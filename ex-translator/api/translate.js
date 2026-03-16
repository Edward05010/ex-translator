const https = require('https');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'No text provided' });
  }
  if (text.length > 2000) {
    return res.status(400).json({ error: 'Text too long' });
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

  const bodyStr = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Translate this text from my ex: "${text.trim()}"` }]
  });

  try {
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(bodyStr)
        }
      };
      const request = https.request(options, (response) => {
        let raw = '';
        response.on('data', chunk => raw += chunk);
        response.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (response.statusCode === 401) reject(new Error('auth'));
            else if (response.statusCode !== 200) reject(new Error('api_error'));
            else resolve(parsed);
          } catch (e) { reject(new Error('parse_error')); }
        });
      });
      request.on('error', reject);
      request.write(bodyStr);
      request.end();
    });

    const textContent = (data.content || []).map(b => b.text || '').join('');
    const clean = textContent.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    return res.status(200).json(result);

  } catch (err) {
    console.error('Error:', err.message);
    if (err.message === 'auth') return res.status(500).json({ error: 'API key invalid' });
    return res.status(500).json({ error: 'Something went wrong: ' + err.message });
  }
};
