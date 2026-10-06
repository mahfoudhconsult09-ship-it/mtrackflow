import { NextResponse } from 'next/server';

function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i]; const n = input[i + 1];
    if (quoted) { if (c === '"' && n === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; }
    else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  row.push(cell); if (row.some(Boolean)) rows.push(row); return rows;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (typeof url !== 'string' || !url.trim()) return NextResponse.json({ error: 'Google Sheets URL is required.' }, { status: 400 });
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return NextResponse.json({ error: 'Invalid Google Sheets URL.' }, { status: 400 });
    const gid = parsed.searchParams.get('gid') || '0';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${encodeURIComponent(gid)}`;
    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ error: 'Sheet could not be read. Make sure it is shared as “Anyone with the link can view”.' }, { status: 400 });
    const text = await response.text();
    if (text.length > 5 * 1024 * 1024) return NextResponse.json({ error: 'The Google Sheet export is larger than 5 MB.' }, { status: 400 });
    const matrix = parseCsv(text);
    if (!matrix.length) return NextResponse.json({ error: 'The Google Sheet is empty.' }, { status: 400 });
    const headers = matrix[0].map(h => h.trim());
    const rows = matrix.slice(1).filter(r => r.some(v => v.trim())).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
    return NextResponse.json({ rows });
  } catch (e: any) { return NextResponse.json({ error: e?.message || 'Could not read Google Sheet.' }, { status: 500 }); }
}
