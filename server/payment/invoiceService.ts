import { storagePut } from '../storage';
import { invoices } from '../../drizzle/schema';

export interface InvoiceData {
  id: number;
  invoiceNumber: string;
  billingName: string;
  billingEmail: string;
  billingAddress?: string | null;
  billingVatId?: string | null;
  itemDescription: string;
  amount: number;
  currency: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  issuedAt: Date | null;
  paidAt: Date | null;
}

/**
 * Generate PDF invoice and upload to S3
 */
export async function generateInvoicePDF(invoice: InvoiceData): Promise<string> {
  try {
    // Generate HTML for invoice
    const html = generateInvoiceHTML(invoice);

    // Convert HTML to PDF using WeasyPrint (installed in sandbox)
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const fs = await import('fs/promises');

    // Write HTML to temp file
    const tempHtmlPath = `/tmp/invoice-${invoice.invoiceNumber}.html`;
    const tempPdfPath = `/tmp/invoice-${invoice.invoiceNumber}.pdf`;

    await fs.writeFile(tempHtmlPath, html, 'utf-8');

    // Convert to PDF using weasyprint
    await execAsync(`weasyprint ${tempHtmlPath} ${tempPdfPath}`);

    // Read PDF file
    const pdfBuffer = await fs.readFile(tempPdfPath);

    // Upload to S3
    const s3Key = `invoices/${invoice.invoiceNumber}.pdf`;
    const { url } = await storagePut(s3Key, pdfBuffer, 'application/pdf');

    // Clean up temp files
    await fs.unlink(tempHtmlPath);
    await fs.unlink(tempPdfPath);

    console.log(`[Invoice] PDF generated and uploaded: ${url}`);
    return url;
  } catch (error) {
    console.error('[Invoice] Failed to generate PDF:', error);
    throw error;
  }
}

/**
 * Generate HTML for invoice
 */
function generateInvoiceHTML(invoice: InvoiceData): string {
  const formatCurrency = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  };

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rechnung ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      padding: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 60px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2563EB;
    }
    
    .company-info {
      flex: 1;
    }
    
    .company-name {
      font-size: 24pt;
      font-weight: bold;
      color: #2563EB;
      margin-bottom: 10px;
    }
    
    .company-details {
      font-size: 9pt;
      color: #666;
      line-height: 1.4;
    }
    
    .invoice-info {
      text-align: right;
    }
    
    .invoice-title {
      font-size: 28pt;
      font-weight: bold;
      color: #2563EB;
      margin-bottom: 10px;
    }
    
    .invoice-number {
      font-size: 12pt;
      color: #666;
      margin-bottom: 5px;
    }
    
    .billing-section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #2563EB;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .billing-address {
      background: #f8f9fa;
      padding: 15px;
      border-left: 3px solid #2563EB;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table th {
      background: #2563EB;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      font-size: 10pt;
    }
    
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .items-table tr:last-child td {
      border-bottom: none;
    }
    
    .text-right {
      text-align: right;
    }
    
    .totals-section {
      margin-left: auto;
      width: 300px;
      margin-bottom: 40px;
    }
    
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .totals-row.total {
      font-size: 14pt;
      font-weight: bold;
      color: #2563EB;
      border-top: 2px solid #2563EB;
      border-bottom: 2px solid #2563EB;
      padding: 12px 0;
      margin-top: 10px;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }
    
    .footer-section {
      margin-bottom: 10px;
    }
    
    .payment-info {
      background: #f8f9fa;
      padding: 20px;
      margin-bottom: 30px;
      border-left: 3px solid #10B981;
    }
    
    .payment-info-title {
      font-size: 12pt;
      font-weight: bold;
      color: #10B981;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-name">Mi42</div>
      <div class="company-details">
        Marktforschungsportal für die Bauzulieferindustrie<br>
        Beispielstraße 123<br>
        12345 Musterstadt<br>
        Deutschland<br>
        <br>
        USt-IdNr.: DE123456789<br>
        Steuernummer: 123/456/78901
      </div>
    </div>
    <div class="invoice-info">
      <div class="invoice-title">RECHNUNG</div>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <div class="invoice-number">Datum: ${formatDate(invoice.issuedAt)}</div>
    </div>
  </div>

  <div class="billing-section">
    <div class="section-title">Rechnungsempfänger</div>
    <div class="billing-address">
      <strong>${invoice.billingName}</strong><br>
      ${invoice.billingEmail}<br>
      ${invoice.billingAddress || ''}<br>
      ${invoice.billingVatId ? `USt-IdNr.: ${invoice.billingVatId}` : ''}
    </div>
  </div>

  ${invoice.paidAt ? `
  <div class="payment-info">
    <div class="payment-info-title">✓ Bezahlt</div>
    <div>Zahlungseingang: ${formatDate(invoice.paidAt)}</div>
    <div>Vielen Dank für Ihre Zahlung!</div>
  </div>
  ` : ''}

  <table class="items-table">
    <thead>
      <tr>
        <th>Pos.</th>
        <th>Beschreibung</th>
        <th class="text-right">Menge</th>
        <th class="text-right">Einzelpreis</th>
        <th class="text-right">Gesamt</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${invoice.itemDescription}</td>
        <td class="text-right">1</td>
        <td class="text-right">${formatCurrency(invoice.amount, invoice.currency)}</td>
        <td class="text-right">${formatCurrency(invoice.amount, invoice.currency)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-section">
    <div class="totals-row">
      <span>Zwischensumme:</span>
      <span>${formatCurrency(invoice.amount, invoice.currency)}</span>
    </div>
    <div class="totals-row">
      <span>MwSt. (${invoice.taxRate}%):</span>
      <span>${formatCurrency(invoice.taxAmount, invoice.currency)}</span>
    </div>
    <div class="totals-row total">
      <span>Gesamtbetrag:</span>
      <span>${formatCurrency(invoice.totalAmount, invoice.currency)}</span>
    </div>
  </div>

  <div class="footer">
    <div class="footer-section">
      <strong>Mi42</strong> | Beispielstraße 123 | 12345 Musterstadt | Deutschland
    </div>
    <div class="footer-section">
      E-Mail: rechnung@mi42.com | Web: www.mi42.com | Tel: +49 (0) 123 456789
    </div>
    <div class="footer-section">
      Geschäftsführer: Max Mustermann | Amtsgericht Musterstadt | HRB 12345
    </div>
    <div class="footer-section">
      USt-IdNr.: DE123456789 | Steuernummer: 123/456/78901
    </div>
  </div>
</body>
</html>
  `.trim();
}
