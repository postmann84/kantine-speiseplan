import OpenAI from 'openai';
import { ALLERGEN_CODES, ADDITIVE_CODES } from '../../lib/allergenTaxonomy';
import { findExactMatch, findPartialMatch, findSimilarMatch } from '../../lib/mealDatabase';
import { getSmartDefaults } from '../../lib/smartDefaults';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Erweiterte Keyword-Mappings (2x mehr Keywords als vorher)
const KEYWORD_MAPPING = {
  // Allergene - stark erweitert
  'a': [
    'weizen', 'mehl', 'weizenmehl', 'brot', 'brötchen', 'pasta', 'nudel', 'spaghetti', 'penne', 'fusilli',
    'gluten', 'roggen', 'gerste', 'hafer', 'dinkel', 'paniermehl', 'semmelbrösel', 'semmelmehl',
    'roulade', 'sauce', 'soße', 'hackbraten', 'frikadelle', 'bulette', 'schnitzel', 'cordon',
    'teig', 'knödel', 'klöße', 'spätzle', 'gnocchi', 'pizza', 'burger', 'wrap', 'tortilla',
    'croissant', 'brötchen', 'paniert', 'gebacken', 'mehlschwitze', 'binden', 'gebunden',
    'panade', 'backfisch', 'fish and chips', 'tempura', 'seitan', 'couscous', 'bulgur'
  ],
  'c': [
    'ei', 'eier', 'eiern', 'mayo', 'mayonnaise', 'omelett', 'pasta', 'nudel', 'spaghetti',
    'hackbraten', 'frikadelle', 'bulette', 'pfannkuchen', 'kaiserschmarrn', 'rührei', 'spiegelei',
    'eiersalat', 'carbonara', 'hollandaise', 'aioli', 'remoulade', 'eigelb', 'eiweiß', 'eiklar',
    'eiernudeln', 'ravioli', 'tortellini', 'maultasche', 'knödel', 'klöße', 'spätzle',
    'cordon bleu', 'nuggets', 'burger', 'fleischkäse', 'leberkäse', 'paniert', 'panade'
  ],
  'd': [
    'fisch', 'lachs', 'forelle', 'thunfisch', 'hering', 'sardine', 'sardellen', 'anchovi', 'anchovis',
    'kabeljau', 'seelachs', 'makrele', 'scholle', 'zander', 'karpfen', 'pangasius', 'dorade',
    'wolfsbarsch', 'fischstäbchen', 'backfisch', 'matjes', 'rollmops', 'bismarckhering',
    'fischfilet', 'seafood', 'meeresfrüchte', 'worcester', 'worcestershire'
  ],
  'e': [
    'erdnuss', 'erdnüsse', 'peanut', 'erdnussöl', 'erdnussbutter', 'satay', 'sataysauce',
    'pad thai', 'afrikanisch', 'asiatisch'
  ],
  'f': [
    'soja', 'tofu', 'sojasauce', 'sojasoße', 'miso', 'sojaöl', 'sojamilch', 'tempeh', 'edamame',
    'sojasprossen', 'teriyaki', 'lecithin', 'sojalecithin', 'tofuwurst', 'sojawurst',
    'shoyu', 'tamari', 'asiatisch'
  ],
  'g': [
    'milch', 'käse', 'butter', 'sahne', 'sahnesauce', 'joghurt', 'quark', 'mozzarella', 'parmesan',
    'creme', 'sauce', 'soße', 'bechamel', 'roulade', 'rahm', 'rahmgemüse', 'rahmsauce',
    'püree', 'kartoffelpüree', 'gratin', 'auflauf', 'lasagne', 'risotto', 'fondue', 'raclette',
    'cappuccino', 'latte', 'schafskäse', 'feta', 'ziegenkäse', 'camembert', 'brie', 'gouda',
    'emmentaler', 'cheddar', 'ricotta', 'mascarpone', 'schmand', 'crème fraîche', 'sauerrahm',
    'käsesauce', 'käsesoße', 'überbacken', 'gratiniert', 'carbonara', 'alfredo', 'hollandaise',
    'rahmschnitzel', 'sahnesauce', 'milchprodukt', 'molke', 'buttermilch', 'kondensmilch'
  ],
  'h': [
    'nuss', 'nüsse', 'nüssen', 'mandel', 'mandeln', 'haselnuss', 'haselnüsse', 'walnuss', 'walnüsse',
    'cashew', 'cashewnuss', 'pistazie', 'pistazien', 'paranuss', 'pekannuss', 'macadamia',
    'nougat', 'marzipan', 'nutella', 'nussschokolade', 'mandelblättchen', 'nussmus'
  ],
  'i': [
    'sellerie', 'staudensellerie', 'selleriesalz', 'knollensellerie', 'selleriepüree',
    'suppengrün', 'wurzelgemüse', 'brühe', 'bouillon', 'fond', 'suppe', 'eintopf'
  ],
  'j': [
    'senf', 'mostrich', 'dijon', 'senfkörner', 'honigsenf', 'süßsenf', 'senfsauce',
    'senfsoße', 'estragon', 'roulade', 'würze'
  ],
  'k': [
    'sesam', 'sesamöl', 'tahini', 'tahina', 'sesamkörner', 'sesamsamen', 'hummus', 'falafel',
    'orientalisch', 'arabisch', 'asiatisch'
  ],
  'l': [
    'schwefel', 'sulfit', 'sulfite', 'schwefeldioxid', 'wein', 'rotwein', 'weißwein',
    'trockenfrüchte', 'rosinen', 'sultaninen', 'aprikosen', 'essig', 'balsamico',
    'weinessig', 'geschwefelt'
  ],
  'm': [
    'lupin', 'lupine', 'lupinen', 'lupinmehl', 'lupinschrot', 'lupineneiweiß'
  ],
  'n': [
    'muschel', 'muscheln', 'schnecke', 'schnecken', 'tintenfisch', 'kalmar', 'calamari',
    'austern', 'miesmuschel', 'jakobsmuschel', 'paella', 'pulpo', 'oktopus', 'sepia',
    'meeresfrüchte', 'seafood'
  ],
  
  // Zusatzstoffe - stark erweitert
  '1': [
    'farbstoff', 'färbend', 'colorant', 'paprika', 'kurkuma', 'safran', 'rote beete', 'rotebeete',
    'spinat', 'karotte', 'karamell', 'curry', 'annatto', 'beta-carotin', 'riboflavin',
    'gebacken', 'gebräunt', 'karamellisiert', 'currywurst', 'zigeunerschnitzel'
  ],
  '2': [
    'konserviert', 'haltbar', 'konservierungsstoff', 'gepökelt', 'geräuchert', 'pökeln',
    'speck', 'schinken', 'hackfleisch', 'hackbraten', 'hack', 'wurst', 'bratwurst', 'currywurst',
    'bockwurst', 'käse', 'schafskäse', 'feta', 'ziegenkäse', 'salami', 'leberwurst',
    'mortadella', 'mettwurst', 'teewurst', 'blutwurst', 'leberkäse', 'fleischkäse',
    'kasseler', 'eisbein', 'bacon', 'rauchfleisch', 'räucherlachs', 'räucherfisch',
    'sauerkraut', 'rotkohl', 'blaukraut', 'essiggurken', 'oliven'
  ],
  '3': [
    'antioxidans', 'antioxidantien', 'vitamin c', 'ascorbinsäure', 'tocopherol', 'vitamin e',
    'citronensäure', 'zitronensäure'
  ],
  '4': [
    'geschmacksverstärker', 'glutamat', 'msg', 'hefeextrakt', 'würze', 'bouillon', 'brühe',
    'fond', 'suppenwürfel', 'instantbrühe', 'würzmischung', 'gewürzmischung', 'umami',
    'sauce', 'soße', 'suppe', 'eintopf', 'curry', 'asiatisch', 'chinese'
  ],
  '5': [
    'geschwefelt', 'schwefel', 'trockenfrüchte', 'rosinen', 'aprikosen', 'sultaninen',
    'wein', 'essig', 'sulfit'
  ],
  '6': [
    'geschwärzt', 'oliven', 'schwarze oliven', 'schwarz gefärbt'
  ],
  '7': [
    'phosphat', 'polyphosphat', 'schmelzkäse', 'käsezubereitung', 'analoge', 'ersatz',
    'wurst', 'bratwurst', 'fleischersatz'
  ],
  '8': [
    'milcheiweiß', 'kasein', 'molke', 'molkeneiweiß', 'fleisch', 'wurst', 'speck', 'schinken',
    'hackbraten', 'frikadelle', 'bulette', 'rind', 'schwein', 'kalb', 'hackfleisch',
    'bratwurst', 'leberwurst', 'salami', 'mortadella', 'käse', 'schafskäse', 'feta',
    'ziegenkäse', 'gebacken', 'leberkäse', 'fleischkäse', 'bockwurst', 'wiener',
    'currywurst', 'gulasch', 'roulade', 'kohlroulade', 'krautroulade', 'cordon bleu',
    'nuggets', 'burger patty', 'hackfleischsauce', 'bolognese', 'fleischsauce'
  ],
  '9': [
    'koffein', 'kaffee', 'espresso', 'cola', 'energy', 'energydrink', 'tee', 'schwarztee',
    'grüntee', 'eistee', 'cappuccino', 'latte', 'mokka'
  ],
  '10': [
    'chinin', 'tonic', 'bitter lemon', 'schweppes', 'chininhalt'
  ],
  '11': [
    'süßstoff', 'süßungsmittel', 'aspartam', 'saccharin', 'stevia', 'light', 'zero',
    'diet', 'zuckerfrei', 'kalorienreduziert'
  ],
  '13': [
    'gewachst', 'zitrusfrüchte', 'zitronen', 'orangen', 'limetten', 'äpfel', 'birnen',
    'zitrone', 'orange', 'mandarine', 'grapefruit'
  ]
};

// Keyword-basierte Erkennung
function detectKeywords(mealName) {
  const lowerName = mealName.toLowerCase();
  const allergens = new Set();
  const additives = new Set();
  const matchedKeywords = [];
  
  for (const [code, keywords] of Object.entries(KEYWORD_MAPPING)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        matchedKeywords.push({ code, keyword });
        
        if (ALLERGEN_CODES.includes(code)) {
          allergens.add(code);
        } else if (ADDITIVE_CODES.includes(code)) {
          additives.add(code);
        }
        break; // Ein Match pro Code reicht
      }
    }
  }
  
  return {
    allergens: Array.from(allergens),
    additives: Array.from(additives),
    matchedKeywords
  };
}

// GPT-4o-mini Analyse mit verbessertem Prompt
async function analyzeWithGPT(mealName, keywordResult) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du bist Experte für deutsche Kantinen-Speisepläne und EU-Lebensmittelkennzeichnung.

WICHTIG: Sei GROSSZÜGIG bei der Kennzeichnung! Lieber mehr kennzeichnen als zu wenig.
Fast JEDES verarbeitete Kantinen-Gericht hat Zusatzstoffe!

AUFGABE: Analysiere Gerichte präzise für EU-Allergene (a-n) und Zusatzstoffe (1-13, ohne 12).

ALLERGENE (immer kennzeichnungspflichtig):
a=Glutenhaltiges Getreide (Weizen, Roggen, Gerste, Hafer, Dinkel, Kamut) - in Mehl, Saucen, Panaden
b=Krebstiere (Garnelen, Krabben, Hummer)
c=Eier (auch in Nudeln, Mayonnaise, Backwaren, Panaden)
d=Fische (auch Fischsauce, Worcestershire)
e=Erdnüsse (auch Erdnussöl, Satay-Sauce)
f=Soja (auch Sojasoße, Tofu, Lecithin)
g=Milch/Laktose (Butter, Käse, Sahne, Joghurt, in ALLEN Sahnesaucen!)
h=Schalenfrüchte (Mandeln, Haselnüsse, Walnüsse)
i=Sellerie (in Suppengrün, Brühen, Würzmischungen!)
j=Senf (auch Senfkörner, Mostrich, in Rouladen)
k=Sesam (auch Tahini, Sesamöl)
l=Schwefeldioxid/Sulfite (Wein, Trockenfrüchte, Essig)
m=Lupinen (Lupinenmehl)
n=Weichtiere (Muscheln, Schnecken, Tintenfisch)

ZUSATZSTOFFE (bei Verwendung IMMER kennzeichnen!):
1=mit Farbstoff (z.B. Paprika, Kurkuma, durch Bräunung bei gebackenem Käse!)
2=mit Konservierungsstoff (ALLE Wurstwaren, gepökeltes/geräuchertes Fleisch, Käse!)
3=mit Antioxidationsmittel (Vitamin C, E)
4=mit Geschmacksverstärker (Glutamat, Hefeextrakt, in Brühen/Saucen/Suppen!)
5=geschwefelt (Trockenfrüchte, Wein)
6=geschwärzt (Schwarze Oliven)
7=mit Phosphat (Schmelzkäse, verarbeitetes Fleisch)
8=mit Milcheiweiß (SEHR WICHTIG: In fast ALLEN Fleischerzeugnissen/Wurstwaren!)
9=koffeinhaltig (Kaffee, Cola, Energy-Drinks)
10=chininhaltig (Tonic Water, Bitter Lemon)
11=mit Süßungsmittel (Light-Produkte, Diät-Getränke)
13=gewachst (behandelte Zitrusfrüchte, Äpfel)

KRITISCHE REGELN:
1. JEDE Wurst/Hackfleisch/verarbeitetes Fleisch = MINDESTENS Zusatzstoffe 2+8 (Konserviert + Milcheiweiß)
2. Gebackener Käse = Zusatzstoffe 1+2+8 (Farbstoff durch Bräunung + Konserviert + Milcheiweiß)
3. Alle Saucen mit Sahne/Milch = Allergene a+g (Gluten+Milch)
4. Panierte Gerichte = Allergene a+c+g (Gluten+Ei+Milch) + Zusatzstoff 8
5. Suppen/Eintöpfe = Allergen i (Sellerie) + Zusatzstoff 4 (Geschmacksverstärker)
6. Rouladen = Allergene a+g+j (Gluten+Milch+Senf) + Zusatzstoff 8

Antworte NUR als JSON ohne Erklärung: {"allergens":["a","c"],"additives":["2","8"]}`
        },
        {
          role: 'user',
          content: `Gericht: "${mealName}"

Keywords gefunden: Allergene ${keywordResult.allergens.join(',') || 'keine'}, Zusatzstoffe ${keywordResult.additives.join(',') || 'keine'}

Erweitere/korrigiere diese Liste. Sei GROSSZÜGIG - lieber mehr als zu wenig!

BEISPIELE:
{"meal":"Schnitzel Wiener Art","allergens":["a","c","g"],"additives":["8"]}
{"meal":"Bratwurst","allergens":[],"additives":["2","8"]}
{"meal":"Currywurst","allergens":[],"additives":["1","2","4","8"]}
{"meal":"Hackbraten","allergens":["a","c","g"],"additives":["2","8"]}
{"meal":"Spaghetti Bolognese","allergens":["a","c","g"],"additives":["2","8"]}
{"meal":"Rinderroulade","allergens":["a","g","j"],"additives":["8"]}
{"meal":"Gebackener Schafskäse","allergens":["a","c","g"],"additives":["1","2","8"]}
{"meal":"Gulaschsuppe","allergens":["a","g","i"],"additives":["1","4","8"]}
{"meal":"Fischfilet paniert","allergens":["a","c","d","g"],"additives":[]}
{"meal":"Kartoffelpüree","allergens":["g"],"additives":[]}

JSON:`
        }
      ],
      temperature: 0.5, // Erhöht von 0.2 für mehr "Mut"
      max_tokens: 150
    });

    const gptResponse = completion.choices?.[0]?.message?.content?.trim() || '';
    
    let parsed = { allergens: [], additives: [] };
    try {
      parsed = JSON.parse(gptResponse);
    } catch (e) {
      console.warn('GPT JSON parse error:', e);
      return null;
    }

    // Sanitize GPT results
    const allergens = Array.isArray(parsed.allergens)
      ? parsed.allergens
          .map((c) => String(c).toLowerCase())
          .filter((c) => ALLERGEN_CODES.includes(c))
      : [];
    const additives = Array.isArray(parsed.additives)
      ? parsed.additives
          .map((c) => String(c))
          .filter((c) => ADDITIVE_CODES.includes(c))
      : [];

    return { allergens, additives };
  } catch (error) {
    console.error('GPT analysis failed:', error);
    return null;
  }
}

// Intelligente Kombination aller Quellen
function mergeResults(database, keywords, smartDefaults, gpt) {
  const allergens = new Set();
  const additives = new Set();
  
  // Sammle von allen Quellen
  [database, keywords, smartDefaults, gpt].forEach(source => {
    if (source?.allergens) source.allergens.forEach(a => allergens.add(a));
    if (source?.additives) source.additives.forEach(a => additives.add(a));
  });
  
  return {
    allergens: Array.from(allergens),
    additives: Array.from(additives)
  };
}

// Hauptfunktion
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mealName } = req.body;
    if (!mealName || typeof mealName !== 'string') {
      return res.status(400).json({ error: 'mealName ist erforderlich' });
    }

    console.log('🔍 Analysiere:', mealName);

    // STUFE 1: Exakter Datenbank-Match (höchste Priorität)
    const exactMatch = findExactMatch(mealName);
    if (exactMatch) {
      console.log('✅ Exakter Datenbank-Match gefunden');
      return res.status(200).json({
        allergens: exactMatch.allergens,
        additives: exactMatch.additives,
        confidence: 100,
        method: 'exact_database_match',
        source: exactMatch.name
      });
    }

    // STUFE 2: Partieller Datenbank-Match
    const partialMatch = findPartialMatch(mealName);
    if (partialMatch) {
      console.log('✅ Partieller Datenbank-Match gefunden:', partialMatch.name);
      return res.status(200).json({
        allergens: partialMatch.allergens,
        additives: partialMatch.additives,
        confidence: 95,
        method: 'partial_database_match',
        source: partialMatch.name
      });
    }

    // STUFE 3: Ähnlichkeits-Match (Fuzzy)
    const similarMatch = findSimilarMatch(mealName, 0.85);
    if (similarMatch) {
      console.log('✅ Ähnlicher Datenbank-Match gefunden:', similarMatch.name, '(', Math.round(similarMatch.similarity * 100), '%)');
      return res.status(200).json({
        allergens: similarMatch.allergens,
        additives: similarMatch.additives,
        confidence: Math.round(similarMatch.similarity * 100),
        method: 'fuzzy_database_match',
        source: similarMatch.name
      });
    }

    // STUFE 4: Keyword-Erkennung
    const keywordResult = detectKeywords(mealName);
    console.log('📋 Keywords gefunden:', keywordResult);

    // STUFE 5: Smart Category Defaults
    const smartDefaults = getSmartDefaults(mealName);
    console.log('🎯 Smart Defaults:', smartDefaults);

    // STUFE 6: GPT-Analyse
    const gptResult = await analyzeWithGPT(mealName, keywordResult);
    console.log('🤖 GPT Result:', gptResult);

    // Intelligente Kombination aller Quellen
    const merged = mergeResults(null, keywordResult, smartDefaults, gptResult);
    
    // Bestimme Konfidenz und Methode
    let confidence = 50;
    let method = 'combined';
    let sources = [];
    
    if (gptResult && (gptResult.allergens.length > 0 || gptResult.additives.length > 0)) {
      confidence = 90;
      sources.push('gpt');
    }
    if (smartDefaults.allergens.length > 0 || smartDefaults.additives.length > 0) {
      confidence = Math.max(confidence, smartDefaults.confidence);
      sources.push('smart_defaults');
    }
    if (keywordResult.allergens.length > 0 || keywordResult.additives.length > 0) {
      confidence = Math.max(confidence, 75);
      sources.push('keywords');
    }
    
    method = sources.join('+');

    // Wenn GAR NICHTS gefunden wurde - warne!
    if (merged.allergens.length === 0 && merged.additives.length === 0) {
      console.warn('⚠️ WARNUNG: Keine Kennzeichnungen gefunden für:', mealName);
      confidence = 30;
      method = 'no_match_found';
    }

    console.log('✅ Final Result:', merged, 'Confidence:', confidence, 'Method:', method);

    return res.status(200).json({
      allergens: merged.allergens,
      additives: merged.additives,
      confidence,
      method,
      details: {
        keywords: keywordResult,
        smartDefaults: smartDefaults,
        gpt: gptResult
      }
    });

  } catch (error) {
    console.error('❌ Fehler bei der Allergen-Analyse:', error);
    return res.status(500).json({ 
      error: 'Analyse fehlgeschlagen',
      message: error.message 
    });
  }
}
