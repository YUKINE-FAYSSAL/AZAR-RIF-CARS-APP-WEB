import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from "react-helmet-async";
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Cars from './pages/Cars/Cars';
import CarDetails from './pages/CarDetails/CarDetails';
import LoginSignup from './pages/LoginSignup/LoginSignup';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Services from './pages/Services/Services';
import EditCar from './admin/EditCar/EditCar';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import Footer from './components/Footer/Footer';
import "./App.css";

// ADMIN
import Dashboard from './admin/Dashboard/Dashboard';
import AdminCars from './admin/Cars/AdminCars';
import AddCar from './admin/AddCar/AddCar';
import AdminUsers from './admin/Users/Users';
import AdminStats from './admin/Stats/Stats';
import AdminContrats from './admin/Contrats/Contrats';
import Reservations from './admin/Reservations/Reservations';

// Supprimer axios (on utilise api.js maintenant)

// 🛑 Dev warnings silencieux
if (process.env.NODE_ENV === "development") {
  const suppressedWarnings = [
    "Failed to parse source map",
    "ResizeObserver loop completed with undelivered notifications",
    "ResizeObserver loop limit exceeded"
  ];
  const realConsoleError = console.error;
  console.error = (...args) => {
    if (
      args.length > 0 &&
      suppressedWarnings.some(entry => args[0]?.toString().includes(entry))
    ) {
      return;
    }
    realConsoleError(...args);
  };
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<Dashboard />}>
            <Route path="cars" element={<AdminCars />} />
            <Route path="add-car" element={<AddCar />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="contrats" element={<AdminContrats />} />
            <Route path="reservations" element={<Reservations />} />
          </Route>

          <Route path="/admin/dashboard/edit-car/:id" element={<EditCar />} />
        </Routes>
        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;
