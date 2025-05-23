import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { getWeekDates } from '../../lib/dateUtils';

// Hilfsfunktion zum Formatieren des Datums
const formatDateRange = (startDate, endDate) => {
  const startDay = startDate.getDate().toString().padStart(2, '0');
  const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
  const endDay = endDate.getDate().toString().padStart(2, '0');
  const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
  const year = endDate.getFullYear();
  return `${startDay}.${startMonth}.-${endDay}.${endMonth}.${year}`;
};

// Hilfsfunktion um die Kalenderwoche zu berechnen
function getWeek(date) {
  const target = new Date(date);
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() != 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

// Hilfsfunktion zum Aufteilen eines Arrays in Batches
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting email send process...');
    
    // Extrahiere Parameter aus der Anfrage
    const { 
      weekStart, 
      weekEnd, 
      weekNumber, 
      year, 
      startBatchIndex = 0, // Standardmäßig beginnen wir mit dem ersten Batch
      totalSent = 0        // Standardmäßig wurden noch keine E-Mails versendet
    } = req.body;

    if (!weekNumber || !year) {
      // Fallback auf alte Implementierung, wenn weekNumber und year fehlen
      if (!weekStart || !weekEnd) {
        throw new Error('Keine ausreichenden Wochendaten vorhanden');
      }
    }

    // Wochendaten entweder aus weekNumber und year berechnen oder aus den übergebenen Daten verwenden
    let actualWeekDates;
    if (weekNumber && year) {
      // Nutze die Funktion aus dateUtils.js um Montag und Freitag für die ausgewählte Woche zu berechnen
      actualWeekDates = getWeekDates(year, weekNumber);
    } else {
      // Fallback: Verwende das alte Verfahren
      actualWeekDates = {
        start: new Date(weekStart),
        end: new Date(weekEnd)
      };
    }

    // Formatiere das Datum korrekt für die ausgewählte Woche
    const dateRange = formatDateRange(actualWeekDates.start, actualWeekDates.end);
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;

    console.log('Verwende Datumszeitraum:', dateRange);

    // Kontakte aus der Umgebungsvariable laden
    const emailListString = process.env.EMAIL_LIST_KOLLEGEN || '';
    const allContacts = emailListString.split(',').map(email => email.trim()).filter(email => email);
    
    console.log(`${allContacts.length} Kontakte aus Umgebungsvariable geladen`);

    // Kontakte in Batches von maximal 25 Empfängern aufteilen
    const BATCH_SIZE = 25;
    const contactBatches = chunkArray(allContacts, BATCH_SIZE);
    console.log(`Kontakte in ${contactBatches.length} Batches aufgeteilt`);

    // Maximale Anzahl von Batches, die in einer Anfrage versendet werden können
    const MAX_BATCHES_PER_REQUEST = 1;
    
    // Berechne den Endindex für diese Anfrage
    const endBatchIndex = Math.min(startBatchIndex + MAX_BATCHES_PER_REQUEST, contactBatches.length);
    
    // Prüfe, ob es noch Batches zu versenden gibt
    if (startBatchIndex >= contactBatches.length) {
      // Alle Batches wurden bereits versendet, sende eine Bestätigungs-E-Mail
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          }
        });
        
        const summaryMailOptions = {
          from: {
            name: 'Betriebskantine',
            address: process.env.EMAIL_USER
          },
          to: process.env.EMAIL_USER,
          subject: `Speiseplan ${dateRange} - Versandbestätigung`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">Versandbestätigung</h2>
              <p>Der Speiseplan für die Woche vom ${dateRange} wurde erfolgreich an alle ${totalSent} Empfänger versendet.</p>
              <p>Versandzeitpunkt: ${new Date().toLocaleString('de-DE')}</p>
            </div>
          `
        };

        await transporter.sendMail(summaryMailOptions);
        console.log('Bestätigungs-E-Mail an Absender versendet');
      } catch (error) {
        console.error('Fehler beim Versenden der Bestätigungs-E-Mail:', error);
      }
      
      return res.status(200).json({
        success: true,
        completed: true,
        message: `E-Mail wurde erfolgreich an alle ${totalSent} Empfänger versendet`,
        totalRecipients: allContacts.length,
        totalSent
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      }
    });

    // SMTP-Verbindung testen
    try {
      await transporter.verify();
      console.log('SMTP-Verbindung erfolgreich getestet');
    } catch (smtpError) {
      console.error('SMTP-Verbindungsfehler:', smtpError);
      throw new Error(`SMTP-Verbindungsfehler: ${smtpError.message}`);
    }

    // QR-Code generieren
    const qrCodeDataUrl = await QRCode.toDataURL(websiteUrl);
    const qrCodeBase64 = qrCodeDataUrl.split(',')[1];

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Neuer Speiseplan verfügbar</h2>
        <p>Der Speiseplan für die Woche vom ${dateRange} ist jetzt online verfügbar.</p>
        <p>Sie können den Speiseplan direkt über diesen Link aufrufen:</p>
        <p><a href="${websiteUrl}" style="background-color: #fbbf24; color: #1a365d; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Zum Speiseplan</a></p>
        <p>Oder scannen Sie den QR-Code:</p>
        <img src="cid:qrcode" alt="QR Code" style="width: 150px; height: 150px; display: block; margin: 10px 0;" />
        <p style="color: #666; font-size: 0.9em; margin-top: 20px;">Wir freuen uns auf Ihren Besuch.</p>
      </div>
    `;

    // E-Mails in Batches versenden
    const results = [];
    let batchSuccessCount = 0;
    let batchFailureCount = 0;

    // Versende nur die Batches im aktuellen Bereich
    for (let i = startBatchIndex; i < endBatchIndex; i++) {
      const batch = contactBatches[i];
      
      try {
        console.log(`Sende Batch ${i+1}/${contactBatches.length} mit ${batch.length} Empfängern...`);
        
        // E-Mail-Konfiguration für diesen Batch
        const mailOptions = {
          from: {
            name: 'Betriebskantine',
            address: process.env.EMAIL_USER
          },
          bcc: batch,
          subject: `Speiseplan ${dateRange}`,
          html: emailHtml,
          attachments: [{
            filename: 'qrcode.png',
            content: qrCodeBase64,
            encoding: 'base64',
            cid: 'qrcode',
            contentType: 'image/png'
          }]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Batch ${i+1} erfolgreich versendet: ${info.messageId}`);
        
        results.push({
          batch: i+1,
          success: true,
          messageId: info.messageId,
          recipients: batch.length
        });
        
        batchSuccessCount += batch.length;
        
        // Kurze Pause zwischen den Batches, um den Server nicht zu überlasten
        if (i < endBatchIndex - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Fehler beim Versenden von Batch ${i+1}:`, error);
        
        results.push({
          batch: i+1,
          success: false,
          error: error.message,
          recipients: batch.length
        });
        
        batchFailureCount += batch.length;
      }
    }

    // Berechne die Gesamtzahl der gesendeten E-Mails
    const newTotalSent = totalSent + batchSuccessCount;
    
    // Prüfe, ob alle Batches versendet wurden
    const isCompleted = endBatchIndex >= contactBatches.length;
    
    // Rückgabe der Ergebnisse
    res.status(200).json({ 
      success: batchFailureCount === 0,
      completed: isCompleted,
      message: isCompleted 
        ? `E-Mail wurde erfolgreich an alle ${newTotalSent} Empfänger versendet` 
        : `Batches ${startBatchIndex+1} bis ${endBatchIndex} versendet (${batchSuccessCount} Empfänger), ${contactBatches.length - endBatchIndex} Batches verbleiben`,
      totalRecipients: allContacts.length,
      batchSuccessCount,
      batchFailureCount,
      totalSent: newTotalSent,
      nextBatchIndex: endBatchIndex,
      batches: results
    });

  } catch (error) {
    console.error('Detaillierte Fehlerinformation:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Fehler beim E-Mail-Versand',
      error: error.message,
      details: error.stack
    });
  }
} 