const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parse } = require('csv-parse/sync');

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
  console.log('Lade alle Kontakte...');
  
  // Fallback-Kontakte aus Umgebungsvariablen, falls keine Kontaktdatei gefunden wird
  const fallbackContacts = process.env.EMAIL_LIST_KOLLEGEN ? 
    process.env.EMAIL_LIST_KOLLEGEN.split(',').map(email => email.trim()) : [];
  
  try {
    // Versuche zuerst, Kontakte aus der verschlüsselten Datei zu laden
    const contacts = await loadContacts('kollegen');
    
    if (contacts && contacts.length > 0) {
      console.log(`${contacts.length} Kontakte aus Datei geladen`);
      return contacts;
    }
    
    // Wenn keine Kontakte in der Datei gefunden wurden, verwende Fallback
    if (fallbackContacts.length > 0) {
      console.log(`Keine Kontakte in Datei gefunden, verwende ${fallbackContacts.length} Fallback-Kontakte aus Umgebungsvariablen`);
      return fallbackContacts;
    }
    
    console.log('Keine Kontakte gefunden (weder in Datei noch in Umgebungsvariablen)');
    return [];
  } catch (error) {
    console.error('Fehler beim Laden aller Kontakte:', error);
    
    // Bei Fehler: Verwende Fallback-Kontakte aus Umgebungsvariablen
    if (fallbackContacts.length > 0) {
      console.log(`Fehler beim Laden der Kontakte, verwende ${fallbackContacts.length} Fallback-Kontakte aus Umgebungsvariablen`);
      return fallbackContacts;
    }
    
    return [];
  }
}

module.exports = {
  loadContacts,
  loadAllContacts,
  encryptData
}; 