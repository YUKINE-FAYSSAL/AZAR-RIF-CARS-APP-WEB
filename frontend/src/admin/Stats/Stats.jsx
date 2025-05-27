import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Stats.css';

const Stats = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    rentedCars: 0,
    totalUsers: 0,
    newUsers: 0,
    avgPrice: 0,
    totalContracts: 0,
    recentContracts: 0,
    carTypes: {}
  });
const API_BASE_URL = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/admin/stats`);
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur de chargement des statistiques:', err);
        alert("Erreur de chargement des statistiques. Veuillez vérifier le backend.");
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-stats">
        <h2>📊 Statistiques du Tableau de Bord</h2>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="admin-stats mobile-stats">
        <h2>📊 Tableau de Bord</h2>

        <div className="stats-table-section">
          <h3>🚗 Véhicules</h3>
          <table className="stats-table">
            <tbody>
              <tr><td>Total Voitures</td><td className="highlight">{stats.totalCars}</td></tr>
              <tr><td>Disponibles</td><td className="highlight">{stats.availableCars}</td></tr>
              <tr><td>Louées</td><td className="highlight">{stats.rentedCars}</td></tr>
              <tr><td>Prix Moyen</td><td className="highlight">{stats.avgPrice.toLocaleString()} DH</td></tr>
            </tbody>
          </table>
        </div>

        <div className="stats-table-section">
          <h3>👥 Utilisateurs</h3>
          <table className="stats-table">
            <tbody>
              <tr><td>Total Utilisateurs</td><td className="highlight">{stats.totalUsers}</td></tr>
              <tr><td>Nouveaux (7j)</td><td className="highlight">{stats.newUsers}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="stats-table-section">
          <h3>📄 Contrats</h3>
          <table className="stats-table">
            <tbody>
              <tr><td>Total Contrats</td><td className="highlight">{stats.totalContracts}</td></tr>
              <tr><td>Récents (28j)</td><td className="highlight">{stats.recentContracts}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="stats-table-section">
          <h3>🔠 Types de Véhicules</h3>
          <table className="stats-table">
            <tbody>
              {Object.entries(stats.carTypes).map(([type, count]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td className="highlight">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-stats">
      <h2>📊 Aperçu du Tableau de Bord</h2>

      <div className="stats-section">
        <h3><span className="stat-icon">🚗</span> Véhicules</h3>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">🚗</div><h4>Total Voitures</h4><p>{stats.totalCars}</p></div>
          <div className="stat-card"><div className="stat-icon">✅</div><h4>Disponibles</h4><p>{stats.availableCars}</p></div>
          <div className="stat-card"><div className="stat-icon">⏳</div><h4>Louées</h4><p>{stats.rentedCars}</p></div>
          <div className="stat-card"><div className="stat-icon">💰</div><h4>Prix Moyen</h4><p>{stats.avgPrice.toLocaleString()} DH</p></div>
        </div>
      </div>

      <div className="stats-section">
        <h3><span className="stat-icon">👥</span> Utilisateurs</h3>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">👥</div><h4>Total Utilisateurs</h4><p>{stats.totalUsers}</p></div>
          <div className="stat-card"><div className="stat-icon">🆕</div><h4>Nouveaux (7j)</h4><p>{stats.newUsers}</p></div>
        </div>
      </div>

      <div className="stats-section">
        <h3><span className="stat-icon">📄</span> Contrats</h3>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">📄</div><h4>Total Contrats</h4><p>{stats.totalContracts}</p></div>
          <div className="stat-card"><div className="stat-icon">🕒</div><h4>Récents (28j)</h4><p>{stats.recentContracts}</p></div>
        </div>
      </div>

      <div className="stats-section">
        <h3><span className="stat-icon">🔠</span> Types de Véhicules</h3>
        <div className="type-grid">
          {Object.entries(stats.carTypes).map(([type, count]) => (
            <div className="type-card" key={type}>
              <div className="type-name">{type}</div>
              <div className="type-count">{count}</div>
              <div className="type-bar" style={{ width: `${(count / stats.totalCars) * 100}%` }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;