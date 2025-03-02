import { getIronSession } from 'iron-session';

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST-Anfragen erlaubt' });
  }

  const session = await getIronSession(req, res, sessionOptions);
  const { username, password } = req.body;

  // Vergleiche mit den Umgebungsvariablen
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    session.isLoggedIn = true;
    await session.save();
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Ungültige Anmeldedaten' });
  }
} 