// Havalimanı Valiz Yönetimi Sistemi - React Frontend Kodu

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [valizler, setValizler] = useState([]);
  const [formData, setFormData] = useState({ yolcu_id: '', agirlik: '', boyutlar: '', durum: '' });

  // Valizleri yükle
  useEffect(() => {
    fetchValizler();
  }, []);

  const fetchValizler = async () => {
    try {
      const response = await axios.get('/api/valizler');
      setValizler(response.data);
    } catch (error) {
      console.error('Valizleri yüklerken hata oluştu:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/valiz/ekle', formData);
      fetchValizler(); // Verileri yenile
      setFormData({ yolcu_id: '', agirlik: '', boyutlar: '', durum: '' });
    } catch (error) {
      console.error('Valiz eklerken hata oluştu:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Havalimanı Valiz Yönetimi</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Yolcu ID:
            <input
              type="number"
              name="yolcu_id"
              value={formData.yolcu_id}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Ağırlık:
            <input
              type="text"
              name="agirlik"
              value={formData.agirlik}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Boyutlar:
            <input
              type="text"
              name="boyutlar"
              value={formData.boyutlar}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Durum:
            <input
              type="text"
              name="durum"
              value={formData.durum}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Valiz Ekle</button>
        </form>

        <h2>Valiz Listesi</h2>
        <ul>
          {valizler.map((valiz) => (
            <li key={valiz.id}>
              <strong>Yolcu ID:</strong> {valiz.yolcu_id}, <strong>Ağırlık:</strong> {valiz.agirlik}, <strong>Boyutlar:</strong> {valiz.boyutlar}, <strong>Durum:</strong> {valiz.durum}
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
