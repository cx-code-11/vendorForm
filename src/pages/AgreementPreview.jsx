import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StepIndicator } from '../components/StepIndicator';
import { FileText } from 'lucide-react';

const steps = [
  { name: 'Registration' },
  { name: 'Documents' },
  { name: 'Agreement' },
  { name: 'Sign' }
];

export function AgreementPreview() {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('vendorData');
    if (data) {
      setVendorData(JSON.parse(data));
    }
  }, []);

  const handleContinue = () => {
    if (accepted) {
      navigate('/sign');
    }
  };

  if (!vendorData) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Service Agreement</h1>
        <p className="mt-2 text-slate-600">Please review the master service agreement generated for your company.</p>
      </div>

      <div className="mb-10">
        <StepIndicator steps={steps} currentStep={2} />
      </div>

      <Card>
        <CardHeader 
          title="Agreement Preview"
          description="Read carefully before accepting"
          className="bg-slate-50"
        />
        <CardContent>
          <div 
            className="bg-white border border-slate-200 rounded-lg p-8 h-96 overflow-y-auto prose prose-slate max-w-none text-sm"
            id="agreement-content"
          >
            <h2 className="text-center mb-6">MASTER SERVICE AGREEMENT</h2>
            <p>This Master Service Agreement ("Agreement") is made and entered into on <strong>{new Date().toLocaleDateString()}</strong> by and between:</p>
            
            <p><strong>Vyess FMS</strong>, a company incorporated under the Companies Act, having its registered office at Tech Park, Bangalore (hereinafter referred to as "Company").</p>
            <p className="text-center my-4">AND</p>
            <p><strong>{vendorData.companyName}</strong>, located at <strong>{vendorData.address}</strong> (hereinafter referred to as "Service Provider").</p>

            <h3 className="mt-6 font-bold">1. SCOPE OF SERVICES</h3>
            <p>The Service Provider agrees to provide the services as requested by the Company from time to time in accordance with the terms of this Agreement.</p>

            <h3 className="mt-6 font-bold">2. PAYMENT TERMS</h3>
            <p>Payment shall be made within 30 days of receipt of an undisputed invoice. All payments are subject to applicable tax deductions at source.</p>

            <h3 className="mt-6 font-bold">3. CONFIDENTIALITY</h3>
            <p>The Service Provider agrees to keep confidential all proprietary information received from the Company and shall not disclose it to any third party without prior written consent.</p>
            
            <h3 className="mt-6 font-bold">4. TERMINATION</h3>
            <p>Either party may terminate this Agreement by providing a 30-day written notice to the other party.</p>
            
            <div className="mt-12 pt-8 border-t border-slate-200">
              <p>IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.</p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3">
            <div className="flex items-center h-5">
              <input
                id="accept"
                name="accept"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
            </div>
            <label htmlFor="accept" className="text-sm text-slate-700">
              I, {vendorData.contactPerson}, authorized representative of {vendorData.companyName}, have read and agree to the terms and conditions outlined in this Master Service Agreement.
            </label>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => navigate('/upload')}>
            Back
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!accepted}
            size="lg"
          >
            Proceed to Sign
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
