import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Filter, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([
    {
      id: 'V-1023',
      name: 'Acme Services Pvt Ltd',
      contact: 'John Doe',
      date: 'Oct 24, 2023',
      status: 'Pending'
    },
    {
      id: 'V-1022',
      name: 'Global Tech Solutions',
      contact: 'Sarah Smith',
      date: 'Oct 23, 2023',
      status: 'Approved'
    },
    {
      id: 'V-1021',
      name: 'Rapid Logistics',
      contact: 'Mike Johnson',
      date: 'Oct 22, 2023',
      status: 'Rejected'
    }
  ]);

  const handleApprove = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Approved' } : v));
    // For demo purposes, we also navigate to the approved page if the top one is approved
    if (id === 'V-1023') {
      setTimeout(() => navigate('/approved'), 1000);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      case 'Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Pending</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage vendor applications and verifications.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader 
          title="Recent Applications"
          className="bg-slate-50"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Vendor ID</th>
                  <th className="px-6 py-4 font-semibold">Company Name</th>
                  <th className="px-6 py-4 font-semibold">Contact Person</th>
                  <th className="px-6 py-4 font-semibold">Applied On</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{vendor.id}</td>
                    <td className="px-6 py-4">{vendor.name}</td>
                    <td className="px-6 py-4 text-slate-600">{vendor.contact}</td>
                    <td className="px-6 py-4 text-slate-600">{vendor.date}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(vendor.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                        {vendor.status === 'Pending' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700" 
                            onClick={() => handleApprove(vendor.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
