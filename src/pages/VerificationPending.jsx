import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

export function VerificationPending() {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-2xl mx-auto pt-12">
      <Card className="text-center">
        <CardContent className="pt-12 pb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Verification Pending</h1>
          <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
            Thank you for completing your onboarding. Your profile and documents are currently under review by our admin team.
          </p>
          <div className="bg-slate-50 p-6 rounded-lg mb-8 text-sm text-slate-600 text-left">
            <h3 className="font-semibold text-slate-900 mb-2">What happens next?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Our team will verify your KYC documents within 24-48 hours.</li>
              <li>You will receive an email notification once approved.</li>
              <li>If any additional information is required, we will reach out to you.</li>
            </ul>
          </div>
          <Button onClick={() => navigate('/admin')} variant="outline">
            Go to Admin Dashboard (Demo)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
