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

    // Erstelle Transporter mit optimierten Einstellungen
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        // Stark erhöhte Timeout-Einstellungen
        connectionTimeout: 30000,  // 30 Sekunden
        greetingTimeout: 30000,    // 30 Sekunden
        socketTimeout: 45000       // 45 Sekunden
      });

      // SMTP-Verbindung testen
      await transporter.verify();
      console.log('SMTP-Verbindung erfolgreich getestet');
    } catch (smtpError) {
      console.error('SMTP-Verbindungsfehler:', smtpError);
      return res.status(500).json({
        success: false,
        message: 'SMTP-Verbindungsfehler',
        error: smtpError.message
      });
    }

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
      // Lade alle Kontakte aus den verschlüsselten Dateien
      console.log('Lade Kontakte aus verschlüsselten Dateien...');
      let allContacts = [];
      try {
        allContacts = await loadAllContacts();
        console.log(`${allContacts.length} Kontakte geladen`);
        
        if (allContacts.length === 0) {
          console.warn('Keine Kontakte gefunden. E-Mail wird nur an den Absender gesendet.');
          
          // Sende nur an den Absender
          const mailOptions = {
            from: {
              name: 'Betriebskantine',
              address: process.env.EMAIL_USER
            },
            to: process.env.EMAIL_USER,
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

          const info = await transporter.sendMail(mailOptions);
          console.log('E-Mail an Absender erfolgreich versendet:', info.messageId);
          
          return res.status(200).json({ 
            success: true, 
            message: 'E-Mail wurde erfolgreich an den Absender versendet',
            messageId: info.messageId
          });
        }
      } catch (contactsError) {
        console.error('Fehler beim Laden der Kontakte:', contactsError);
        return res.status(500).json({
          success: false,
          message: 'Fehler beim Laden der Kontakte',
          error: contactsError.message
        });
      }

      // Teile die Empfängerliste in Batches auf
      const batches = chunkArray(allContacts, BATCH_SIZE);
      console.log(`Kontakte in ${batches.length} Batches aufgeteilt (je ${BATCH_SIZE} Empfänger)`);

      // Sende E-Mails in Batches
      const results = [];
      let successCount = 0;
      let errorCount = 0;
      let failedRecipients = [];

      // Sende E-Mail an den Absender als Bestätigung
      try {
        const senderMailOptions = {
          from: {
            name: 'Betriebskantine',
            address: process.env.EMAIL_USER
          },
          to: process.env.EMAIL_USER,
          subject: `Speiseplan ${dateRange} - Versand gestartet`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">Speiseplan-Versand gestartet</h2>
              <p>Der Versand des Speiseplans für die Woche vom ${dateRange} wurde gestartet.</p>
              <p>Empfänger: ${allContacts.length}</p>
              <p>Batches: ${batches.length} (je ${BATCH_SIZE} Empfänger)</p>
              <p>Der Versand kann einige Minuten dauern. Sie erhalten eine Bestätigung, wenn alle E-Mails versendet wurden.</p>
            </div>
          `
        };

        await transporter.sendMail(senderMailOptions);
        console.log('Bestätigungs-E-Mail an Absender gesendet');
      } catch (error) {
        console.error('Fehler beim Senden der Bestätigungs-E-Mail:', error);
      }

      // Starte den Batch-Versand im Hintergrund
      // Wir senden eine erfolgreiche Antwort zurück, bevor der Versand abgeschlossen ist
      res.status(200).json({ 
        success: true, 
        message: `E-Mail-Versand an ${allContacts.length} Empfänger gestartet`,
        batchCount: batches.length
      });

      // Führe den Versand im Hintergrund durch
      (async () => {
        // Versuche zuerst den Batch-Versand
        let batchSendingFailed = false;

        for (let i = 0; i < batches.length && !batchSendingFailed; i++) {
          const batch = batches[i];
          console.log(`Verarbeite Batch ${i+1}/${batches.length} mit ${batch.length} Empfängern`);
          
          // Für jeden Batch eine neue SMTP-Verbindung erstellen
          let batchTransporter;
          try {
            batchTransporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT),
              secure: true,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
              },
              // Stark erhöhte Timeout-Einstellungen für Batches
              connectionTimeout: 60000,  // 60 Sekunden
              greetingTimeout: 60000,    // 60 Sekunden
              socketTimeout: 90000       // 90 Sekunden
            });
            
            // Verbindung für diesen Batch testen
            await batchTransporter.verify();
            console.log(`SMTP-Verbindung für Batch ${i+1}/${batches.length} erfolgreich getestet`);
          } catch (batchSmtpError) {
            console.error(`SMTP-Verbindungsfehler für Batch ${i+1}/${batches.length}:`, batchSmtpError);
            results.push({ batch: i+1, success: false, error: batchSmtpError.message });
            errorCount += batch.length;
            failedRecipients = [...failedRecipients, ...batch];
            
            // Wenn der erste Batch bereits fehlschlägt, wechseln wir zur Einzelversand-Strategie
            if (i === 0) {
              console.log('Erster Batch fehlgeschlagen, wechsle zu Einzelversand-Strategie');
              batchSendingFailed = true;
              break;
            }
            
            // Längere Pause nach einem Verbindungsfehler
            await new Promise(resolve => setTimeout(resolve, 10000));
            continue; // Mit dem nächsten Batch fortfahren
          }
          
          const mailOptions = {
            from: {
              name: 'Betriebskantine',
              address: process.env.EMAIL_USER
            },
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

          try {
            // Mehrere Versuche für jeden Batch
            let retries = 3;
            let success = false;
            let lastError = null;
            
            while (retries > 0 && !success) {
              try {
                const info = await batchTransporter.sendMail(mailOptions);
                console.log(`Batch ${i+1}/${batches.length} erfolgreich versendet:`, info.messageId);
                results.push({ batch: i+1, success: true, messageId: info.messageId });
                successCount += batch.length;
                success = true;
              } catch (sendError) {
                lastError = sendError;
                console.error(`Fehler beim Senden von Batch ${i+1}/${batches.length} (Versuch ${4-retries}/3):`, sendError);
                retries--;
                
                if (retries > 0) {
                  console.log(`Wiederhole Versand von Batch ${i+1}/${batches.length} in 15 Sekunden...`);
                  await new Promise(resolve => setTimeout(resolve, 15000)); // 15 Sekunden warten vor dem nächsten Versuch
                }
              }
            }
            
            if (!success) {
              results.push({ batch: i+1, success: false, error: lastError.message });
              errorCount += batch.length;
              failedRecipients = [...failedRecipients, ...batch];
              
              // Wenn mehrere Batches hintereinander fehlschlagen, wechseln wir zur Einzelversand-Strategie
              if (i > 0 && results[i-1].success === false) {
                console.log('Mehrere Batches hintereinander fehlgeschlagen, wechsle zu Einzelversand-Strategie');
                batchSendingFailed = true;
                break;
              }
            }
          } catch (sendError) {
            console.error(`Fehler beim Senden von Batch ${i+1}/${batches.length}:`, sendError);
            results.push({ batch: i+1, success: false, error: sendError.message });
            errorCount += batch.length;
            failedRecipients = [...failedRecipients, ...batch];
          } finally {
            // Verbindung für diesen Batch schließen
            try {
              batchTransporter.close();
            } catch (closeError) {
              console.error(`Fehler beim Schließen der SMTP-Verbindung für Batch ${i+1}/${batches.length}:`, closeError);
            }
          }
          
          // Längere Pause zwischen den Batches, um den SMTP-Server nicht zu überlasten
          if (i < batches.length - 1) {
            console.log(`Warte 10 Sekunden vor dem nächsten Batch...`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // 10 Sekunden
          }
        }

        // Fallback: Einzelversand für fehlgeschlagene Empfänger
        if (batchSendingFailed || failedRecipients.length > 0) {
          console.log(`Starte Einzelversand für ${failedRecipients.length} fehlgeschlagene Empfänger`);
          
          // Informiere den Absender über den Wechsel zur Einzelversand-Strategie
          try {
            const fallbackNotificationOptions = {
              from: {
                name: 'Betriebskantine',
                address: process.env.EMAIL_USER
              },
              to: process.env.EMAIL_USER,
              subject: `Speiseplan ${dateRange} - Wechsel zu Einzelversand`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1a365d;">Batch-Versand fehlgeschlagen</h2>
                  <p>Der Batch-Versand des Speiseplans für die Woche vom ${dateRange} ist fehlgeschlagen.</p>
                  <p>Es wird nun versucht, die E-Mails einzeln zu versenden. Dies kann länger dauern.</p>
                  <p>Fehlgeschlagene Empfänger: ${failedRecipients.length}</p>
                </div>
              `
            };
            
            await transporter.sendMail(fallbackNotificationOptions);
            console.log('Benachrichtigung über Wechsel zu Einzelversand gesendet');
          } catch (error) {
            console.error('Fehler beim Senden der Fallback-Benachrichtigung:', error);
          }
          
          // Sammle alle fehlgeschlagenen Empfänger, wenn der Batch-Versand komplett fehlgeschlagen ist
          if (batchSendingFailed) {
            failedRecipients = [];
            batches.forEach((batch, index) => {
              if (!results.some(r => r.batch === index + 1 && r.success)) {
                failedRecipients = [...failedRecipients, ...batch];
              }
            });
          }
          
          // Versuche den Einzelversand für fehlgeschlagene Empfänger
          let individualSuccessCount = 0;
          let individualErrorCount = 0;
          
          for (let i = 0; i < failedRecipients.length; i++) {
            const recipient = failedRecipients[i];
            console.log(`Sende E-Mail an einzelnen Empfänger (${i+1}/${failedRecipients.length}): ${recipient}`);
            
            // Neue Verbindung für jeden Empfänger
            let individualTransporter;
            try {
              individualTransporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: true,
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASSWORD,
                },
                connectionTimeout: 30000,
                greetingTimeout: 30000,
                socketTimeout: 45000
              });
            } catch (error) {
              console.error(`Fehler beim Erstellen der SMTP-Verbindung für ${recipient}:`, error);
              individualErrorCount++;
              continue;
            }
            
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
              await individualTransporter.sendMail(mailOptions);
              console.log(`E-Mail an ${recipient} erfolgreich versendet`);
              individualSuccessCount++;
              successCount++;
              errorCount--;
            } catch (error) {
              console.error(`Fehler beim Senden der E-Mail an ${recipient}:`, error);
              individualErrorCount++;
            } finally {
              try {
                individualTransporter.close();
              } catch (error) {
                console.error(`Fehler beim Schließen der SMTP-Verbindung für ${recipient}:`, error);
              }
            }
            
            // Kurze Pause zwischen den einzelnen E-Mails
            if (i < failedRecipients.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          console.log(`Einzelversand abgeschlossen: ${individualSuccessCount} erfolgreich, ${individualErrorCount} fehlgeschlagen`);
        }

        // Sende eine abschließende Bestätigung an den Absender
        try {
          const summaryMailOptions = {
            from: {
              name: 'Betriebskantine',
              address: process.env.EMAIL_USER
            },
            to: process.env.EMAIL_USER,
            subject: `Speiseplan ${dateRange} - Versand abgeschlossen`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a365d;">Speiseplan-Versand abgeschlossen</h2>
                <p>Der Versand des Speiseplans für die Woche vom ${dateRange} wurde abgeschlossen.</p>
                <p>Erfolgreich: ${successCount} Empfänger</p>
                <p>Fehler: ${errorCount} Empfänger</p>
                <p>Gesamtzahl: ${allContacts.length} Empfänger</p>
                ${batchSendingFailed ? '<p><strong>Hinweis:</strong> Der Batch-Versand ist fehlgeschlagen. Es wurde versucht, die E-Mails einzeln zu versenden.</p>' : ''}
              </div>
            `
          };

          await transporter.sendMail(summaryMailOptions);
          console.log('Abschluss-Bestätigung an Absender gesendet');
        } catch (error) {
          console.error('Fehler beim Senden der Abschluss-Bestätigung:', error);
        }

        console.log('E-Mail-Versand abgeschlossen:', {
          success: successCount,
          error: errorCount,
          total: allContacts.length
        });
      })().catch(error => {
        console.error('Fehler im Hintergrundprozess:', error);
      });

      // Die Antwort wurde bereits gesendet, daher kein weiteres return erforderlich
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