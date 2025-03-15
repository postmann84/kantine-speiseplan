// Dieses Skript verschlüsselt CSV-Kontaktdaten und speichert sie im data-Verzeichnis
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parse } = require('csv-parse/sync');
const dotenv = require('dotenv');

// Lade Umgebungsvariablen
dotenv.config({ path: '.env.local' });

const ENCRYPTION_KEY = process.env.CONTACTS_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  console.error('Fehler: CONTACTS_ENCRYPTION_KEY nicht in .env.local gefunden');
  process.exit(1);
}

// Funktion zum Verschlüsseln von Daten
function encryptData(data, key) {
  // Generiere zufälligen Initialisierungsvektor
  const iv = crypto.randomBytes(16);
  
  // Erstelle Cipher mit AES-256-CBC
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    crypto.createHash('sha256').update(key).digest(), 
    iv
  );
  
  // Verschlüssele die Daten
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Gib IV + verschlüsselte Daten zurück
  return iv.toString('hex') + encrypted.toString('hex');
}

// Funktion zum Verschlüsseln einer CSV-Datei
async function encryptContactsFile(inputFile, outputGroup) {
  try {
    // Prüfe, ob die Eingabedatei existiert
    if (!fs.existsSync(inputFile)) {
      console.error(`Fehler: Datei ${inputFile} nicht gefunden`);
      return;
    }

    // Lese CSV-Datei
    const csvData = fs.readFileSync(inputFile, 'utf8');
    
    // Verschlüssele Daten
    const encryptedData = encryptData(csvData, ENCRYPTION_KEY);
    
    // Erstelle Ausgabeverzeichnis, falls es nicht existiert
    const outputDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Speichere verschlüsselte Daten
    const outputFile = path.join(outputDir, `${outputGroup}.enc`);
    fs.writeFileSync(outputFile, encryptedData);
    
    console.log(`Kontakte erfolgreich verschlüsselt und in ${outputFile} gespeichert`);
  } catch (error) {
    console.error('Fehler beim Verschlüsseln der Kontakte:', error);
  }
}

// Hauptfunktion
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Verwendung: node scripts/encrypt-contacts.js <csv-datei> <gruppenname>');
    console.log('Beispiel: node scripts/encrypt-contacts.js kollegen.csv kollegen');
    return;
  }
  
  const inputFile = args[0];
  const groupName = args[1];
  
  await encryptContactsFile(inputFile, groupName);
}

// Führe Hauptfunktion aus
main().catch(console.error); 