import crypto from 'crypto';
import { serialize } from 'cookie';
import { createSession, SESSION_COOKIE } from '../../../lib/auth';

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Methode nicht erlaubt' });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ success: false, error: 'Server nicht konfiguriert (ADMIN_PASSWORD fehlt).' });
  }

  const { password } = req.body || {};
  if (!safeEqual(password, expected)) {
    return res.status(401).json({ success: false, error: 'Falsches Passwort.' });
  }

  const token = await createSession();
  const isHttps = (req.headers['x-forwarded-proto'] || '').includes('https');
  res.setHeader('Set-Cookie', serialize(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  }));

  return res.status(200).json({ success: true });
}
