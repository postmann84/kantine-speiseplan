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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const { weekStart, weekEnd, weekNumber, year } = req.body;
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

    // E-Mail-Konfiguration
    const mailOptions = {
      from: {
        name: 'Betriebskantine',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER,
      // Die Kontaktgruppen müssen als E-Mail-Adressen formatiert werden
      bcc: [
        // Format: Gruppenname <E-Mail-Adresse>
        'Mittagskarte <' + process.env.EMAIL_USER + '>',
        'Kollegen <' + process.env.EMAIL_USER + '>'
      ],
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

    console.log('Sende E-Mail mit folgenden Details:');
    console.log('Von:', process.env.EMAIL_USER);
    console.log('Betreff:', `Speiseplan ${dateRange}`);

    const info = await transporter.sendMail(mailOptions);
    console.log('E-Mail erfolgreich versendet:', info.messageId);

    res.status(200).json({ 
      success: true, 
      message: 'E-Mail wurde erfolgreich versendet',
      messageId: info.messageId
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