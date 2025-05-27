import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Profile.css';
import { Helmet } from 'react-helmet-async';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    full_name: ''
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL;


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/user/profile');
        setUserData(response.data);
        setFormData({
          email: response.data.email || '',
          phone: response.data.phone || '',
          full_name: response.data.full_name || ''
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/user/profile', formData);
      setUserData(prev => ({
        ...prev,
        email: formData.email,
        phone: formData.phone,
        full_name: formData.full_name
      }));
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
     <>
      <Helmet>
        <title>Mon profil | Taza Rent Car</title>
        <meta name="description" content="Consultez et gérez votre profil client, suivez vos réservations de voitures et mettez à jour vos informations personnelles." />
      </Helmet>
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-avatar">
            <img 
  src={
    userData.profile_img
      ? `${API_BASE_URL}${userData.profile_img}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=f43f5e&color=fff&rounded=true&size=150`
  }
/>

          </div>
          
          {editMode ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              <h2>{userData.username}</h2>
              <p><strong>Email:</strong> {userData.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> {userData.phone || 'Not provided'}</p>
              <p><strong>Full Name:</strong> {userData.full_name || 'Not provided'}</p>
              <p><strong>Member since:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
              
              <div className="profile-actions">
                <button 
                  className="edit-profile-btn"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Profile;
