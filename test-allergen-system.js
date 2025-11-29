// Test-Script für das neue Allergen-System
// Kann mit: node test-allergen-system.js ausgeführt werden

const { findExactMatch, findPartialMatch, findSimilarMatch } = require('./lib/mealDatabase');
const { getSmartDefaults } = require('./lib/smartDefaults');

console.log('🧪 ALLERGEN-SYSTEM V2 TEST\n');

// Test 1: Exakter Match
console.log('📌 Test 1: Exakter Datenbank-Match');
const test1 = findExactMatch('Schnitzel Wiener Art');
console.log('Gericht: "Schnitzel Wiener Art"');
console.log('Result:', test1);
console.log('✅ Erwartung: a,c,g + 8\n');

// Test 2: Partieller Match
console.log('📌 Test 2: Partieller Match');
const test2 = findPartialMatch('Wiener Schnitzel mit Pommes');
console.log('Gericht: "Wiener Schnitzel mit Pommes"');
console.log('Result:', test2);
console.log('✅ Sollte Schnitzel finden\n');

// Test 3: Fuzzy Match
console.log('📌 Test 3: Fuzzy Matching (Tippfehler)');
const test3 = findSimilarMatch('Bratworst mit Sauerkraut', 0.75);
console.log('Gericht: "Bratworst mit Sauerkraut" (Tippfehler)');
console.log('Result:', test3);
console.log('✅ Sollte Bratwurst finden\n');

// Test 4: Smart Defaults - Wurst
console.log('📌 Test 4: Smart Category Detection - Wurst');
const test4 = getSmartDefaults('Currywurst mit Pommes');
console.log('Gericht: "Currywurst mit Pommes"');
console.log('Result:', test4);
console.log('✅ Erwartung: Zusatzstoffe 1,2,4,8\n');

// Test 5: Smart Defaults - Gebackener Käse
console.log('📌 Test 5: Smart Category Detection - Gebackener Käse');
const test5 = getSmartDefaults('Gebackener Schafskäse mit Salat');
console.log('Gericht: "Gebackener Schafskäse mit Salat"');
console.log('Result:', test5);
console.log('✅ Erwartung: a,c,g + 1,2,8\n');

// Test 6: Smart Defaults - Suppe
console.log('📌 Test 6: Smart Category Detection - Suppe');
const test6 = getSmartDefaults('Gulaschsuppe');
console.log('Gericht: "Gulaschsuppe"');
console.log('Result:', test6);
console.log('✅ Erwartung: i + 4,8\n');

// Test 7: Smart Defaults - Sauce
console.log('📌 Test 7: Smart Category Detection - Sauce');
const test7 = getSmartDefaults('Hähnchenbrust mit Rahmsoße');
console.log('Gericht: "Hähnchenbrust mit Rahmsoße"');
console.log('Result:', test7);
console.log('✅ Erwartung: a,g + 4,8\n');

console.log('✅ ALLE TESTS ABGESCHLOSSEN\n');
console.log('Hinweis: GPT-Tests können nur über die API getestet werden (benötigt OPENAI_API_KEY)');
