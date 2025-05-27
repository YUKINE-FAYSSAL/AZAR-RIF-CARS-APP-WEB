import React, { useEffect, useState, useRef } from 'react';
import './Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo/logo.png';


function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    setMobileDropdownOpen(false);
    setDesktopDropdownOpen(false);
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setMobileDropdownOpen(false);
      }
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target)) {
        setDesktopDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setMobileDropdownOpen(false);
    setDesktopDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header>
      {/* TOP BAR */}
      <div className="nav-topbar">
        <div className="nav-topbar-left">
          <span className="nav-topbar-email">
            <i className="fas fa-envelope nav-desktop-icon"></i>
            <a href="mailto:azaryouhrif@gmail.com">azaryouhrif@gmail.com</a>
          </span>
          <span className="nav-topbar-phone">
            <i className="fas fa-phone nav-desktop-icon"></i>
            <a href="tel:+212661306515">+212-661-306515</a>
          </span>
        </div>
        <div className="nav-topbar-right">
          <div className="nav-social-icons">
            <a 
              href="https://api.whatsapp.com/send/?phone=%2B212661306515&text&type=phone_number&app_absent=0" 
              className="nav-social-btn whatsapp" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="WhatsApp"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
            <a 
              href="https://www.instagram.com/azaryouhcar/" 
              className="nav-social-btn insta" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a 
              href="https://www.facebook.com/location.taza" 
              className="nav-social-btn facebook" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
          </div>
          
          {/* Mobile profile/login */}
          <div className="nav-mobile-login">
            {!user ? (
              <Link to="/login" className="nav-mobile-login-btn">
                <i className="fas fa-sign-in-alt"></i>
              </Link>
            ) : (
              <div style={{ position: 'relative' }} ref={mobileDropdownRef}>
                <button
                  className="nav-mobile-login-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileDropdownOpen(!mobileDropdownOpen);
                  }}
                  aria-label="User menu"
                >
                  <img
                    src={
                      user.profile_img
                        ? `${API_BASE_URL}${user.profile_img}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=f43f5e&color=fff&rounded=true&size=50`
                    }
                    alt="profile"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </button>
                {mobileDropdownOpen && (
                  <div 
                    className="nav-dropdown-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to="/profile"
                      onClick={() => {
                        setMobileDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className={isActive('/profile')}
                    >
                      <i className="fas fa-user"></i> Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => {
                        setMobileDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className={isActive('/settings')}
                    >
                      <i className="fas fa-cog"></i> Settings
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="nav-main">
<Link to="/" className="nav-logo">
  <img src={logo} alt="Taza RentCar" className="navbar-logo-img" />
</Link>

        
        <button 
          className="nav-mobile-menu-btn" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        <div className={`nav-content ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li>
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className={isActive('/')}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/cars" 
                onClick={() => setIsMenuOpen(false)}
                className={isActive('/cars')}
              >
                Our Cars
              </Link>
            </li>
            <li>
              <Link 
                to="/services" 
                onClick={() => setIsMenuOpen(false)}
                className={isActive('/services')}
              >
                Services
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                onClick={() => setIsMenuOpen(false)}
                className={isActive('/about')}
              >
                About
              </Link>
            </li>
            {user && user.role === 'admin' && (
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-admin-btn ${isActive('/admin/dashboard')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link>
              </li>
            )}
          </ul>

          {/* Profile / Login Desktop */}
          <div className="nav-desktop-login" ref={desktopDropdownRef}>
            {!user ? (
              <Link to="/login" className="nav-login-btn">
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
            ) : (
              <div className="nav-profile-dropdown">
                <button
                  className="nav-profile-btn"
                  onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                  aria-label="User menu"
                  aria-expanded={desktopDropdownOpen}
                >
                  <img
                    src={
                      user.profile_img
                        ? `${API_BASE_URL}${user.profile_img}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=f43f5e&color=fff&rounded=true&size=38`
                    }
                    alt="profile"
                    className="nav-profile-avatar"
                  />
                  <span className="nav-profile-name">{user.username}</span>
                  <i className={`fas fa-caret-down ${desktopDropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {desktopDropdownOpen && (
                  <div 
                    className="nav-dropdown-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link 
                      to="/profile" 
                      onClick={() => {
                        setDesktopDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className={isActive('/profile')}
                    >
                      <i className="fas fa-user"></i> Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      onClick={() => {
                        setDesktopDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className={isActive('/settings')}
                    >
                      <i className="fas fa-cog"></i> Settings
                    </Link>
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay (Mobile Drawer) */}
      {isMenuOpen && (
        <div
          className="nav-drawer-overlay"
          onClick={() => {
            setIsMenuOpen(false);
            setMobileDropdownOpen(false);
            setDesktopDropdownOpen(false);
          }}
        ></div>
      )}
    </header>
  );
}

export default Navbar;