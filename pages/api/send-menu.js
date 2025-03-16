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

    const { weekStart, weekEnd, weekNumber, year } = req.body;
    
    // Überprüfe, ob die erforderlichen Daten vorhanden sind
    if (!weekNumber || !year) {
      if (!weekStart || !weekEnd) {
        return res.status(400).json({
          success: false,
          message: 'Keine ausreichenden Wochendaten vorhanden'
        });
      }
    }

    // Wochendaten entweder aus weekNumber und year berechnen oder aus den übergebenen Daten verwenden
    let actualWeekDates;
    try {
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
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://postkantine-speiseplan.vercel.app';

    console.log('Verwende Datumszeitraum:', dateRange);

    // Lade alle Kontakte aus den verschlüsselten Dateien
    console.log('Lade Kontakte aus verschlüsselten Dateien...');
    let allContacts = [];
    try {
      allContacts = await loadAllContacts();
      console.log(`${allContacts.length} Kontakte geladen`);
      
      if (allContacts.length === 0) {
        console.warn('Keine Kontakte gefunden. E-Mail wird nur an den Absender gesendet.');
      }
    } catch (contactsError) {
      console.error('Fehler beim Laden der Kontakte:', contactsError);
      // Wir brechen hier nicht ab, sondern senden die E-Mail nur an den Absender
    }

    // Erstelle Transporter
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
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

    // QR-Code generieren
    let qrCodeBase64;
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(websiteUrl);
      qrCodeBase64 = qrCodeDataUrl.split(',')[1];
    } catch (qrError) {
      console.error('Fehler bei der QR-Code-Generierung:', qrError);
      // Wir brechen hier nicht ab, sondern senden die E-Mail ohne QR-Code
      qrCodeBase64 = null;
    }

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

    // E-Mail-Konfiguration
    const mailOptions = {
      from: {
        name: 'Betriebskantine',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER,
      bcc: allContacts, // Verwende alle geladenen Kontakte als BCC
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

    console.log('Sende E-Mail mit folgenden Details:');
    console.log('Von:', process.env.EMAIL_USER);
    console.log('Betreff:', `Speiseplan ${dateRange}`);
    console.log('Anzahl BCC-Empfänger:', allContacts.length);

    // E-Mail senden
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('E-Mail erfolgreich versendet:', info.messageId);

      return res.status(200).json({ 
        success: true, 
        message: 'E-Mail wurde erfolgreich versendet',
        messageId: info.messageId
      });
    } catch (sendError) {
      console.error('Fehler beim Senden der E-Mail:', sendError);
      return res.status(500).json({
        success: false,
        message: 'Fehler beim Senden der E-Mail',
        error: sendError.message
      });
    }

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