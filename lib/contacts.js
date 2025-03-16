const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const csv = require('csv-parser');

// Cache für entschlüsselte Kontakte
let contactsCache = null;
let lastCacheTime = 0;
const CACHE_VALIDITY_MS = 3600000; // 1 Stunde Cache-Gültigkeit

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
async function loadContacts(groupName) {
  try {
    console.log(`Starte Laden der Kontakte für Gruppe: ${groupName}`);
    
    // Prüfe, ob wir einen gültigen Cache haben
    const now = Date.now();
    if (contactsCache && (now - lastCacheTime < CACHE_VALIDITY_MS)) {
      console.log(`Verwende gecachte Kontakte (${contactsCache.length} Einträge)`);
      return contactsCache;
    }

    // Pfad zur verschlüsselten Kontaktdatei
    const filePath = path.join(process.cwd(), 'data', `${groupName}.enc`);
    console.log(`Suche Kontaktdatei unter: ${filePath}`);
    
    // Prüfe, ob die Datei existiert
    if (!fs.existsSync(filePath)) {
      console.error(`Kontaktdatei für ${groupName} nicht gefunden`);
      return [];
    }
    
    console.log(`Kontaktdatei gefunden, lese Daten...`);
    
    // Lade verschlüsselte Daten
    const encryptedData = fs.readFileSync(filePath, 'utf8');
    console.log(`Verschlüsselte Daten gelesen (${encryptedData.length} Bytes)`);
    
    // Hole Entschlüsselungsschlüssel aus Umgebungsvariablen
    const decryptionKey = process.env.CONTACTS_ENCRYPTION_KEY;
    if (!decryptionKey) {
      console.error('Kein Entschlüsselungsschlüssel in den Umgebungsvariablen gefunden');
      return [];
    }
    
    console.log('Entschlüsselungsschlüssel gefunden, entschlüssele Daten...');
    
    // Entschlüssele die Daten
    const csvData = decryptContacts(encryptedData, decryptionKey);
    if (!csvData) {
      console.error('Entschlüsselung fehlgeschlagen');
      return [];
    }
    
    console.log(`Daten erfolgreich entschlüsselt (${csvData.length} Bytes), parse CSV...`);
    
    // Parse CSV-Daten
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`CSV erfolgreich geparst, ${records.length} Datensätze gefunden`);
    
    // Extrahiere E-Mail-Adressen
    const emails = records
      .map(record => {
        // Versuche verschiedene mögliche Spaltennamen für E-Mail-Adressen
        const email = record['E-mail Address'] || record['E-Mail'] || record.email || record['e-mail'] || 
                     record['Email'] || record['EMAIL'] || record['E-MAIL'] || record['E-mail'];
        
        if (email) {
          return email.trim();
        }
        return null;
      })
      .filter(email => email && email.includes('@'));
    
    console.log(`${emails.length} gültige E-Mail-Adressen extrahiert`);
    
    // Aktualisiere den Cache
    contactsCache = emails;
    lastCacheTime = now;
    
    return emails;
  } catch (error) {
    console.error('Fehler beim Laden der Kontaktdaten:', error);
    console.error(error.stack);
    return [];
  }
}

// Hilfsfunktion zum Verschlüsseln von Daten (nur für die Vorbereitung der Dateien)
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

// Funktion zum Laden aller Kontakte
async function loadAllContacts() {
  // Verwende die Kontaktliste direkt aus der Umgebungsvariable
  const contactList = process.env.EMAIL_LIST_KOLLEGEN || '';
  const contacts = contactList.split(',').map(email => email.trim()).filter(email => email);
  
  console.log(`Verwende ${contacts.length} Kontakte aus der Umgebungsvariable EMAIL_LIST_KOLLEGEN`);
  return contacts;
}

// Hilfsfunktion zum Laden der Kontakte aus der Datei (als Fallback)
async function loadContactsFromFile() {
  return new Promise((resolve, reject) => {
    try {
      const contactsFilePath = path.join(process.cwd(), 'data', 'kollegen.enc');
      
      // Prüfe, ob die Datei existiert
      if (!fs.existsSync(contactsFilePath)) {
        console.warn('Kontaktdatei nicht gefunden:', contactsFilePath);
        return resolve([]);
      }
      
      // Prüfe, ob der Entschlüsselungsschlüssel vorhanden ist
      const encryptionKey = process.env.CONTACTS_ENCRYPTION_KEY;
      if (!encryptionKey) {
        console.warn('Entschlüsselungsschlüssel nicht gefunden');
        return resolve([]);
      }
      
      // Lese die verschlüsselte Datei
      const encryptedData = fs.readFileSync(contactsFilePath);
      
      // Entschlüssele die Daten
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(encryptionKey, 'salt', 32);
      const iv = encryptedData.slice(0, 16);
      const encryptedContent = encryptedData.slice(16);
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedContent);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      // Verarbeite die CSV-Daten
      const results = [];
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(decrypted);
      
      bufferStream
        .pipe(csv())
        .on('data', (data) => {
          // Extrahiere die E-Mail-Adresse aus den CSV-Daten
          if (data.Email) {
            results.push(data.Email);
          }
        })
        .on('end', () => {
          console.log(`${results.length} Kontakte aus der Datei geladen`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('Fehler beim Parsen der CSV-Daten:', error);
          reject(error);
        });
    } catch (error) {
      console.error('Fehler beim Laden der Kontakte:', error);
      reject(error);
    }
  });
}

module.exports = {
  loadContacts,
  loadAllContacts,
  encryptData
}; 