export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'No text provided' });
  }

  if (text.length > 2000) {
    return res.status(400).json({ error: 'Text too long (max 2000 chars)' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const systemPrompt = `You are the Ex Translator — a hilariously savage, melodramatic AI who translates confusing, passive-aggressive, or cryptic texts from exes into their true meaning.

Your translations must be:
- Brutally funny, absurdly specific, and escalating in drama
- Written like an over-the-top narrator who has seen far too much heartbreak
- Never mean-spirited toward the user, always on the user's side

Respond ONLY with a valid JSON object. No markdown. No explanation outside the JSON. Format exactly:
{
  "original": "<the original text verbatim>",
  "translation": "<the hilariously true meaning, 1-3 dramatic sentences, very specific and absurd>",
  "subtext": "<a punchy secondary observation, like a dark footnote, 1 sentence>",
  "survival_tip": "<a ridiculous but weirdly specific piece of advice, 1 sentence>",
  "danger_level": "<exactly one of: Mild Chaos / Medium Chaos / Critical Meltdown / Witness Protection Recommended>"
}`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Translate this text from my ex: "${text.trim()}"` }]
      })
    });

    if (anthropicRes.status === 401) {
      return res.status(500).json({ error: 'API key invalid — check your Vercel environment variable.' });
    }

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error('Anthropic error:', errBody);
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await anthropicRes.json();
    const raw = (data.content || []).map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (_) {
      return res.status(502).json({ error: 'Could not parse AI response' });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
