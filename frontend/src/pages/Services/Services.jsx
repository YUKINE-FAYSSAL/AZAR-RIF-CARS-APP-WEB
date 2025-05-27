import React, { useEffect, useState } from 'react';
import './Services.css';
import CarCard from '../../components/CarCard/CarCard';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import api from '../../services/api';
import { Helmet } from 'react-helmet-async';

import img1 from '../../assets/services/gallery/1.jpg';
import img2 from '../../assets/services/gallery/2.jpg';
import img3 from '../../assets/services/gallery/3.jpg';
import img4 from '../../assets/services/gallery/4.jpg';
import img5 from '../../assets/services/gallery/5.jpg';
import img6 from '../../assets/services/gallery/6.jpg';

const servicesData = [
  {
    title: "🚗 Location de Voitures",
    description: "Large gamme de véhicules pour tous les besoins et budgets, avec des options de livraison flexible.",
    features: ["Voitures économiques", "Véhicules familiaux", "Voitures de luxe", "4x4 et SUV"]
  },
  {
    title: "✈️ Transfert Aéroport",
    description: "Service de transfert professionnel depuis et vers tous les aéroports du Maroc.",
    features: ["Ponctualité garantie", "Conducteurs professionnels", "Voitures confortables", "Prix fixes"]
  },
  {
    title: "🏨 Location Longue Durée",
    description: "Solutions de location mensuelle avec des tarifs avantageux pour les séjours prolongés.",
    features: ["Réductions mensuelles", "Entretien inclus", "Assurance complète", "Flexibilité"]
  },
  {
    title: "🛣️ Location Voyage",
    description: "Location spécialement conçue pour vos voyages avec kilométrage illimité.",
    features: ["Kilométrage illimité", "Assurance tous risques", "Assistance 24h", "Options GPS"]
  },
  {
    title: "👨‍👩‍👧‍👦 Location Familiale",
    description: "Véhicules spacieux et sécurisés adaptés aux besoins des familles.",
    features: ["Sièges enfants gratuits", "Grand coffre", "Climatisation", "GPS inclus"]
  },
  {
    title: "🏖️ Location Vacances",
    description: "Packages tout compris pour des vacances en toute liberté à travers le Maroc.",
    features: ["Kilométrage illimité", "Assurance tous risques", "Assistance 24h", "Options GPS"]
  }
];

const benefits = [
  {
    icon: "🏆",
    title: "7 Ans d'Expérience",
    description: "Une expertise solide dans la location de voitures au Maroc"
  },
  {
    icon: "🛡️",
    title: "Assurance Complète",
    description: "Tous nos véhicules sont assurés tous risques avec franchise réduite"
  },
  {
    icon: "💎",
    title: "Service Premium",
    description: "Des véhicules neufs et un service client disponible 24h/24"
  },
  {
    icon: "💰",
    title: "Meilleur Prix Garanti",
    description: "Nous vous garantissons les meilleurs prix du marché"
  }
];

const serviceImages = [
  { img: img1, title: "Service Premium" },
  { img: img2, title: "Voitures de Luxe" },
  { img: img3, title: "Transfert Aéroport" },
  { img: img4, title: "Location Familiale" },
  { img: img5, title: "Service Client" },
  { img: img6, title: "" }
];

function Services() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const response = await api.get('/api/cars');
        const cars = response.data;
        const availableCars = cars.filter(car => car.is_available).slice(0, 6);
        setFeaturedCars(availableCars);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cars:", error);
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(3, featuredCars.length),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, featuredCars.length),
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const gallerySettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Services | Taza Rent Car</title>
        <meta name="description" content="Découvrez tous nos services : location de voitures, transferts vers l'aéroport, assistance routière et bien plus." />
      </Helmet>
    <div className="services-container">
      {/* Updated Header Banner */}
<>
  <header className="services-full-header">
    <div className="services-header-content">
      <h1>Nos Services</h1>
      <div className="services-breadcrumbs">
        <a href="/">Accueil</a>
        <span style={{ margin: "0 4px" }}>{'>'}</span>
        <a href="/services">Services</a>
      </div>
    </div>
  </header>

  <div className="services-container">
    {/* ... le reste du contenu ... */}
  </div>
</>




      <section className="services-intro-section">
        <h2 className="services-title">Découvrez Nos <span>Services</span></h2>
        <p className="services-intro">
          Chez Taza Rent Car, nous nous engageons à fournir des services de location de voitures de qualité supérieure 
          avec une transparence totale, une flexibilité maximale et un service client exceptionnel. Découvrez notre gamme 
          complète de services conçus pour répondre à tous vos besoins de mobilité.
        </p>
      </section>

      <div className="services-grid">
        {servicesData.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon">{service.title.split(' ')[0]}</div>
            <div className="service-content">
              <h3>{service.title.split(' ').slice(1).join(' ')}</h3>
              <p>{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Cars Slider */}
      <div className="featured-cars-section">
        <h2 className="section-title">Nos Véhicules <span>Disponibles</span></h2>
        {loading ? (
          <div className="loading-cars">Chargement des véhicules...</div>
        ) : featuredCars.length > 0 ? (
          <div className="cars-slider-container">
            <Slider {...sliderSettings} className="cars-slider">
              {featuredCars.map((car) => (
                <div key={car._id} className="slider-item">
                  <CarCard car={car} />
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <div className="no-cars">Aucun véhicule disponible pour le moment</div>
        )}
      </div>

      <div className="why-choose-us">
        <h2>Pourquoi Choisir Taza Rent Car ?</h2>
        <div className="benefits-container">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Updated Gallery Section */}
      <div className="images-zone">
        <h2 className="section-title">Galerie de Nos Services</h2>
        <div className="gallery-slider-container">
          <Slider {...gallerySettings} className="gallery-slider">
            {serviceImages.map((s, i) => (
              <div key={i} className="gallery-slide">
                <div className="gallery-image-wrapper">
                  <img src={s.img} alt={s.title} />
                  <div className="gallery-caption">{s.title}</div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
    </>
  );
}

export default Services;