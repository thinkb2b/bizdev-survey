import { SurveySubmission } from '../types';
import { SURVEY_BLOCKS } from '../constants';

// Helper to escape CSV fields
const escapeCsvField = (field: string | number | undefined): string => {
  if (field === undefined || field === null) return '';
  const stringField = String(field);
  // If field contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (stringField.search(/("|,|\n)/g) >= 0) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export const generateCSV = (submissions: SurveySubmission[]): void => {
  if (submissions.length === 0) {
    alert("Keine Daten zum Exportieren vorhanden.");
    return;
  }

  // 1. Build Headers
  // Personal info headers
  const staticHeaders = [
    'Submission Date',
    'First Name',
    'Last Name',
    'Position',
    'Time in Company',
    'Working Years'
  ];

  // Survey question headers (flattened)
  // We collect IDs to map answers later, but use text for the Header row
  const questionMap: Array<{id: string, text: string}> = [];
  
  SURVEY_BLOCKS.forEach(block => {
    block.questions.forEach(q => {
      if (q.type !== 'header') {
        questionMap.push({ id: q.id, text: q.text });
      }
    });
  });

  const allHeaders = [...staticHeaders, ...questionMap.map(q => q.text)];
  const headerRow = allHeaders.map(escapeCsvField).join(',');

  // 2. Build Rows
  const rows = submissions.map(sub => {
    const rowValues: (string | number)[] = [
      new Date(sub.timestamp).toLocaleDateString() + ' ' + new Date(sub.timestamp).toLocaleTimeString(),
      sub.personalInfo.firstName,
      sub.personalInfo.lastName,
      sub.personalInfo.position,
      sub.personalInfo.yearsInCompany,
      sub.personalInfo.workingYears
    ];

    questionMap.forEach(q => {
      const answer = sub.answers[q.id] || '';
      rowValues.push(answer);
    });

    return rowValues.map(escapeCsvField).join(',');
  });

  // 3. Combine and Download
  const csvContent = "\uFEFF" + [headerRow, ...rows].join('\n'); // Add BOM for Excel utf-8 compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `survey_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};