import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './EditCar.css';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get(`/api/car/${id}`)
      .then(res => {
        setForm({
          ...res.data.car,
          is_available: res.data.car.is_available === true || res.data.car.is_available === "true"
        });
        setImages(res.data.car.images || []);
      })
      .catch(() => setMsg("Erreur de chargement"));
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === "radio") {
      setForm(f => ({ ...f, [name]: value === "true" }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleFile(e) {
    const newFiles = Array.from(e.target.files);
    setImages(prev => [...prev, ...newFiles]);
  }

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "is_available" || k === "airConditioning") {
        formData.append(k, v ? "true" : "false");
      } else {
        formData.append(k, v);
      }
    });

    for (let img of images) {
      if (img instanceof File) {
        formData.append("images", img);
      } else {
        formData.append("old_images", img);
      }
    }

    try {
      await api.put(`/api/car/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMsg("✅ Voiture modifiée !");
      setTimeout(() => navigate("/admin/dashboard/cars"), 1000);
    } catch {
      setMsg("❌ Erreur lors de la modification !");
    }
  }

  if (!form) return (
    <div className="editcar-container">
      <h2>Modifier la voiture</h2>
      <div>Chargement…</div>
    </div>
  );

  let transmissionValue = "";
  if (form.transmission) {
    if (["automatic", "automatique"].includes(form.transmission.toLowerCase())) {
      transmissionValue = "automatic";
    } else if (["manual", "manuelle"].includes(form.transmission.toLowerCase())) {
      transmissionValue = "manual";
    }
  }

  return (
    <div className="editcar-container">
      <h2>✏️ Modifier la Voiture</h2>
      <form className="editcar-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-row">
          <input className="half" name="make" placeholder="Marque" value={form.make || ""} onChange={handleChange} required />
          <input className="half" name="model" placeholder="Modèle" value={form.model || ""} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input className="half" name="year" type="number" placeholder="Année" value={form.year || ""} onChange={handleChange} required />
          <input className="half" name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input className="half" name="price" type="number" placeholder="Prix (MAD/Jour)" value={form.price || ""} onChange={handleChange} required />
          <select className="half" name="transmission" value={transmissionValue} onChange={handleChange} required>
            <option value="">-- Transmission --</option>
            <option value="automatic">Automatique</option>
            <option value="manual">Manuelle</option>
          </select>
        </div>
        <div className="form-row">
          <select className="half" name="fuel" value={form.fuel || ""} onChange={handleChange} required>
            <option value="">-- Carburant --</option>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="electrique">Électrique</option>
          </select>
          <input className="half" name="places" type="number" placeholder="Nombre de sièges" value={form.places || ""} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input className="half" name="doors" type="number" placeholder="Nombre de portes" value={form.doors || ""} onChange={handleChange} required />
          <input className="half" name="gear" placeholder="Type boîte (AUTO/MANUAL)" value={form.gear || ""} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <input className="half" name="km" placeholder="Kilométrage (ex: 27K)" value={form.km || ""} onChange={handleChange} required />
          <input className="half" name="type" placeholder="Type (SUV, Berline...)" value={form.type || ""} onChange={handleChange} required />
        </div>
        <div className="checkbox-block">
          <input type="checkbox" name="airConditioning" checked={!!form.airConditioning} onChange={handleChange} />
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
        <div className="upload-block">
          <label className="upload-label">
            <span className="upload-btn">📷 Ajouter des images</span>
            <input type="file" multiple accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          </label>
        </div>
        {images.length > 0 && (
          <div className="editcar-imgs">
            {images.map((img, i) => (
              <div key={i} className="editcar-img-wrapper">
                <span className="editcar-img-delete" onClick={() => handleRemoveImage(i)}>✖</span>
                <img
                  src={
                    img instanceof File
                      ? URL.createObjectURL(img)
                      : img.startsWith("/")
                        ? `${process.env.REACT_APP_API_URL}${img}`
                        : `${process.env.REACT_APP_API_URL}/api/car/${id}/images/${img}`
                  }
                  alt="img"
                  className="editcar-img"
                />
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="editcar-btn">Enregistrer</button>
        {msg && <div className="editcar-msg">{msg}</div>}
      </form>
    </div>
  );
}
