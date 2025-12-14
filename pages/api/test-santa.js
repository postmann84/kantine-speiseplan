// Test-API um zu prüfen ob Santa-Animation angezeigt werden würde
// Aufruf: GET /api/test-santa
// 
// Die Animation läuft in ZWEI Wochen:
// - KW 51: 15.-19.12. (Vorweihnachtswoche)
// - KW 52: 23.-29.12. (Weihnachtswoche)
// Diese API zeigt nur den Status, aktiviert die Animation aber NICHT!

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Hole aktuellen veröffentlichten Speiseplan
    const menuResponse = await fetch(`${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/menu`);
    const menuData = await menuResponse.json();

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // Prüfungen
    const checks = {
      hasMenu: menuData.success && menuData.data !== null,
      isPublished: menuData.data?.isPublished || false,
      weekContainsDec15: false,
      weekContainsDec24: false,
      todayDate: `${day}.${month}.${year}`,
      weekStart: null,
      weekEnd: null,
      shouldShowSanta: false,
      note: 'Animation läuft in ZWEI Wochen: 15.-19.12. (KW 51) UND 23.-29.12. (KW 52)'
    };

    if (checks.hasMenu && checks.isPublished) {
      const weekStart = new Date(menuData.data.weekStart);
      const weekEnd = new Date(menuData.data.weekEnd);
      const dec15 = new Date(year, 11, 15); // 15. Dezember
      const dec24 = new Date(year, 11, 24); // 24. Dezember
      
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);
      dec15.setHours(0, 0, 0, 0);
      dec24.setHours(12, 0, 0, 0);
      
      checks.weekStart = weekStart.toISOString().split('T')[0];
      checks.weekEnd = weekEnd.toISOString().split('T')[0];
      checks.weekContainsDec15 = dec15 >= weekStart && dec15 <= weekEnd;
      checks.weekContainsDec24 = dec24 >= weekStart && dec24 <= weekEnd;
    }

    // Finale Entscheidung: Woche enthält 15.12. ODER 24.12.
    checks.shouldShowSanta = 
      checks.hasMenu && 
      checks.isPublished && 
      (checks.weekContainsDec15 || checks.weekContainsDec24);

    return res.status(200).json({
      success: true,
      ...checks,
      message: checks.shouldShowSanta 
        ? '🎅 Weihnachtsmann-Animation wird angezeigt!'
        : '❌ Weihnachtsmann-Animation wird NICHT angezeigt',
      reasons: !checks.shouldShowSanta ? [
        !checks.hasMenu && 'Kein Speiseplan vorhanden',
        !checks.isPublished && 'Speiseplan ist nicht veröffentlicht',
        checks.hasMenu && checks.isPublished && !checks.weekContainsDec15 && !checks.weekContainsDec24 && 
          `Die Woche (${checks.weekStart} bis ${checks.weekEnd}) enthält weder 15.12. noch 24.12.`
      ].filter(Boolean) : [],
      activeWeeks: {
        week1: 'KW 51: 15.-19.12.2024',
        week2: 'KW 52: 23.-29.12.2024',
        currentWeekMatch: checks.weekContainsDec15 ? 'KW 51 (15.12.)' : checks.weekContainsDec24 ? 'KW 52 (24.12.)' : 'Keine'
      }
    });

  } catch (error) {
    console.error('Test-Santa API Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Fehler beim Testen der Santa-Animation',
      message: error.message 
    });
  }
}
