import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Pfad zur CSV-Datei
const csvFilePath = 'scripts/kollegen.csv';

try {
  // Lese CSV-Datei
  console.log(`Lese CSV-Datei: ${csvFilePath}`);
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  
  // Parse CSV-Daten
  console.log('Verarbeite CSV-Daten...');
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });
  
  console.log(`Anzahl der Datensätze: ${records.length}`);
  
  // Extrahiere E-Mail-Adressen
  const emails = records
    .map(record => record['E-mail Address'] || record['E-Mail'] || record.email || record['e-mail'])
    .filter(email => email && email.includes('@'));
  
  console.log(`Anzahl der E-Mail-Adressen: ${emails.length}`);
  
  // Zeige die ersten 5 E-Mail-Adressen an
  console.log('Erste 5 E-Mail-Adressen:');
  emails.slice(0, 5).forEach(email => console.log(`- ${email}`));
  
  console.log('CSV-Datei wurde erfolgreich gelesen und verarbeitet.');
} catch (error) {
  console.error('Fehler beim Lesen der CSV-Datei:', error);
} 