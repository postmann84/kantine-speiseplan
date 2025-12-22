# 🎆 Neujahrs/Silvester-Animation

## 📋 Übersicht

Eine mehrstufige, dynamische Silvester-Animation für die Woche mit dem **1. Januar**, bestehend aus 3 Phasen:

1. 🚀 **Schweinchen auf Rakete** fliegt über den Bildschirm
2. 💥 **Feuerwerk-Explosion** in der Bildschirmmitte
3. 🍀 **2026 mit Kleeblatt-Fallschirm** fällt herunter

---

## 🎯 Funktionsweise

### Wann erscheint die Animation?

**Bedingungen:**
1. ✅ Ein Speiseplan mit `isPublished: true` ist veröffentlicht
2. ✅ Die Woche enthält den **1. Januar** (aktuelles oder nächstes Jahr)
3. ✅ Nur auf der öffentlichen Kundenseite `/`

**Beispiel-Wochen:**
- **KW 1 2025**: 30.12.2024 - 5.1.2025 ✅ (enthält 1.1.2025)
- **KW 1 2026**: 29.12.2025 - 4.1.2026 ✅ (enthält 1.1.2026)

---

## 🎬 Animations-Phasen

### **Phase 1: Rakete fliegt (5 Sekunden)** 🚀

- **Element**: Schweinchen auf Rakete
- **Bewegung**: Von links nach rechts über den Bildschirm
- **Rotation**: Leicht schräg (-15°) für realistische Flugbahn
- **Dauer**: 5 Sekunden
- **Größe**: 
  - Desktop: 250px Höhe
  - Mobil: 150px Höhe

**Animation:**
```css
@keyframes rocketFly {
  0%   { left: -300px; }
  100% { left: 100%; }
}
```

### **Phase 2: Explosion (2 Sekunden)** 💥

- **Element**: Silvester-Feuerwerk
- **Position**: Bildschirmmitte
- **Effekt**: 
  - Erscheint aus dem Nichts (scale 0 → 1.2 → 1)
  - Rotiert während der Explosion (0° → 360°)
  - Fade-in Effekt
- **Dauer**: 2 Sekunden
- **Größe**: 
  - Desktop: 600px Breite
  - Mobil: 400px Breite

**Animation:**
```css
@keyframes explode {
  0%   { scale(0) opacity(0) }
  50%  { scale(1.2) opacity(1) }
  100% { scale(1) rotate(360deg) }
}
```

### **Phase 3: 2026 fällt (5 Sekunden)** 🍀

- **Element**: Jahreszahl 2026 mit Kleeblatt-Fallschirm
- **Bewegung**: Fällt von oben nach unten
- **Effekte**:
  - Sanftes Schwingen beim Fallen (Pendelbewegung)
  - Leichte horizontale Drift (50px nach rechts)
  - Leichte Rotation (10°)
- **Dauer**: 5 Sekunden
- **Größe**: 
  - Desktop: 300px Höhe
  - Mobil: 200px Höhe

**Animation:**
```css
@keyframes fallDown {
  0%   { top: -200px; opacity: 0; }
  10%  { opacity: 1; }
  100% { top: 110vh; translateX(50px); }
}

@keyframes swing {
  0%, 100% { rotate(-5deg); }
  50%      { rotate(5deg); }
}
```

---

## ⏱️ Timeline

```
0s    → Phase 1 startet: Rakete fliegt
5s    → Phase 2 startet: Explosion/Feuerwerk
7s    → Phase 3 startet: 2026 fällt
12s   → Animation komplett durchgelaufen
12s   → Neustart bei Phase 1 (Endlosschleife)
```

**Gesamtdauer pro Zyklus:** 12 Sekunden  
**Wiederholung:** Endlos während die Woche mit 1. Januar veröffentlicht ist

---

## 🎨 Technische Details

### Bilder:

| Datei | Größe | Transparenz | Verwendung |
|-------|-------|-------------|------------|
| `newyear-rocket.png` | 2.3 MB | ⚠️ Grauer Hintergrund (CSS-Trick) | Phase 1 |
| `newyear-firework.png` | 1.2 MB | ✅ Transparent | Phase 2 |
| `newyear-2026.png` | 908 KB | ✅ Transparent | Phase 3 |

### Hintergrund-Problem bei Rakete:

Das Raketen-Bild hat einen grauen Hintergrund. Gelöst durch:
```css
.rocket-img {
  mix-blend-mode: multiply;
  filter: brightness(1.1);
}
```

**Multiply-Mode** entfernt helle Hintergründe automatisch!

---

## 🔧 Anpassungen

### Geschwindigkeit ändern:

**In `/app/pages/index.js`, Zeile ~155-169:**

```javascript
// Phase 1: Rakete (aktuell 5s)
setTimeout(() => {
  setNewYearPhase(2);
}, 5000); // ← Ändern Sie 5000 (= 5 Sekunden)

// Phase 2: Explosion (aktuell 2s)
setTimeout(() => {
  setNewYearPhase(3);
}, 2000); // ← Ändern Sie 2000 (= 2 Sekunden)

// Phase 3: Fallschirm (aktuell 5s)
setTimeout(() => {
  startNewYearAnimation();
}, 5000); // ← Ändern Sie 5000 (= 5 Sekunden)
```

### Größen ändern:

**In `/app/pages/index.js`, CSS-Bereich:**

```css
/* Rakete */
.rocket-img {
  height: 250px; /* Größer: 350px, Kleiner: 180px */
}

/* Explosion */
.explosion-img {
  width: 600px; /* Größer: 800px, Kleiner: 400px */
}

/* 2026 Fallschirm */
.year-img {
  height: 300px; /* Größer: 400px, Kleiner: 200px */
}
```

### Position der Rakete ändern:

```css
.rocket-phase {
  bottom: 30%; /* Höher: 50%, Tiefer: 20% */
}
```

### Schwing-Geschwindigkeit des Fallschirms:

```css
.year-img {
  animation: swing 2s ease-in-out infinite;
  /* Schneller: 1s, Langsamer: 3s */
}
```

---

## 🎁 Besondere Features

### 1. **Mehrstufige Animation**
Einzigartig! Nicht nur eine simple Animation, sondern eine **Geschichte in 3 Akten**.

### 2. **Nahtlose Übergänge**
Jede Phase geht fließend in die nächste über - keine harten Schnitte.

### 3. **Physikalisch realistisch**
- Rakete fliegt schräg nach oben (realistische Flugbahn)
- Explosion in Bildschirmmitte (wo Rakete angekommen wäre)
- Fallschirm schwingt beim Fallen (Pendeleffekt)

### 4. **Responsive Design**
Alle Größen passen sich automatisch an Mobile/Desktop an.

### 5. **Performance-optimiert**
- CSS-Animationen (GPU-beschleunigt)
- Nur aktive Phase wird gerendert
- Keine Last auf dem Browser

---

## 🐛 Troubleshooting

### Problem: Raketen-Hintergrund ist sichtbar

Der graue Hintergrund sollte durch `mix-blend-mode: multiply` entfernt werden. Falls nicht:

**Alternative 1 - Screen Mode:**
```css
.rocket-img {
  mix-blend-mode: screen; /* Statt multiply */
}
```

**Alternative 2 - Bild selbst transparent machen:**
- Nutzen Sie https://www.remove.bg/upload
- Laden Sie die Rakete hoch
- Hintergrund wird automatisch entfernt
- Laden Sie transparentes PNG herunter
- Ersetzen Sie `/public/newyear-rocket.png`

### Problem: Animation läuft nicht

**Checkliste:**
1. ✅ Ist Speiseplan für Woche mit 1. Januar veröffentlicht?
2. ✅ Browser-Cache geleert? (Strg+Shift+R)
3. ✅ Sind alle 3 Bilder in `/public/` vorhanden?

**Debug - Browser-Konsole (F12):**
```
🎆 Neujahrs-Animation wird aktiviert!
✅ Veröffentlichte Woche: 2024-12-30 bis 2025-01-05
🎊 Diese Woche enthält den 1. Januar → Silvester-Animation aktiv!
```

### Problem: Animation ist zu schnell/langsam

Passen Sie die Timeouts an (siehe "Anpassungen" oben).

### Problem: 2026 schwingt zu stark

```css
@keyframes swing {
  0%, 100% { rotate(-3deg); } /* War: -5deg */
  50% { rotate(3deg); }       /* War: 5deg */
}
```

---

## 📊 Performance

| Metrik | Wert |
|--------|------|
| CPU-Last | Sehr gering (CSS-Animationen) |
| Memory | < 5 MB (3 Bilder) |
| GPU-Beschleunigung | ✅ Ja |
| Einfluss auf Seite | Minimal (pointer-events: none) |
| Browser-Support | 95%+ (alle modernen Browser) |

---

## 🎨 Kombination mit Weihnachts-Animation

**Beide Animationen können NICHT gleichzeitig laufen!**

- **Dezember-Wochen (15.-19.12. & 23.-29.12.)**: Weihnachtsmann + Schneeflocken 🎅❄️
- **Neujahrs-Woche (mit 1.1.)**: Silvester-Animation 🎆🐷🍀

**Z-Index Hierarchie:**
```
Santa/Weihnachtsmann:  z-index: 9999 (oben)
Schneeflocken:         z-index: 9998 (mitte)
Neujahr:               z-index: 9997 (unten)
```

---

## 🚀 Erweiterungen

### Idee 1: Sound-Effekte

Fügen Sie Silvester-Sounds hinzu:
```javascript
// In startNewYearAnimation()
const explosionSound = new Audio('/sounds/explosion.mp3');
setTimeout(() => explosionSound.play(), 5000);
```

### Idee 2: Konfetti

Fügen Sie nach der Explosion Konfetti-Regen hinzu (ähnlich wie Schneeflocken).

### Idee 3: Countdown

Zeigen Sie einen Countdown zur nächsten Phase an.

### Idee 4: Interaktivität

Lassen Sie Benutzer auf die Rakete klicken, um die Explosion früher auszulösen.

---

## 📝 Zusammenfassung

**Animation-Flow:**
```
Schweinchen auf Rakete 🚀 (5s)
    ↓
Explosion/Feuerwerk 💥 (2s)
    ↓
2026 fällt mit Fallschirm 🍀 (5s)
    ↓
Wiederholung (Endlosschleife)
```

**Aktivierung:**
- Woche mit 1. Januar veröffentlichen
- Animation startet automatisch
- Läuft die ganze Woche als Endlosschleife

**Dateien:**
```
/app/public/newyear-rocket.png     (2.3 MB)
/app/public/newyear-firework.png   (1.2 MB)
/app/public/newyear-2026.png       (908 KB)
/app/pages/index.js                (Animations-Code)
```

---

**Frohes Neues Jahr! 🎆🐷🍀2026**

**Version**: 1.0.0  
**Datum**: Dezember 2024  
**Status**: ✅ Production Ready
