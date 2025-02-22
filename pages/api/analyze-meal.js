import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MEAL_CATEGORIES = {
  'PORK': '🐷',
  'CHICKEN': '🐔',
  'BEEF': '🐄',
  'FISH': '🐟',
  'VEGETARIAN': '🥗',
  'PASTA': '🍝',
  'SOUP': '🥣',
  'DEFAULT': '🍽️'
};

const SVG_ICONS = {
  'CHICKEN': `<svg viewBox="0 0 100 100" class="menu-icon">
    <path d="M25,25 C40,10 60,10 75,25 C90,40 90,60 75,75 C60,90 40,90 25,75 C10,60 10,40 25,25" />
  </svg>`,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mealName } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Du bist ein Experte für Speisekarten. Kategorisiere das folgende Gericht in GENAU EINE der folgenden Kategorien: PORK, CHICKEN, BEEF, FISH, VEGETARIAN, PASTA, SOUP. Antworte NUR mit dem Kategorienamen."
        },
        {
          role: "user",
          content: mealName
        }
      ],
      temperature: 0.3,
      max_tokens: 10
    });

    const category = completion.choices[0].message.content.trim();
    const icon = MEAL_CATEGORIES[category] || MEAL_CATEGORIES.DEFAULT;
    
    return res.status(200).json({
      category: category,
      icon: icon
    });
  } catch (error) {
    console.error('Fehler bei der Analyse:', error);
    return res.status(500).json({ error: 'Analyse fehlgeschlagen' });
  }
} 