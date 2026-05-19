import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StepIndicator } from '../components/StepIndicator';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

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

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [type]: e.target.files[0] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, upload to Firebase Storage here
    navigate('/agreement');
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
              disabled={!files.aadhaar || !files.pan}
            >
              Save & Continue
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
