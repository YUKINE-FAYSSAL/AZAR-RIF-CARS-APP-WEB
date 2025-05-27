import React, { useState } from 'react';
import api from '../../services/api';
import './VerifyEmail.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import logo from '../../assets/logo/logo.png';
import { Helmet } from 'react-helmet-async';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const formData = location.state?.formData;

  const handleVerify = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/api/verify-code', { email, code });
      
      // If verification is successful, proceed with signup
      const res = await api.post('/api/signup', {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        full_name: formData.fullName
      });
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsVerified(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError("Code invalide ou expiré");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    try {
      await api.post('/api/send-verification-code', { email });
      setError(''); // Clear any previous errors
    } catch (err) {
      setError("Erreur lors de l'envoi du code. Veuillez réessayer.");
    }
  };

  return (
     <>
      <Helmet>
        <title>Vérification email | Taza Rent Car</title>
        <meta name="description" content="Vérifiez votre adresse email pour sécuriser votre compte et accéder à tous les services Taza Rent Car." />
      </Helmet>
    <div className="verify-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      {isVerified ? (
        <>
          <div className="verification-icon">
            <FaCheckCircle />
          </div>
          <h2>Vérification réussie!</h2>
          <p>Votre compte a été créé avec succès.</p>
          <p>Redirection en cours...</p>
        </>
      ) : (
        <>
          <div className="verification-icon">
            <FaEnvelope />
          </div>
          <h2>Vérification de votre email</h2>
          <p>
            Nous avons envoyé un code de vérification à : <br />
            <strong>{email}</strong>
          </p>

          <input
            type="text"
            placeholder="Entrez le code à 6 chiffres"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength="6"
          />

          {error && <p className="error">{error}</p>}

          <button onClick={handleVerify} disabled={isLoading}>
            {isLoading ? 'Vérification...' : 'Vérifier'}
          </button>

          <p className="resend-link" onClick={handleResendCode}>
            Vous n'avez pas reçu de code ? Renvoyer
          </p>
        </>
      )}
    </div>
    </>
  );
}