import React, { useState } from 'react';
import { useSessionStore } from './sessionStore';
import { Lock, Delete } from 'lucide-react';

export default function StaffLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const setStaff = useSessionStore((state) => state.setStaff);

  const handlePinInput = async (digit) => {
    const newPin = pin + digit;
    if (newPin.length <= 4) {
      setPin(newPin);
      if (newPin.length === 4) {
        // Check if Electron bridge exists
        if (!window.electron) {
          console.warn("Running in Browser: Demo Mode Enabled");
          if (newPin === '1234') {
            setStaff({ name: 'Demo User', role: 'Admin' });
          } else {
            setError(true);
            setTimeout(() => { setPin(''); setError(false); }, 1000);
          }
          return;
        }

        const staff = await window.electron.verifyStaff(newPin);
        if (staff) {
          setStaff(staff);
        } else {
          setError(true);
          setTimeout(() => { setPin(''); setError(false); }, 1000);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-80 text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${error ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Staff Login</h2>
        <p className="text-slate-500 mb-6">Enter your 4-digit PIN</p>
        
        <div className="flex justify-center gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-slate-800 border-slate-800' : 'border-slate-300'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handlePinInput(n.toString())} className="h-16 text-2xl font-semibold rounded-xl hover:bg-slate-100 active:bg-slate-200 border border-slate-100 transition-colors">
              {n}
            </button>
          ))}
          <button className="h-16 rounded-xl hover:bg-slate-100 border border-slate-100 flex items-center justify-center" onClick={() => setPin('')}>
            <span className="text-xs font-bold text-slate-400">CLEAR</span>
          </button>
          <button onClick={() => handlePinInput('0')} className="h-16 text-2xl font-semibold rounded-xl hover:bg-slate-100 border border-slate-100">0</button>
          <button className="h-16 rounded-xl hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-red-500" onClick={() => setPin(pin.slice(0, -1))}>
            <Delete size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}