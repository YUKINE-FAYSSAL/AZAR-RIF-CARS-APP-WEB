// src/admin/AdminCars.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Swal from 'sweetalert2';
import './AdminCars.css';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/cars`)
      .then(res => {
        setCars(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement voitures:", err);
        setLoading(false);
      });
  };

  const handleDelete = (id, make, model) => {
    Swal.fire({
      title: 'Confirmation',
      text: `Supprimer ${make} ${model} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e30613',
      cancelButtonColor: '#7f8c8d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${API_BASE_URL}/api/car/${id}`)
          .then(() => {
            setCars(prev => prev.filter(car => car._id !== id));
            Swal.fire('Supprimé!', 'La voiture a été supprimée.', 'success');
          })
          .catch(() => Swal.fire('Erreur', "La suppression a échoué", 'error'));
      }
    });
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                        (filter === 'available' && car.is_available) || 
                        (filter === 'unavailable' && !car.is_available);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-cars-wrapper">
      <div className="admin-cars-header">
        <h2>🚗 Gestion des Voitures</h2>
        <div className="admin-cars-count">{filteredCars.length} voitures</div>
      </div>

      <div className="admin-cars-filters">
        <div className="admin-search-container">
          <input
            type="text"
            placeholder="Rechercher une voiture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="admin-search-icon">🔍</span>
        </div>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="admin-filter-select"
        >
          <option value="all">Toutes</option>
          <option value="available">Disponibles</option>
          <option value="unavailable">Non disponibles</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading-message">Chargement des voitures...</div>
      ) : filteredCars.length === 0 ? (
        <div className="admin-empty-message">Aucune voiture trouvée</div>
      ) : (
        <div className="admin-cars-grid">
          {filteredCars.map(car => (
            <div className="admin-car-card" key={car._id}>
              <div className="admin-car-image-container">
                <img
                  src={`${API_BASE_URL}/api/car/${car._id}/images/${car.images?.[0] || 'default.jpg'}`}
                  alt={`${car.make} ${car.model}`}
                  className="admin-car-image"
                />
                <div className={`admin-availability-badge ${car.is_available ? 'available' : 'unavailable'}`}>
                  {car.is_available ? 'Disponible' : 'Indisponible'}
                </div>
              </div>
              <div className="admin-car-details">
                <h3>{car.make} {car.model}</h3>
                <div className="admin-car-specs">
                  <div className="admin-spec-item">
                    <span className="admin-spec-label">Année:</span>
                    <span>{car.year}</span>
                  </div>
                  <div className="admin-spec-item">
                    <span className="admin-spec-label">Prix:</span>
                    <span className="admin-price">{car.price} DH/jour</span>
                  </div>
                  <div className="admin-spec-item">
                    <span className="admin-spec-label">Transmission:</span>
                    <span>{car.transmission}</span>
                  </div>
                </div>
              </div>
              <div className="admin-car-actions">
                <button 
                  onClick={() => navigate(`/admin/dashboard/edit-car/${car._id}`)}
                  className="admin-btn-edit"
                >
                  Modifier
                </button>
                <button 
                  onClick={() => handleDelete(car._id, car.make, car.model)}
                  className="admin-btn-delete"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCars;