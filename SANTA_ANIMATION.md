# 🎅 Weihnachtsmann-Animation zur Weihnachtswoche

## 📋 Übersicht

Eine animierte Weihnachtsmann-Animation, die während der **gesamten Woche mit dem 24. Dezember** über den Bildschirm der öffentlichen Kundenseite fliegt, wenn der Speiseplan für diese Woche veröffentlicht ist.

---

## 🎯 Funktionsweise

### Voraussetzungen (ALLE müssen erfüllt sein):

1. ✅ **Datum**: Heute ist der **24. Dezember**
2. ✅ **Veröffentlichter Speiseplan**: Ein Speiseplan mit `isPublished: true` existiert
3. ✅ **Woche enthält 24.12.**: Die Woche des Speiseplans (weekStart bis weekEnd) umfasst den 24. Dezember
4. ✅ **Nur Kundenseite**: Erscheint NUR auf `/` (index.js), NICHT im Admin-Bereich

### Was passiert?

- 🎅 Der Weihnachtsmann fliegt in seinem Schlitten (gezogen von Schweinen mit Rentier-Geweihen) von **links nach rechts** über den Bildschirm
- ⏱️ Die Animation läuft für **15 Sekunden** (ca. 2 Durchläufe)
- 📱 **Responsive**: Kleinere Größe auf mobilen Geräten
- 🔇 **Stumm**: Video wird ohne Ton abgespielt (kein nerviges "Ho ho ho")
- 🚫 **Keine Interaktion**: Animation blockiert keine Klicks (pointer-events: none)

---

## 🎬 Technische Details

### Dateien:

- **Video**: `/public/santa-animation.mp4` (4 MB, 7 Sekunden Loop)
- **Code**: `/app/pages/index.js` (Zeilen ~85-135, ~581-621)

### CSS-Animation:

```css
@keyframes santaFly {
  0% {
    left: -200px;  /* Startet außerhalb links */
  }
  100% {
    left: 100%;    /* Endet außerhalb rechts */
  }
}
```

**Dauer**: 7 Sekunden pro Durchlauf  
**Position**: 20% vom unteren Bildschirmrand (10% auf mobil)  
**Größe**: 120px Höhe (80px auf mobil)

---

## 🧪 Testing

### Manuelles Testen am 24.12.2024:

1. **Veröffentlichen Sie einen Speiseplan** für die Woche mit dem 24.12. (KW 52)
2. Öffnen Sie die **öffentliche Seite**: `https://ihre-domain.vercel.app`
3. Der Weihnachtsmann sollte automatisch erscheinen
4. Nach 15 Sekunden verschwindet er

### Testen außerhalb des 24.12. (für Entwicklung):

Um die Animation zu jedem Datum zu testen, können Sie die Prüfung temporär deaktivieren:

**In `/app/pages/index.js`, Zeile ~109:**

```javascript
// ORIGINAL (nur am 24.12.):
if (day !== 24 || month !== 12) {
  return; // Nicht der 24.12.
}

// FÜR TESTS (immer anzeigen):
if (false) {  // Temporär auf false setzen
  return;
}
```

**WICHTIG**: Diese Änderung NUR für Tests! Danach zurücksetzen!

---

## 🔧 Anpassungen

### Animation länger anzeigen:

**In `/app/pages/index.js`, Zeile ~130:**

```javascript
// Standard: 15 Sekunden
setTimeout(() => {
  setShowSanta(false);
}, 15000);

// Ändern Sie 15000 auf gewünschte Millisekunden:
// 30 Sekunden = 30000
// 1 Minute = 60000
```

### Größe ändern:

**In `/app/pages/index.js`, Zeile ~600:**

```css
.santa-video {
  height: 120px;  /* Größer: 150px, Kleiner: 80px */
  width: auto;
}
```

### Position ändern:

**In `/app/pages/index.js`, Zeile ~591:**

```css
.santa-container {
  bottom: 20%;  /* Höher: 40%, Tiefer: 10% */
}
```

### Geschwindigkeit ändern:

**In `/app/pages/index.js`, Zeile ~597:**

```css
animation: santaFly 7s linear infinite;
/* Schneller: 5s, Langsamer: 10s */
```

---

## 🎨 Erweiterungen

### Andere Feiertage hinzufügen:

Sie können ähnliche Animationen für andere Tage hinzufügen:

**Beispiel für Silvester (31.12.):**

```javascript
// Neue State-Variable
const [showNewYear, setShowNewYear] = useState(false);

// In checkSantaAnimation erweitern:
const checkHolidayAnimation = (menuData) => {
  // ... Santa-Code ...
  
  // Silvester-Prüfung
  if (day === 31 && month === 12) {
    setShowNewYear(true);
    setTimeout(() => setShowNewYear(false), 15000);
  }
};
```

---

## 📊 Logik-Flussdiagramm

```
Benutzer lädt Seite
     ↓
Speiseplan laden
     ↓
checkSantaAnimation()
     ↓
├─→ Ist veröffentlicht? ─→ NEIN → ❌ Keine Animation
│        ↓ JA
├─→ Ist heute 24.12.? ─→ NEIN → ❌ Keine Animation
│        ↓ JA
└─→ Woche enthält 24.12.? ─→ NEIN → ❌ Keine Animation
         ↓ JA
    ✅ Animation starten
         ↓
    Läuft 15 Sekunden
         ↓
    Automatisch ausblenden
```

---

## 🐛 Troubleshooting

### Problem: Animation wird nicht angezeigt

**Checkliste:**

1. ✅ Ist heute wirklich der 24. Dezember?
2. ✅ Ist ein Speiseplan veröffentlicht? (Admin → "Veröffentlichen" Checkbox)
3. ✅ Liegt der 24.12. in der Woche des Speiseplans?
4. ✅ Browser-Cache geleert? (Strg+Shift+R / Cmd+Shift+R)
5. ✅ Video vorhanden? Prüfe: `/public/santa-animation.mp4` existiert

**Debug:**

Öffnen Sie die Browser-Konsole (F12) und suchen Sie nach:
```
🎅 Weihnachtsmann-Animation wird aktiviert!
```

Falls diese Nachricht fehlt, ist eine der Voraussetzungen nicht erfüllt.

### Problem: Animation ruckelt

- Video-Datei ist 4 MB groß
- Bei langsamer Internetverbindung kann es ruckeln
- Lösung: Video komprimieren oder kleinere Version verwenden

### Problem: Animation blockiert Inhalt

- Das sollte nicht passieren (pointer-events: none)
- Falls doch: Prüfen Sie z-index und Position in CSS

---

## 📝 Code-Referenz

### Haupt-Prüfungs-Funktion:

```javascript
const checkSantaAnimation = (menuData) => {
  // 1. Prüfe veröffentlicht
  if (!menuData || !menuData.isPublished) return;

  // 2. Prüfe Datum
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  if (day !== 24 || month !== 12) return;

  // 3. Prüfe Woche
  const weekStart = new Date(menuData.weekStart);
  const weekEnd = new Date(menuData.weekEnd);
  const christmas = new Date(today.getFullYear(), 11, 24);
  
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);
  christmas.setHours(12, 0, 0, 0);

  if (christmas >= weekStart && christmas <= weekEnd) {
    setShowSanta(true);
    setTimeout(() => setShowSanta(false), 15000);
  }
};
```

---

## 🎁 Fun Facts

- 🐷 Die Schweine mit Rentier-Geweihen sind eine lustige, unkonventionelle Interpretation
- 🔄 Das Video loopt nahtlos alle 7 Sekunden
- 🎄 Die Animation ist bewusst dezent gehalten, um den Speiseplan nicht zu stören
- 🌟 Sie können mehrere Animationen gleichzeitig laufen lassen (z.B. Schneefall + Santa)

---

**Version**: 1.0.0  
**Datum**: Dezember 2024  
**Autor**: E1 AI Assistant  
**Status**: ✅ Production Ready
