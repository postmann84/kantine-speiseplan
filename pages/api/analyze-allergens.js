import OpenAI from 'openai';
import { ALLERGEN_CODES, ADDITIVE_CODES } from '../../lib/allergenTaxonomy';
import dbConnect from '../../lib/mongodb';
import Menu from '../../models/menu';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Keyword-basierte Allergen-Erkennung (kostenlos)
const KEYWORD_MAPPING = {
  // Allergene (erweitert)
  'a': ['weizen', 'mehl', 'brot', 'pasta', 'nudel', 'spaghetti', 'gluten', 'roggen', 'gerste', 'hafer', 'paniermehl', 'semmelbrös', 'roulade', 'sauce', 'soße', 'hackbraten', 'frikadelle', 'bulette', 'schnitzel', 'cordon', 'teig', 'knödel', 'klöße', 'spätzle', 'gnocchi', 'pizza', 'burger', 'wrap', 'tortilla', 'croissant', 'brötchen'],
  'c': ['ei', 'eier', 'mayonnaise', 'omelett', 'pasta', 'nudel', 'hackbraten', 'frikadelle', 'bulette', 'pfannkuchen', 'kaiserschmarrn', 'rührei', 'spiegelei', 'eiersalat', 'carbonara', 'hollandaise', 'aioli', 'remoulade'],
  'd': ['fisch', 'lachs', 'forelle', 'thunfisch', 'hering', 'sardine', 'anchovi', 'kabeljau', 'seelachs', 'makrele', 'scholle', 'zander', 'karpfen', 'pangasius', 'dorade', 'wolfsbarsch', 'fischstäbchen', 'backfisch'],
  'e': ['erdnuss', 'erdnüsse', 'peanut', 'erdnussöl', 'erdnussbutter', 'satay', 'pad thai'],
  'f': ['soja', 'tofu', 'sojasauce', 'miso', 'sojaöl', 'sojamilch', 'tempeh', 'edamame', 'sojasprossen', 'teriyaki'],
  'g': ['milch', 'käse', 'butter', 'sahne', 'joghurt', 'quark', 'mozzarella', 'parmesan', 'creme', 'sauce', 'soße', 'bechamel', 'roulade', 'rahm', 'rahmgemüse', 'püree', 'kartoffelpüree', 'gratin', 'auflauf', 'lasagne', 'risotto', 'fondue', 'raclette', 'cappuccino', 'latte', 'schafskäse', 'feta', 'ziegenkäse', 'camembert', 'brie'],
  'h': ['nuss', 'nüsse', 'mandel', 'haselnuss', 'walnuss', 'cashew', 'pistazie', 'paranuss', 'pekannuss', 'macadamia', 'nougat', 'marzipan', 'nutella'],
  'i': ['sellerie', 'staudensellerie', 'selleriesalz', 'knollensellerie', 'selleriepüree'],
  'j': ['senf', 'mostrich', 'dijon', 'senfkörner', 'honigsenf', 'süßsenf'],
  'k': ['sesam', 'sesamöl', 'tahini', 'sesamkörner', 'hummus', 'falafel'],
  'l': ['schwefel', 'sulfit', 'schwefeldioxid', 'wein', 'trockenfrüchte', 'rosinen', 'sultaninen', 'aprikosen', 'essig', 'balsamico'],
  'm': ['lupin', 'lupine', 'lupinmehl', 'lupinschrot'],
  'n': ['muschel', 'schnecke', 'tintenfisch', 'kalmar', 'austern', 'miesmuschel', 'jakobsmuschel', 'calamari', 'pulpo', 'paella'],
  
  // Zusatzstoffe (alle wichtigen)
  '1': ['farbstoff', 'färbend', 'colorant', 'paprika', 'kurkuma', 'safran', 'rote beete', 'spinat', 'karotte'],
  '2': ['konserviert', 'haltbar', 'konservierungsstoff', 'gepökelt', 'geräuchert', 'speck', 'hackfleisch', 'hackbraten', 'wurst', 'schinken', 'salami', 'leberwurst', 'bratwurst', 'currywurst', 'bockwurst', 'käse', 'schafskäse', 'feta', 'ziegenkäse'],
  '3': ['antioxidans', 'antioxidantien', 'vitamin c', 'ascorbinsäure', 'tocopherol', 'vitamin e'],
  '4': ['geschmacksverstärker', 'glutamat', 'msg', 'hefeextrakt', 'würze', 'bouillon', 'brühe', 'fond', 'suppenwürfel'],
  '5': ['geschwefelt', 'schwefel', 'trockenfrüchte', 'rosinen', 'aprikosen', 'wein', 'essig'],
  '6': ['geschwärzt', 'oliven', 'schwarze oliven'],
  '7': ['phosphat', 'polyphosphat', 'schmelzkäse', 'käsezubereitung'],
  '8': ['milcheiweiß', 'kasein', 'molke', 'fleisch', 'wurst', 'speck', 'schinken', 'hackbraten', 'frikadelle', 'bulette', 'rind', 'schwein', 'kalb', 'hackfleisch', 'bratwurst', 'leberwurst', 'salami', 'mortadella', 'käse', 'schafskäse', 'feta', 'ziegenkäse', 'gebacken'],
  '9': ['koffein', 'kaffee', 'espresso', 'cola', 'energy', 'tee', 'schwarztee', 'grüntee'],
  '10': ['chinin', 'tonic', 'bitter lemon', 'schweppes'],
  '11': ['süßstoff', 'süßungsmittel', 'aspartam', 'saccharin', 'stevia', 'light', 'zero', 'diet'],
  '13': ['gewachst', 'zitrusfrüchte', 'zitronen', 'orangen', 'limetten', 'äpfel', 'birnen']
};

// Fuzzy String Matching für ähnliche Gerichte
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

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

export default async function handler(req, res) {
  // Redirect to new improved API
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mealName } = req.body;
    
    // Call the new improved API internally
    const apiUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/analyze-allergens-v2`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealName })
    });
    
    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (error) {
    console.error('Fehler bei der Allergen-Analyse:', error);
    
    // Fallback to old implementation if new one fails
    try {
      const analysisResult = await analyzeAllergens(mealName || req.body?.mealName);
      return res.status(200).json(analysisResult);
    } catch (fallbackError) {
      return res.status(500).json({ error: 'Analyse fehlgeschlagen' });
    }
  }
}

async function analyzeAllergens(mealName) {
  const lowerMealName = mealName.toLowerCase();
  let confidence = 0;
  let method = '';

  // STUFE 1: Exakte Übereinstimmung in der Datenbank (temporär deaktiviert für Testing)
  // Deaktiviert um neue Keywords/GPT-Verbesserungen zu testen
  /*
  try {
    await dbConnect();
    const exactMatch = await Menu.findOne({
      'days.meals': {
        $elemMatch: {
          name: { $regex: new RegExp(`^${mealName.trim()}$`, 'i') },
          $or: [
            { allergenCodes: { $exists: true, $not: { $size: 0 } } },
            { additiveCodes: { $exists: true, $not: { $size: 0 } } }
          ]
        }
      }
    }).lean();

    if (exactMatch) {
      const meal = exactMatch.days
        .flatMap(day => day.meals)
        .find(meal => meal.name.toLowerCase() === lowerMealName);
      
      if (meal && (meal.allergenCodes?.length > 0 || meal.additiveCodes?.length > 0)) {
        return {
          allergens: meal.allergenCodes || [],
          additives: meal.additiveCodes || [],
          confidence: 100,
          method: 'exact_database_match'
        };
      }
    }
  } catch (error) {
    console.warn('Database lookup failed:', error);
  }
  */

  // STUFE 2: Ähnlichkeits-Matching in der Datenbank (temporär deaktiviert für Testing)
  // Deaktiviert um neue Keywords/GPT-Verbesserungen zu testen - alte falsche Daten umgehen
  /*
  try {
    await dbConnect();
    const similarMeals = await Menu.aggregate([
      { $unwind: '$days' },
      { $unwind: '$days.meals' },
      {
        $match: {
          'days.meals.name': { $ne: '', $exists: true },
          $or: [
            { 'days.meals.allergenCodes': { $exists: true, $not: { $size: 0 } } },
            { 'days.meals.additiveCodes': { $exists: true, $not: { $size: 0 } } }
          ]
        }
      },
      {
        $project: {
          name: '$days.meals.name',
          allergenCodes: '$days.meals.allergenCodes',
          additiveCodes: '$days.meals.additiveCodes'
        }
      }
    ]);

    let bestMatch = null;
    let bestSimilarity = 0;

    for (const meal of similarMeals) {
      const similarity = calculateSimilarity(lowerMealName, meal.name.toLowerCase());
      if (similarity > bestSimilarity && similarity >= 0.95) {
        bestSimilarity = similarity;
        bestMatch = meal;
      }
    }

    if (bestMatch && bestSimilarity >= 0.95) {
      return {
        allergens: bestMatch.allergenCodes || [],
        additives: bestMatch.additiveCodes || [],
        confidence: Math.round(bestSimilarity * 100),
        method: `similarity_match_${Math.round(bestSimilarity * 100)}%`,
        matchedWith: bestMatch.name
      };
    }
  } catch (error) {
    console.warn('Similarity matching failed:', error);
  }
  */

  // STUFE 3: Keyword-basierte Erkennung (kostenlos, schnell)
  const keywordAllergens = [];
  const keywordAdditives = [];
  const matchedKeywords = [];

  console.log('KEYWORD DEBUG - Meal:', lowerMealName);

  Object.entries(KEYWORD_MAPPING).forEach(([code, keywords]) => {
    const foundKeywords = keywords.filter(keyword => lowerMealName.includes(keyword));
    if (foundKeywords.length > 0) {
      console.log(`KEYWORD MATCH - Code: ${code}, Keywords: ${foundKeywords.join(', ')}`);
      matchedKeywords.push({ code, keywords: foundKeywords });
      
      if (ALLERGEN_CODES.includes(code)) {
        keywordAllergens.push(code);
      } else if (ADDITIVE_CODES.includes(code)) {
        keywordAdditives.push(code);
      }
    }
  });

  console.log('KEYWORD RESULT - Allergens:', keywordAllergens, 'Additives:', keywordAdditives);

  // GPT-Validierung: Verwende GPT-4o-mini für bessere Genauigkeit
  // Keywords als Basis, GPT für Verbesserung und Validierung
  const useGPT = true; // Immer GPT verwenden für beste Ergebnisse
  
  if (!useGPT && (keywordAllergens.length > 0 || keywordAdditives.length > 0)) {
    confidence = 75;
    method = 'keyword_matching';
    return {
      allergens: keywordAllergens,
      additives: keywordAdditives,
      confidence,
      method
    };
  }

  // STUFE 4: GPT-Analyse mit GPT-4o-mini
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du bist Experte für deutsche Kantinen-Speisepläne und EU-Lebensmittelkennzeichnung.

AUFGABE: Analysiere Gerichte präzise für EU-Allergene (a-n) und Zusatzstoffe (1-13, ohne 12).

ALLERGENE (immer kennzeichnungspflichtig):
a=Glutenhaltiges Getreide (Weizen, Roggen, Gerste, Hafer, Dinkel, Kamut)
b=Krebstiere (Garnelen, Krabben, Hummer, Langusten)  
c=Eier (auch in Nudeln, Mayonnaise, Backwaren)
d=Fische (auch Fischsauce, Worcestershire)
e=Erdnüsse (auch Erdnussöl, Satay-Sauce)
f=Soja (auch Sojasoße, Tofu, Lecithin)
g=Milch/Laktose (auch Butter, Käse, Sahne, Joghurt)
h=Schalenfrüchte (Mandeln, Haselnüsse, Walnüsse, etc.)
i=Sellerie (auch Selleriesalz, Gewürzmischungen)
j=Senf (auch Senfkörner, Mostrich)
k=Sesam (auch Tahini, Sesamöl)
l=Schwefeldioxid/Sulfite (Wein, Trockenfrüchte, Essig)
m=Lupinen (Lupinenmehl, Lupinenschrot)
n=Weichtiere (Muscheln, Schnecken, Tintenfisch)

ZUSATZSTOFFE (bei Verwendung kennzeichnungspflichtig):
1=mit Farbstoff (Paprika, Kurkuma, Safran, Rote Bete)
2=mit Konservierungsstoff (Gepökelt, Geräuchert, Wurst, Speck)
3=mit Antioxidationsmittel (Vitamin C, Vitamin E)
4=mit Geschmacksverstärker (Glutamat, Hefeextrakt, Brühwürfel)
5=geschwefelt (Trockenfrüchte, Wein)
6=geschwärzt (Schwarze Oliven)
7=mit Phosphat (Schmelzkäse, verarbeitetes Fleisch)
8=mit Milcheiweiß (bei Fleischerzeugnissen!)
9=koffeinhaltig (Kaffee, Cola, Energy-Drinks)
10=chininhaltig (Tonic Water, Bitter Lemon)
11=mit Süßungsmittel (Light-Produkte, Diät-Getränke)
13=gewachst (behandelte Zitrusfrüchte, Äpfel)

WICHTIGE REGELN:
- Fleischgerichte (Hackbraten, Frikadellen, Würste) = fast immer Zusatzstoff 8 (Milcheiweiß)
- Alle Wurstwaren = meist Zusatzstoff 2 (Konserviert)
- Käsegerichte (Schafskäse, Feta, etc.) = meist Zusatzstoffe 2 (Konserviert) + 8 (Milcheiweiß)
- Gebackene Käsegerichte = zusätzlich oft Zusatzstoff 1 (Farbstoff durch Bräunung)
- Saucen mit Mehl = Allergen a (Gluten)
- Saucen mit Sahne/Milch = Allergen g (Milch)
- Panierte Gerichte = meist a, c, g (Gluten, Ei, Milch)

Antworte NUR als JSON ohne Erklärung.`
        },
        {
          role: 'user',
          content: `Gericht: "${mealName}"

Keywords gefunden: Allergene ${keywordAllergens.join(',') || 'keine'}, Zusatzstoffe ${keywordAdditives.join(',') || 'keine'}

Erweitere/korrigiere diese Liste basierend auf typischen deutschen Kantinen-Gerichten:

Beispiele typischer Kantinen-Gerichte:
- Schnitzel Wiener Art: {"allergens":["a","c","g"],"additives":["8"]}
- Spaghetti Bolognese: {"allergens":["a","g"],"additives":["8"]}
- Hackbraten mit Sauce: {"allergens":["a","c","g"],"additives":["2","8"]}
- Bratwurst mit Sauerkraut: {"allergens":[],"additives":["2","8"]}
- Fischfilet paniert: {"allergens":["a","c","d","g"],"additives":[]}
- Rinderroulade: {"allergens":["a","g"],"additives":["8"]}
- Kohlroulade: {"allergens":["a","g"],"additives":["8"]}
- Currywurst: {"allergens":[],"additives":["1","2","8"]}
- Kartoffelpüree: {"allergens":["g"],"additives":[]}
- Gemüse-Lasagne: {"allergens":["a","c","g"],"additives":[]}
- Gebackener Schafskäse: {"allergens":["g"],"additives":["1","2","8"]}

JSON:`
        }
      ],
      temperature: 0.2,
      max_tokens: 100
    });

    const gptResponse = completion.choices?.[0]?.message?.content?.trim() || '';

    let parsed = { allergens: [], additives: [] };
    try {
      parsed = JSON.parse(gptResponse);
    } catch (e) {
      return {
        allergens: keywordAllergens,
        additives: keywordAdditives,
        confidence: 60,
        method: 'keyword_fallback_json_error'
      };
    }

    // Sanitize GPT results
    const gptAllergens = Array.isArray(parsed.allergens)
      ? parsed.allergens
          .map((c) => String(c).toLowerCase())
          .filter((c) => ALLERGEN_CODES.includes(c))
      : [];
    const gptAdditives = Array.isArray(parsed.additives)
      ? parsed.additives
          .map((c) => String(c))
          .filter((c) => ADDITIVE_CODES.includes(c))
      : [];

    // Intelligente Kombination: GPT als Hauptquelle, Keywords als Backup/Validierung
    const finalAllergens = gptAllergens.length > 0 ? gptAllergens : keywordAllergens;
    const finalAdditives = gptAdditives.length > 0 ? gptAdditives : keywordAdditives;
    
    // Zusätzliche Keywords hinzufügen, die GPT möglicherweise übersehen hat
    const enhancedAllergens = [...new Set([...finalAllergens, ...keywordAllergens])];
    const enhancedAdditives = [...new Set([...finalAdditives, ...keywordAdditives])];
    
    // Konfidenz basierend auf Übereinstimmung zwischen GPT und Keywords
    const allergenMatch = keywordAllergens.some(k => gptAllergens.includes(k));
    const additiveMatch = keywordAdditives.some(k => gptAdditives.includes(k));
    const hasMatches = allergenMatch || additiveMatch;
    
    let confidence = 90; // Hohe Konfidenz für GPT-4o-mini
    let method = 'gpt4o_mini_enhanced';
    
    if (hasMatches) {
      confidence = 95; // Sehr hohe Konfidenz bei Übereinstimmung
      method = 'gpt4o_mini_validated';
    } else if (keywordAllergens.length === 0 && keywordAdditives.length === 0) {
      confidence = 85; // Etwas niedrigere Konfidenz ohne Keyword-Backup
      method = 'gpt4o_mini_only';
    }



    return {
      allergens: enhancedAllergens,
      additives: enhancedAdditives,
      confidence,
      method,
      gptResult: { allergens: gptAllergens, additives: gptAdditives },
      keywordResult: { allergens: keywordAllergens, additives: keywordAdditives }
    };

  } catch (error) {
    console.error('GPT analysis failed:', error);
    
    // Fallback zu Keywords
    return {
      allergens: keywordAllergens,
      additives: keywordAdditives,
      confidence: keywordAllergens.length > 0 || keywordAdditives.length > 0 ? 60 : 30,
      method: 'keyword_fallback_after_gpt_error'
    };
  }
}
