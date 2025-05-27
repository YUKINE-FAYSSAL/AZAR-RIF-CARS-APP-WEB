// CarDetails.jsx - Version Française
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarDetails.css';
import api from '../../services/api';
import { FaTrash, FaReply, FaArrowLeft } from 'react-icons/fa';
import { 
  FaCar, FaGasPump, FaUserFriends, FaCalendarAlt,
  FaCogs, FaRoad, FaCommentDots, FaStar 
} from 'react-icons/fa';
import { MdAirlineSeatReclineNormal, MdOutlineAir } from 'react-icons/md';
import { GiCarDoor } from 'react-icons/gi';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import villesMaroc from '../../assets/ville/ville_cars';
import { Helmet } from 'react-helmet-async';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [car, setCar] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: '', message: '' });
  const [activeTab, setActiveTab] = useState('details');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [selectedVille, setSelectedVille] = useState('');
  const [villes, setVilles] = useState([]);

  useEffect(() => {
    setVilles(villesMaroc);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    api.get(`/api/car/${id}`)
      .then(res => {
        setCar(res.data.car);
        setComments(res.data.comments || []);
        setReservations(res.data.reservations || []);
      })
      .catch(err => console.error("Erreur de chargement de la voiture", err));
  }, []);
const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (startDate && endDate && car) {
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDays(diffDays);
      setTotalPrice(diffDays * car.price);
    }
  }, [startDate, endDate, car]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.name || !newComment.message || rating === 0) return;

    try {
      await api.post(`/api/car/${car._id}/comment`, {
        username: newComment.name,
        comment: newComment.message,
        rating: rating,
      });
      
      const updated = await api.get(`/api/car/${id}`);
      setCar(updated.data.car);
      setComments(updated.data.comments || []);
      setNewComment({ name: '', message: '' });
      setRating(0);
      
      Swal.fire('Succès', 'Votre avis a été soumis!', 'success');
    } catch (err) {
      console.error("Erreur lors de la soumission du commentaire:", err);
      Swal.fire('Erreur', 'Échec de la soumission de l\'avis', 'error');
    }
  };

  const handleReservation = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!startDate || !endDate) {
      Swal.fire("Erreur", "Veuillez sélectionner les dates de début et de fin", "error");
      return;
    }
    if (!selectedVille) {
      Swal.fire("Erreur", "Veuillez sélectionner une ville", "error");
      return;
    }

    try {
      await api.post(`/api/reserve/${car._id}`, {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        ville: selectedVille,
      });

      Swal.fire({
        title: "Réservation réussie!",
        html: `Vous avez réservé ${car.make} ${car.model} pour ${days} jours.<br>Total: ${totalPrice} MAD`,
        icon: "success"
      });
    } catch (err) {
      console.error("Erreur de réservation:", err);
      Swal.fire("Erreur", err.response?.data?.message || "Échec de la réservation", "error");
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  if (!car) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des détails de la voiture...</p>
      </div>
    );
  }

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/api/comment/${commentId}`);
      const updated = await api.get(`/api/car/${id}`);
      setCar(updated.data.car);
      setComments(updated.data.comments || []);
      Swal.fire("Supprimé", "Le commentaire a été supprimé.", "success");
    } catch (err) {
      console.error("Erreur de suppression:", err);
      Swal.fire("Erreur", "Échec de la suppression.", "error");
    }
  };

  const handleReply = async (commentId) => {
    const { value: reply } = await Swal.fire({
      title: "Répondre au commentaire",
      input: "textarea",
      inputLabel: "Message de réponse",
      inputPlaceholder: "Écrivez votre réponse ici...",
      inputAttributes: { "aria-label": "Réponse" },
      showCancelButton: true
    });

    if (reply) {
      try {
        await api.put(`/api/comment/${commentId}/reply`, { reply });
        const updated = await api.get(`/api/car/${id}`);
        setCar(updated.data.car);
        setComments(updated.data.comments || []);
        Swal.fire("Répondu", "Votre réponse a été enregistrée.", "success");
      } catch (err) {
        console.error("Erreur de réponse:", err);
        Swal.fire("Erreur", "Échec de l'envoi de la réponse.", "error");
      }
    }
  };

  return (
    <>
    
      <Helmet>
  <title>Détails voiture | Taza Rent Car</title>
  <meta name="description" content="Consultez tous les détails de nos voitures à louer : options, prix, disponibilité et réservez facilement en ligne." />
</Helmet>

    <div className="car-details-container">
      <button className="back-button" onClick={() => navigate('/cars')}>
        <FaArrowLeft /> Retour
      </button>

      <div className="car-main">
        <div className="car-images">
          {car.images?.length > 0 ? (
            <Slider {...sliderSettings}>
              {car.images.map((image, index) => (
                <div key={index} className="image-slide">
                  <img
                    src={`${API_BASE_URL}/api/car/${car._id}/images/${image}`}
                    alt={`${car.make} ${car.model}`}
                    className="car-image"
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="no-image">Aucune image disponible</div>
          )}
        </div>

        <div className="car-info">
          <div className="car-header">
            <h1 className="car-title">
              {car.make} {car.model} <span>{car.year}</span>
            </h1>
            <div className="car-price">
              <span className="price">{car.price} MAD</span>
              <span className="per-day">/ jour</span>
            </div>
          </div>

          <div className="tabs">
            <button 
              className={activeTab === 'details' ? 'active' : ''}
              onClick={() => setActiveTab('details')}
            >
              Détails
            </button>
            <button 
              className={activeTab === 'specs' ? 'active' : ''}
              onClick={() => setActiveTab('specs')}
            >
              Spécifications
            </button>
            <button 
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Avis ({comments.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'details' && (
              <>
                <p className="car-description">
                  {car.description || "Cette voiture premium offre confort et performance. Parfaite pour les voyages d'affaires ou les vacances en famille."}
                </p>
                <div className="highlight-features">
                  <div><FaStar /> Kilométrage illimité</div>
                  <div><FaStar /> Assurance complète</div>
                  <div><FaStar /> Support 24/7</div>
                </div>
              </>
            )}

            {activeTab === 'specs' && (
              <div className="car-specs-grid">
                <div>
                  <FaCar />
                  <span>Transmission</span>
                  <strong>{car.transmission ? (car.transmission === 'automatic' ? 'Automatique' : 'Manuelle') : 'N/A'}</strong>
                </div>
                <div>
                  <FaGasPump />
                  <span>Carburant</span>
                  <strong>{car.fuel ? (car.fuel === "electrique" ? "Électrique" : car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1)) : 'N/A'}</strong>
                </div>
                <div>
                  <MdAirlineSeatReclineNormal />
                  <span>Places</span>
                  <strong>{car.places || 'N/A'}</strong>
                </div>
                <div>
                  <GiCarDoor />
                  <span>Portes</span>
                  <strong>{car.doors || 'N/A'}</strong>
                </div>
                <div>
                  <FaCalendarAlt />
                  <span>Année</span>
                  <strong>{car.year || 'N/A'}</strong>
                </div>
                <div>
                  <FaRoad />
                  <span>Kilométrage</span>
                  <strong>{car.km ? `${car.km} km` : 'N/A'}</strong>
                </div>
                <div>
                  <MdOutlineAir />
                  <span>Climatisation</span>
                  <strong style={{ color: car.airConditioning ? "#27bb51" : "#c00" }}>
                    {car.airConditioning ? "Oui" : "Non"}
                  </strong>
                </div>
                <div>
                  <FaCogs />
                  <span>Type</span>
                  <strong>{car.type || 'N/A'}</strong>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                {comments.length > 0 ? (
                  <div className="comment-list">
                    {comments.map((c, index) => (
                      <div className="comment-card" key={index}>
                        <div className="comment-header">
                          <div>
                            <span className="comment-author">{c.username}</span>
                            <div className="comment-rating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className={i < c.rating ? 'filled' : ''} />
                              ))}
                            </div>
                          </div>
                          <span className="comment-date">
                            {new Date(c.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="comment-message">{c.comment}</p>
                        {c.admin_reply && (
                          <p className="admin-reply">
                            <strong>Réponse admin:</strong> {c.admin_reply}
                          </p>
                        )}
                        {user?.role === 'admin' && (
                          <div className="comment-actions">
                            <button onClick={() => handleDelete(c._id)}>
                              <FaTrash /> Supprimer
                            </button>
                            <button onClick={() => handleReply(c._id)}>
                              <FaReply /> Répondre
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-comment">
                    Aucun avis pour le moment. Soyez le premier à en laisser un!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="reservation-section">
            <h3 className="section-title">
              <FaCalendarAlt /> Réserver cette voiture
            </h3>
            
            <div className="reservation-dates">
              <div className="form-group">
                <label>Date de début</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  minDate={new Date()}
                  className="date-picker-input"
                  placeholderText="Sélectionner la date de début"
                />
              </div>
              
              <div className="form-group">
                <label>Date de fin</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  minDate={startDate || new Date()}
                  className="date-picker-input"
                  placeholderText="Sélectionner la date de fin"
                />
              </div>
              
              <select
                value={selectedVille}
                onChange={e => setSelectedVille(e.target.value)}
                required
              >
                <option value="">Sélectionner une ville</option>
                {villes.map((v, i) => <option key={i} value={v}>{v}</option>)}
              </select>
            </div>

            {startDate && endDate && (
              <div className="price-summary">
                <div className="price-row">
                  <span>{car.price} MAD x {days} jours</span>
                  <span>{car.price * days} MAD</span>
                </div>
                <div className="price-total">
                  <strong>Total:</strong>
                  <strong>{totalPrice} MAD</strong>
                </div>
              </div>
            )}
          </div>

          <div className="action-buttons">
            {car.is_available ? (
              user ? (
                <button className="reserver-btn" onClick={handleReservation}>
                  Réserver maintenant
                </button>
              ) : (
                <button 
                  className="reserver-btn" 
                  onClick={() => navigate('/login')}
                >
                  Connectez-vous pour réserver
                </button>
              )
            ) : (
              <button className="reserver-btn" disabled>
                Indisponible
              </button>
            )}
            <a 
              href="https://wa.me/212600000000" 
              className="contact-btn"
              target="_blank" 
              rel="noreferrer"
            >
              Contact via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="comment-section">
        <h2 className="section-title">
          <FaCommentDots className="comment-icon" /> Laisser un avis
        </h2>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="form-group">
              <label>Votre nom</label>
              <input 
                type="text" 
                value={newComment.name}
                onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Note</label>
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i}
                    className={i < (hoverRating || rating) ? 'star-filled' : 'star-empty'}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(i + 1)}
                  />
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Votre avis</label>
              <textarea 
                value={newComment.message}
                onChange={(e) => setNewComment({...newComment, message: e.target.value})}
                required
                placeholder="Partagez votre expérience avec ce véhicule..."
              />
            </div>
            
            <button type="submit" className="submit-comment">
              Soumettre l'avis
            </button>
          </form>
        ) : (
          <p className="not-logged">
            Veuillez <a href="/login">vous connecter</a> pour laisser un avis.
          </p>
        )}
      </div>
    </div>
    </>
  );
};

export default CarDetails;