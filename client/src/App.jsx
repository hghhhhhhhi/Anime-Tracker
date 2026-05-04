import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, RefreshCcw, Search, X } from 'lucide-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

const jikanAPI = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

const statusLabels = {
  planned: 'Planned',
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped'
};

const initialForm = {
  title: '',
  description: '',
  episodes_total: '',
  episodes_watched: '',
  status: 'planned',
  rating: '0',
  genre: '',
  year: '',
  image_url: ''
};

function App() {
  const [anime, setAnime] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchAnime = async () => {
    setLoading(true);
    try {
      const response = await api.get('/anime');
      setAnime(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to sync with server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage('Title is required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      episodes_total: Number(form.episodes_total) || 0,
      episodes_watched: Number(form.episodes_watched) || 0,
      status: form.status,
      rating: Number(form.rating) || 0,
      genre: form.genre.trim(),
      year: Number(form.year) || null,
      image_url: form.image_url.trim()
    };

    try {
      if (editingId) {
        await api.put(`/anime/${editingId}`, payload);
        setMessage('Anime entry updated.');
      } else {
        await api.post('/anime', payload);
        setMessage('Anime entry added.');
      }
      resetForm();
      await fetchAnime();
    } catch (error) {
      console.error(error);
      setMessage('Unable to save anime entry.');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title || '',
      description: entry.description || '',
      episodes_total: entry.episodes_total || '',
      episodes_watched: entry.episodes_watched || '',
      status: entry.status || 'planned',
      rating: entry.rating || '0',
      genre: entry.genre || '',
      year: entry.year || '',
      image_url: entry.image_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this anime from your list?')) return;
    try {
      await api.delete(`/anime/${id}`);
      setMessage('Anime entry deleted.');
      await fetchAnime();
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete anime entry.');
    }
  };

  const searchAnime = async (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setSearching(true);
    setSearchResults([]);
    setShowSearchResults(true);
    
    try {
      console.log('Searching for:', trimmedQuery);
      // Use a more targeted search approach with proper URL encoding
      const encodedQuery = encodeURIComponent(trimmedQuery);
      let url = `https://api.jikan.moe/v4/anime?q=${encodedQuery}&limit=15&order_by=relevance&sort=desc`;
      
      // Special handling for specific anime titles
      if (trimmedQuery.toLowerCase() === 're zero') {
        url = `https://api.jikan.moe/v4/anime?q=re:zero&limit=15&order_by=relevance&sort=desc`;
      } else if (trimmedQuery.toLowerCase() === 're') {
        url = `https://api.jikan.moe/v4/anime?q=re:&limit=15&order_by=relevance&sort=desc`;
      } else {
        url = `https://api.jikan.moe/v4/anime?q=${encodedQuery}&limit=15&order_by=relevance&sort=desc`;
      }
      console.log('URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle API errors
      if (data.status === 400 || data.error) {
        console.log('API Error, trying fallback search...');
        // Fallback: try a simpler search without special characters
        const fallbackUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(trimmedQuery)}&limit=15`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback API Response:', fallbackData);
        var results = fallbackData.data || [];
      } else {
        var results = data.data || [];
      }
      
      // Prioritize exact and partial title matches
      if (results.length > 0) {
        // Special handling for "re zero" to find Re:Zero
        let targetQuery = trimmedQuery.toLowerCase();
        if (trimmedQuery.toLowerCase() === 're zero') {
          targetQuery = 're:zero';
        }
        
        const exactMatch = results.find(anime => 
          anime.title.toLowerCase() === targetQuery ||
          anime.title.toLowerCase().includes(targetQuery)
        );
        
        const partialMatches = results.filter(anime => 
          anime.title.toLowerCase().includes(targetQuery) &&
          anime.title.toLowerCase() !== targetQuery
        );
        
        const otherMatches = results.filter(anime => 
          !anime.title.toLowerCase().includes(targetQuery)
        );
        
        // Reorder results: exact matches first, then partial matches, then others
        results = [
          ...(exactMatch ? [exactMatch] : []),
          ...partialMatches.slice(0, 5),
          ...otherMatches.slice(0, 10)
        ].slice(0, 15);
        
        console.log('First result title:', results[0].title);
        console.log('All titles:', results.map(r => r.title));
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setMessage('No anime found for "' + trimmedQuery + '". Try a different search.');
      } else {
        setMessage(`Found ${results.length} anime matching "${trimmedQuery}"`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessage('Search failed: ' + (error.message || 'Please try again.'));
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addFromSearch = (animeData) => {
    const genres = animeData.genres?.map((g) => g.name).join(', ') || '';
    setForm({
      title: animeData.title || animeData.title_english || '',
      description: animeData.synopsis || '',
      episodes_total: animeData.episodes || 0,
      episodes_watched: 0,
      status: 'planned',
      rating: '0',
      genre: genres,
      year: animeData.year || '',
      image_url: animeData.images?.jpg?.large_image_url || ''
    });
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage('Anime loaded from search. Click "Add anime" to save it.');
  };

  const filteredAnime = useMemo(() => {
    return anime.filter((entry) => {
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      const matchesSearch = [entry.title, entry.genre, entry.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(searchText.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [anime, searchText, statusFilter]);

  const stats = useMemo(() => {
    const total = anime.length;
    const completed = anime.filter((item) => item.status === 'completed').length;
    const watching = anime.filter((item) => item.status === 'watching').length;
    const planned = anime.filter((item) => item.status === 'planned').length;
    const onHold = anime.filter((item) => item.status === 'on_hold').length;
    const dropped = anime.filter((item) => item.status === 'dropped').length;
    const episodesWatched = anime.reduce((sum, item) => sum + Number(item.episodes_watched || 0), 0);
    const averageRating = anime.length
      ? (anime.reduce((sum, item) => sum + Number(item.rating || 0), 0) / anime.length).toFixed(1)
      : '0.0';
    return { total, completed, watching, planned, onHold, dropped, episodesWatched, averageRating };
  }, [anime]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Anime Tracker</p>
          <h1>Track your anime on Android and PC</h1>
          <p className="subtitle">Use the same backend to keep your list synced across devices.</p>
        </div>
        <button className="refresh-button" onClick={fetchAnime} disabled={loading}>
          <RefreshCcw size={18} /> Refresh
        </button>
      </header>

      {message && (
        <div className="status-message" onClick={() => setMessage('')}>
          {message}
        </div>
      )}

      <section className="stats-grid">
        <article>
          <span>Total</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>Watching</span>
          <strong>{stats.watching}</strong>
        </article>
        <article>
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </article>
        <article>
          <span>Planned</span>
          <strong>{stats.planned}</strong>
        </article>
        <article>
          <span>Episodes Watched</span>
          <strong>{stats.episodesWatched}</strong>
        </article>
        <article>
          <span>Avg Rating</span>
          <strong>{stats.averageRating}</strong>
        </article>
      </section>

      <section className="search-section">
        <div className="search-container">
          <div className="search-input-group">
            <label htmlFor="search-query">Search Anime Database</label>
            <div className="search-input-wrapper">
              <Search size={18} />
              <input
                id="search-query"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchAnime(e.target.value);
                  }
                }}
                placeholder="Search for anime..."
              />
            </div>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => searchAnime(searchQuery)}
            disabled={searching || !searchQuery.trim()}
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results">
            <div className="search-results-header">
              <h3>Search Results</h3>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowSearchResults(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="search-results-grid">
              {searchResults.map((item) => (
                <div key={item.mal_id} className="search-result-card">
                  <img
                    src={item.images?.jpg?.large_image_url || ''}
                    alt={item.title}
                  />
                  <div className="result-content">
                    <h4>{item.title}</h4>
                    <p className="result-meta">
                      {item.episodes ? `${item.episodes} episodes` : 'Ongoing'} • {item.year || 'TBA'}
                    </p>
                    <p className="result-synopsis">{item.synopsis?.substring(0, 100)}...</p>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => addFromSearch(item)}
                    >
                      Add to list
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSearchResults && searchResults.length === 0 && !searching && (
          <div className="empty-state">No anime found. Try a different search.</div>
        )}
      </section>

      <form className="anime-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="title">Anime title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="One Piece" />
          </div>
          <div className="input-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="episodes_total">Total episodes</label>
            <input id="episodes_total" name="episodes_total" type="number" min="0" value={form.episodes_total} onChange={handleChange} placeholder="24" />
          </div>
          <div className="input-group">
            <label htmlFor="episodes_watched">Episodes watched</label>
            <input id="episodes_watched" name="episodes_watched" type="number" min="0" value={form.episodes_watched} onChange={handleChange} placeholder="12" />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="rating">Rating</label>
            <input id="rating" name="rating" type="number" min="0" max="10" value={form.rating} onChange={handleChange} placeholder="8" />
          </div>
          <div className="input-group">
            <label htmlFor="year">Year</label>
            <input id="year" name="year" type="number" min="1900" max="2100" value={form.year} onChange={handleChange} placeholder="2025" />
          </div>
        </div>

        <div className="form-row single-row">
          <div className="input-group full-width">
            <label htmlFor="genre">Genre</label>
            <input id="genre" name="genre" value={form.genre} onChange={handleChange} placeholder="Action, Fantasy" />
          </div>
        </div>

        <div className="form-row single-row">
          <div className="input-group full-width">
            <label htmlFor="image_url">Cover image URL</label>
            <input id="image_url" name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..." />
          </div>
        </div>

        <div className="form-row single-row">
          <div className="input-group full-width">
            <label htmlFor="description">Notes / description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Short notes about this anime"></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button">
            <Plus size={16} /> {editingId ? 'Save changes' : 'Add anime'}
          </button>
          <button type="button" className="secondary-button" onClick={resetForm}>
            Clear
          </button>
        </div>
      </form>

      <section className="list-controls">
        <div>
          <label>
            Search
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search title, genre or notes" />
          </label>
        </div>
        <div>
          <label>
            Filter
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="anime-list">
        {loading ? (
          <div className="empty-state">Loading your synced list...</div>
        ) : filteredAnime.length === 0 ? (
          <div className="empty-state">No anime found. Add one to start syncing.</div>
        ) : (
          filteredAnime.map((entry) => (
            <article key={entry.id} className="anime-card">
              <div className="anime-card-image">
                {entry.image_url ? <img src={entry.image_url} alt={entry.title} /> : <div className="placeholder-image">No image</div>}
              </div>
              <div className="anime-card-body">
                <div className="anime-card-header">
                  <div>
                    <h2>{entry.title}</h2>
                    <p className="status-pill">{statusLabels[entry.status] || 'Planned'}</p>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(entry)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="meta-line">{entry.genre || 'Genre unknown'} • {entry.year || 'Year unknown'}</p>
                <p className="description">{entry.description || 'No description added.'}</p>
                <div className="progress-row">
                  <span>Episodes: {entry.episodes_watched || 0}/{entry.episodes_total || 0}</span>
                  <span>Rating: {entry.rating || 0}/10</span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <footer className="footer-note">
        Open this app in a browser on both Android and PC. The backend stores your list so changes stay synced.
      </footer>
    </div>
  );
}

export default App;
