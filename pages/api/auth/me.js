import { parse } from 'cookie';
import { verifySession, SESSION_COOKIE } from '../../../lib/auth';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  const session = await verifySession(cookies[SESSION_COOKIE]);
  return res.status(200).json({ authenticated: !!session });
}
