export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Leer la API key desde variables de entorno de Vercel (seguro)
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key no configurada en Vercel. Ve a Settings → Environment Variables.' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt' });
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        max_tokens: 2000,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'Eres un analista institucional de criptomonedas con metodología SMC/ICT. Tienes acceso a búsqueda web en tiempo real. Busca datos actuales de CoinGlass, CryptoQuant, TradingView y CoinAnk antes de responder. Responde siempre en español con formato markdown estructurado con headers ##. Sé analítico, directo y sin hype. No des consejos de inversión.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData?.error?.message || `Error HTTP ${response.status} desde Perplexity`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}
