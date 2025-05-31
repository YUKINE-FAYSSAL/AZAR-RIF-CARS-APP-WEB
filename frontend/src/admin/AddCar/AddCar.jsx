// src/admin/AddCar/AddCar.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import './AddCar.css';

const AddCar = ({ onCarAdded }) => {
  const [form, setForm] = useState({
    make: '', model: '', year: '', price: '',
    description: '', transmission: '', fuel: '',
    places: '', gear: '', km: '', is_available: false,
    doors: '', airConditioning: false, type: ''
  });
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState('');

  // Handle text, select, checkbox and radio fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'radio') {
      // "true" or "false" as string, but we'll keep as boolean in state for consistency
      setForm(prev => ({ ...prev, [name]: value === "true" }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle multiple images + preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Generate preview for all images
    const filePreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(filePreviews);
  };

  // Remove image from preview + upload
  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    // Convert boolean is_available to string for backend compatibility
    Object.keys(form).forEach(key => {
      if (key === "is_available" || key === "airConditioning") {
        data.append(key, form[key] ? "true" : "false");
      } else {
        data.append(key, form[key]);
      }
    });
    images.forEach(img => data.append('images', img));

    try {
      await api.post('/cars', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
});
      setMessage('✅ Voiture ajoutée avec succès');
      setForm({
        make: '', model: '', year: '', price: '',
        description: '', transmission: '', fuel: '',
        places: '', gear: '', km: '', is_available: false,
        doors: '', airConditioning: false, type: ''
      });
      setImages([]);
      setPreviews([]);
      if (onCarAdded) onCarAdded();
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout de la voiture');
      console.error(err);
    }
  };

  return (
    <div className="editcar-container">
      <h2>➕ Ajouter une Voiture</h2>
      <form className="editcar-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-row">
          <input className="half" type="text" name="make" placeholder="Marque" value={form.make} onChange={handleChange} required />
          <input className="half" type="text" name="model" placeholder="Modèle" value={form.model} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input className="half" type="number" name="year" placeholder="Année" value={form.year} onChange={handleChange} required />
          <input className="half" type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input className="half" type="number" name="price" placeholder="Prix (MAD/Jour)" value={form.price} onChange={handleChange} required />
          <select className="half" name="transmission" value={form.transmission} onChange={handleChange} required>
            <option value="">-- Transmission --</option>
            <option value="manual">Manuelle</option>
            <option value="automatic">Automatique</option>
          </select>
        </div>
        <div className="form-row">
          <select className="half" name="fuel" value={form.fuel} onChange={handleChange} required>
            <option value="">-- Carburant --</option>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="electrique">Électrique</option>
          </select>
          <input className="half" type="number" name="places" placeholder="Nombre de sièges" value={form.places} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input className="half" type="number" name="doors" placeholder="Nombre de portes" value={form.doors} onChange={handleChange} required />
          <input className="half" type="text" name="gear" placeholder="Type boîte (AUTO/MANUAL)" value={form.gear} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input className="half" type="text" name="km" placeholder="Kilométrage (ex: 27K)" value={form.km} onChange={handleChange} required />
          <input className="half" type="text" name="type" placeholder="Type (SUV, Berline...)" value={form.type} onChange={handleChange} required />
        </div>
        <div className="checkbox-block">
          <input type="checkbox" name="airConditioning" checked={form.airConditioning} onChange={handleChange} />
          <label htmlFor="airConditioning">Climatisation</label>
        </div>
        <div className="form-row">
          <label style={{ marginRight: 12 }}>Disponible :</label>
          <label>
            <input
              type="radio"
              name="is_available"
              value="true"
              checked={form.is_available === true || form.is_available === "true"}
              onChange={handleChange}
            />
            Oui
          </label>
          <label style={{ marginLeft: 14 }}>
            <input
              type="radio"
              name="is_available"
              value="false"
              checked={form.is_available === false || form.is_available === "false"}
              onChange={handleChange}
            />
            Non
          </label>
        </div>

        {/* Zone d’upload stylée */}
        <div className="upload-block">
          <label className="upload-label">
            <span className="upload-btn">
              📷 Choisir des images
            </span>
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Preview images with delete btn */}
        {previews.length > 0 && (
          <div className="editcar-imgs">
            {previews.map((src, idx) => (
              <div className="editcar-img-wrapper" key={idx}>
                <img className="editcar-img" src={src} alt={`Aperçu ${idx}`} />
                <span className="editcar-img-delete" onClick={() => removeImage(idx)}>×</span>
              </div>
            ))}
          </div>
        )}
        <button className="editcar-btn" type="submit">Ajouter la Voiture</button>
        {message && <div className="editcar-msg">{message}</div>}
      </form>
    </div>
  );
};

export default AddCar;
