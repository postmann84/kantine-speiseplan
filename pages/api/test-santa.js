// Test-API um zu prüfen ob Santa-Animation am 24.12. angezeigt werden würde
// Aufruf: GET /api/test-santa

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
      isChristmasEve: day === 24 && month === 12,
      weekContainsChristmas: false,
      todayDate: `${day}.${month}.${year}`,
      weekStart: null,
      weekEnd: null,
      shouldShowSanta: false
    };

    if (checks.hasMenu && checks.isPublished) {
      const weekStart = new Date(menuData.data.weekStart);
      const weekEnd = new Date(menuData.data.weekEnd);
      const christmas = new Date(year, 11, 24); // 11 = Dezember
      
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);
      christmas.setHours(12, 0, 0, 0);
      
      checks.weekStart = weekStart.toISOString().split('T')[0];
      checks.weekEnd = weekEnd.toISOString().split('T')[0];
      checks.weekContainsChristmas = christmas >= weekStart && christmas <= weekEnd;
    }

    // Finale Entscheidung
    checks.shouldShowSanta = 
      checks.hasMenu && 
      checks.isPublished && 
      checks.isChristmasEve && 
      checks.weekContainsChristmas;

    return res.status(200).json({
      success: true,
      ...checks,
      message: checks.shouldShowSanta 
        ? '🎅 Weihnachtsmann-Animation wird angezeigt!'
        : '❌ Weihnachtsmann-Animation wird NICHT angezeigt',
      reasons: !checks.shouldShowSanta ? [
        !checks.hasMenu && 'Kein Speiseplan vorhanden',
        !checks.isPublished && 'Speiseplan ist nicht veröffentlicht',
        !checks.isChristmasEve && `Heute ist nicht der 24.12. (heute: ${checks.todayDate})`,
        checks.hasMenu && checks.isPublished && !checks.weekContainsChristmas && 
          `Die Woche (${checks.weekStart} bis ${checks.weekEnd}) enthält nicht den 24.12.`
      ].filter(Boolean) : []
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
