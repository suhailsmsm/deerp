import React from 'react';

export const generateReceiptHtml = async (transaction, branch, staff) => {
  const items = JSON.parse(transaction.items);
  const dateStr = new Date().toLocaleString('en-AE');
  
  const qrData = await window.electron.generateQr({
    seller: branch?.name || 'dERP',
    trn: branch?.trn || '100XXXXXXXXXXXX',
    timestamp: transaction.createdAt,
    total: transaction.total.toFixed(2),
    vat: transaction.vat.toFixed(2)
  });

  return `
    <html>
      <style>
        body { font-family: sans-serif; width: 80mm; padding: 5mm; font-size: 12px; }
        .text-center { text-align: center; }
        .header { margin-bottom: 10px; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
        .ar { direction: rtl; font-family: 'Arial'; }
        .bilingual { display: flex; justify-content: space-between; font-size: 10px; color: #555; }
        .total { font-weight: bold; font-size: 14px; }
        .qr-placeholder { background: #eee; width: 40mm; height: 40mm; margin: 10px auto; display: flex; align-items: center; justify-content: center; font-size: 8px; text-break: break-all; }
      </style>
      <body>
        <div class="header text-center">
          <h2 style="margin:0">${branch?.name || 'dERP'}</h2>
          <div>TRN: ${branch?.trn || '100XXXXXXXXXXXX'}</div>
          <div>${dateStr}</div>
        </div>
        <div class="divider"></div>
        <div class="text-center">TAX INVOICE / فاتورة ضريبية</div>
        <div class="divider"></div>
        
        ${items.map(item => `
          <div class="item-wrap">
            <div class="item-row">
              <span>${item.name} x${item.qty}</span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
            <div class="bilingual">
              <span class="ar">${item.nameAr || ''}</span>
            </div>
          </div>
        `).join('')}
        
        <div class="divider"></div>
        <div class="item-row"><span>Subtotal / المجموع</span><span>${transaction.subtotal.toFixed(2)}</span></div>
        <div class="item-row"><span>VAT (5%) / الضريبة</span><span>${transaction.vat.toFixed(2)}</span></div>
        <div class="item-row total"><span>TOTAL / الإجمالي</span><span>${transaction.total.toFixed(2)}</span></div>
        
        <div class="divider"></div>
        <div class="text-center">
          <div class="qr-placeholder">Digital Verification QR<br>${qrData.substring(0, 30)}...</div>
          <p style="font-size: 8px;">Scan to verify Tax Invoice via FTA App</p>
        </div>

        <div class="text-center">
          <p>Cashier: ${staff?.name || 'Admin'}</p>
          <p>Thank you for your visit!</p>
          <p>شكراً لزيارتكم</p>
        </div>
      </body>
    </html>
  `;
};
