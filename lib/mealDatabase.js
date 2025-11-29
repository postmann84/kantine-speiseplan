// lib/mealDatabase.js
// Referenz-Datenbank für häufige Kantinen-Gerichte mit Allergen- und Zusatzstoff-Kennzeichnung

export const MEAL_DATABASE = [
  // Fleischgerichte - Schwein
  { name: 'Schnitzel Wiener Art', allergens: ['a', 'c', 'g'], additives: ['8'] },
  { name: 'Paniertes Schnitzel', allergens: ['a', 'c', 'g'], additives: ['8'] },
  { name: 'Jägerschnitzel', allergens: ['a', 'c', 'g'], additives: ['8'] },
  { name: 'Zigeunerschnitzel', allergens: ['a', 'c', 'g'], additives: ['1', '8'] },
  { name: 'Schweineschnitzel', allergens: ['a', 'c', 'g'], additives: ['8'] },
  { name: 'Schweinekotelett', allergens: [], additives: ['8'] },
  { name: 'Schweinesteak', allergens: [], additives: ['8'] },
  { name: 'Kasseler', allergens: [], additives: ['2', '8'] },
  { name: 'Eisbein', allergens: [], additives: ['2', '8'] },
  { name: 'Schweinebraten', allergens: ['a', 'g'], additives: ['8'] },
  
  // Fleischgerichte - Rind
  { name: 'Rinderbraten', allergens: ['a', 'g'], additives: ['8'] },
  { name: 'Rindersteak', allergens: [], additives: ['8'] },
  { name: 'Rinderroulade', allergens: ['a', 'g', 'j'], additives: ['8'] },
  { name: 'Sauerbraten', allergens: ['a', 'g'], additives: ['1', '8'] },
  { name: 'Gulasch', allergens: ['a', 'g'], additives: ['1', '8'] },
  { name: 'Rindergulasch', allergens: ['a', 'g'], additives: ['1', '8'] },
  { name: 'Beef Stroganoff', allergens: ['a', 'g'], additives: ['8'] },
  
  // Fleischgerichte - Geflügel
  { name: 'Hähnchenbrust', allergens: [], additives: ['8'] },
  { name: 'Hähnchenkeule', allergens: [], additives: ['8'] },
  { name: 'Hähnchen paniert', allergens: ['a', 'c', 'g'], additives: ['8'] },
  { name: 'Chicken Nuggets', allergens: ['a', 'c', 'g'], additives: ['1', '8'] },
  { name: 'Hähnchengeschnetzeltes', allergens: ['a', 'g'], additives: ['8'] },
  { name: 'Putenschnitzel', allergens: ['a', 'c', 'g'], additives: ['8'] },
  { name: 'Putensteak', allergens: [], additives: ['8'] },
  { name: 'Puten-Geschnetzeltes', allergens: ['a', 'g'], additives: ['8'] },
  { name: 'Ente', allergens: ['a', 'g'], additives: ['8'] },
  
  // Hackfleischgerichte
  { name: 'Hackbraten', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Frikadelle', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Bulette', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Königsberger Klopse', allergens: ['a', 'c', 'g', 'd'], additives: ['8'] },
  { name: 'Gehacktes', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Hackfleischsoße', allergens: ['a', 'g'], additives: ['2', '8'] },
  { name: 'Bolognese', allergens: ['a', 'g'], additives: ['2', '8'] },
  { name: 'Lasagne', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Moussaka', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  
  // Wurst
  { name: 'Bratwurst', allergens: [], additives: ['2', '8'] },
  { name: 'Currywurst', allergens: [], additives: ['1', '2', '4', '8'] },
  { name: 'Bockwurst', allergens: [], additives: ['2', '8'] },
  { name: 'Wiener Würstchen', allergens: [], additives: ['2', '8'] },
  { name: 'Leberkäse', allergens: ['a', 'c'], additives: ['2', '8'] },
  { name: 'Weißwurst', allergens: [], additives: ['2', '8'] },
  
  // Fischgerichte
  { name: 'Fischfilet paniert', allergens: ['a', 'c', 'd', 'g'], additives: [] },
  { name: 'Backfisch', allergens: ['a', 'c', 'd', 'g'], additives: [] },
  { name: 'Fischstäbchen', allergens: ['a', 'c', 'd', 'g'], additives: ['1'] },
  { name: 'Lachsfilet', allergens: ['d'], additives: [] },
  { name: 'Seelachsfilet', allergens: ['d'], additives: [] },
  { name: 'Forellenfilet', allergens: ['d'], additives: [] },
  { name: 'Matjesfilet', allergens: ['d'], additives: [] },
  { name: 'Heringsfilet', allergens: ['d'], additives: ['2'] },
  
  // Rouladen und gefüllte Gerichte
  { name: 'Kohlroulade', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Krautroulade', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Paprika gefüllt', allergens: ['a', 'g'], additives: ['2', '8'] },
  { name: 'Gefüllte Paprika', allergens: ['a', 'g'], additives: ['2', '8'] },
  { name: 'Cordon Bleu', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  
  // Nudelgerichte
  { name: 'Spaghetti Bolognese', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Spaghetti Carbonara', allergens: ['a', 'c', 'g'], additives: ['2', '8'] },
  { name: 'Pasta Napoli', allergens: ['a', 'c'], additives: [] },
  { name: 'Pasta Arrabiata', allergens: ['a', 'c'], additives: ['1'] },
  { name: 'Tortellini', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Ravioli', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Nudeln mit Sauce', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Makkaroni', allergens: ['a', 'c'], additives: [] },
  
  // Kartoffelgerichte
  { name: 'Bratkartoffeln', allergens: [], additives: [] },
  { name: 'Kartoffelpüree', allergens: ['g'], additives: [] },
  { name: 'Kartoffelbrei', allergens: ['g'], additives: [] },
  { name: 'Stampfkartoffeln', allergens: ['g'], additives: [] },
  { name: 'Pommes Frites', allergens: [], additives: [] },
  { name: 'Kroketten', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Kartoffelgratin', allergens: ['g'], additives: [] },
  { name: 'Kartoffelpuffer', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Reibekuchen', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Rosmarinkartoffeln', allergens: [], additives: [] },
  { name: 'Ofenkartoffeln', allergens: [], additives: [] },
  
  // Reis & Knödel
  { name: 'Reis', allergens: [], additives: [] },
  { name: 'Butterreis', allergens: ['g'], additives: [] },
  { name: 'Djuvecreis', allergens: [], additives: ['1'] },
  { name: 'Curryreis', allergens: [], additives: ['1'] },
  { name: 'Knödel', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Semmelknödel', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Kartoffelknödel', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Klöße', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Spätzle', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Käsespätzle', allergens: ['a', 'c', 'g'], additives: ['8'] },
  
  // Vegetarische Gerichte
  { name: 'Gemüse-Lasagne', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Gemüseauflauf', allergens: ['a', 'g'], additives: [] },
  { name: 'Gemüsepfanne', allergens: [], additives: [] },
  { name: 'Ratatouille', allergens: [], additives: [] },
  { name: 'Gebackener Schafskäse', allergens: ['a', 'c', 'g'], additives: ['1', '2', '8'] },
  { name: 'Gebackener Feta', allergens: ['a', 'c', 'g'], additives: ['1', '2', '8'] },
  { name: 'Gebackener Ziegenkäse', allergens: ['a', 'c', 'g'], additives: ['1', '2', '8'] },
  { name: 'Omelette', allergens: ['c', 'g'], additives: [] },
  { name: 'Eierkuchen', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Pfannkuchen', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Kaiserschmarrn', allergens: ['a', 'c', 'g'], additives: [] },
  { name: 'Gemüsecurry', allergens: ['g'], additives: ['1', '4'] },
  { name: 'Falafel', allergens: ['a', 'k'], additives: [] },
  
  // Suppen
  { name: 'Gulaschsuppe', allergens: ['a', 'g'], additives: ['1', '4', '8'] },
  { name: 'Erbsensuppe', allergens: [], additives: ['2', '4', '8'] },
  { name: 'Linsensuppe', allergens: ['i'], additives: ['2', '4', '8'] },
  { name: 'Kartoffelsuppe', allergens: ['g', 'i'], additives: ['4'] },
  { name: 'Gemüsesuppe', allergens: ['i'], additives: ['4'] },
  { name: 'Tomatensuppe', allergens: ['g', 'i'], additives: ['4'] },
  { name: 'Kürbissuppe', allergens: ['g'], additives: [] },
  { name: 'Hühnersuppe', allergens: ['a', 'i'], additives: ['4', '8'] },
  { name: 'Rinderbrühe', allergens: ['i'], additives: ['4'] },
  
  // Eintöpfe
  { name: 'Eintopf', allergens: ['i'], additives: ['2', '4', '8'] },
  { name: 'Bohneneintopf', allergens: ['i'], additives: ['2', '4', '8'] },
  { name: 'Kartoffeleintopf', allergens: ['i'], additives: ['2', '4', '8'] },
  { name: 'Linseneintopf', allergens: ['i'], additives: ['2', '4', '8'] },
  { name: 'Erbseneintopf', allergens: ['i'], additives: ['2', '4', '8'] },
  { name: 'Pichelsteiner', allergens: ['i'], additives: ['4', '8'] },
  
  // Salate (Beilagen)
  { name: 'Gemischter Salat', allergens: [], additives: [] },
  { name: 'Grüner Salat', allergens: [], additives: [] },
  { name: 'Krautsalat', allergens: [], additives: ['11'] },
  { name: 'Kartoffelsalat', allergens: ['j'], additives: ['2'] },
  { name: 'Gurkensalat', allergens: [], additives: ['11'] },
  { name: 'Tomatensalat', allergens: [], additives: [] },
  
  // Gemüse-Beilagen
  { name: 'Rotkohl', allergens: [], additives: ['2'] },
  { name: 'Blaukraut', allergens: [], additives: ['2'] },
  { name: 'Sauerkraut', allergens: [], additives: ['2'] },
  { name: 'Rahmgemüse', allergens: ['g'], additives: [] },
  { name: 'Buttergemüse', allergens: ['g'], additives: [] },
  { name: 'Rahmspinat', allergens: ['g'], additives: [] },
  { name: 'Leipziger Allerlei', allergens: ['g'], additives: [] },
  { name: 'Grüne Bohnen', allergens: [], additives: [] },
  { name: 'Erbsen und Möhren', allergens: [], additives: [] },
  { name: 'Brokkoli', allergens: [], additives: [] },
  { name: 'Blumenkohl', allergens: [], additives: [] },
  
  // Saucen
  { name: 'Jägersauce', allergens: ['a', 'g', 'i'], additives: ['4'] },
  { name: 'Zigeunersauce', allergens: ['a', 'g'], additives: ['1', '4'] },
  { name: 'Rahmsoße', allergens: ['a', 'g'], additives: [] },
  { name: 'Sahnesoße', allergens: ['a', 'g'], additives: [] },
  { name: 'Bratensoße', allergens: ['a', 'g', 'i'], additives: ['4'] },
  { name: 'Sauce Hollandaise', allergens: ['c', 'g'], additives: [] },
  { name: 'Kräutersoße', allergens: ['a', 'g'], additives: [] },
  { name: 'Pfeffersauce', allergens: ['a', 'g'], additives: [] },
  { name: 'Champignonsauce', allergens: ['a', 'g'], additives: ['4'] },
  { name: 'Tomatensauce', allergens: ['i'], additives: [] },
  { name: 'Currysauce', allergens: ['a', 'g'], additives: ['1', '4'] }
];

// Normalisiere Gerichtnamen für besseres Matching
export function normalizeString(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

// Suche nach exaktem Match
export function findExactMatch(mealName) {
  const normalized = normalizeString(mealName);
  return MEAL_DATABASE.find(meal => normalizeString(meal.name) === normalized);
}

// Suche nach partiellem Match (z.B. "Schnitzel" in "Wiener Schnitzel")
export function findPartialMatch(mealName) {
  const normalized = normalizeString(mealName);
  const words = normalized.split(' ').filter(w => w.length > 3); // Nur Wörter mit 4+ Buchstaben
  
  for (const meal of MEAL_DATABASE) {
    const mealNormalized = normalizeString(meal.name);
    // Prüfe ob alle signifikanten Wörter enthalten sind
    if (words.every(word => mealNormalized.includes(word))) {
      return meal;
    }
  }
  return null;
}

// Levenshtein Distance für Fuzzy Matching
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

// Berechne Ähnlichkeit (0-1)
export function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Suche nach ähnlichem Match
export function findSimilarMatch(mealName, threshold = 0.8) {
  const normalized = normalizeString(mealName);
  let bestMatch = null;
  let bestSimilarity = 0;
  
  for (const meal of MEAL_DATABASE) {
    const similarity = calculateSimilarity(normalized, normalizeString(meal.name));
    if (similarity > bestSimilarity && similarity >= threshold) {
      bestSimilarity = similarity;
      bestMatch = { ...meal, similarity };
    }
  }
  
  return bestMatch;
}
