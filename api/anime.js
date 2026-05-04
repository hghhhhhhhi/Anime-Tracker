// Vercel serverless function for anime API
module.exports = function handler(req, res) {
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

// Mock data storage (in production, use a real database)
let mockAnime = [
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

function handleGet(req, res) {
  res.status(200).json(mockAnime);
}

function handlePost(req, res) {
  const { title, description, episodes_total, genre, year, image_url } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

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

  mockAnime.push(newAnime);
  res.status(201).json({ id: newAnime.id, message: 'Anime added successfully', anime: newAnime });
}

function handlePut(req, res) {
  const { id } = req.query;
  const { title, description, episodes_total, episodes_watched, status, rating, genre, year, image_url } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const animeIndex = mockAnime.findIndex(anime => anime.id == id);
  if (animeIndex === -1) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  // Update the anime
  mockAnime[animeIndex] = {
    ...mockAnime[animeIndex],
    title: title || mockAnime[animeIndex].title,
    description: description || mockAnime[animeIndex].description,
    episodes_total: episodes_total !== undefined ? episodes_total : mockAnime[animeIndex].episodes_total,
    episodes_watched: episodes_watched !== undefined ? episodes_watched : mockAnime[animeIndex].episodes_watched,
    status: status || mockAnime[animeIndex].status,
    rating: rating !== undefined ? rating : mockAnime[animeIndex].rating,
    genre: genre || mockAnime[animeIndex].genre,
    year: year || mockAnime[animeIndex].year,
    image_url: image_url || mockAnime[animeIndex].image_url,
    updated_at: new Date().toISOString()
  };

  res.status(200).json({ message: 'Anime updated successfully', anime: mockAnime[animeIndex] });
}

function handleDelete(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const animeIndex = mockAnime.findIndex(anime => anime.id == id);
  if (animeIndex === -1) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  // Actually remove the anime from the array
  const deletedAnime = mockAnime.splice(animeIndex, 1)[0];
  
  res.status(200).json({ 
    message: 'Anime deleted successfully', 
    deletedAnime: deletedAnime,
    remainingAnime: mockAnime 
  });
}
