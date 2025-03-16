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

// Maximale Anzahl von Empfängern pro E-Mail-Batch
const BATCH_SIZE = 10;

// Hilfsfunktion zum Aufteilen der Empfängerliste in Gruppen
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Hilfsfunktion zum Warten
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

    const { menu, recipient, weekNumber, year } = req.body;
    
    // Überprüfe, ob die erforderlichen Daten vorhanden sind
    if (!menu) {
      return res.status(400).json({
        success: false,
        message: 'Keine Menüdaten vorhanden'
      });
    }

    // Wochendaten aus weekNumber und year berechnen
    let actualWeekDates;
    try {
      if (weekNumber && year) {
        actualWeekDates = getWeekDates(year, weekNumber);
      } else if (menu.weekStart && menu.weekEnd) {
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
      
      // Einfache Konfiguration für nodemailer mit erhöhten Timeouts
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 10000, // 10 Sekunden Timeout für die Verbindung
        greetingTimeout: 5000,    // 5 Sekunden Timeout für die Begrüßung
        socketTimeout: 10000      // 10 Sekunden Timeout für Socket-Operationen
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
      // Verwende die Kontaktliste direkt aus der Umgebungsvariable
      const contactList = process.env.EMAIL_LIST_KOLLEGEN || '';
      const allContacts = contactList.split(',').map(email => email.trim()).filter(email => email);
      
      // Begrenze die Anzahl der Kontakte für Vercel (um Timeouts zu vermeiden)
      // In der Vercel-Umgebung senden wir nur an die ersten 50 Kontakte
      const isVercel = process.env.VERCEL === '1';
      const contacts = isVercel ? allContacts.slice(0, 50) : allContacts;
      
      console.log(`Sende E-Mail an ${contacts.length} Empfänger...`);
      
      // Teile die Kontakte in Batches auf
      const batches = chunkArray(contacts, BATCH_SIZE);
      console.log(`Aufgeteilt in ${batches.length} Batches mit je maximal ${BATCH_SIZE} Empfängern`);
      
      // Sende eine Bestätigung an den Client, dass der Versand gestartet wurde
      res.status(200).json({ 
        success: true, 
        message: `E-Mail-Versand an ${contacts.length} Empfänger gestartet`,
        batchCount: batches.length
      });
      
      // Einfache Konfiguration für nodemailer mit erhöhten Timeouts
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 10000, // 10 Sekunden Timeout für die Verbindung
        greetingTimeout: 5000,    // 5 Sekunden Timeout für die Begrüßung
        socketTimeout: 10000      // 10 Sekunden Timeout für Socket-Operationen
      });
      
      // Sende E-Mails in Batches
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Sende Batch ${i+1}/${batches.length} mit ${batch.length} Empfängern...`);
        
        try {
          // Für jeden Batch eine neue Verbindung öffnen
          const batchTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000
          });
          
          const mailOptions = {
            from: {
              name: 'Betriebskantine',
              address: process.env.EMAIL_USER
            },
            to: process.env.EMAIL_USER,
            bcc: batch,
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
          
          const info = await batchTransporter.sendMail(mailOptions);
          console.log(`Batch ${i+1}/${batches.length} erfolgreich versendet:`, info.messageId);
          successCount += batch.length;
          
          // Warte 2 Sekunden zwischen den Batches, um den Server nicht zu überlasten
          if (i < batches.length - 1) {
            await sleep(2000);
          }
          
          // Schließe die Verbindung
          batchTransporter.close();
        } catch (batchError) {
          console.error(`Fehler beim Senden von Batch ${i+1}/${batches.length}:`, batchError);
          errorCount += batch.length;
          
          // Bei Fehler: Warte 5 Sekunden vor dem nächsten Versuch
          if (i < batches.length - 1) {
            await sleep(5000);
          }
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
          subject: `Speiseplan ${dateRange} - Versand abgeschlossen`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">E-Mail-Versand abgeschlossen</h2>
              <p>Der Versand des Speiseplans für die Woche vom ${dateRange} wurde abgeschlossen.</p>
              <p>Erfolgreich: ${successCount} Empfänger</p>
              <p>Fehler: ${errorCount} Empfänger</p>
              <p>Gesamtzahl: ${contacts.length} Empfänger</p>
            </div>
          `
        };
        
        await transporter.sendMail(summaryOptions);
        console.log('Zusammenfassung an Absender gesendet');
      } catch (summaryError) {
        console.error('Fehler beim Senden der Zusammenfassung:', summaryError);
      }
      
      console.log(`E-Mail-Versand abgeschlossen. Erfolg: ${successCount}, Fehler: ${errorCount}`);
    }
  } catch (error) {
    console.error('Detaillierte Fehlerinformation:', error);
    
    // Wenn die Antwort noch nicht gesendet wurde, sende einen Fehler
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false,
        message: 'Fehler beim E-Mail-Versand',
        error: error.message
      });
    }
  }
} 