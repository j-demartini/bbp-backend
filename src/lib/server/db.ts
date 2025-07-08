import Database from 'better-sqlite3';
import { join } from 'path';
import * as XLSX from 'xlsx';
import path from 'path'
import fs from 'fs';

const dbFile = join(process.cwd(), 'mydb.sqlite');
const db = new Database(dbFile) as any;

db.exec(`DROP TABLE IF EXISTS items`);
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    link TEXT
  );
`);

// Convert the file to an arrayBuffer

let buffer;

console.log(path.join(process.cwd(), 'data', 'ArtistData.xlsx'));
console.log(path.join(process.cwd(), 'ArtistData.xlsx'));

if(fs.existsSync(path.join(process.cwd(), 'data', 'ArtistData.xlsx')))
{
  buffer = fs.readFileSync(path.join(process.cwd(), 'data', 'ArtistData.xlsx'));
  console.log("A");
} else
if(fs.existsSync(path.join(process.cwd(), 'ArtistData.xlsx')))
{
  buffer = fs.readFileSync(path.join(process.cwd(), 'ArtistData.xlsx'));
  console.log("B");
}

if(buffer)
{

  console.log("success, continuing");
  const wb = XLSX.read(buffer, { type: 'array' });

  // Get the first sheet's data as JSON
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws);

  db.exec('DELETE FROM items');

  console.log("deleting");

  const insert = db.prepare('INSERT INTO items (name, link) VALUES (?, ?)');
  console.log("inserting rows");
  const insertMany = db.transaction((rows: { name: string, link?: string }[]) => {
  for (const row of rows) {
    if (row.name) {
      insert.run(row.name, row.link);
    }
  }
  });
  insertMany(data);
}

export function getArtists(searchTerm : string): { name:string, link:string } [] {
  const stmt = db.prepare('SELECT * FROM items');
  let artistLists: { name:string, link:string }[] = stmt.all();
  return artistLists.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
}

export function addArtist(name: string) {
  const stmt = db.prepare('INSERT INTO items (name) VALUES (?)');
  stmt.run(name);
}
