// Vercel serverless function for stats API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mock statistics data
  const stats = {
    total: 2,
    completed: 1,
    watching: 1,
    planned: 0,
    on_hold: 0,
    dropped: 0,
    total_episodes_watched: 112,
    average_rating: 9
  };

  res.status(200).json(stats);
}
