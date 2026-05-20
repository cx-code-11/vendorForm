import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StepIndicator } from '../components/StepIndicator';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';

const steps = [
  { name: 'Registration' },
  { name: 'Documents' },
  { name: 'Agreement' },
  { name: 'Sign' }
];

export function DocumentUpload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState({
    aadhaar: null,
    pan: null,
    gst: null
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [type]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData();
      if (files.aadhaar) formData.append('aadhaar', files.aadhaar);
      if (files.pan) formData.append('pan', files.pan);
      if (files.gst) formData.append('gst', files.gst);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Save document URLs to vendor data
      const vendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
      vendorData.documentUrls = data.urls;
      localStorage.setItem('vendorData', JSON.stringify(vendorData));

      navigate('/agreement');
    } catch (error) {
      console.error('Error uploading documents:', error);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderUploadBox = (title, type, description) => (
    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
      <input
        type="file"
        id={`upload-${type}`}
        className="hidden"
        onChange={(e) => handleFileChange(e, type)}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <label htmlFor={`upload-${type}`} className="cursor-pointer flex flex-col items-center">
        {files[type] ? (
          <>
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
            <span className="font-medium text-slate-900">{files[type].name}</span>
            <span className="text-sm text-slate-500 mt-1">Click to change</span>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-blue-500 mb-3" />
            <span className="font-medium text-slate-900">Upload {title}</span>
            <span className="text-sm text-slate-500 mt-1">{description} (PDF, JPG, PNG)</span>
          </>
        )}
      </label>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload Documents</h1>
        <p className="mt-2 text-slate-600">Please provide the required KYC documents for verification.</p>
      </div>

      <div className="mb-10">
        <StepIndicator steps={steps} currentStep={1} />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader 
            title="KYC Documents"
            description="Ensure all documents are clear and legible."
          />
          <CardContent className="space-y-6">
            {renderUploadBox('Aadhaar Card', 'aadhaar', 'Front and back side')}
            {renderUploadBox('PAN Card', 'pan', 'Clear image of PAN card')}
            {renderUploadBox('GST Certificate', 'gst', 'Optional if not applicable')}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" type="button" onClick={() => navigate('/register')}>
              Back
            </Button>
            <Button 
              type="submit" 
              size="lg"
              disabled={!files.aadhaar || !files.pan || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
