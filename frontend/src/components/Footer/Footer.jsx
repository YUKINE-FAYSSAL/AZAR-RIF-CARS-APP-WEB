import React from 'react';
import './Footer.css';
import logo from '../../assets/logo/logo.png';

export default function Footer() {
  return (
    <footer className="footer-modern">
      <div className="footer-modern-container">
        {/* Logo + Slogan + Social */}
        <div className="footer-modern-col footer-logo-col">
          <img src={logo} alt="Azaryouh Rif Car Logo" className="footer-modern-logo" />
          <p className="footer-modern-slogan">
            WHEREVER YOU WANNA GO!<br />JUST CLICK AND GO! 😎
          </p>
          <div className="footer-modern-social">
            <a href="https://wa.me/+212661306515" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href="https://www.facebook.com/location.taza/?locale=ar_AR" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://www.instagram.com/azaryouhcar/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
        {/* Contact */}
        <div className="footer-modern-col">
          <h4>Contact</h4>
          <p className="footer-contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>
              Ben Abdellah immo AXA، Rue Ali Ibn Abi Talib Ang, Rue Allal Ben Abdallah, Taza 35000
            </span>
          </p>
          <p className="footer-contact-item">
            <i className="fas fa-phone"></i>
            <a href="tel:+212661306515">+212 661-306515</a>
          </p>
          <p className="footer-contact-item">
            <i className="fas fa-envelope"></i>
            <a href="mailto:azaryouhrif@gmail.com">azaryouhrif@gmail.com</a>
          </p>
          <p className="footer-contact-item">
            <i className="fas fa-globe"></i>
            <a href="http://www.azarcars.com" target="_blank" rel="noopener noreferrer">www.azarcars.com</a>
          </p>
        </div>
        {/* Links */}
        <div className="footer-modern-col">
          <h4>Liens</h4>
          <p><a href="/">Accueil</a></p>
          <p><a href="/services">Nos Services</a></p>
          <p><a href="/about">À propos</a></p>
          <p><a href="/cars">Nos voitures</a></p>
        </div>
        {/* Horaires */}
        <div className="footer-modern-col">
          <h4>Horaires</h4>
          <p>Lundi - Mardi : 8h - 22h</p>
          <p>Mercredi : 8h - 19h</p>
          <p>Vendredi : 7h - 12h</p>
          <p>Samedi : 9h - 20h</p>
          <p>Dimanche : Fermé</p>
        </div>
      </div>
      <div className="footer-modern-bottom">
        &copy; {new Date().getFullYear()} AZARYOUH RIF CAR – Tous droits réservés
      </div>
    </footer>
  );
}
