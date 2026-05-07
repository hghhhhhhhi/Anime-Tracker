// Image proxy to handle CORS issues with external images
const https = require('https');
const http = require('http');
const url = require('url');

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
  
  const imageUrl = req.query.url;
  
  if (!imageUrl) {
    res.status(400).json({ error: 'URL parameter is required' });
    return;
  }
  
  // Validate URL
  let parsedUrl;
  try {
    parsedUrl = new URL(imageUrl);
    // Only allow image URLs from known safe domains
    const allowedDomains = ['cdn.myanimelist.net', 'api.jikan.moe', 'myanimelist.net'];
    if (!allowedDomains.includes(parsedUrl.hostname)) {
      res.status(400).json({ error: 'Domain not allowed' });
      return;
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }
  
  // Choose the right protocol module
  const protocol = parsedUrl.protocol === 'https:' ? https : http;
  
  const request = protocol.get(imageUrl, (response) => {
    // Set appropriate headers
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    
    // Handle redirects
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      return res.redirect(response.statusCode, response.headers.location);
    }
    
    // Handle errors
    if (response.statusCode >= 400) {
      return res.status(response.statusCode).json({ error: `Failed to fetch image: ${response.statusCode}` });
    }
    
    // Stream the response
    response.pipe(res);
  });
  
  request.on('error', (error) => {
    console.error('Image proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  });
  
  request.setTimeout(10000, () => {
    request.destroy();
    res.status(408).json({ error: 'Request timeout' });
  });
};
