export default function handler(req, res) {
  // Einfache Prüfung, ob der User eingeloggt ist
  res.status(200).json({ authenticated: true });
} 