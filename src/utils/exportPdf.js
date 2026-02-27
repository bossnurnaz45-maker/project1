import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { COLUMN_KEYS, getCellValue } from '../components/DataTable';

const COLUMN_LABELS = {
  id: 'ID',
  name: '\u0418\u043C\u044F',
  username: '\u041B\u043E\u0433\u0438\u043D',
  email: 'Email',
  phone: '\u0422\u0435\u043B\u0435\u0444\u043E\u043D',
  website: '\u0421\u0430\u0439\u0442',
  company: '\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F',
  city: '\u0413\u043E\u0440\u043E\u0434',
};

const PDF_OPTIONS = {
  iframe: {
    width: 595,
    height: 842,
  },
  renderDelay: 800,
  logo: {
    path: '/logo-placeholder.png',
    x: 14,
    y: 10,
    width: 30,
    height: 10,
  },
};

const TABLE_STYLE = {
  header: 'background:#646cff;color:white;padding:6px 8px;text-align:left;border:1px solid #ddd;font-family:Roboto,Arial,sans-serif;',
  cell: 'padding:5px 8px;border:1px solid #ddd;font-family:Roboto,Arial,sans-serif;',
};

async function loadLogoAsBase64() {
  try {
    const res = await fetch(PDF_OPTIONS.logo.path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function buildTableData(users, selectedColumns) {
  const columns = selectedColumns.length > 0 ? selectedColumns : COLUMN_KEYS.map((c) => c.key);
  const headers = columns.map((k) => COLUMN_LABELS[k] || k);
  const rows = users.map((user) => columns.map((key) => String(getCellValue(user, key))));
  return { columns, headers, rows };
}

function buildPdfHtml(users, selectedColumns, dateStr) {
  const { headers, rows } = buildTableData(users, selectedColumns);

  const headerCells = headers
    .map((h) => `<th style="${TABLE_STYLE.header}">${escapeHtml(h)}</th>`)
    .join('');

  const dataRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td style="${TABLE_STYLE.cell}">${escapeHtml(cell)}</td>`).join('')}</tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:20px;font-family:Roboto,Arial,sans-serif;background:white;">
  <h1 style="text-align:center;font-size:18px;margin:0 0 10px;font-weight:700;">\u041E\u0442\u0447\u0435\u0442 \u043F\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F\u043C</h1>
  <p style="text-align:center;font-size:10px;margin:0 0 15px;color:#333;">\u0414\u0430\u0442\u0430 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438: ${escapeHtml(dateStr)}</p>
  <table style="width:100%;border-collapse:collapse;font-size:9px;font-family:Roboto,Arial,sans-serif;">
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${dataRows}</tbody>
  </table>
</body>
</html>
  `.trim();
}

async function captureContentAsImage(html) {
  const { width, height } = PDF_OPTIONS.iframe;
  const iframe = document.createElement('iframe');

  iframe.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;border:none;z-index:99999;background:white;`;
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  await new Promise((r) => setTimeout(r, PDF_OPTIONS.renderDelay));

  const body = iframeDoc.body;
  const canvas = await html2canvas(body, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: width,
    windowHeight: body.scrollHeight,
  });

  document.body.removeChild(iframe);
  return canvas;
}

export async function exportUsersToPdf(users, selectedColumns) {
  const dateStr = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = buildPdfHtml(users, selectedColumns, dateStr);
  const canvas = await captureContentAsImage(html);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logo = PDF_OPTIONS.logo;

  let yPos = 10;

  const logoBase64 = await loadLogoAsBase64();
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', logo.x, logo.y, logo.width, logo.height);
    yPos = 25;
  }

  const imgWidth = pageWidth - 20;
  const availableHeight = pageHeight - yPos - 10;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight > availableHeight) {
    imgHeight = availableHeight;
  }

  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, yPos, imgWidth, imgHeight);
  doc.save(`users-report-${new Date().getFullYear()}.pdf`);
}
