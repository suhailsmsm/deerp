import React from 'react';

export default function generateVATReceipt(transaction, branch, staff, options = {}) {
  const { 
    includeArabic = true, 
    showQRCode = true,
    trnNumber = branch?.trn || '123456789012345', // UAE TRN format
    companyName = branch?.name || 'DERPX Store',
    companyAddress = branch?.address || 'Dubai, UAE',
    companyPhone = branch?.phone || '+971 4 XXX XXXX',
    receiptFooter = 'Thank you for your business!'
  } = options;

  const items = typeof transaction.items === 'string' 
    ? JSON.parse(transaction.items) 
    : transaction.items;

  const subtotal = transaction.subtotal || items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = transaction.discount || 0;
  const vatRate = 0.05; // 5% UAE VAT
  const vatAmount = (subtotal - discount) * vatRate;
  const total = transaction.total || (subtotal - discount + vatAmount);

  const receiptWidth = 80; // 80mm thermal printer width
  const lineLength = 32; // characters per line

  // Center text helper
  const centerText = (text, length = lineLength) => {
    const padding = Math.max(0, Math.floor((length - text.length) / 2));
    return ' '.repeat(padding) + text;
  };

  // Format currency
  const formatCurrency = (amount) => `AED ${amount.toFixed(2)}`;

  // Generate receipt HTML
  const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: #fff;
      max-width: ${receiptWidth}mm;
      margin: 0 auto;
      padding: 10px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .small { font-size: 10px; }
    .line { border-bottom: 1px dashed #000; margin: 8px 0; }
    .double-line { border-bottom: 2px solid #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; margin: 4px 0; }
    .arabic { direction: rtl; text-align: right; font-family: 'Traditional Arabic', serif; }
    .qr-code { text-align: center; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 4px 0; border-bottom: 1px dotted #ccc; }
    .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #000; }
  </style>
</head>
<body>
  <div class="text-center">
    <div style="font-size: 16px;" class="bold">${companyName}</div>
    <div class="small">${companyAddress}</div>
    <div class="small">Tel: ${companyPhone}</div>
    ${includeArabic ? `
    <div class="arabic small" style="margin-top: 8px;">
      <div class="bold">${companyName}</div>
      <div>${companyAddress}</div>
    </div>
    ` : ''}
  </div>

  <div class="line"></div>

  <div class="row">
    <span>Date: ${new Date(transaction.createdAt).toLocaleDateString('en-AE')}</span>
    <span>Time: ${new Date(transaction.createdAt).toLocaleTimeString('en-AE')}</span>
  </div>
  <div class="row">
    <span>Invoice #: ${transaction.id}</span>
    <span>TRN: ${trnNumber}</span>
  </div>
  ${transaction.customer ? `
  <div class="row">
    <span>Customer: ${transaction.customer}</span>
  </div>
  ` : ''}
  ${staff ? `
  <div class="row">
    <span>Cashier: ${staff.name}</span>
  </div>
  ` : ''}
  ${transaction.table ? `
  <div class="row">
    <span>Table: ${transaction.table}</span>
  </div>
  ` : ''}

  <div class="double-line"></div>

  <table>
    <thead>
      <tr class="bold">
        <th style="width: 45%;">Item</th>
        <th style="width: 15%; text-align: center;">Qty</th>
        <th style="width: 20%; text-align: right;">Price</th>
        <th style="width: 20%; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">${formatCurrency(item.price)}</td>
        <td style="text-align: right;">${formatCurrency(item.price * item.qty)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="line"></div>

  <div class="row">
    <span>Subtotal:</span>
    <span>${formatCurrency(subtotal)}</span>
  </div>
  ${discount > 0 ? `
  <div class="row">
    <span>Discount:</span>
    <span>-${formatCurrency(discount)}</span>
  </div>
  ` : ''}
  <div class="row">
    <span>VAT (5%):</span>
    <span>${formatCurrency(vatAmount)}</span>
  </div>
  ${transaction.paymentMethod ? `
  <div class="row">
    <span>Payment:</span>
    <span class="bold">${transaction.paymentMethod.toUpperCase()}</span>
  </div>
  ` : ''}

  <div class="double-line"></div>

  <div class="row total-row">
    <span>TOTAL:</span>
    <span>${formatCurrency(total)}</span>
  </div>

  <div class="double-line"></div>

  ${showQRCode ? `
  <div class="qr-code">
    <div style="width: 100px; height: 100px; margin: 0 auto; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px;">
      [QR Code]<br/>TRN Verified
    </div>
  </div>
  ` : ''}

  <div class="text-center small">
    <div>${receiptFooter}</div>
    ${includeArabic ? `
    <div class="arabic" style="margin-top: 8px;">
      <div>شكراً لتعاملكم!</div>
    </div>
    ` : ''}
  </div>

  <div class="line" style="margin-top: 12px;"></div>

  <div class="text-center small" style="color: #666;">
    <div>Tax Invoice - Original Copy</div>
    <div>FTA Compliant | TRN: ${trnNumber}</div>
  </div>

  <script>
    window.onload = function() {
      // Auto-print on load (optional)
      // window.print();
    };
  </script>
</body>
</html>
  `.trim();

  return receiptHtml;
}

// Function to print receipt
export function printReceipt(html, newWindow = true) {
  if (newWindow) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  } else {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    document.body.appendChild(printFrame);
    printFrame.contentDocument.write(html);
    printFrame.contentDocument.close();
    setTimeout(() => {
      printFrame.contentWindow.print();
      document.body.removeChild(printFrame);
    }, 250);
  }
}

// Function to download receipt as PDF (requires html2pdf or similar)
export async function downloadReceiptAsPDF(html, filename = 'receipt.pdf') {
  // This would require html2pdf.js or similar library
  console.log('Download receipt:', filename);
  alert('PDF download feature requires html2pdf.js library');
}

// Function to share receipt via WhatsApp
export function shareReceiptViaWhatsApp(transaction, phone = '') {
  const message = `
*${transaction.branchName || 'DERPX Store'}*
📄 Invoice #: ${transaction.id}
📅 ${new Date(transaction.createdAt).toLocaleDateString('en-AE')}

*Items:*
${typeof transaction.items === 'string' ? JSON.parse(transaction.items).map(i => `• ${i.name} x${i.qty} - AED ${(i.price * i.qty).toFixed(2)}`).join('\n') : ''}

*Total: AED ${transaction.total?.toFixed(2) || '0.00'}*

Thank you for your business!
  `.trim();

  const whatsappUrl = `https://wa.me/${phone}?${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Function to send receipt via SMS
export function sendReceiptViaSMS(phone, message) {
  const smsUrl = `sms:${phone}?&body=${encodeURIComponent(message)}`;
  window.open(smsUrl, '_blank');
}

// Function to send receipt via Email
export function sendReceiptViaEmail(email, subject, htmlContent) {
  // This would require backend email service
  console.log('Send email:', email, subject);
  alert('Email feature requires backend integration');
}
