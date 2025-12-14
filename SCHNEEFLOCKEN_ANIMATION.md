# ❄️ Schneeflocken-Animation zur Weihnachtswoche

## 📋 Übersicht

Eine elegante Schneeflocken-Animation, die **alle 30 Sekunden** für **5 Sekunden** über den Bildschirm rieselt, wenn der Weihnachtsmann (Speiseplan für 24.12.) aktiv ist.

---

## 🎯 Funktionsweise

### Wann erscheinen die Schneeflocken?

**Bedingungen (ALLE müssen erfüllt sein):**
1. ✅ **Weihnachtsmann-Animation aktiv** (Speiseplan für Woche mit 24.12. veröffentlicht)
2. ✅ **Timing**: 
   - Erste Schneeflocken nach **5 Sekunden** Ladezeit
   - Dann alle **30 Sekunden** wiederholt
   - Jedes Mal für **5 Sekunden** Dauer

### Was passiert?

- ❄️ **15 Schneeflocken** fallen vom oberen Bildschirmrand
- 🌨️ **Verschiedene Größen** (16px - 24px)
- ⏱️ **Unterschiedliche Geschwindigkeiten** (8s - 13s pro Fall)
- 💨 **Sanftes Driften** nach links und rechts beim Fallen
- ✨ **Leuchten-Effekt** (text-shadow für Glanz)
- 👻 **Nicht-blockierend** (pointer-events: none)

---

## 🎨 Technische Details

### CSS-Animation:

```css
@keyframes snowfall {
  0%   { transform: translateY(-10vh); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(110vh); opacity: 0; }
}
```

### Schneeflocken-Charakteristiken:

| Eigenschaft | Werte |
|-------------|-------|
| Anzahl | 15 Schneeflocken |
| Symbole | ❄ ❅ ❆ |
| Größen | 16px - 24px |
| Geschwindigkeiten | 8s - 13s |
| Drift | -40px bis +40px |
| Position | Zufällig über die Breite verteilt (5% - 95%) |
| Z-Index | 9998 (unter Santa, über Rest) |

### Timing:

```javascript
// Erste Schneeflocken nach 5 Sekunden
setTimeout(() => {
  setShowSnowflakes(true);
  setTimeout(() => setShowSnowflakes(false), 5000); // 5s Dauer
}, 5000);

// Dann alle 30 Sekunden wiederholen
setInterval(() => {
  setShowSnowflakes(true);
  setTimeout(() => setShowSnowflakes(false), 5000); // 5s Dauer
}, 30000);
```

---

## 🔧 Anpassungen

### Häufigkeit ändern (alle X Sekunden):

**In `/app/pages/index.js`, Zeile ~134:**

```javascript
setInterval(() => {
  setShowSnowflakes(true);
  setTimeout(() => setShowSnowflakes(false), 5000);
}, 30000); // ← HIER ändern

// Beispiele:
// 20 Sekunden: 20000
// 45 Sekunden: 45000
// 1 Minute: 60000
```

### Dauer der Schneeflocken ändern:

**In `/app/pages/index.js`, Zeile ~130 und ~134:**

```javascript
setTimeout(() => setShowSnowflakes(false), 5000); // ← HIER ändern

// Beispiele:
// 3 Sekunden: 3000
// 7 Sekunden: 7000
// 10 Sekunden: 10000
```

### Anzahl der Schneeflocken ändern:

**In `/app/pages/index.js`, Zeile ~725-739:**

Fügen Sie mehr `<div className="snowflake">❄</div>` hinzu oder entfernen Sie welche.

**Wichtig**: Für jede neue Schneeflocke CSS-Regel hinzufügen:
```css
.snowflake:nth-child(16) { 
  --size: 20px; 
  --duration: 10s; 
  --delay: 1.5s; 
  left: 20%; 
  --drift: 25px; 
}
```

### Schneeflocken-Geschwindigkeit ändern:

**In `/app/pages/index.js`, CSS-Bereich Zeile ~710-724:**

```css
.snowflake:nth-child(1) { 
  --duration: 8s;  /* ← Schneller: 5s, Langsamer: 15s */
}
```

### Schneeflocken-Größe ändern:

```css
.snowflake:nth-child(1) { 
  --size: 20px;  /* ← Kleiner: 14px, Größer: 30px */
}
```

---

## 🎄 Schneeflocken-Symbole

Verfügbare Unicode-Schneeflocken:
- ❄ (U+2744) - Klassische Schneeflocke
- ❅ (U+2745) - Dichte Schneeflocke
- ❆ (U+2746) - Schwere Schneeflocke
- ✻ (U+273B) - Stern-Schneeflocke
- ✼ (U+273C) - Offene Schneeflocke
- ❊ (U+274A) - Acht-Speichen-Schneeflocke
- ✥ (U+2725) - Vier-Blatt-Schneeflocke
- ✺ (U+273A) - 16-Punkt-Stern

**Zum Ändern**: Ersetzen Sie die Symbole in den `<div>` Tags:
```html
<div className="snowflake">✺</div>
```

---

## 📊 Performance

### Ressourcen-Nutzung:

- **CPU**: Sehr gering (nur CSS-Animationen)
- **Memory**: < 1 MB
- **GPU**: Nutzt Hardware-Beschleunigung wenn verfügbar
- **Einfluss auf Seite**: Minimal (pointer-events: none)

### Browser-Kompatibilität:

| Browser | Support |
|---------|---------|
| Chrome | ✅ Vollständig |
| Firefox | ✅ Vollständig |
| Safari | ✅ Vollständig |
| Edge | ✅ Vollständig |
| Mobile | ✅ Vollständig |

---

## 🎨 Erweiterte Anpassungen

### Nur auf Desktop anzeigen:

```css
@media (max-width: 768px) {
  .snowflake-container {
    display: none; /* Keine Schneeflocken auf mobil */
  }
}
```

### Schneeflocken mit Farbverlauf:

```css
.snowflake {
  background: linear-gradient(white, lightblue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Schneeflocken mit Rotation:

```css
@keyframes snowfall {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 0;
  }
  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
  }
}
```

### Mehr Schneeflocken für "Schneesturm":

Erhöhen Sie auf 30-50 Schneeflocken für intensiveren Effekt:

```html
{/* In index.js, Zeile ~725 */}
<div className="snowflake">❄</div>
<div className="snowflake">❅</div>
{/* ... bis 30-50 Stück */}
```

---

## 🐛 Troubleshooting

### Problem: Schneeflocken erscheinen nicht

**Checkliste:**
1. ✅ Ist Weihnachtsmann-Animation aktiv? (Speiseplan für 24.12. veröffentlicht?)
2. ✅ Haben Sie 5 Sekunden gewartet? (Erste Schneeflocken nach 5s)
3. ✅ Browser-Cache geleert? (Strg+Shift+R)

**Debug:**
Browser-Konsole (F12) sollte zeigen:
```
🎅 Weihnachtsmann-Animation wird aktiviert!
```

### Problem: Schneeflocken laufen nicht flüssig

**Lösung**: Reduzieren Sie die Anzahl der Schneeflocken auf 10-12 Stück.

### Problem: Schneeflocken erscheinen zu oft/selten

**Anpassen**: Ändern Sie das Intervall (siehe "Anpassungen" oben).

---

## 💡 Design-Tipps

### Dezente Animation (AKTUELL):
- 15 Schneeflocken
- Alle 30 Sekunden für 5 Sekunden
- Mittlere Größe (16-24px)
- **Empfohlen für professionelle Seiten**

### Intensive Animation:
- 30-40 Schneeflocken
- Alle 15 Sekunden für 8 Sekunden
- Größere Flocken (20-32px)
- **Gut für festliche/spielerische Seiten**

### Subtile Animation:
- 8-10 Schneeflocken
- Alle 45 Sekunden für 3 Sekunden
- Kleine Flocken (12-18px)
- **Für minimalistische Designs**

---

## 🎁 Kombinationen

Die Schneeflocken-Animation läuft **parallel** zum Weihnachtsmann:

```
Timeline:
0s   → Seite lädt
0s   → Weihnachtsmann startet (kontinuierlich)
5s   → Erste Schneeflocken (5s lang)
10s  → Schneeflocken enden
35s  → Zweite Schneeflocken (5s lang)
40s  → Schneeflocken enden
65s  → Dritte Schneeflocken (5s lang)
...  → Endlos-Schleife
```

---

## 📝 Code-Struktur

### Hauptkomponenten:

1. **State Management**:
   ```javascript
   const [showSnowflakes, setShowSnowflakes] = useState(false);
   ```

2. **Intervall-Steuerung**:
   ```javascript
   const startSnowflakeInterval = () => { ... }
   ```

3. **CSS-Animationen**:
   ```css
   @keyframes snowfall { ... }
   ```

4. **Render-Komponente**:
   ```jsx
   {showSnowflakes && showSanta && (
     <div className="snowflake-container">
       <div className="snowflake">❄</div>
       ...
     </div>
   )}
   ```

---

## 🎯 Zusammenfassung

**Vorteile:**
- ✅ Elegant und festlich
- ✅ Sehr performant (nur CSS)
- ✅ Nicht störend (alle 30s für 5s)
- ✅ Passt perfekt zum Weihnachtsmann
- ✅ Voll anpassbar

**Einstellungen:**
- 📊 **Häufigkeit**: 30 Sekunden (anpassbar)
- ⏱️ **Dauer**: 5 Sekunden (anpassbar)
- ❄️ **Anzahl**: 15 Schneeflocken (anpassbar)
- 📏 **Größe**: 16-24px (anpassbar)

---

**Version**: 1.0.0  
**Datum**: Dezember 2024  
**Status**: ✅ Production Ready  
**Performance**: ⚡ Sehr leichtgewichtig
