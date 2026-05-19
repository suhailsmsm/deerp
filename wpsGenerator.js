/**
 * UAE WPS .SIF File Generator
 * Generates the comma-separated file required for salary transfers in the UAE.
 */
export function generateSIFContent(company, employees, month, year) {
  const fileCreationDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const fileCreationTime = new Date().toTimeString().slice(0, 5).replace(/:/g, '');
  
  // Header Record (EDR)
  let sif = `EDR,${company.employerID},${company.bankCode},${fileCreationDate},${fileCreationTime},${employees.length}\n`;
  
  // Employee Records (SCR)
  employees.forEach(emp => {
    const salary = (emp.basicSalary + emp.allowances).toFixed(2);
    sif += `SCR,${emp.personID},${emp.bankCode},${emp.accountNumber},${month}${year},${salary},0.00,0\n`;
  });
  
  return sif;
}

export function downloadSIF(content, filename = "wps_export.sif") {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}