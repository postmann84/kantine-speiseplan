// lib/allergenTaxonomy.js
// Gemeinsame Taxonomie für deklarationspflichtige Zusatzstoffe und Allergene

export const ADDITIVES = {
  '1': 'mit Farbstoff',
  '2': 'mit Konservierungsstoff',
  '3': 'mit Antioxidationsmittel',
  '4': 'mit Geschmacksverstärker',
  '5': 'geschwefelt',
  '6': 'geschwärzt',
  '7': 'mit Phosphat',
  '8': 'mit Milcheiweiß (bei Fleischerzeugnissen)',
  '9': 'koffeinhaltig',
  '10': 'chininhaltig',
  '11': 'mit Süßungsmittel',
  // '12': '—', // bewusst ausgelassen, nicht in der Liste
  '13': 'gewachst'
};

export const ALLERGENS = {
  'a': 'Glutenhaltiges Getreide',
  'b': 'Krebstiere und daraus gewonnene Erzeugnisse',
  'c': 'Eier und daraus gewonnene Erzeugnisse',
  'd': 'Fische und daraus gewonnene Erzeugnisse',
  'e': 'Erdnüsse und daraus gewonnene Erzeugnisse',
  'f': 'Soja(bohnen) und daraus gewonnene Erzeugnisse',
  'g': 'Milch und daraus gewonnene Erzeugnisse',
  'h': 'Schalenfrüchte',
  'i': 'Sellerie und daraus gewonnene Erzeugnisse',
  'j': 'Senf und daraus gewonnene Erzeugnisse',
  'k': 'Sesamsamen und daraus gewonnene Erzeugnisse',
  'l': 'Schwefeldioxid und Sulphite',
  'm': 'Lupinen und daraus gewonnene Erzeugnisse',
  'n': 'Weichtiere und daraus gewonnene Erzeugnisse'
};

export const ADDITIVE_CODES = Object.keys(ADDITIVES);
export const ALLERGEN_CODES = Object.keys(ALLERGENS);

export function formatCodesInline(allergenCodes = [], additiveCodes = []) {
  const allergens = (allergenCodes || []).map((c) => c.toLowerCase()).join('');
  const additives = (additiveCodes || []).map((c) => String(c)).join('');
  if (!allergens && !additives) return '';
  if (allergens && additives) return `${allergens}${additives}`;
  return allergens || additives;
}

