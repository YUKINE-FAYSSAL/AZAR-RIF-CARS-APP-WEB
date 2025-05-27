// src/admin/Reservations/Reservations.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './Reservations.css';

// Navbar principales (أنواع الحجوزات)
const NAVS = [
  { key: 'car', label: 'Locations voitures 🚗' },
  { key: 'transport', label: "Transports aéroport 🚌" }
];

// Tabs فرعية (الحالات)
const STATUS_TABS = [
  { key: 'pending', label: 'En attente 🕒' },
  { key: 'accepted', label: 'Acceptées ✅' },
  { key: 'rejected', label: 'Refusées ❌' }
];

const Reservations = () => {
  const [activeTab, setActiveTab] = useState('car'); // 'car' or 'transport'
  const [activeStatus, setActiveStatus] = useState('pending'); // 'pending', 'accepted', 'rejected'
  const [reservations, setReservations] = useState({
    car: { pending: [], accepted: [], rejected: [] },
    transport: { pending: [], accepted: [], rejected: [] }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/admin/reservations');
      const all = res.data;
      // قسم كل نوع على حسب الحالة
      const cars = all.filter(r => r.type !== 'transport' && r.type !== 'airport');
      const transports = all.filter(r => r.type === 'transport' || r.type === 'airport');

      setReservations({
        car: {
          pending: cars.filter(r => r.status === 'en attente'),
          accepted: cars.filter(r => r.status === 'acceptée'),
          rejected: cars.filter(r => r.status === 'refusée')
        },
        transport: {
          pending: transports.filter(r => r.status === 'en attente'),
          accepted: transports.filter(r => r.status === 'acceptée'),
          rejected: transports.filter(r => r.status === 'refusée')
        }
      });
    } catch (err) {
      console.error("Error fetching reservations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put('/api/admin/reservations', {
        reservation_id: id,
        status: status
      });
      await fetchReservations();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleDateString('fr-FR', options);
  };

  // === TABLES ===

// Table Locations Voitures
const TableCars = ({ list }) => (
  <>
    <div className="reservation-cards">
      {list.map(r => (
        <div key={r._id} className="reservation-card">
          <div className="card-row"><span className="card-label">Voiture</span><span className="card-value">{r.car_id}</span></div>
          <div className="card-row"><span className="card-label">Nom complet</span><span className="card-value">{r.full_name || '-'}</span></div>
          <div className="card-row"><span className="card-label">Email</span><span className="card-value">{r.email || '-'}</span></div>
          <div className="card-row"><span className="card-label">Téléphone</span><span className="card-value">{r.phone || '-'}</span></div>
          <div className="card-row"><span className="card-label">Ville</span><span className="card-value">{r.ville || '-'}</span></div>
          <div className="card-row"><span className="card-label">Période</span>
            <span className="card-value">{formatDate(r.start_date)} - {formatDate(r.end_date)}</span>
          </div>
          <div className="card-row"><span className="card-label">Statut</span>
            <span className="card-value">
              {r.status !== 'en attente' ? (
                <span className={`statut ${r.status.replace(' ', '.')}`}>{r.status}</span>
              ) : <span>En attente</span>}
            </span>
          </div>
          {r.status === 'en attente' && (
            <div className="card-actions">
              <button className="btn-accept" onClick={() => updateStatus(r._id, 'acceptée')}>✓ Accepter</button>
              <button className="btn-refuse" onClick={() => updateStatus(r._id, 'refusée')}>✗ Refuser</button>
            </div>
          )}
          {r.status === 'refusée' && (
            <div className="card-actions">
              <button className="btn-accept" onClick={() => updateStatus(r._id, 'acceptée')}>✓ Accepter</button>
            </div>
          )}
        </div>
      ))}
    </div>
    <table className="reservation-table">
      <thead>
        <tr>
          <th>Voiture</th>
          <th>Nom complet</th>
          <th>Email</th>
          <th>Téléphone</th>
          <th>Ville</th>
          <th>Période</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        {list.map(r => (
          <tr key={r._id}>
            <td>{r.car_name }</td>
            <td>{r.full_name || '-'}</td>
            <td>{r.email || '-'}</td>
            <td>{r.phone || '-'}</td>
            <td>{r.ville || '-'}</td>
            <td>{formatDate(r.start_date)} - {formatDate(r.end_date)}</td>
            <td>
              {r.status === 'en attente' ? (
                <div className="actions-cell">
                  <button className="btn-accept" onClick={() => updateStatus(r._id, 'acceptée')}>✓</button>
                  <button className="btn-refuse" onClick={() => updateStatus(r._id, 'refusée')}>✗</button>
                </div>
              ) : r.status === 'refusée' ? (
                <div className="actions-cell">
                  <button className="btn-accept" onClick={() => updateStatus(r._id, 'acceptée')}>✓</button>
                </div>
              ) : (
                <span className={`statut ${r.status.replace(' ', '.')}`}>{r.status}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);


// Table Transport aéroport
const TableTransport = ({ list }) => (
  <>
    <div className="reservation-cards">
      {list.map(t => (
        <div key={t._id} className="reservation-card">
          <div className="card-row"><span className="card-label">Nom complet</span><span className="card-value">{t.full_name || '-'}</span></div>
          <div className="card-row"><span className="card-label">Email</span><span className="card-value">{t.email || '-'}</span></div>
          <div className="card-row"><span className="card-label">Téléphone</span><span className="card-value">{t.phone || '-'}</span></div>
          <div className="card-row"><span className="card-label">Ville</span><span className="card-value">{t.ville || '-'}</span></div>
          <div className="card-row"><span className="card-label">Aéroport</span><span className="card-value">{t.aeroport || '-'}</span></div>
          <div className="card-row"><span className="card-label">Date</span><span className="card-value">{formatDate(t.date)}</span></div>
          <div className="card-row"><span className="card-label">Statut</span>
            <span className="card-value">
              {t.status !== 'en attente' ? (
                <span className={`statut ${t.status.replace(' ', '.')}`}>{t.status}</span>
              ) : <span>En attente</span>}
            </span>
          </div>
          {t.status === 'en attente' && (
            <div className="card-actions">
              <button className="btn-accept" onClick={() => updateStatus(t._id, 'acceptée')}>✓ Accepter</button>
              <button className="btn-refuse" onClick={() => updateStatus(t._id, 'refusée')}>✗ Refuser</button>
            </div>
          )}
          {t.status === 'refusée' && (
            <div className="card-actions">
              <button className="btn-accept" onClick={() => updateStatus(t._id, 'acceptée')}>✓ Accepter</button>
            </div>
          )}
        </div>
      ))}
    </div>
    <table className="reservation-table transport-table">
      <thead>
        <tr>
          <th>Nom complet</th>
          <th>Email</th>
          <th>Téléphone</th>
          <th>Ville</th>
          <th>Aéroport</th>
          <th>Date</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        {list.map(t => (
          <tr key={t._id}>
            <td>{t.full_name || '-'}</td>
            <td>{t.email || '-'}</td>
            <td>{t.phone || '-'}</td>
            <td>{t.ville || '-'}</td>
            <td>{t.aeroport || '-'}</td>
            <td>{formatDate(t.date)}</td>
            <td>
              {t.status === 'en attente' ? (
                <div className="actions-cell">
                  <button className="btn-accept" onClick={() => updateStatus(t._id, 'acceptée')}>✓</button>
                  <button className="btn-refuse" onClick={() => updateStatus(t._id, 'refusée')}>✗</button>
                </div>
              ) : (
                <span className={`statut ${t.status.replace(' ', '.')}`}>{t.status}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);



  // ========== RENDER ==========
  return (
    <div className="reservation-page">
      {/* Navbar نوع الحجز */}
      <div className="mini-navbar">
        {NAVS.map(n => (
          <button
            key={n.key}
            className={`mini-nav-btn${activeTab === n.key ? ' active' : ''}`}
            onClick={() => { setActiveTab(n.key); setActiveStatus('pending'); }}
          >
            {n.label}
          </button>
        ))}
      </div>
      {/* Navbar الحالة */}
      <div className="mini-navbar">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            className={`mini-nav-btn${activeStatus === tab.key ? ' active' : ''}`}
            onClick={() => setActiveStatus(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <h2>
        <span role="img" aria-label="Reservations">📋</span>
        {(activeTab === 'car' ? "Réservations voitures" : "Transports aéroport") +
          " — " + STATUS_TABS.find(t => t.key === activeStatus).label}
      </h2>
      {isLoading ? (
        <div className="empty-state">Chargement en cours...</div>
      ) : (
        <>
          {activeTab === 'car'
            ? (
              reservations.car[activeStatus].length > 0
                ? <TableCars list={reservations.car[activeStatus]} />
                : <div className="empty-state">Aucune réservation voiture {STATUS_TABS.find(t => t.key === activeStatus).label.toLowerCase()}</div>
            )
            : (
              reservations.transport[activeStatus].length > 0
                ? <TableTransport list={reservations.transport[activeStatus]} />
                : <div className="empty-state">Aucun transport aéroport {STATUS_TABS.find(t => t.key === activeStatus).label.toLowerCase()}</div>
            )
          }
        </>
      )}
    </div>
  );
};

export default Reservations;
