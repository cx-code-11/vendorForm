import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StepIndicator } from '../components/StepIndicator';
import { Eraser, Download, MapPin } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const steps = [
  { name: 'Registration' },
  { name: 'Documents' },
  { name: 'Agreement' },
  { name: 'Sign' }
];

export function DigitalSignature() {
  const navigate = useNavigate();
  const sigCanvas = useRef({});
  const [location, setLocation] = useState(null);
  const [timestamp, setTimestamp] = useState('');
  const [vendorData, setVendorData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('vendorData');
    if (data) setVendorData(JSON.parse(data));
    
    setTimestamp(new Date().toLocaleString());
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.log(error)
      );
    }
  }, []);

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const generatePDF = async () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }

    setIsGenerating(true);
    const pdfContent = document.createElement('div');
    try {
      const sigData = sigCanvas.current.getCanvas().toDataURL('image/png');
      
      // Create a temporary div for PDF generation to perfectly format it
      pdfContent.style.position = 'absolute';
      pdfContent.style.top = '-9999px';
      pdfContent.style.left = '-9999px';
      pdfContent.style.width = '800px';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.innerHTML = `
        <div style="padding: 40px; font-family: sans-serif; color: #333;">
          <h2 style="text-align: center;">MASTER SERVICE AGREEMENT</h2>
          <p>This Master Service Agreement is made and entered into on <strong>${new Date().toLocaleDateString()}</strong> by and between:</p>
          <p><strong>Vyess FMS</strong> and <strong>${vendorData.companyName || 'Vendor'}</strong></p>
          <p style="margin-top: 20px;"><strong>Address:</strong> ${vendorData.address || ''}</p>
          <h3 style="margin-top: 30px;">1. SCOPE OF SERVICES</h3>
          <p>The Service Provider agrees to provide the services as requested by the Company.</p>
          <h3 style="margin-top: 20px;">2. PAYMENT TERMS</h3>
          <p>Payment shall be made within 30 days of receipt of an undisputed invoice.</p>
          
          <div style="margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px;">
            <p>IN WITNESS WHEREOF, the parties hereto have executed this Agreement.</p>
            <div style="display: flex; justify-content: space-between; margin-top: 40px;">
              <div>
                <p><strong>For Vyess FMS</strong></p>
                <div style="height: 80px; width: 200px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; color: #999;">
                  Auto-signed via System
                </div>
              </div>
              <div>
                <p><strong>For ${vendorData.companyName || 'Vendor'}</strong></p>
                <img src="${sigData}" style="max-height: 80px; max-width: 200px;" />
                <p style="font-size: 12px; color: #666; margin: 2px 0;">Signed by: ${vendorData.contactPerson || ''}</p>
                <p style="font-size: 12px; color: #666; margin: 2px 0;">Time: ${timestamp}</p>
                ${location ? `<p style="font-size: 12px; color: #666; margin: 2px 0;">Loc: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(pdfContent);
      
      const canvas = await html2canvas(pdfContent, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Save PDF locally
      pdf.save(`${vendorData.companyName?.replace(/\s+/g, '_') || 'Vendor'}_Agreement.pdf`);
      
      // Get PDF as base64 string
      const pdfBase64 = pdf.output('datauristring');
      
      // Send to backend
      try {
        const response = await fetch('http://localhost:3001/api/submit-application', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: vendorData.companyName,
            contactPerson: vendorData.contactPerson,
            email: vendorData.email,
            phone: vendorData.phone,
            address: vendorData.address,
            documentUrls: vendorData.documentUrls,
            pdfBase64: pdfBase64
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend Error:", errorData);
          alert("Failed to send email. The PDF was downloaded.");
        } else {
          console.log("Application submitted successfully!");
        }
      } catch (err) {
        console.error("Network error while submitting:", err);
        alert("Failed to connect to server. The PDF was downloaded.");
      }
      
      // Navigate to success page
      setTimeout(() => {
        navigate('/pending');
      }, 1500);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      setIsGenerating(false);
    } finally {
      if (document.body.contains(pdfContent)) {
        document.body.removeChild(pdfContent);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Digital Signature</h1>
        <p className="mt-2 text-slate-600">Please sign below to complete the agreement execution.</p>
      </div>

      <div className="mb-10">
        <StepIndicator steps={steps} currentStep={3} />
      </div>

      <Card>
        <CardHeader 
          title="Sign Agreement"
          description="Use your mouse or finger to draw your signature"
        />
        <CardContent>
          <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white mb-4">
            <SignatureCanvas 
              ref={sigCanvas}
              canvasProps={{className: 'w-full h-64 cursor-crosshair'}}
              backgroundColor="rgb(255, 255, 255)"
            />
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" size="sm" onClick={clearSignature} className="text-slate-500">
              <Eraser className="w-4 h-4 mr-2" />
              Clear Canvas
            </Button>
            
            <div className="text-right text-xs text-slate-500 space-y-1">
              <p>Signer: <strong>{vendorData.contactPerson}</strong></p>
              <p>Time: {timestamp}</p>
              {location && (
                <p className="flex items-center justify-end gap-1">
                  <MapPin className="w-3 h-3" />
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between bg-blue-50 border-blue-100">
          <Button variant="outline" onClick={() => navigate('/agreement')}>
            Back
          </Button>
          <Button 
            onClick={generatePDF} 
            size="lg"
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? 'Processing...' : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Sign & Download PDF
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
