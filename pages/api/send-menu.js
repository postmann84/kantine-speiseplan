import nodemailer from 'nodemailer';

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
    // Detailliertere SMTP-Konfiguration
    const transporter = nodemailer.createTransport({
      host: 'smtp.web.de',
      port: 465,           // SSL Port
      secure: true,        // SSL
      auth: {
        user: 'Postmann65@web.de',
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true,
      logger: true
    });

    // Verbindungstest
    console.log('Teste SMTP-Verbindung...');
    try {
      await transporter.verify();
      console.log('SMTP-Verbindung erfolgreich!');
    } catch (verifyError) {
      console.error('SMTP-Verbindungstest fehlgeschlagen:', verifyError);
      throw verifyError;
    }

    const { weekStart, weekEnd } = req.body;
    const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    const recipient = process.env.EMAIL_RECIPIENTS;

    // Formatiere das Datum im gewünschten Format (TT.MM.-TT.MM.JJJJ)
    const formatDateRange = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const startDay = startDate.getDate().toString().padStart(2, '0');
      const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
      const endDay = endDate.getDate().toString().padStart(2, '0');
      const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
      const year = endDate.getFullYear();
      return `${startDay}.${startMonth}.-${endDay}.${endMonth}.${year}`;
    };

    const dateRange = formatDateRange(weekStart, weekEnd);

    console.log('Sende E-Mail mit folgenden Details:');
    console.log('Von:', 'Postmann65@web.de');
    console.log('An:', recipient);
    console.log('Betreff:', `Speiseplan ${dateRange}`);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Neuer Speiseplan verfügbar</h2>
        <p>Der Speiseplan für die Woche vom ${weekStart} bis ${weekEnd} ist jetzt online verfügbar.</p>
        <p>Sie können den Speiseplan direkt über diesen Link aufrufen:</p>
        <p><a href="${websiteUrl}" style="background-color: #fbbf24; color: #1a365d; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Zum Speiseplan</a></p>
        <p>Oder scannen Sie den QR-Code:</p>
        <img src="cid:qrcode" alt="QR Code" style="width: 150px; height: 150px;" />
        <p style="color: #666; font-size: 0.9em; margin-top: 20px;">Wir freuen uns auf Ihren Besuch.</p>
      </div>
    `;

    const mailOptions = {
      from: {
        name: 'Betriebskantine',
        address: 'Postmann65@web.de'
      },
      to: recipient,
      subject: `Speiseplan ${dateRange}`,
      html: emailHtml,
      attachments: [{
        filename: 'qrcode.png',
        path: `${websiteUrl}/api/qr-code?url=${encodeURIComponent(websiteUrl)}`,
        cid: 'qrcode'
      }]
    };

    console.log('Starte E-Mail-Versand...');
    const info = await transporter.sendMail(mailOptions);
    console.log('E-Mail erfolgreich versendet:', info);

    res.status(200).json({ 
      success: true, 
      message: 'E-Mail wurde erfolgreich versendet',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('E-Mail-Versand fehlgeschlagen:', error);
    res.status(500).json({ 
      error: 'E-Mail-Versand fehlgeschlagen', 
      details: error.message,
      stack: error.stack
    });
  }
} 