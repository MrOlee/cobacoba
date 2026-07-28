module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = 'bb47332ceca91e3a2c97128a40c798a69306400072cc4b5a352800697069e45c';
  const { url, method = 'GET', body } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Parameter url diperlukan' });
  }

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    if (body && method === 'POST') {
      options.body = body;
    }

    const response = await fetch(url, options);
    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
};
