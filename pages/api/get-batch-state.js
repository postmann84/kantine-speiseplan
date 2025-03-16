// Diese API wird nicht mehr benötigt, da wir den Batch-Status nicht mehr im Dateisystem speichern
export default async function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'Diese API wird nicht mehr verwendet'
  });
} 