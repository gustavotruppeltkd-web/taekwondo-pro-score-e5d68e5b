import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { computeMatchReport, formatClock, type MatchEvent } from './matchReport';

export type { MatchEvent } from './matchReport';

export interface MatchReportData {
  log: MatchEvent[];
  chungName: string; // already resolved (never empty)
  hongName: string;
  winner: 'chung' | 'hong' | null;
  roundResults: Array<'chung' | 'hong' | null>;
}

const CHUNG_RGB: [number, number, number] = [37, 99, 235]; // blue
const HONG_RGB: [number, number, number] = [220, 38, 38]; // red
const DARK_RGB: [number, number, number] = [30, 30, 30];

const sanitizeFilename = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

// jspdf-autotable augments the doc instance with lastAutoTable at runtime.
const lastTableY = (doc: jsPDF): number =>
  (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

/**
 * Builds the match report PDF entirely in memory and triggers the browser
 * download. Nothing is persisted to disk or to any backend.
 */
export const generateMatchReport = (data: MatchReportData): void => {
  const { log, chungName, hongName, winner, roundResults } = data;
  const nameOf = (f: 'chung' | 'hong') => (f === 'chung' ? chungName : hongName);
  const { rounds, totals } = computeMatchReport(log, roundResults);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // --- Header ---
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_RGB);
  doc.text('TAEKWONDO PRO SCOREBOARD', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(
    `Relatório da luta — ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    pageWidth / 2,
    25,
    { align: 'center' }
  );

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...CHUNG_RGB);
  doc.text(chungName, pageWidth / 2 - 5, 35, { align: 'right' });
  doc.setTextColor(90);
  doc.text('x', pageWidth / 2, 35, { align: 'center' });
  doc.setTextColor(...HONG_RGB);
  doc.text(hongName, pageWidth / 2 + 5, 35, { align: 'left' });

  const chungRounds = roundResults.filter((r) => r === 'chung').length;
  const hongRounds = roundResults.filter((r) => r === 'hong').length;
  doc.setFontSize(12);
  doc.setTextColor(...DARK_RGB);
  doc.text(
    winner
      ? `Vencedor: ${nameOf(winner)}  (rounds ${chungRounds} - ${hongRounds})`
      : `Rounds ${chungRounds} - ${hongRounds}`,
    pageWidth / 2,
    43,
    { align: 'center' }
  );

  // --- Per-round tables ---
  let cursorY = 52;
  for (const r of rounds) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_RGB);
    doc.text(`ROUND ${r.round}`, 14, cursorY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110);
    doc.text(`Vencedor do round: ${r.winner ? nameOf(r.winner) : '—'}`, pageWidth - 14, cursorY, {
      align: 'right',
    });

    autoTable(doc, {
      startY: cursorY + 2,
      head: [['Tempo', 'Atleta', 'Evento', 'Placar (Azul - Vermelho)']],
      body:
        r.rows.length > 0
          ? r.rows.map((row) => [
              formatClock(row.clock),
              nameOf(row.fighter),
              row.event,
              `${row.chungScore} - ${row.hongScore}`,
            ])
          : [['—', '—', 'Sem pontos', '0 - 0']],
      theme: 'striped',
      headStyles: { fillColor: DARK_RGB, textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 22 }, 3: { halign: 'center', cellWidth: 45 } },
      margin: { left: 14, right: 14 },
    });

    cursorY = lastTableY(doc) + 10;
  }

  // --- Summary ---
  autoTable(doc, {
    startY: cursorY,
    head: [['Resumo', 'Pontos', 'Gam-jeom']],
    body: [
      [chungName, String(totals.chung.points), String(totals.chung.gamjeoms)],
      [hongName, String(totals.hong.points), String(totals.hong.gamjeoms)],
    ],
    theme: 'grid',
    headStyles: { fillColor: DARK_RGB, textColor: 255 },
    margin: { left: 14, right: 14 },
  });

  const filename = `luta_${sanitizeFilename(chungName)}_vs_${sanitizeFilename(hongName)}_${now
    .toISOString()
    .slice(0, 10)}.pdf`;
  doc.save(filename);
};
