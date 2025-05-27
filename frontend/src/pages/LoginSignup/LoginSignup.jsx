import React, { useState } from 'react';
import api from '../../services/api';
import './LoginSignup.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/logo.png';
import { Helmet } from 'react-helmet-async';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // LOGIN b EMAIL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        // LOGIN avec email (not username)
        const res = await api.post('/api/login', {
          email: formData.email,
          password: formData.password
        }, { withCredentials: true });
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur de connexion');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }
      // 1. Envoyer le code (signup)
      try {
        await api.post('/api/send-verification-code', {
          email: formData.email
        });
        // Naviguer vers page vérification code (signup step 2)
        navigate('/verify-email', { state: { email: formData.email, formData } });
      } catch (err) {
        setError("Erreur lors de l’envoi du code");
      }
    }
  };

  return (
     <>
      <Helmet>
        <title>Connexion / Inscription | Taza Rent Car</title>
        <meta name="description" content="Connectez-vous ou créez un compte pour gérer vos réservations, consulter votre profil et profiter de nos services de location." />
      </Helmet>
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
        {error && <p className="error">{error}</p>}

        {/* LOGIN/REGISTER : email obligatoire */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* SIGNUP ONLY */}
        {!isLogin && (
          <>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmer mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="text"
              name="fullName"
              placeholder="Nom complet"
              value={formData.fullName}
              onChange={handleChange}
            />
          </>
        )}

        <button type="submit">
          {isLogin ? 'Se connecter' : "Envoyer le code"}
        </button>

        <p className="toggle-link" onClick={() => {
          setIsLogin(!isLogin);
          setError('');
        }}>
          {isLogin ? "Pas encore de compte ? S’inscrire" : "Déjà inscrit ? Connexion"}
        </p>
      </form>
    </div>
    </>
  );
};

export default LoginSignup;
