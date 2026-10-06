import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
const MAX_BYTES=5*1024*1024;
const MAX_ROWS=1000;

export async function POST(req:Request){
 try{
  const form=await req.formData(); const file=form.get('file');
  if(!(file instanceof File))return NextResponse.json({error:'Please choose an Excel or CSV file.'},{status:400});
  if(file.size>MAX_BYTES)return NextResponse.json({error:'File is too large. Maximum size is 5 MB.'},{status:400});
  const name=file.name.toLowerCase(); if(!/\.(xlsx|xls|csv)$/.test(name))return NextResponse.json({error:'Only .xlsx, .xls and .csv files are supported.'},{status:400});
  const buffer=await file.arrayBuffer();
  const wb=XLSX.read(buffer,{type:'array',cellFormula:false,cellHTML:false,cellNF:false,cellStyles:false,WTF:false});
  const first=wb.SheetNames[0]; if(!first)return NextResponse.json({error:'The spreadsheet has no worksheet.'},{status:400});
  const ws=wb.Sheets[first]; const rows=XLSX.utils.sheet_to_json<Record<string,string>>(ws,{defval:'',raw:false,blankrows:false});
  if(!rows.length)return NextResponse.json({error:'The spreadsheet has no data rows.'},{status:400});
  if(rows.length>MAX_ROWS)return NextResponse.json({error:`This file contains more than ${MAX_ROWS} rows. Please split it into smaller imports.`},{status:400});
  return NextResponse.json({rows});
 }catch(e:any){return NextResponse.json({error:'Could not read this spreadsheet. Check that it is a valid Excel or CSV file.'},{status:400});}
}
