const express = require('express');
const cors = require('cors');

const API_KEY = '2c23752a27db60c1d1b2a1c9ba672980'; // keep this secret!
const app = express();
const PORT = 4000;

app.use(cors());

app.get('/api/heightmap', async (req, res) => {
  const { south, north, west, east } = req.query;
  console.log(`[proxy] Received request: south=${south} north=${north} west=${west} east=${east}`);
  if (!south || !north || !west || !east) {
    console.log('[proxy] Missing bbox params');
    return res.status(400).json({ error: 'Missing bbox params' });
  }
  const url = `https://portal.opentopography.org/API/globaldem?demtype=SRTMGL1&south=${south}&north=${north}&west=${west}&east=${east}&outputFormat=AAIGrid&API_Key=${API_KEY}`;
  try {
    const fetch = (await import('node-fetch')).default;
    console.log(`[proxy] Fetching from OpenTopo: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      console.log(`[proxy] OpenTopo error: ${response.status} ${errText.slice(0, 200)}`);
      return res.status(response.status).send(errText);
    }
    const text = await response.text();
    console.log(`[proxy] Success, sending response (${text.length} chars)`);
    res.type('text/plain').send(text);
  } catch (err) {
    console.log('[proxy] Exception:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`OpenTopo proxy running on http://localhost:${PORT}`);
}); 