import React from 'react';
import './CarCard.css';
import { Link } from 'react-router-dom';
import {
  FaStar, FaUserFriends, FaCar, FaGasPump,
  FaCalendarAlt, FaCogs, FaRoad, FaBolt, 
} from 'react-icons/fa';
import { MdOutlineAir } from 'react-icons/md';
import { GiCarDoor } from 'react-icons/gi';

const CarCard = ({ car }) => {
  const getBadgeType = () => {
    if (car.isFeatured) return 'popular';
    if (car.isNew) return 'new';
    if (car.category === 'luxury') return 'luxury';
    return '';
  };

  const badgeType = getBadgeType();
  const badgeText =
    badgeType === 'popular' ? 'Populaire' :
    badgeType === 'new' ? 'Nouveau' :
    badgeType === 'luxury' ? 'Luxe' : '';

  // Normalize some fields with fallback
  const transmission = car.transmission ? car.transmission.toLowerCase() : '';
  const fuel = car.fuel ? car.fuel.toLowerCase() : '';
  const airConditioning = !!car.airConditioning;
  const doors = car.doors || 'N/A';
  const km = car.km || 'N/A';
  const type = car.type || 'N/A';
  const places = car.places || 'N/A';
  const averageRating = car.average_rating || 0;
const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Construct image URL fallback
  const imgUrl = car.images && car.images.length > 0
    ? car.images[0].startsWith('http')
      ? car.images[0]
      : `${API_BASE_URL}/api/car/${car._id}/images/${car.images[0]}`
    : '/default-car.jpg';

  return (
    <div className="car-card-v2">
      <div className="car-img-container">
        <img
          src={imgUrl}
          alt={`${car.make} ${car.model}`}
          className="car-img"
        />
        {badgeText && (
          <div className={`car-badge ${badgeType}`}>
            {badgeText}
          </div>
        )}
      </div>

      <h3 className="car-title-center">{car.make} {car.model}</h3>


      <div className="car-rating">
        <div className="stars">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              color={i < Math.round(averageRating) ? "#f1c40f" : "#ddd"}
              size={16}
            />
          ))}
        </div>
        <span className="rating-text">({averageRating} / 5)</span>
      </div>

      <div className="car-price">
        {car.price ? `${car.price} MAD/Jour` : 'N/A'}
      </div>

      <div className="car-details">
        <div>
          <FaUserFriends size={18} />
          <span>{places} Places</span>
        </div>
        <div>
          <FaCar size={18} />
  <span>
    {["automatic", "automatique"].includes(transmission) ? 'Auto' :
     ["manual", "manuelle"].includes(transmission) ? 'Manuelle' : 'N/A'}
  </span>
        </div>
        <div>
          {fuel === 'electrique' ? (
            <FaBolt size={18} color="#3498db" />
          ) : (
            <FaGasPump size={18} />
          )}
          <span>{fuel ? fuel.charAt(0).toUpperCase() + fuel.slice(1) : 'N/A'}</span>
        </div>
        <div>
          <MdOutlineAir size={18} color={airConditioning ? "#27bb51" : "#c00"} />
          <span>{airConditioning ? "Clim" : "Sans clim"}</span>
        </div>
        <div>
          <GiCarDoor size={18} />
          <span>{doors} Portes</span>
        </div>
        <div>
          <FaCalendarAlt size={18} />
          <span>{car.year || 'N/A'}</span>
        </div>
        <div>
          <FaCogs size={18} />
          <span>{type}</span>
        </div>
        <div>
          <FaRoad size={18} />
          <span>{km}</span>
        </div>
      </div>

      {car.is_available ? (
        <Link to={`/car/${car._id}`} className="btn-reserver">
          Réserver Maintenant
        </Link>
      ) : (
        <div className="btn-indispo">Indisponible</div>
      )}
    </div>
  );
};

export default CarCard;
