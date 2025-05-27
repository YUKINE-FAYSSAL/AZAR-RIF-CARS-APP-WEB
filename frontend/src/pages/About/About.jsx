import React from 'react';
import './About.css';
import aboutBanner from '../../assets/about/banner.svg';
import fouadImage from '../../assets/about/profile/profile.jpg';
import { FaBullseye, FaFlag } from 'react-icons/fa';
import { GiCarKey, GiPriceTag, GiProgression, GiHeadphones } from 'react-icons/gi';
import { Helmet } from 'react-helmet-async';


const About = () => {
  return (
    <>
      <Helmet>
        <title>À propos | Taza Rent Car</title>
        <meta name="description" content="Découvrez l'histoire, la mission et l'équipe de Taza Rent Car, votre partenaire de confiance pour la location de voitures à Taza." />
      </Helmet>
    <div className="about-container">
      <header
        className="about-full-header"
        style={{
          backgroundImage: `linear-gradient(rgba(15,34,57,0.55),rgba(15,34,57,0.70)), url(${aboutBanner})`
        }}
      >
        <div className="about-header-content">
          <h1>À Propos de Nous</h1>
          <div className="about-breadcrumbs">
            <a href="/">Accueil</a>
            <span style={{ margin: "0 4px" }}>{'>'}</span>
            <span>À Propos</span>
          </div>
        </div>
      </header>

      <section className="about-intro">
        <h2><span>AZARYOUH</span> RIF CAR</h2>
        <p>
          Leader dans la location de voitures avec plus de 7 ans d'expérience, nous nous engageons à fournir des services de qualité exceptionnelle. 
          Notre flotte moderne et notre service clientèle dédié font de nous le choix idéal pour vos déplacements.
        </p>
        
        <div className="about-cards">
          <div className="about-card">
            <div className="card-icon vision-icon">
              <FaBullseye />
            </div>
            <h3>Notre Vision</h3>
            <p>Transformer l'expérience de location de voitures grâce à l'innovation et un service personnalisé.</p>
          </div>
          <div className="about-card">
            <div className="card-icon mission-icon">
              <FaFlag />
            </div>
            <h3>Notre Mission</h3>
            <p>Offrir des solutions de mobilité flexibles, fiables et accessibles à tous nos clients.</p>
          </div>
        </div>
        
        <div className="about-stats">
          <div>
            <h1>7</h1>
            <p>Années d'Expérience</p>
          </div>
          <ul>
            <li>Véhicules récents et parfaitement entretenus</li>
            <li>Assistance routière disponible 24h/24 et 7j/7</li>
            <li>Options de paiement sécurisées et flexibles</li>
            <li>Service clientèle réactif et attentionné</li>
          </ul>
        </div>
      </section>

      <section className="advantages">
        <h2>Pourquoi Nous <span>Choisir</span>?</h2>
        <div className="advantage-items">
          <div className="advantage-column">
            <div className="advantage-item">
              <div className="advantage-icon">
                <GiProgression />
              </div>
              <h3>Service Premium</h3>
              <p>Un service haut de gamme avec une attention particulière à chaque détail pour votre confort.</p>
            </div>
            <div className="advantage-item">
              <div className="advantage-icon">
                <GiHeadphones />
                {/* أو استعمل FaHeadset إذا بغيتي:
                <FaHeadset />
                */}
              </div>
              <h3>Assistance 24h/24</h3>
              <p>Notre équipe est disponible à tout moment pour vous assister en cas de besoin.</p>
            </div>
          </div>
          <div className="advantage-column">
            <div className="advantage-item">
              <div className="advantage-icon">
                <GiPriceTag />
              </div>
              <h3>Rapport Qualité-Prix</h3>
              <p>Des tarifs compétitifs sans compromis sur la qualité de service ou des véhicules.</p>
            </div>
            <div className="advantage-item">
              <div className="advantage-icon">
                <GiCarKey />
              </div>
              <h3>Prise en Charge Rapide</h3>
              <p>Processus de location simplifié et restitution facile dans nos agences.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-info">
            <div className="profile-image">
              <img src={fouadImage} alt="Fouad Azaryouh" />
            </div>
            <h2>Fouad <span>Azaryouh</span></h2>
            <p className="position">Fondateur & Directeur Général</p>
            <div className="contact-details">
              <p><i className="fas fa-phone"></i> +212 661-383838</p>
              <p><i className="fas fa-envelope"></i> azaryouhrif@gmail.com</p>
              <p><i className="fas fa-map-marker-alt"></i> Ben Abdellah immo AXA, Rue Ali Ibn Abi Talib Ang, Rue Allal Ben Abdallah, Taza 35000</p>
              <p><i className="fas fa-clock"></i> Ouvert 7j/7 de 8h à 20h</p>
            </div>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-whatsapp"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          
          <div className="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3299.057683265979!2d-4.0072575!3d34.2215455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd9e1712554bf99f%3A0xc75a4904f63ba2d0!2sAZARYOUH%20RIF%20CAR!5e0!3m2!1sfr!2sma!4v1747875964526!5m2!1sfr!2sma" 
              width="100%" 
              height="100%" 
              style={{border:0}} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation de notre agence AZARYOUH RIF CAR">
            </iframe>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default About;
