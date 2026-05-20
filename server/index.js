import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import pg from 'pg';
import * as Minio from 'minio';
import multer from 'multer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Increase limit for base64 PDF payloads
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const resend = new Resend(process.env.RESEND_API_KEY);

// PostgreSQL setup
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT || '5432', 10),
});

// Create tables on startup
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        aadhaar_doc_url TEXT,
        pan_doc_url TEXT,
        gst_doc_url TEXT,
        pdf_agreement_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};
initDB();

// MinIO setup
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const DOCS_BUCKET = 'vendor-documents';
const AGREEMENTS_BUCKET = 'vendor-agreements';

// Create buckets on startup
const initMinio = async () => {
  try {
    const docsExists = await minioClient.bucketExists(DOCS_BUCKET);
    if (!docsExists) {
      await minioClient.makeBucket(DOCS_BUCKET);
    }
    
    const agreementsExists = await minioClient.bucketExists(AGREEMENTS_BUCKET);
    if (!agreementsExists) {
      await minioClient.makeBucket(AGREEMENTS_BUCKET);
    }
    console.log('MinIO buckets initialized');
  } catch (err) {
    console.error('Error initializing MinIO:', err);
  }
};
initMinio();

// Multer setup for in-memory uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper to upload buffer to MinIO
const uploadToMinio = async (bucket, filename, buffer) => {
  await minioClient.putObject(bucket, filename, buffer);
  // Just return the relative path or identifier
  return `${bucket}/${filename}`;
};

// --- Endpoints ---

// Upload KYC documents
app.post('/api/upload', upload.fields([
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'gst', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    const resultUrls = {};

    for (const [key, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        const filename = `${Date.now()}_${file.originalname}`;
        const url = await uploadToMinio(DOCS_BUCKET, filename, file.buffer);
        resultUrls[key] = url;
      }
    }

    res.status(200).json({ urls: resultUrls });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
});

// Submit final application & agreement
app.post('/api/submit-application', async (req, res) => {
  try {
    const { 
      companyName, contactPerson, email, phone, address,
      documentUrls, pdfBase64 
    } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({ error: 'Email and PDF data are required' });
    }

    // 1. Save PDF to MinIO
    // Extract base64 part
    const base64Data = pdfBase64.split('base64,')[1] || pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    const pdfFilename = `${companyName?.replace(/\s+/g, '_') || 'Vendor'}_Agreement_${Date.now()}.pdf`;
    
    const pdfUrl = await uploadToMinio(AGREEMENTS_BUCKET, pdfFilename, pdfBuffer);

    // 2. Save Data to PostgreSQL
    const insertQuery = `
      INSERT INTO vendors (
        company_name, contact_person, email, phone, address,
        aadhaar_doc_url, pan_doc_url, gst_doc_url, pdf_agreement_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `;
    
    const values = [
      companyName, contactPerson, email, phone, address,
      documentUrls?.aadhaar || null,
      documentUrls?.pan || null,
      documentUrls?.gst || null,
      pdfUrl
    ];
    
    const dbResult = await pool.query(insertQuery, values);
    const vendorId = dbResult.rows[0].id;

    // 3. Send Email to Vendor
    const { error: vendorEmailError } = await resend.emails.send({
      from: 'Vyess FMS Onboarding <onboarding@resend.dev>',
      to: [email],
      subject: `Master Service Agreement - ${companyName || 'Vendor'}`,
      html: `<p>Hello ${contactPerson},</p><p>Please find attached your signed Master Service Agreement for your records. Your application ID is #${vendorId}.</p><p>Thank you,<br/>Vyess FMS Team</p>`,
      attachments: [
        {
          filename: pdfFilename,
          content: base64Data,
        },
      ],
    });

    if (vendorEmailError) {
      console.error('Resend API Error (Vendor):', vendorEmailError);
      // We don't fail the whole request if email fails, but we should log it
    }

    // 4. Send Email to Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const { error: adminEmailError } = await resend.emails.send({
      from: 'Vyess FMS System <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `New Vendor Application: ${companyName}`,
      html: `
        <h2>New Vendor Registration</h2>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Contact:</strong> ${contactPerson}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}</p>
        <hr />
        <h3>Uploaded Documents:</h3>
        <ul>
          <li>Aadhaar: ${documentUrls?.aadhaar || 'N/A'}</li>
          <li>PAN: ${documentUrls?.pan || 'N/A'}</li>
          <li>GST: ${documentUrls?.gst || 'N/A'}</li>
        </ul>
        <p>The signed MSA is attached.</p>
      `,
      attachments: [
        {
          filename: pdfFilename,
          content: base64Data,
        },
      ],
    });

    if (adminEmailError) {
      console.error('Resend API Error (Admin):', adminEmailError);
    }

    res.status(200).json({ 
      message: 'Application submitted successfully',
      vendorId: vendorId 
    });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
