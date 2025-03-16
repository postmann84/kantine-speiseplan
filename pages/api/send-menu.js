import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { getWeekDates } from '../../lib/dateUtils';
const { loadAllContacts } = require('../../lib/contacts');

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

// Maximale Anzahl von Empfängern pro E-Mail-Batch
const BATCH_SIZE = 20;

// Hilfsfunktion zum Aufteilen der Empfängerliste in Gruppen
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Nur POST-Anfragen erlaubt' 
    });
  }

  try {
    console.log('Starting email send process...');
    
    // Debug-Logging für SMTP-Konfiguration
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST || 'nicht gesetzt',
      port: process.env.SMTP_PORT || 'nicht gesetzt',
      user: process.env.EMAIL_USER ? '✓ vorhanden' : '✗ fehlt',
      pass: process.env.EMAIL_PASSWORD ? '✓ vorhanden' : '✗ fehlt',
      websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || 'nicht gesetzt'
    });

    // Überprüfe, ob alle erforderlichen Umgebungsvariablen gesetzt sind
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return res.status(500).json({
        success: false,
        message: 'E-Mail-Konfiguration unvollständig. Bitte überprüfen Sie die Umgebungsvariablen.'
      });
    }

    const { menu, recipient, weekStart, weekEnd, weekNumber, year } = req.body;
    
    // Überprüfe, ob die erforderlichen Daten vorhanden sind
    if (!menu) {
      return res.status(400).json({
        success: false,
        message: 'Keine Menüdaten vorhanden'
      });
    }

    // Wochendaten entweder aus weekNumber und year berechnen oder aus den übergebenen Daten verwenden
    let actualWeekDates;
    try {
      if (weekNumber && year) {
        // Nutze die Funktion aus dateUtils.js um Montag und Freitag für die ausgewählte Woche zu berechnen
        actualWeekDates = getWeekDates(year, weekNumber);
      } else if (weekStart && weekEnd) {
        // Fallback: Verwende das alte Verfahren
        actualWeekDates = {
          start: new Date(weekStart),
          end: new Date(weekEnd)
        };
      } else if (menu.weekStart && menu.weekEnd) {
        // Fallback: Verwende Daten aus dem Menü
        actualWeekDates = {
          start: new Date(menu.weekStart),
          end: new Date(menu.weekEnd)
        };
      } else {
        // Fallback: Verwende aktuelle Woche
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        const friday = new Date(monday);
        friday.setDate(monday.getDate() + 4);
        
        actualWeekDates = {
          start: monday,
          end: friday
        };
      }
    } catch (dateError) {
      console.error('Fehler bei der Datumsberechnung:', dateError);
      return res.status(400).json({
        success: false,
        message: 'Fehler bei der Datumsberechnung',
        error: dateError.message
      });
    }

    // Formatiere das Datum korrekt für die ausgewählte Woche
    const dateRange = formatDateRange(actualWeekDates.start, actualWeekDates.end);
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || req.headers.origin || 'https://postkantine-speiseplan.vercel.app';

    console.log('Verwende Datumszeitraum:', dateRange);

    // QR-Code generieren mit optimierten Einstellungen
    let qrCodeBase64;
    try {
      const qrCodeOptions = {
        errorCorrectionLevel: 'L', // Niedrigste Fehlerkorrektur für schnellere Generierung
        scale: 4,                  // Kleinere Größe für schnellere Generierung
        margin: 1                  // Kleinerer Rand für schnellere Generierung
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(websiteUrl, qrCodeOptions);
      qrCodeBase64 = qrCodeDataUrl.split(',')[1];
    } catch (qrError) {
      console.error('Fehler bei der QR-Code-Generierung:', qrError);
      // Wir brechen hier nicht ab, sondern senden die E-Mail ohne QR-Code
      qrCodeBase64 = null;
    }

    // E-Mail-HTML erstellen
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Neuer Speiseplan verfügbar</h2>
        <p>Der Speiseplan für die Woche vom ${dateRange} ist jetzt online verfügbar.</p>
        <p>Sie können den Speiseplan direkt über diesen Link aufrufen:</p>
        <p><a href="${websiteUrl}" style="background-color: #fbbf24; color: #1a365d; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Zum Speiseplan</a></p>
        ${qrCodeBase64 ? `
        <p>Oder scannen Sie den QR-Code:</p>
        <img src="cid:qrcode" alt="QR Code" style="width: 150px; height: 150px; display: block; margin: 10px 0;" />
        ` : ''}
        <p style="color: #666; font-size: 0.9em; margin-top: 20px;">Wir freuen uns auf Ihren Besuch.</p>
      </div>
    `;

    // Wenn ein einzelner Empfänger angegeben wurde, sende nur an diesen
    if (recipient) {
      console.log(`Sende E-Mail an einzelnen Empfänger: ${recipient}`);
      
      // Einfache Konfiguration für nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });
      
      const mailOptions = {
        from: {
          name: 'Betriebskantine',
          address: process.env.EMAIL_USER
        },
        to: recipient,
        subject: `Speiseplan ${dateRange}`,
        html: emailHtml,
        attachments: qrCodeBase64 ? [{
          filename: 'qrcode.png',
          content: qrCodeBase64,
          encoding: 'base64',
          cid: 'qrcode',
          contentType: 'image/png'
        }] : []
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`E-Mail an ${recipient} erfolgreich versendet:`, info.messageId);
        
        return res.status(200).json({ 
          success: true, 
          message: `E-Mail wurde erfolgreich an ${recipient} versendet`,
          messageId: info.messageId
        });
      } catch (sendError) {
        console.error(`Fehler beim Senden der E-Mail an ${recipient}:`, sendError);
        return res.status(500).json({
          success: false,
          message: `Fehler beim Senden der E-Mail an ${recipient}`,
          error: sendError.message
        });
      }
    } else {
      // Lade alle Kontakte
      console.log('Lade Kontakte...');
      let allContacts = [];
      try {
        // Lade Kontakte aus der Datei oder Fallback aus Umgebungsvariablen
        allContacts = await loadAllContacts();
        console.log(`${allContacts.length} Kontakte geladen`);
        
        if (allContacts.length === 0) {
          console.warn('Keine Kontakte gefunden. E-Mail wird nur an den Absender gesendet.');
          allContacts = [process.env.EMAIL_USER];
        }
      } catch (contactsError) {
        console.error('Fehler beim Laden der Kontakte:', contactsError);
        // Fallback: Sende nur an den Absender
        allContacts = [process.env.EMAIL_USER];
      }

      // Einfache Konfiguration für nodemailer
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });

      // Sende E-Mail an den Absender mit allen Kontakten im BCC
      const mailOptions = {
        from: {
          name: 'Betriebskantine',
          address: process.env.EMAIL_USER
        },
        to: process.env.EMAIL_USER,
        bcc: allContacts,
        subject: `Speiseplan ${dateRange}`,
        html: emailHtml,
        attachments: qrCodeBase64 ? [{
          filename: 'qrcode.png',
          content: qrCodeBase64,
          encoding: 'base64',
          cid: 'qrcode',
          contentType: 'image/png'
        }] : []
      };

      try {
        console.log(`Sende E-Mail an ${allContacts.length} Empfänger...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('E-Mail erfolgreich versendet:', info.messageId);
        
        return res.status(200).json({ 
          success: true, 
          message: `E-Mail wurde erfolgreich an ${allContacts.length} Empfänger versendet`,
          messageId: info.messageId
        });
      } catch (sendError) {
        console.error('Fehler beim Senden der E-Mail:', sendError);
        
        // Wenn der Massenversand fehlschlägt, versuche es mit Einzelversand
        console.log('Massenversand fehlgeschlagen, versuche Einzelversand...');
        
        // Sende zuerst eine Benachrichtigung an den Absender
        try {
          const notificationOptions = {
            from: {
              name: 'Betriebskantine',
              address: process.env.EMAIL_USER
            },
            to: process.env.EMAIL_USER,
            subject: `Speiseplan ${dateRange} - Wechsel zu Einzelversand`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a365d;">Massenversand fehlgeschlagen</h2>
                <p>Der Versand des Speiseplans für die Woche vom ${dateRange} als Massenversand ist fehlgeschlagen.</p>
                <p>Es wird nun versucht, die E-Mails einzeln zu versenden. Dies kann länger dauern.</p>
                <p>Fehler: ${sendError.message}</p>
              </div>
            `
          };
          
          await transporter.sendMail(notificationOptions);
          console.log('Benachrichtigung über Wechsel zu Einzelversand gesendet');
        } catch (notificationError) {
          console.error('Fehler beim Senden der Benachrichtigung:', notificationError);
        }
        
        // Versuche den Einzelversand
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < allContacts.length; i++) {
          const recipient = allContacts[i];
          console.log(`Sende E-Mail an einzelnen Empfänger (${i+1}/${allContacts.length}): ${recipient}`);
          
          const singleMailOptions = {
            from: {
              name: 'Betriebskantine',
              address: process.env.EMAIL_USER
            },
            to: recipient,
            subject: `Speiseplan ${dateRange}`,
            html: emailHtml,
            attachments: qrCodeBase64 ? [{
              filename: 'qrcode.png',
              content: qrCodeBase64,
              encoding: 'base64',
              cid: 'qrcode',
              contentType: 'image/png'
            }] : []
          };
          
          try {
            await transporter.sendMail(singleMailOptions);
            console.log(`E-Mail an ${recipient} erfolgreich versendet`);
            successCount++;
          } catch (singleSendError) {
            console.error(`Fehler beim Senden der E-Mail an ${recipient}:`, singleSendError);
            errorCount++;
          }
          
          // Kurze Pause zwischen den einzelnen E-Mails
          if (i < allContacts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Sende eine Zusammenfassung an den Absender
        try {
          const summaryOptions = {
            from: {
              name: 'Betriebskantine',
              address: process.env.EMAIL_USER
            },
            to: process.env.EMAIL_USER,
            subject: `Speiseplan ${dateRange} - Einzelversand abgeschlossen`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a365d;">Einzelversand abgeschlossen</h2>
                <p>Der Einzelversand des Speiseplans für die Woche vom ${dateRange} wurde abgeschlossen.</p>
                <p>Erfolgreich: ${successCount} Empfänger</p>
                <p>Fehler: ${errorCount} Empfänger</p>
                <p>Gesamtzahl: ${allContacts.length} Empfänger</p>
              </div>
            `
          };
          
          await transporter.sendMail(summaryOptions);
          console.log('Zusammenfassung an Absender gesendet');
        } catch (summaryError) {
          console.error('Fehler beim Senden der Zusammenfassung:', summaryError);
        }
        
        if (successCount > 0) {
          return res.status(200).json({
            success: true,
            message: `E-Mail wurde an ${successCount} von ${allContacts.length} Empfängern versendet`,
            partialSuccess: true,
            successCount,
            errorCount
          });
        } else {
          return res.status(500).json({
            success: false,
            message: 'E-Mail-Versand fehlgeschlagen',
            error: sendError.message
          });
        }
      }
    }
  } catch (error) {
    console.error('Detaillierte Fehlerinformation:', error);
    
    // Wenn die Antwort noch nicht gesendet wurde, sende einen Fehler
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false,
        message: 'Fehler beim E-Mail-Versand',
        error: error.message,
        details: error.stack
      });
    }
  }
} 