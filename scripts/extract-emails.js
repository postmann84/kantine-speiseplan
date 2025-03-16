const fs = require('fs');
const csv = require('csv-parser');

// Pfad zur CSV-Datei
const csvFilePath = 'scripts/kollegen.csv';

// Array für E-Mail-Adressen
const emails = [];

// CSV-Datei lesen und E-Mail-Adressen extrahieren
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Versuche verschiedene mögliche Spaltennamen für E-Mail-Adressen
    const email = row['E-mail Address'] || row['E-Mail'] || row.email || row['e-mail'] || 
                 row['Email'] || row['EMAIL'] || row['E-MAIL'] || row['E-mail'];
    
    if (email && email.trim() && email.includes('@')) {
      emails.push(email.trim());
    }
  })
  .on('end', () => {
    console.log(`Insgesamt ${emails.length} E-Mail-Adressen gefunden.`);
    
    // Ausgabe als kommagetrennter String
    const emailString = emails.join(',');
    console.log('\nKommagetrennter String für EMAIL_LIST_KOLLEGEN:');
    console.log(emailString);
    
    // Optional: In Datei speichern
    fs.writeFileSync('email-list.txt', emailString);
    console.log('\nDie E-Mail-Liste wurde auch in die Datei "email-list.txt" geschrieben.');
  })
  .on('error', (error) => {
    console.error('Fehler beim Lesen der CSV-Datei:', error);
  }); 