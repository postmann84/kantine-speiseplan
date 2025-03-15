import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { parse } from 'csv-parse/sync';

// Funktion zum Entschlüsseln der Kontaktdaten
function decryptContacts(encryptedData, key) {
  try {
    // Extrahiere IV und verschlüsselte Daten
    const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
    const encrypted = Buffer.from(encryptedData.slice(32), 'hex');
    
    // Erstelle Decipher mit AES-256-CBC
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      crypto.createHash('sha256').update(key).digest(), 
      iv
    );
    
    // Entschlüssele die Daten
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Fehler beim Entschlüsseln der Kontaktdaten:', error);
    return null;
  }
}

// Funktion zum Laden und Parsen der Kontaktdaten
export async function loadContacts(groupName) {
  try {
    // Pfad zur verschlüsselten Kontaktdatei
    const filePath = path.join(process.cwd(), 'data', `${groupName}.enc`);
    
    // Prüfe, ob die Datei existiert
    if (!fs.existsSync(filePath)) {
      console.error(`Kontaktdatei für ${groupName} nicht gefunden`);
      return [];
    }
    
    // Lade verschlüsselte Daten
    const encryptedData = fs.readFileSync(filePath, 'utf8');
    
    // Hole Entschlüsselungsschlüssel aus Umgebungsvariablen
    const decryptionKey = process.env.CONTACTS_ENCRYPTION_KEY;
    if (!decryptionKey) {
      console.error('Kein Entschlüsselungsschlüssel in den Umgebungsvariablen gefunden');
      return [];
    }
    
    // Entschlüssele die Daten
    const csvData = decryptContacts(encryptedData, decryptionKey);
    if (!csvData) {
      return [];
    }
    
    // Parse CSV-Daten
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Extrahiere E-Mail-Adressen
    const emails = records
      .map(record => record.Email || record['E-Mail'] || record.email || record['e-mail'])
      .filter(email => email && email.includes('@'));
    
    return emails;
  } catch (error) {
    console.error('Fehler beim Laden der Kontaktdaten:', error);
    return [];
  }
}

// Hilfsfunktion zum Verschlüsseln von Daten (nur für die Vorbereitung der Dateien)
export function encryptData(data, key) {
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

// Funktion zum Laden aller Kontakte
export async function loadAllContacts() {
  // Es gibt nur eine Kontaktdatei "kollegen"
  return await loadContacts('kollegen');
} 