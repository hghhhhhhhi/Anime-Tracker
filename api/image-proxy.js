// Image proxy to handle CORS issues with external images
module.exports = function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const { url } = req.query;
  
  if (!url) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }
  
  // Validate URL
  try {
    const urlObj = new URL(url);
    // Only allow image URLs from known safe domains
    const allowedDomains = ['cdn.myanimelist.net', 'api.jikan.moe', 'myanimelist.net'];
    if (!allowedDomains.includes(urlObj.hostname)) {
      res.status(400).json({ error: 'Domain not allowed' });
      return;
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }
  
  // Fetch the image
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      
      return response.arrayBuffer();
    })
    .then(buffer => {
      res.status(200).send(Buffer.from(buffer));
    })
    .catch(error => {
      console.error('Image proxy error:', error);
      res.status(500).json({ error: 'Failed to proxy image' });
    });
};
