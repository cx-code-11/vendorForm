import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VendorRegistration } from './pages/VendorRegistration';
import { DocumentUpload } from './pages/DocumentUpload';
import { AgreementPreview } from './pages/AgreementPreview';
import { DigitalSignature } from './pages/DigitalSignature';
import { VerificationPending } from './pages/VerificationPending';
import { VendorApproved } from './pages/VendorApproved';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Vyess FMS</span>
            </div>
          </div>
        </header>
        {/* for commit */}

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<VendorRegistration />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/agreement" element={<AgreementPreview />} />
            <Route path="/sign" element={<DigitalSignature />} />
            <Route path="/pending" element={<VerificationPending />} />
            <Route path="/approved" element={<VendorApproved />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
