// Vercel serverless function for anime API
export default function handler(req, res) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      handleGet(req, res);
      break;
    case 'POST':
      handlePost(req, res);
      break;
    case 'PUT':
      handlePut(req, res);
      break;
    case 'DELETE':
      handleDelete(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGet(req, res) {
  // For now, return mock data since we can't use SQLite on Vercel free tier
  const mockAnime = [
    {
      id: 1,
      title: 'Re:Zero - Starting Life in Another World',
      description: 'A teenage boy is suddenly transported to another world.',
      episodes_total: 50,
      episodes_watched: 25,
      status: 'watching',
      rating: 9,
      genre: 'Fantasy, Psychological',
      year: 2016,
      image_url: 'https://cdn.myanimelist.net/images/anime/12/77899.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Attack on Titan',
      description: 'Humanity fights for survival against giant humanoid Titans.',
      episodes_total: 87,
      episodes_watched: 87,
      status: 'completed',
      rating: 9,
      genre: 'Action, Dark Fantasy',
      year: 2013,
      image_url: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  res.status(200).json(mockAnime);
}

function handlePost(req, res) {
  const { title, description, episodes_total, genre, year, image_url } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // For demo purposes, return success without actually storing
  const newAnime = {
    id: Date.now(),
    title,
    description: description || '',
    episodes_total: episodes_total || 0,
    episodes_watched: 0,
    status: 'planned',
    rating: 0,
    genre: genre || '',
    year: year || null,
    image_url: image_url || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  res.status(201).json({ id: newAnime.id, message: 'Anime added successfully', anime: newAnime });
}

function handlePut(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  // For demo purposes, return success without actually updating
  res.status(200).json({ message: 'Anime updated successfully' });
}

function handleDelete(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  // For demo purposes, return success without actually deleting
  res.status(200).json({ message: 'Anime deleted successfully' });
}
