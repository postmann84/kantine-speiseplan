// lib/smartDefaults.js
// Intelligente Default-Regeln für Allergen- und Zusatzstoff-Kennzeichnung basierend auf Kategorien

import { ALLERGEN_CODES, ADDITIVE_CODES } from './allergenTaxonomy';

// Kategorie-Definitionen mit erweiterten Keywords
export const CATEGORY_PATTERNS = {
  // Fleisch & Wurst - fast immer Konservierung + Milcheiweiß
  MEAT_PROCESSED: {
    keywords: [
      'wurst', 'hack', 'bulette', 'frikadelle', 'bratwurst', 'currywurst', 'bockwurst',
      'leberkäse', 'hackbraten', 'gehacktes', 'weißwurst', 'frankfurter', 'wiener',
      'salami', 'schinken', 'speck', 'leberwurst', 'mortadella', 'mettwurst'
    ],
    defaultAllergens: [],
    defaultAdditives: ['2', '8'], // Konserviert + Milcheiweiß
    confidence: 95
  },
  
  // Panierte Gerichte - Gluten, Ei, Milch
  BREADED: {
    keywords: [
      'paniert', 'gebacken', 'backfisch', 'cordon bleu', 'nuggets',
      'schnitzel wiener art', 'fischstäbchen', 'kroketten'
    ],
    defaultAllergens: ['a', 'c', 'g'],
    defaultAdditives: ['8'],
    confidence: 95
  },
  
  // Käsegerichte - Milch + oft konserviert
  CHEESE: {
    keywords: [
      'käse', 'schafskäse', 'feta', 'ziegenkäse', 'mozzarella', 'parmesan',
      'camembert', 'brie', 'gouda', 'emmentaler', 'gratin', 'überbacken'
    ],
    defaultAllergens: ['g'],
    defaultAdditives: ['2', '8'],
    confidence: 90
  },
  
  // Gebackener Käse - zusätzlich Farbstoff durch Bräunung
  BAKED_CHEESE: {
    keywords: [
      'gebackener schafskäse', 'gebackener feta', 'gebackener ziegenkäse',
      'gebackener käse', 'käse gebacken'
    ],
    defaultAllergens: ['a', 'c', 'g'],
    defaultAdditives: ['1', '2', '8'], // Farbstoff + Konserviert + Milcheiweiß
    confidence: 98
  },
  
  // Saucen & Soßen - meist Gluten + Milch
  SAUCE: {
    keywords: [
      'sauce', 'soße', 'sahnesoße', 'rahmsoße', 'jägersauce', 'zigeunersauce',
      'bratensoße', 'pfeffersauce', 'champignonsauce', 'kräutersoße',
      'hollandaise', 'bechamel', 'currysauce'
    ],
    defaultAllergens: ['a', 'g'],
    defaultAdditives: ['4'], // Geschmacksverstärker
    confidence: 85
  },
  
  // Rouladen - Gluten, Milch, oft Senf
  ROULADE: {
    keywords: [
      'roulade', 'rinderroulade', 'kohlroulade', 'krautroulade'
    ],
    defaultAllergens: ['a', 'g', 'j'],
    defaultAdditives: ['8'],
    confidence: 90
  },
  
  // Nudeln/Pasta - Gluten, Ei
  PASTA: {
    keywords: [
      'nudel', 'pasta', 'spaghetti', 'penne', 'rigatoni', 'fusilli',
      'tortellini', 'ravioli', 'makkaroni', 'lasagne'
    ],
    defaultAllergens: ['a', 'c'],
    defaultAdditives: [],
    confidence: 95
  },
  
  // Pasta mit Fleischsauce - zusätzlich Milch und Konservierung
  PASTA_MEAT: {
    keywords: [
      'bolognese', 'carbonara', 'spaghetti mit hackfleisch',
      'lasagne', 'pasta mit fleisch'
    ],
    defaultAllergens: ['a', 'c', 'g'],
    defaultAdditives: ['2', '8'],
    confidence: 95
  },
  
  // Fischgerichte
  FISH: {
    keywords: [
      'fisch', 'lachs', 'forelle', 'seelachs', 'thunfisch', 'hering',
      'kabeljau', 'scholle', 'zander', 'dorade'
    ],
    defaultAllergens: ['d'],
    defaultAdditives: [],
    confidence: 98
  },
  
  // Panierter Fisch
  FISH_BREADED: {
    keywords: [
      'backfisch', 'fischstäbchen', 'fisch paniert', 'panierter fisch'
    ],
    defaultAllergens: ['a', 'c', 'd', 'g'],
    defaultAdditives: ['1'],
    confidence: 98
  },
  
  // Kartoffelgerichte mit Milch
  POTATO_DAIRY: {
    keywords: [
      'püree', 'kartoffelpüree', 'kartoffelbrei', 'stampfkartoffeln',
      'kartoffelgratin', 'gratin'
    ],
    defaultAllergens: ['g'],
    defaultAdditives: [],
    confidence: 90
  },
  
  // Suppen - meist Sellerie und Geschmacksverstärker
  SOUP: {
    keywords: [
      'suppe', 'eintopf', 'brühe', 'gulaschsuppe', 'erbsensuppe',
      'linsensuppe', 'kartoffelsuppe', 'gemüsesuppe'
    ],
    defaultAllergens: ['i'], // Sellerie
    defaultAdditives: ['4'], // Geschmacksverstärker
    confidence: 85
  },
  
  // Suppen mit Fleisch
  SOUP_MEAT: {
    keywords: [
      'gulaschsuppe', 'rinderbrühe', 'hühnersuppe', 'fleischsuppe',
      'erbsensuppe mit wurst'
    ],
    defaultAllergens: ['i'],
    defaultAdditives: ['2', '4', '8'],
    confidence: 90
  },
  
  // Eier-Gerichte
  EGG: {
    keywords: [
      'ei', 'eier', 'omelett', 'rührei', 'spiegelei', 'eierkuchen',
      'pfannkuchen', 'kaiserschmarrn'
    ],
    defaultAllergens: ['c', 'g'],
    defaultAdditives: [],
    confidence: 95
  },
  
  // Knödel & Klöße
  DUMPLINGS: {
    keywords: [
      'knödel', 'klöße', 'semmelknödel', 'kartoffelknödel', 'serviettenknödel'
    ],
    defaultAllergens: ['a', 'c', 'g'],
    defaultAdditives: [],
    confidence: 90
  },
  
  // Spätzle
  SPAETZLE: {
    keywords: ['spätzle', 'käsespätzle'],
    defaultAllergens: ['a', 'c', 'g'],
    defaultAdditives: [],
    confidence: 95
  },
  
  // Curry-Gerichte
  CURRY: {
    keywords: ['curry', 'currywurst', 'currysauce', 'gemüsecurry'],
    defaultAllergens: ['g'],
    defaultAdditives: ['1', '4'], // Farbstoff + Geschmacksverstärker
    confidence: 85
  },
  
  // Gulasch
  GOULASH: {
    keywords: ['gulasch', 'rindergulasch', 'schweinegulasch'],
    defaultAllergens: ['a', 'g'],
    defaultAdditives: ['1', '8'], // Farbstoff + Milcheiweiß
    confidence: 90
  }
};

// Analysiere Text und finde passende Kategorien
export function detectCategories(mealName) {
  const lowerName = mealName.toLowerCase();
  const matches = [];
  
  // Prüfe jede Kategorie
  for (const [categoryName, category] of Object.entries(CATEGORY_PATTERNS)) {
    for (const keyword of category.keywords) {
      if (lowerName.includes(keyword)) {
        matches.push({
          category: categoryName,
          allergens: category.defaultAllergens,
          additives: category.defaultAdditives,
          confidence: category.confidence,
          matchedKeyword: keyword
        });
        break; // Nur ein Match pro Kategorie
      }
    }
  }
  
  return matches;
}

// Kombiniere mehrere Kategorie-Matches intelligent
export function mergeCategories(categories) {
  if (categories.length === 0) {
    return {
      allergens: [],
      additives: [],
      confidence: 0,
      method: 'no_category_match'
    };
  }
  
  // Sammle alle Allergene und Zusatzstoffe
  const allAllergens = new Set();
  const allAdditives = new Set();
  let maxConfidence = 0;
  const matchedCategories = [];
  
  for (const match of categories) {
    match.allergens.forEach(a => allAllergens.add(a));
    match.additives.forEach(add => allAdditives.add(add));
    maxConfidence = Math.max(maxConfidence, match.confidence);
    matchedCategories.push(match.category);
  }
  
  // Validiere dass nur gültige Codes verwendet werden
  const validAllergens = Array.from(allAllergens).filter(a => ALLERGEN_CODES.includes(a));
  const validAdditives = Array.from(allAdditives).filter(a => ADDITIVE_CODES.includes(a));
  
  return {
    allergens: validAllergens,
    additives: validAdditives,
    confidence: maxConfidence,
    method: 'smart_category',
    categories: matchedCategories
  };
}

// Hauptfunktion: Intelligente Default-Erkennung
export function getSmartDefaults(mealName) {
  const categories = detectCategories(mealName);
  return mergeCategories(categories);
}
