import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Increase limit for base64 PDF payloads
app.use(express.json({ limit: '50mb' }));
app.use(cors());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/send-pdf', async (req, res) => {
  try {
    const { email, companyName, pdfBase64 } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({ error: 'Email and PDF data are required' });
    }

    // Extract the base64 part from the data URI (data:image/png;base64,...)
    // Wait, jsPDF output('datauristring') gives a full data URI.
    const base64Data = pdfBase64.split('base64,')[1] || pdfBase64;

    const { data, error } = await resend.emails.send({
      from: 'Vyess FMS Onboarding <onboarding@resend.dev>', // Use onboarding@resend.dev for testing, requires verifying domain in prod
      to: [email],
      subject: `Master Service Agreement - ${companyName || 'Vendor'}`,
      html: `<p>Hello,</p><p>Please find attached the signed Master Service Agreement for your records.</p><p>Thank you,<br/>Vyess FMS Team</p>`,
      attachments: [
        {
          filename: `${companyName?.replace(/\s+/g, '_') || 'Vendor'}_Agreement.pdf`,
          content: base64Data,
        },
      ],
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ error });
    }

    res.status(200).json({ message: 'Email sent successfully', data });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
