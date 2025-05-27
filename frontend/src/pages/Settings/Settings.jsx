import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./Settings.css";
import { Helmet } from 'react-helmet-async';
const TABS = ["profile", "password"];

export default function Settings() {
  const [user, setUser] = useState({});
  const [profileMsg, setProfileMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    api
      .get("/api/user/profile")
      .then(res => setUser(res.data))
      .catch(() => {});
  }, []);

  // ----------- Profile Tab
  function ProfileTab() {
    const [form, setForm] = useState(user || {});
    const [file, setFile] = useState(null);

    useEffect(() => {
      setForm(user || {});
    }, [user]);

    function handleFile(e) {
      setFile(e.target.files[0]);
    }

    function handleChange(e) {
      setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSaveProfile(e) {
      e.preventDefault();
      try {
        const formData = new FormData();
        formData.append("email", form.email || "");
        formData.append("phone", form.phone || "");
        formData.append("full_name", form.full_name || "");
        if (file) formData.append("profile_img", file);

        const res = await api.put("/api/user/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        setProfileMsg("Profil modifié avec succès.");
        setTimeout(() => setProfileMsg(""), 1700);
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data)); // ضروري

      } catch {
        setProfileMsg("Erreur lors de la modification du profil.");
      }
    }

    return (
          
      <form className="settings-section" onSubmit={handleSaveProfile}>
        <div className="profile-img-block">
          <img
            src={
              user.profile_img
                ? `${API_BASE_URL}${user.profile_img}`
                : "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(form.username || "")
            }
            alt="profile"
            className="profile-img"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            id="profile-pic-upload"
            style={{ display: "none" }}
          />
          <label htmlFor="profile-pic-upload" className="profile-upload-btn">
            Choisir une image
          </label>
        </div>

        <label>
          Nom d'utilisateur
          <input
            type="text"
            name="username"
            value={form.username || ""}
            onChange={handleChange}
            disabled
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Téléphone
          <input
            type="text"
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="settings-save-btn">
          Enregistrer les modifications
        </button>
        {profileMsg && (
          <div className="settings-msg" style={{ color: "#25c342" }}>
            {profileMsg}
          </div>
        )}
      </form>
    );
  }

  // ----------- Password Tab
  function PasswordTab() {
    const [form, setForm] = useState({
      current_password: "",
      new_password: "",
      confirm_password: ""
    });

    function handleChange(e) {
      setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSavePw(e) {
      e.preventDefault();
      setPwMsg("");

      if (!form.new_password || form.new_password !== form.confirm_password) {
        setPwMsg("Mot de passe invalide ou non confirmé.");
        return;
      }

      try {
        await api.post("/api/user/change-password", form);
        setPwMsg("Mot de passe modifié avec succès.");
        setForm({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
      } catch (err) {
        setPwMsg(
          err.response?.data?.error || "Erreur lors du changement de mot de passe."
        );
      }
    }

    return (
      <form className="settings-section" onSubmit={handleSavePw}>
        <label>
          Mot de passe actuel
          <input
            type="password"
            name="current_password"
            value={form.current_password}
            onChange={handleChange}
          />
        </label>
        <label>
          Nouveau mot de passe
          <input
            type="password"
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
          />
        </label>
        <label>
          Confirmer le mot de passe
          <input
            type="password"
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
          />
        </label>
        <button type="submit" className="settings-save-btn">
          Changer le mot de passe
        </button>
        {pwMsg && (
          <div
            className="settings-msg"
            style={{
              color: pwMsg === "Mot de passe modifié avec succès." ? "#25c342" : "#e30613"
            }}
          >
            {pwMsg}
          </div>
        )}
      </form>
    );
  }

  return (
    <>
      <Helmet>
        <title>Paramètres | Taza Rent Car</title>
        <meta name="description" content="Modifiez vos paramètres de compte, préférences et sécurité sur Taza Rent Car." />
      </Helmet>
    <div className="settings-layout">
      <aside className="settings-sidebar">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`sidebar-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "profile" ? "Profil" : "Mot de passe"}
          </button>
        ))}
      </aside>
      <section className="settings-main">
        <h2>Paramètres</h2>
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "password" && <PasswordTab />}
      </section>
    </div>
    </>
  );
}
