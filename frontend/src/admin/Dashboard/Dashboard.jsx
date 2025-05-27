import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Stats from '../Stats/Stats';
import './Dashboard.css';

const Dashboard = () => {
  const location = useLocation();

  // Check if we're at the root dashboard path
  const isRootDashboard = location.pathname === '/admin/dashboard' || 
                         location.pathname === '/admin/dashboard/';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <ul>
            <li><Link to="/admin/dashboard">📊 Dashboard</Link></li>
            <li><Link to="/admin/dashboard/cars">🚗 Voitures</Link></li>
            <li><Link to="/admin/dashboard/add-car">➕ Ajouter Voiture</Link></li>
            <li><Link to="/admin/dashboard/users">👤 Utilisateurs</Link></li>
            <li><Link to="/admin/dashboard/contrats">📁 Les Contrats</Link></li>
<li><Link to="/admin/dashboard/reservations">📝 Réservations</Link></li>

            <li><Link to="/">↩️ Retour au site</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        {isRootDashboard ? <Stats /> : <Outlet />}
      </main>
    </div>
  );
};

export default Dashboard;