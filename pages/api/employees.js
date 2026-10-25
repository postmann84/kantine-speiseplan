// pages/api/employees.js
import dbConnect from '../../lib/mongodb';
import Employee from '../../models/employee';

export default async function handler(req, res) {
  await dbConnect();

  // GET: Alle Mitarbeiter laden
  if (req.method === 'GET') {
    try {
      const employees = await Employee.find({}).sort({ createdAt: 1 }).lean();
      return res.status(200).json({ success: true, employees });
    } catch (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      return res.status(500).json({ success: false, error: 'Serverfehler' });
    }
  }

  // POST: Mitarbeiter anlegen oder aktualisieren
  if (req.method === 'POST') {
    try {
      const { _id, firstName, lastName, personnelNumber, note, isActive, shift } = req.body;

      if (!firstName || !firstName.trim()) {
        return res.status(400).json({ success: false, error: 'Vorname ist erforderlich' });
      }

      const payload = {
        firstName: (firstName || '').trim(),
        lastName: (lastName || '').trim(),
        personnelNumber: personnelNumber || '',
        note: note || '',
        shift: ['frueh', 'spaet', 'ganztags'].includes(shift) ? shift : 'ganztags',
        isActive: isActive !== undefined ? isActive : true
      };

      let employee;
      if (_id) {
        employee = await Employee.findByIdAndUpdate(_id, payload, { new: true });
      } else {
        employee = await Employee.create(payload);
      }

      return res.status(200).json({ success: true, employee });
    } catch (error) {
      console.error('Fehler beim Speichern des Mitarbeiters:', error);
      return res.status(500).json({ success: false, error: 'Serverfehler' });
    }
  }

  // DELETE: Mitarbeiter löschen
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ success: false, error: 'ID erforderlich' });
      }
      await Employee.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Fehler beim Löschen des Mitarbeiters:', error);
      return res.status(500).json({ success: false, error: 'Serverfehler' });
    }
  }

  return res.status(405).json({ success: false, error: 'Methode nicht erlaubt' });
}
