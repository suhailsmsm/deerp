import React, { useState } from 'react';
import { MessageSquare, Users, TrendingUp, Plus, PhoneCall, Mail } from 'lucide-react';

export default function CRM() {
  const [activeTab, setActiveTab] = useState('customers');
  const [customers] = useState([
    { id: 1, name: 'Mohammed Al Rashid', phone: '+971-50-123-4567', email: 'mohammed@example.com', totalSpent: 12500, visits: 24, lastPurchase: '2026-05-17', segment: 'VIP', status: 'Active' },
    { id: 2, name: 'Fatima Al Zaabi', phone: '+971-50-234-5678', email: 'fatima@example.com', totalSpent: 8750, visits: 18, lastPurchase: '2026-05-15', segment: 'Regular', status: 'Active' },
    { id: 3, name: 'Khalid Ibrahim', phone: '+971-50-345-6789', email: 'khalid@example.com', totalSpent: 4200, visits: 8, lastPurchase: '2026-04-20', segment: 'Regular', status: 'Inactive' },
  ]);

  const [leads] = useState([
    { id: 1, name: 'Sara Al Mansoori', source: 'Referral', status: 'Contacted', value: 5000 },
    { id: 2, name: 'Omar Al Hamdan', source: 'Walk-in', status: 'Qualified', value: 3500 },
    { id: 3, name: 'Leila Ahmed', source: 'Online', status: 'Proposal Sent', value: 7500 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer Relationship Management</h1>
          <p className="text-slate-500 mt-1">Manage customers, leads, and sales pipelines. WhatsApp + SMS integration.</p>
        </div>
        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Total Customers</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{customers.length}</p>
          <p className="text-xs text-slate-500 mt-2">{customers.filter(c => c.status === 'Active').length} active</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Total Revenue (LTV)</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">AED {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Lifetime value</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Active Leads</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{leads.length}</p>
          <p className="text-xs text-slate-500 mt-2">Pipeline value: AED {leads.reduce((sum, l) => sum + l.value, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {['customers', 'leads', 'segments', 'follow-ups', 'campaigns'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
              activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600'
            }`}
          >
            {tab.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Customer</th>
                  <th className="px-6 py-3 text-left font-semibold">Contact</th>
                  <th className="px-6 py-3 text-left font-semibold">Total Spent</th>
                  <th className="px-6 py-3 text-left font-semibold">Visits</th>
                  <th className="px-6 py-3 text-left font-semibold">Last Purchase</th>
                  <th className="px-6 py-3 text-left font-semibold">Segment</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(cust => (
                  <tr key={cust.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold">{cust.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800" title="Call"><PhoneCall size={16} /></button>
                        <button className="text-green-600 hover:text-green-800" title="WhatsApp"><MessageSquare size={16} /></button>
                        <button className="text-slate-600 hover:text-slate-800" title="Email"><Mail size={16} /></button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">AED {cust.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4">{cust.visits}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(cust.lastPurchase).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cust.segment === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {cust.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm font-semibold">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold mb-4">New Leads</h3>
            {leads.filter(l => l.status === 'Contacted').map(lead => (
              <div key={lead.id} className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-sm">{lead.name}</p>
                <p className="text-xs text-slate-600">Value: AED {lead.value}</p>
                <button className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">Qualify</button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold mb-4">Qualified</h3>
            {leads.filter(l => l.status === 'Qualified').map(lead => (
              <div key={lead.id} className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-sm">{lead.name}</p>
                <p className="text-xs text-slate-600">Value: AED {lead.value}</p>
                <button className="mt-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded">Send Proposal</button>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold mb-4">Proposal Sent</h3>
            {leads.filter(l => l.status === 'Proposal Sent').map(lead => (
              <div key={lead.id} className="mb-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="font-semibold text-sm">{lead.name}</p>
                <p className="text-xs text-slate-600">Value: AED {lead.value}</p>
                <button className="mt-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded">Follow Up</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'VIP Customers', count: 1, revenue: 12500, description: 'High-value, frequent buyers' },
            { name: 'Regular Customers', count: 2, revenue: 12950, description: 'Regular purchase patterns' },
            { name: 'At Risk', count: 1, revenue: 4200, description: 'No purchase in 30+ days' },
          ].map((seg, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold mb-2">{seg.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{seg.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Customers:</span><span className="font-semibold">{seg.count}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Total Revenue:</span><span className="font-semibold">AED {seg.revenue.toLocaleString()}</span></div>
              </div>
              <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Send Campaign</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'follow-ups' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4">Follow-up Reminders</h3>
          <div className="space-y-3">
            {[
              { customer: 'Khalid Ibrahim', type: 'Check-in', dueDate: '2026-05-20', priority: 'High' },
              { customer: 'Sara Al Mansoori', type: 'Proposal Follow-up', dueDate: '2026-05-21', priority: 'Medium' },
              { customer: 'Omar Al Hamdan', type: 'Birthday Offer', dueDate: '2026-05-25', priority: 'Low' },
            ].map((task, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-sm">{task.customer}</p>
                  <p className="text-xs text-slate-600">{task.type} - Due: {task.dueDate}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4">Marketing Campaigns</h3>
          <div className="space-y-3">
            {[
              { name: 'Summer Sale 2026', channel: 'WhatsApp + SMS', sent: '2,450', opened: '1,225', converted: '245', status: 'Active' },
              { name: 'Loyalty Program Reminder', channel: 'Email', sent: '1,200', opened: '480', converted: '65', status: 'Active' },
              { name: 'May Flash Deal', channel: 'WhatsApp', sent: '800', opened: '640', converted: '128', status: 'Completed' },
            ].map((campaign, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold">{campaign.name}</p>
                    <p className="text-xs text-slate-600">{campaign.channel}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-slate-600">Sent:</span> <span className="font-semibold">{campaign.sent}</span></div>
                  <div><span className="text-slate-600">Opened:</span> <span className="font-semibold">{campaign.opened}</span></div>
                  <div><span className="text-slate-600">Converted:</span> <span className="font-semibold">{campaign.converted}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
