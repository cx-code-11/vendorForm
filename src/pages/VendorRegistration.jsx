import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StepIndicator } from '../components/StepIndicator';
import { Building2, Mail, Phone, MapPin, User } from 'lucide-react';

const steps = [
  { name: 'Registration' },
  { name: 'Documents' },
  { name: 'Agreement' },
  { name: 'Sign' }
];

export function VendorRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, save to context or Firebase here
    // For now, save to localStorage to pass data between steps
    localStorage.setItem('vendorData', JSON.stringify(formData));
    navigate('/upload');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Partner with Vyess FMS</h1>
        <p className="mt-2 text-slate-600">Join our network of trusted service providers. Fill out the details below to start your onboarding journey.</p>
      </div>

      <div className="mb-10">
        <StepIndicator steps={steps} currentStep={0} />
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader 
            title="Company Details"
            description="Please provide your official business information."
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <Input 
                  label="Company Name"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Services Pvt Ltd"
                />
              </div>
              <Input 
                label="Contact Person"
                name="contactPerson"
                required
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Full Name"
              />
              <Input 
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@company.com"
              />
              <Input 
                label="Phone Number"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Registered Address
                </label>
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Complete business address"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg">Save & Continue</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
