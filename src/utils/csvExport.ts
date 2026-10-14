import { EventRegistration, FormQuestion } from '../types';

/**
 * Escapes a cell value for standard CSV compatibility
 */
function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  if (Array.isArray(val)) {
    return `"${val.map(v => String(v).replace(/"/g, '""')).join(', ')}"`;
  }
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Exports registrations to a dynamically-columned CSV in the browser
 */
export function exportRegistrationsToCsv(
  eventTitle: string,
  eventId: string,
  registrations: EventRegistration[],
  questions: FormQuestion[]
): void {
  // 1. Build Header Row
  const baseHeaders = [
    'Registration ID',
    'Event ID',
    'Event Title',
    'Submission Date',
    'Participant Name',
    'Participant Email',
    'Form Version'
  ];

  // Dynamic question headers (only inputs, ignoring layout blocks)
  const questionFields = questions.filter(q => !['section', 'image'].includes(q.type));
  const questionHeaders = questionFields.map(q => q.label);

  const paymentHeaders = [
    'Payment Required',
    'Amount',
    'Currency',
    'Transaction ID',
    'Payment Status',
    'Payment Screenshot URL',
    'Verification Notes'
  ];

  const fullHeaderRow = [...baseHeaders, ...questionHeaders, ...paymentHeaders]
    .map(escapeCsvCell)
    .join(',');

  // 2. Build Data Rows
  const dataRows = registrations.map(reg => {
    const baseCols = [
      reg.registrationId,
      reg.eventId,
      reg.eventTitle || eventTitle,
      new Date(reg.submittedAt).toLocaleString(),
      reg.participantName || '',
      reg.userEmail || '',
      reg.formVersion || 1
    ];

    const questionCols = questionFields.map(q => {
      return reg.answers?.[q.id] ?? '';
    });

    const paymentCols = [
      reg.payment?.enabled ? 'Yes' : 'No',
      reg.payment?.amount ?? 0,
      reg.payment?.currency ?? '₹',
      reg.payment?.transactionId ?? '',
      reg.payment?.status ?? 'N/A',
      reg.payment?.screenshotUrl ?? '',
      reg.payment?.notes ?? ''
    ];

    return [...baseCols, ...questionCols, ...paymentCols]
      .map(escapeCsvCell)
      .join(',');
  });

  const csvContent = '\uFEFF' + [fullHeaderRow, ...dataRows].join('\r\n');

  // 3. Trigger Browser File Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const filename = `NBKRIST_${sanitizedTitle}_Registrations.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
