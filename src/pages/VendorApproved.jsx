import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle } from 'lucide-react';

export function VendorApproved() {
  return (
    <div className="max-w-2xl mx-auto pt-12">
      <Card className="text-center border-green-200">
        <CardContent className="pt-12 pb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">You're Approved!</h1>
          <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
            Welcome to the Vyess FMS network. Your account is now fully active.
          </p>
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            Access Partner Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
