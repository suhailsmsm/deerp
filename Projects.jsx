import React, { useState } from 'react';
import { Briefcase, CheckCircle, Clock, Plus, Paperclip } from 'lucide-react';

export default function Projects() {
  const [activeTab, setActiveTab] = useState('projects');
  
  const [projects] = useState([
    { id: 1, name: 'Mall Expansion Project', client: 'Al Ain Shopping Center', status: 'In Progress', budget: 250000, spent: 165000, progress: 66, dueDate: '2026-08-30' },
    { id: 2, name: 'IT System Upgrade', client: 'Internal', status: 'Planning', budget: 85000, spent: 12500, progress: 15, dueDate: '2026-07-15' },
    { id: 3, name: 'Store Renovation', client: 'Dubai Branch', status: 'Completed', budget: 120000, spent: 118500, progress: 100, dueDate: '2026-05-10' },
  ]);

  const [tasks] = useState([
    { id: 1, project: 'Mall Expansion Project', name: 'Structural Design', assignee: 'Ahmed K.', status: 'In Progress', dueDate: '2026-05-30' },
    { id: 2, project: 'Mall Expansion Project', name: 'Electrical Wiring', assignee: 'Yousef S.', status: 'Pending', dueDate: '2026-06-15' },
    { id: 3, project: 'IT System Upgrade', name: 'Requirements Gathering', assignee: 'Lina M.', status: 'Completed', dueDate: '2026-05-20' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects & Services</h1>
          <p className="text-slate-500 mt-1">Manage projects, tasks, costing, and service contracts.</p>
        </div>
        <button className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Active Projects</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{projects.filter(p => p.status === 'In Progress').length}</p>
          <p className="text-xs text-slate-500 mt-2">Budget: AED {projects.filter(p => p.status === 'In Progress').reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Total Spent (YTD)</p>
          <p className="text-3xl font-bold text-red-600 mt-2">AED {projects.reduce((sum, p) => sum + p.spent, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Budget: AED {projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Avg Progress</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%</p>
          <p className="text-xs text-slate-500 mt-2">Across all projects</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 text-sm font-medium">Total Tasks</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{tasks.length}</p>
          <p className="text-xs text-slate-500 mt-2">{tasks.filter(t => t.status === 'In Progress').length} in progress</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {['projects', 'tasks', 'costing', 'services'].map(tab => (
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
      {activeTab === 'projects' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <p className="text-sm text-slate-600">Client: {project.client}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  project.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${project.progress}%`}} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Budget</span>
                    <p className="font-semibold">AED {project.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Spent</span>
                    <p className="font-semibold text-orange-600">AED {project.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Due Date</span>
                    <p className="font-semibold">{new Date(project.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <button className="mt-4 text-blue-600 hover:underline text-sm font-semibold">View Details</button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="max-h-[50vh] overflow-y-auto">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Task</th>
                  <th className="px-6 py-3 text-left font-semibold">Project</th>
                  <th className="px-6 py-3 text-left font-semibold">Assignee</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Due Date</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold">{task.name}</td>
                    <td className="px-6 py-4 text-slate-600">{task.project}</td>
                    <td className="px-6 py-4 text-slate-600">{task.assignee}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'costing' && (
        <div className="space-y-4">
          {projects.map(project => {
            const remaining = project.budget - project.spent;
            const percentUsed = Math.round((project.spent / project.budget) * 100);
            return (
              <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold mb-4">{project.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-600 mb-1">Total Budget</p>
                    <p className="text-2xl font-bold">AED {project.budget.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-slate-600 mb-1">Amount Spent ({percentUsed}%)</p>
                    <p className="text-2xl font-bold text-orange-600">AED {project.spent.toLocaleString()}</p>
                  </div>
                  <div className={`${remaining > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} rounded-lg p-4 border`}>
                    <p className="text-slate-600 mb-1">Remaining Budget</p>
                    <p className={`text-2xl font-bold ${remaining > 0 ? 'text-emerald-600' : 'text-red-600'}`}>AED {Math.abs(remaining).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Briefcase size={20} /> Service Contracts & AMC
          </h3>
          <div className="space-y-3">
            {[
              { service: 'Annual Maintenance - POS System', client: 'Internal', value: 'AED 18,000/year', startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
              { service: 'IT Support & Monitoring', client: 'Internal', value: 'AED 12,500/year', startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
              { service: 'Training & Support - New Features', client: 'Staff', value: 'AED 5,000', startDate: '2026-05-01', endDate: '2026-06-30', status: 'Active' },
            ].map((svc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-semibold text-sm">{svc.service}</p>
                  <p className="text-xs text-slate-600">{svc.client} · {svc.value}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">{svc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
