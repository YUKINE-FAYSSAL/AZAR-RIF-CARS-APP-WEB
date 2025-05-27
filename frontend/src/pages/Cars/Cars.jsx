import React, { useEffect, useState } from 'react';
import './Cars.css';
import api from '../../services/api';
import CarCard from '../../components/CarCard/CarCard';
import { FaSearch, FaFilter, FaChevronRight, FaTimes } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    transmission: '',
    fuelType: '',
    carType: '',
    seats: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get('/api/cars');
        setCars(res.data);
      } catch (err) {
        console.error('Error loading cars:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredCars = cars.filter(car => {
    const make = car.make?.toLowerCase() || '';
    const model = car.model?.toLowerCase() || '';
    const transmission = (car.transmission || "").trim().toLowerCase();
    const fuel = car.fuel?.toLowerCase() || '';
    const type = (car.type || "").trim().toLowerCase();
    const price = parseInt(car.price) || 0;
    const seats = parseInt(car.places) || 4;

    const matchesSearch =
      make.includes(searchTerm.toLowerCase()) ||
      model.includes(searchTerm.toLowerCase());

    const matchesPrice =
      price >= filters.priceRange[0] && price <= filters.priceRange[1];

    const matchesTransmission =
      !filters.transmission ||
      transmission === filters.transmission.toLowerCase();

    const matchesFuel =
      !filters.fuelType || fuel === filters.fuelType.toLowerCase();
      
    const matchesType =
      !filters.carType || type === filters.carType.toLowerCase();
      
    const matchesSeats =
      !filters.seats || seats >= parseInt(filters.seats);

    return matchesSearch && matchesPrice && matchesTransmission && 
           matchesFuel && matchesType && matchesSeats;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      priceRange: [0, 1000],
      transmission: '',
      fuelType: '',
      carType: '',
      seats: ''
    });
  };

  return (
    <>
      <Helmet>
        <title>Nos voitures | Taza Rent Car</title>
        <meta name="description" content="Découvrez la flotte complète de voitures en location à Taza : modèles économiques, premiums et utilitaires, aux meilleurs tarifs." />
      </Helmet>
    <div className="cars-page">
      <header className="cars-header">
        <div className="header-content">
          <h1>Nos Véhicules</h1>
          <div className="breadcrumbs">
            <a href="/">Accueil</a>
            <span><FaChevronRight size={10} /></span>
            <a href="/cars">Catégories</a>
          </div>
        </div>
      </header>

      <section className="page-title-section">
        <h2>Catégories De <span>Véhicules</span></h2>
        <p>
          Découvrez notre large sélection de véhicules récents et bien entretenus pour répondre à
          tous vos besoins de mobilité, que ce soit pour un voyage d'affaires ou des vacances en famille.
        </p>
      </section>

      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher une marque ou modèle..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <FaTimes />
            </button>
          )}
        </div>
        
        <button 
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>
        
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Prix (MAD/jour)</label>
              <div className="price-range">
                <span>{filters.priceRange[0]}</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="50"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({
                    ...filters, 
                    priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                  })}
                />
                <span>{filters.priceRange[1]}+</span>
              </div>
              <div className="price-inputs">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: [parseInt(e.target.value), filters.priceRange[1]]
                  })}
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                  })}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Transmission</label>
              <div className="filter-options">
                <button
                  className={!filters.transmission ? 'active' : ''}
                  onClick={() => setFilters({...filters, transmission: ''})}
                >
                  Tous
                </button>
                <button
                  className={filters.transmission === 'automatique' ? 'active' : ''}
                  onClick={() => setFilters({...filters, transmission: 'automatique'})}
                >
                  Automatique
                </button>
                <button
                  className={filters.transmission === 'manuelle' ? 'active' : ''}
                  onClick={() => setFilters({...filters, transmission: 'manuelle'})}
                >
                  Manuelle
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Type de carburant</label>
              <div className="filter-options">
                <button
                  className={!filters.fuelType ? 'active' : ''}
                  onClick={() => setFilters({...filters, fuelType: ''})}
                >
                  Tous
                </button>
                <button
                  className={filters.fuelType === 'essence' ? 'active' : ''}
                  onClick={() => setFilters({...filters, fuelType: 'essence'})}
                >
                  Essence
                </button>
                <button
                  className={filters.fuelType === 'diesel' ? 'active' : ''}
                  onClick={() => setFilters({...filters, fuelType: 'diesel'})}
                >
                  Diesel
                </button>
                <button
                  className={filters.fuelType === 'hybride' ? 'active' : ''}
                  onClick={() => setFilters({...filters, fuelType: 'hybride'})}
                >
                  Hybride
                </button>
                <button
                  className={filters.fuelType === 'électrique' ? 'active' : ''}
                  onClick={() => setFilters({...filters, fuelType: 'électrique'})}
                >
                  Électrique
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Type de véhicule</label>
              <select 
                value={filters.carType}
                onChange={(e) => setFilters({...filters, carType: e.target.value})}
              >
                <option value="">Tous</option>
                <option value="berline">Berline</option>
                <option value="suv">SUV</option>
                <option value="citadine">Citadine</option>
                <option value="utilitaire">Utilitaire</option>
                <option value="luxe">Luxe</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Nombre de places</label>
              <select 
                value={filters.seats}
                onChange={(e) => setFilters({...filters, seats: e.target.value})}
              >
                <option value="">Tous</option>
                <option value="2">2+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
                <option value="7">7+</option>
              </select>
            </div>
            
            <button 
              className="reset-filters-btn"
              onClick={resetFilters}
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des véhicules...</p>
        </div>
      ) : (
        <section className="car-list">
          {filteredCars.length === 0 ? (
            <div className="no-cars-container">
              <p className="no-cars">Aucune voiture ne correspond à vos critères</p>
              <button 
                className="reset-filters"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            filteredCars.map(car => (
              <CarCard key={car._id} car={car} />
            ))
          )}
        </section>
      )}
    </div>
    </>
  );
};

export default Cars;