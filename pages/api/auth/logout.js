import { serialize } from 'cookie';
import { SESSION_COOKIE } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Methode nicht erlaubt' });
  }
  res.setHeader('Set-Cookie', serialize(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  }));
  return res.status(200).json({ success: true });
}
