import React, { useEffect, useState } from 'react';

export default function TableMap({ onSelectTable }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (window.electron) {
      window.electron.getTables().then(setTables);
    } else {
      // Mock tables for browser preview
      setTables([{ id: 1, number: '1', status: 'available', capacity: 4 }]);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-red-500 text-white';
      case 'reserved': return 'bg-amber-500 text-white';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  if (!tables.length) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-center">
        No tables available. Add restaurant tables in the back-office or enable demo data.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {tables.map((table) => (
        <button
          key={table.id}
          onClick={() => onSelectTable(table)}
          className={`h-24 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 ${getStatusColor(table.status)}`}
        >
          <span className="text-lg font-bold">T-{table.number}</span>
          <span className="text-xs uppercase opacity-80">{table.status}</span>
          {table.capacity && <span className="text-[10px] mt-1">Cap: {table.capacity}</span>}
        </button>
      ))}
    </div>
  );
}