import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Contrats.css';

const Contrats = () => {
  const [contrats, setContrats] = useState([]);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchContrats();
  }, []);

  const fetchContrats = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/admin/contrats`)
      .then(res => {
        setContrats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur chargement contrats:', err);
        setLoading(false);
      });
  };

  const handleUpload = (e) => setFiles(e.target.files);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!files.length) return;
    
    const data = new FormData();
    for (let i = 0; i < files.length; i++) data.append('contrats', files[i]);
    
    axios.post(`${API_BASE_URL}/api/admin/contrats`, data)
      .then(() => { 
        fetchContrats(); 
        setFiles([]);
      })
      .catch(() => alert('❌ Erreur lors de l\'upload'));
  };

  const handleDelete = (filename) => {
    if (!window.confirm(`Supprimer le contrat "${filename}" ?`)) return;
    axios.delete(`${API_BASE_URL}/api/admin/contrats/${filename}`)
      .then(() => fetchContrats())
      .catch(() => alert('Erreur lors de la suppression'));
  };

  const filtered = contrats
    .filter(c => c.filename.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'asc'
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date)
    );

  return (
    <div className="contrats-admin">
      <div className="contrats-header">
        <h2>📁 Gestion des Contrats</h2>
        <div className="contrats-count">{filtered.length} contrats</div>
      </div>

      <div className="contrats-actions">
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="file-input-container">
            <label htmlFor="file-upload" className="file-upload-label">
              {files.length > 0 
                ? `${files.length} fichier(s) sélectionné(s)` 
                : 'Choisir des fichiers (.doc, .docx)'}
            </label>
            <input 
              id="file-upload"
              type="file" 
              multiple 
              accept=".doc,.docx" 
              onChange={handleUpload} 
            />
          </div>
          <button 
            type="submit" 
            className="btn-upload"
            disabled={!files.length}
          >
            Téléverser
          </button>
        </form>

        <div className="contrats-filters">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Rechercher un contrat..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            <span className="search-icon">🔍</span>
          </div>
          <select 
            value={sort} 
            onChange={e => setSort(e.target.value)}
            className="sort-select"
          >
            <option value="desc">🕓 Plus récent</option>
            <option value="asc">🕓 Plus ancien</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Chargement des contrats...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-message">Aucun contrat trouvé</div>
      ) : isMobile ? (
        <div className="contrats-mobile-list">
          {filtered.map(c => (
            <div key={c.filename} className="contrat-card">
              <div className="contrat-info">
                <div className="contrat-name">{c.filename}</div>
                <div className="contrat-date">
                  {new Date(c.date).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="contrat-actions">
                <a 
                  href={`${API_BASE_URL}/api/admin/contrats/download/${c.filename}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-download"
                >
                  Télécharger
                </a>
                <button 
                  onClick={() => handleDelete(c.filename)}
                  className="btn-delete"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="contrats-table-container">
          <table className="contrats-table">
            <thead>
              <tr>
                <th>Nom du contrat</th>
                <th>Date d'ajout</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.filename}>
                  <td>{c.filename}</td>
                  <td>{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                  <td className="actions-cell">
                    <a 
                      href={`${API_BASE_URL}/api/admin/contrats/download/${c.filename}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-download"
                    >
                      Télécharger
                    </a>
                    <button 
                      onClick={() => handleDelete(c.filename)}
                      className="btn-delete"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Contrats;