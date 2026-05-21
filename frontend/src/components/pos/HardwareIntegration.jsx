import React, { useState, useEffect } from 'react';
import { Printer, Scan, CreditCard, Box, Bluetooth, Wifi, Usb, Check, X, RefreshCw, Settings } from 'lucide-react';

export default function HardwareIntegration() {
  const [connectedDevices, setConnectedDevices] = useState({
    printer: null,
    scanner: null,
    cashDrawer: null,
    cardTerminal: null,
  });

  const [scanning, setScanning] = useState(false);
  const [printerTest, setPrinterTest] = useState('');

  // Simulate device discovery
  const scanForDevices = async () => {
    setScanning(true);
    // In real implementation, this would use Web Bluetooth API or native modules
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnectedDevices({
      printer: { name: 'Epson TM-T20II', type: 'Bluetooth', status: 'connected' },
      scanner: { name: 'Zebra DS2208', type: 'USB', status: 'connected' },
      cashDrawer: { name: 'APG Vasario', type: 'Printer-linked', status: 'connected' },
      cardTerminal: { name: 'Stripe Reader M2', type: 'Bluetooth', status: 'connected' },
    });
    setScanning(false);
  };

  const testPrinter = async () => {
    setPrinterTest('Printing test receipt...');
    // In real implementation, this would send ESC/POS commands to the printer
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPrinterTest('✓ Test print successful!');
    setTimeout(() => setPrinterTest(''), 3000);
  };

  const disconnectDevice = (device) => {
    setConnectedDevices(prev => ({ ...prev, [device]: null }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Hardware Devices</h1>
          <p className="text-sm text-slate-500 mt-1">Manage printers, scanners, and payment terminals</p>
        </div>
        <button
          onClick={scanForDevices}
          disabled={scanning}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {scanning ? <RefreshCw size={16} className="animate-spin" /> : <Bluetooth size={16} />}
          {scanning ? 'Scanning...' : 'Scan for Devices'}
        </button>
      </div>

      {/* Device Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receipt Printer */}
        <div className={`p-5 rounded-2xl border-2 transition ${
          connectedDevices.printer 
            ? 'border-emerald-200 bg-emerald-50' 
            : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <Printer size={32} className={connectedDevices.printer ? 'text-emerald-600' : 'text-slate-400'} />
            {connectedDevices.printer ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Check size={12} /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                Not Connected
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-950">Receipt Printer</h3>
          {connectedDevices.printer ? (
            <>
              <p className="text-sm text-slate-600 mt-1">{connectedDevices.printer.name}</p>
              <p className="text-xs text-slate-500 mt-1">{connectedDevices.printer.type}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={testPrinter}
                  className="flex-1 px-3 py-2 rounded-lg bg-white text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
                >
                  Test Print
                </button>
                <button
                  onClick={() => disconnectDevice('printer')}
                  className="flex-1 px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center justify-center gap-1"
                >
                  <Settings size={12} /> Config
                </button>
              </div>
              {printerTest && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">{printerTest}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-4">Connect a thermal receipt printer</p>
          )}
        </div>

        {/* Barcode Scanner */}
        <div className={`p-5 rounded-2xl border-2 transition ${
          connectedDevices.scanner 
            ? 'border-emerald-200 bg-emerald-50' 
            : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <Scan size={32} className={connectedDevices.scanner ? 'text-emerald-600' : 'text-slate-400'} />
            {connectedDevices.scanner ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Check size={12} /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                Not Connected
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-950">Barcode Scanner</h3>
          {connectedDevices.scanner ? (
            <>
              <p className="text-sm text-slate-600 mt-1">{connectedDevices.scanner.name}</p>
              <p className="text-xs text-slate-500 mt-1">{connectedDevices.scanner.type}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 rounded-lg bg-white text-emerald-700 text-xs font-semibold hover:bg-emerald-100">
                  Test Scan
                </button>
                <button
                  onClick={() => disconnectDevice('scanner')}
                  className="flex-1 px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center justify-center gap-1"
                >
                  <Settings size={12} /> Config
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-4">Connect USB or Bluetooth scanner</p>
          )}
        </div>

        {/* Cash Drawer */}
        <div className={`p-5 rounded-2xl border-2 transition ${
          connectedDevices.cashDrawer 
            ? 'border-emerald-200 bg-emerald-50' 
            : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <Box size={32} className={connectedDevices.cashDrawer ? 'text-emerald-600' : 'text-slate-400'} />
            {connectedDevices.cashDrawer ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Check size={12} /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                Not Connected
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-950">Cash Drawer</h3>
          {connectedDevices.cashDrawer ? (
            <>
              <p className="text-sm text-slate-600 mt-1">{connectedDevices.cashDrawer.name}</p>
              <p className="text-xs text-slate-500 mt-1">{connectedDevices.cashDrawer.type}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 rounded-lg bg-white text-emerald-700 text-xs font-semibold hover:bg-emerald-100">
                  Open Drawer
                </button>
                <button
                  onClick={() => disconnectDevice('cashDrawer')}
                  className="flex-1 px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center justify-center gap-1"
                >
                  <Settings size={12} /> Config
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-4">Connect via printer or USB</p>
          )}
        </div>

        {/* Card Terminal */}
        <div className={`p-5 rounded-2xl border-2 transition ${
          connectedDevices.cardTerminal 
            ? 'border-emerald-200 bg-emerald-50' 
            : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <CreditCard size={32} className={connectedDevices.cardTerminal ? 'text-emerald-600' : 'text-slate-400'} />
            {connectedDevices.cardTerminal ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Check size={12} /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                Not Connected
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-950">Card Terminal</h3>
          {connectedDevices.cardTerminal ? (
            <>
              <p className="text-sm text-slate-600 mt-1">{connectedDevices.cardTerminal.name}</p>
              <p className="text-xs text-slate-500 mt-1">{connectedDevices.cardTerminal.type}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 rounded-lg bg-white text-emerald-700 text-xs font-semibold hover:bg-emerald-100">
                  Test Payment
                </button>
                <button
                  onClick={() => disconnectDevice('cardTerminal')}
                  className="flex-1 px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 flex items-center justify-center gap-1"
                >
                  <Settings size={12} /> Config
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-4">Stripe, Network Intl, Magnati</p>
          )}
        </div>
      </div>

      {/* Connection Guide */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white">
        <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2">
          <Wifi size={20} className="text-blue-600" />
          Supported Hardware
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">Receipt Printers</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Epson TM-T20II / TM-T88</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Star TSP143III</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Bixolon SRP-350</li>
              <li className="flex items-center gap-2"><Usb size={14} className="text-blue-600" /> Connection: USB, Bluetooth, Ethernet</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">Barcode Scanners</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Zebra DS2208 / DS8108</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Honeywell Xenon 1900</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Socket Mobile S700</li>
              <li className="flex items-center gap-2"><Usb size={14} className="text-blue-600" /> Connection: USB, Bluetooth</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">Card Terminals (UAE)</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Stripe Terminal M2</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Network International</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Magnati PayPoint</li>
              <li className="flex items-center gap-2"><Wifi size={14} className="text-blue-600" /> Connection: Bluetooth, WiFi</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">Cash Drawers</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> APG Vasario Series</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Star CD3 Series</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Epson DK Series</li>
              <li className="flex items-center gap-2"><Usb size={14} className="text-blue-600" /> Connection: Printer-linked, USB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
