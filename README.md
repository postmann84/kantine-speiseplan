# kantine-speiseplan
Speiseplan Verwaltungssystem für die Betriebskantine

## Kontaktdaten für E-Mail-Versand

Die Anwendung unterstützt den Versand von E-Mails an Kontaktgruppen. Die Kontaktdaten werden verschlüsselt im Repository gespeichert.

### Einrichtung der Kontaktdaten

1. Exportieren Sie Ihre Kontakte aus web.de im CSV-Format
2. Setzen Sie den Verschlüsselungsschlüssel in der `.env.local` Datei:
   ```
   CONTACTS_ENCRYPTION_KEY=ihr_sicherer_schluessel
   ```
3. Verschlüsseln Sie die CSV-Datei mit dem Hilfsskript:
   ```
   node scripts/encrypt-contacts.js kollegen.csv kollegen
   ```
4. Die verschlüsselte Datei wird im `data`-Verzeichnis gespeichert und kann ins Repository gepusht werden

### Sicherheitshinweise

- Der Verschlüsselungsschlüssel sollte niemals im Repository gespeichert werden
- Stellen Sie sicher, dass der Schlüssel in den Umgebungsvariablen auf Ihrem Produktionsserver gesetzt ist
- Die Original-CSV-Datei sollte nicht ins Repository gepusht werden (sie ist in .gitignore ausgeschlossen)
