import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import logo from './assets/logo.png'; // Logonun bulunduğu yolu belirt


  function App() {
  const [valizler, setValizler] = useState([]);
  const [formData, setFormData] = useState({ yolcu_id: '', agirlik: '', boyutlar: '', durum: '' });
  const [ucuslar, setUcuslar] = useState([]);
  const [valizSayisi, setValizSayisi] = useState([]);
  const [ucusValizListesi, setUcusValizListesi] = useState([]);  // Uçuşa ait valizleri tutacak state
  const [valizGoster, setValizGoster] = useState(false);
  const [ucusGoster, setUcusGoster] = useState(false);
  const [valizSayisiGoster, setValizSayisiGoster] = useState(false);
  const [yolcuValizListesi, setYolcuValizListesi] = useState([]);
  const [valizSorguGoster, setValizSorguGoster] = useState(false);
  const [yolcuIdSorgu, setYolcuIdSorgu] = useState(''); // Yolcu ID'sini tutacak state
  const [ucusId, setUcusId] = useState(''); // Uçuş ID'sini tutacak state
  const [yolcuValizSorguGoster, setYolcuValizSorguGoster] = useState(false);  // Yolcuya ait sorgu
  const [ucusValizSorguGoster, setUcusValizSorguGoster] = useState(false);  // Uçuşa ait sorgu
  const [valizId, setValizId] = useState(''); // Valiz ID'si için state
  const [durumGuncellemeleri, setDurumGuncellemeleri] = useState([]); // Durum güncellemelerini tutacak state
  const [valizIdGorunumu, setValizIdGorunumu] = useState(false); // Valiz ID input görünürlüğü
  const [valizIdSorguGoster, setValizIdSorguGoster] = useState(false); // Durum sorgulama görünürlüğü
  const [acikTalepler, setAcikTalepler] = useState([]);
  const [talepGoster, setTalepGoster] = useState(false);
  const [guvenlikKontrolleri, setGuvenlikKontrolleri] = useState([]);
  const [guvenlikKontrolGoster, setGuvenlikKontrolGoster] = useState(false);
  const [guvenlikValizId, setGuvenlikValizId] = useState('');



  const durumListesi = [
    'check-in',
    'guvenlik-kontrolunden-gecti',
    'yuklendi',
    'indirildi',
    'aktarma-bekleniyor',
    'aktarma-yapildi',
    'aktarmada',
    'bagaj-bandinda',
    'teslim-edildi',
    'kayip',
    'hasarli',
  ];

  const fetchYolcuValizListesi = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/api/valizsorgu', {
      yolcu_id: yolcuIdSorgu,
    });
    setYolcuValizListesi(response.data);
  } catch (error) {
    console.error('Yolcuya ait valizleri sorgularken hata oluştu:', error);
  }
};


  // Valizleri yükle
  useEffect(() => {
    if (valizGoster) {
      fetchValizler();
    }
  }, [valizGoster]);

  const fetchValizler = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/valizler');
      setValizler(response.data);
    } catch (error) {
      console.error('Valizleri yüklerken hata oluştu:', error);
    }
  };

  // Uçuşları yükle
  useEffect(() => {
    if (ucusGoster) {
      fetchUcuslar();
    }
  }, [ucusGoster]);

  const fetchUcuslar = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/ucus');
      setUcuslar(response.data);
    } catch (error) {
      console.error('Uçuşları yüklerken hata oluştu:', error);
    }
  };

  // Valiz sayısını yükle
  useEffect(() => {
    if (valizSayisiGoster) {
      fetchValizSayisi();
    }
  }, [valizSayisiGoster]);

  const fetchValizSayisi = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/valiz_sayisi');
      setValizSayisi(response.data);
    } catch (error) {
      console.error('Valiz sayısını yüklerken hata oluştu:', error);
    }
  };

    // Belirli bir uçuşun valizlerini yükle
   const fetchUcusValizListesi = async () => {
  if (!ucusId) {
    console.log('Lütfen bir uçuş ID girin');
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:5000/api/ucus_valiz_listesi?ucus_id=${ucusId}`);
    setUcusValizListesi(response.data);
  } catch (error) {
    console.error('Uçuş valiz listesini yüklerken hata oluştu:', error);
  }
};



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:5000/api/valizekle', formData);
      fetchValizler(); // Verileri yenile
      // Reset the form fields after successful submission
      setFormData({
        yolcu_id: '',
        ucus_id: '',
        agirlik: '',
        boyutlar: '',
        renk: '',
        durum: ''
      });
    } catch (error) {
      console.error('Valiz eklerken hata oluştu:', error);
    }
  };

  const updateValizDurumu = async (valizId, yeniDurum) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/valiz/guncelle/${valizId}`, { durum: yeniDurum });
      fetchValizler(); // Verileri yeniden yükle
    } catch (error) {
      console.error('Valiz durumu güncellenirken hata oluştu:', error);
    }
  };

  // Durum sorgulama için fetch fonksiyonu
const fetchDurumGuncellemeleri = async () => {
  if (!valizId) {
    alert("Lütfen bir valiz ID girin");
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:5000/api/durum?valiz_id=${valizId}`);
    setDurumGuncellemeleri(response.data); // Gelen veriyi duruma kaydediyoruz
  } catch (error) {
    console.error('Durum güncellemeleri yüklenirken hata oluştu:', error);
  }
};

const fetchAcikTalepler = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/api/talep');
    setAcikTalepler(response.data);
  } catch (error) {
    console.error('Açık talepleri çekerken hata oluştu:', error);
  }
};

const fetchGuvenlikKontrolleri = async () => {
  if (!guvenlikValizId) {
    alert("Lütfen bir valiz ID girin");
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:5000/api/guvenlik_kontrolu?valiz_id=${guvenlikValizId}`);
    setGuvenlikKontrolleri(response.data);
  } catch (error) {
    console.error('Güvenlik kontrolleri çekilirken hata oluştu:', error);
  }
};




  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} alt="Logo" className="App-logo" />
        <h1>HYPER FLIGHT</h1>
        <h2>Havalimanı Valiz Yönetimi</h2>
        <form className="valiz-form" onSubmit={handleSubmit}>
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
            Uçuş ID:
            <input
              type="number"
              name="ucus_id"
              value={formData.ucus_id}
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
            Renk:
            <input
              type="text"
              name="renk"
              value={formData.renk}
              onChange={handleChange}
            />
          </label>
          <label>
            Durum:
            <select
              name="durum"
              value={formData.durum}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Durum Seçin</option>
              {durumListesi.map((durum, index) => (
                <option key={index} value={durum}>{durum}</option>
              ))}
            </select>
          </label>
          <button type="submit">Valiz Ekle</button>
        </form>

        {/* Yolcu Valiz Sorgulama Kısmı */}
        <button onClick={() => setYolcuValizSorguGoster(!yolcuValizSorguGoster)}>
          {yolcuValizSorguGoster ? 'Yolcu Valiz Sorgulama Gizle' : 'Yolcu Valiz Sorgula'}
        </button>

        {yolcuValizSorguGoster && (
          <div className="valiz-sorgu-container">
            <h2>Yolcu Valiz Sorgulama</h2>
            <label>
              Yolcu ID:
              <input
                type="number"
                value={yolcuIdSorgu}
                onChange={(e) => setYolcuIdSorgu(e.target.value)}  // Yolcu ID değişikliği
              />
            </label>
            <button onClick={fetchYolcuValizListesi}>Valiz Sorgula</button>
          </div>
        )}

        {yolcuValizSorguGoster && yolcuValizListesi.length > 0 && (
          <div>
            <h2>Yolcuya Ait Valiz Listesi</h2>
            <table className="valiz-table">
              <thead>
                <tr>
                  <th>Valiz ID</th>
                  <th>Uçuş ID</th>
                  <th>Ağırlık</th>
                  <th>Renk</th>
                  <th>Durum</th>
                  <th>Boyutlar</th>
                </tr>
              </thead>
              <tbody>
                {yolcuValizListesi.map((valiz, index) => (
                  <tr key={index}>
                    <td>{valiz.valiz_id}</td>
                    <td>{valiz.ucus_id || "Bilinmiyor"}</td>
                    <td>{valiz.agirlik || "Bilinmiyor"}</td>
                    <td>{valiz.renk || "Bilinmiyor"}</td>
                    <td>{valiz.durum || "Bilinmiyor"}</td>
                    <td>
                      {valiz.boyutlar && typeof valiz.boyutlar === 'object'
                        ? `Genişlik: ${valiz.boyutlar.width || "N/A"}, Yükseklik: ${valiz.boyutlar.height || "N/A"}, Derinlik: ${valiz.boyutlar.depth || "N/A"}`
                        : "Bilinmiyor"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={() => setValizGoster(!valizGoster)}>
          {valizGoster ? 'Valizleri Gizle' : 'Valizleri Göster'}
        </button>

        {valizGoster && (
          <div>
            <h2>Valiz Listesi</h2>
            <table className="valiz-table">
              <thead>
                <tr>
                  <th>Yolcu ID</th>
                  <th>Ağırlık</th>
                  <th>Boyutlar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {valizler.map((valiz, index) => (
                  <tr key={index}>
                    <td>{valiz.yolcu_id}</td>
                    <td>{valiz.agirlik}</td>
                    <td>
                      {valiz.boyutlar
                        ? `Genişlik: ${valiz.boyutlar.width || "N/A"}, Yükseklik: ${valiz.boyutlar.height || "N/A"}, Derinlik: ${valiz.boyutlar.depth || "N/A"}`
                        : "Bilinmiyor"}
                    </td>
                    <td>{valiz.durum}</td>
                    <td>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={() => setUcusGoster(!ucusGoster)}>
          {ucusGoster ? 'Uçuşları Gizle' : 'Uçuşları Göster'}
        </button>

        {ucusGoster && (
          <div>
            <h2>Uçuş Listesi</h2>
            <table className="ucus-table">
              <thead>
                <tr>
                  <th>Uçuş ID</th>
                  <th>Kalkış Zamanı</th>
                  <th>Varış Zamanı</th>
                  <th>Kalkış Havalimanı</th>
                  <th>Varış Havalimanı</th>
                </tr>
              </thead>
              <tbody>
                {ucuslar.map((ucus, index) => (
                  <tr key={index}>
                    <td>{ucus.ucus_id}</td>
                    <td>{ucus.kalkis_zamani}</td>
                    <td>{ucus.varis_zamani}</td>
                    <td>{ucus.kalkis_havalimani}</td>
                    <td>{ucus.varis_havalimani}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Valiz Sayısını Listeleme */}
<button onClick={() => setValizSayisiGoster(!valizSayisiGoster)}>
  {valizSayisiGoster ? 'Valiz Sayısını Gizle' : 'Valiz Sayısını Göster'}
</button>

{/* Valiz Sayısı Tablosu */}
{valizSayisiGoster && valizSayisi.length > 0 && (
  <div>
    <h2>Uçuşların Valiz Sayıları</h2>
    <table className="valiz-sayisi-table">
      <thead>
        <tr>
          <th>
            Uçuş ID
            {/* Uçuş ID'ye Göre Sıralama Oku */}
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '5px',
              }}
              onClick={() => {
                const sortedList = [...valizSayisi].sort((a, b) => a.ucus_id - b.ucus_id);
                setValizSayisi(sortedList); // Sıralanmış listeyi güncelle
              }}
            >
              🔽
            </button>
          </th>
          <th>Valiz Sayısı</th>
        </tr>
      </thead>
      <tbody>
        {valizSayisi.map((valiz, index) => (
          <tr key={index}>
            <td>{valiz.ucus_id}</td>
            <td>{valiz.baggage_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


{/* Uçuş Valiz Sorgulama Kısmı */}
<button onClick={() => {
  setUcusValizSorguGoster(!ucusValizSorguGoster);  // Değerin tersine çevrilmesini sağlarız
  setUcusValizListesi([]);         // Sonuçları sıfırlarız
}}>
  {ucusValizSorguGoster ? 'Uçuş Valiz Sorgulama Gizle' : 'Uçuş Valiz Sorgula'}
</button>

{/* Uçuş Valiz Sorgulama Input ve Buton */}
{ucusValizSorguGoster && (
  <div className="ucus-valiz-sorgulama">
    <h2>Uçuş Valizleri Sorgulama</h2>
    <label>
      Uçuş ID:
      <input
        type="number"
        value={ucusId}
        onChange={(e) => setUcusId(e.target.value)}  // Uçuş ID değişikliği
        required
      />
    </label>
    <button onClick={fetchUcusValizListesi}>Uçuşa Ait Valizleri Göster</button>
  </div>
)}

{/* Uçuş Valiz Listesi */}
{ucusValizListesi.length > 0 && (
  <div>
    <h2>Uçuşa Ait Valiz Listesi</h2>
    <table className="valiz-table">
      <thead>
        <tr>
          <th>Valiz ID</th>
          <th>Yolcu İsim</th>
          <th>Yolcu Soyisim</th>
          <th>Ağırlık</th>
          <th>Boyutlar</th>
          <th>Renk</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        {ucusValizListesi.map((valiz, index) => (
          <tr key={index}>
            <td>{valiz.valiz_id}</td>
            <td>{valiz.isim || "Bilinmiyor"}</td>
            <td>{valiz.soyisim || "Bilinmiyor"}</td>
            <td>{valiz.agirlik || "Bilinmiyor"}</td>
            <td>{valiz.boyutlar ? `${valiz.boyutlar.width}, ${valiz.boyutlar.height}` : "Bilinmiyor"}</td>
            <td>{valiz.renk || "Bilinmiyor"}</td>
            <td>{valiz.durum || "Bilinmiyor"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

{/* Durum Sorgulama Butonu */}
<button onClick={() => {
  setValizIdSorguGoster(!valizIdSorguGoster);  // Durum sorgulama görünürlüğünü kontrol et
  setDurumGuncellemeleri([]);   // Durum güncellemeleri tablosunu sıfırla
}}>
  {valizIdSorguGoster ? 'Durum Sorgulamayı Gizle' : 'Durum Sorgula'}
</button>

{/* Valiz ID Girişi ve Durum Sorgulama Butonu */}
{valizIdSorguGoster && (
  <div>
    <label>
      Valiz ID:
      <input
        type="number"
        value={valizId}
        onChange={(e) => setValizId(e.target.value)}  // Valiz ID'sini güncelle
        required
      />
    </label>
    <button onClick={fetchDurumGuncellemeleri}>Sorgula</button>
  </div>
)}

{/* Durum güncellemeleri tablosu */}
{durumGuncellemeleri.length > 0 && (
  <div>
    <h2>Durum Güncellemeleri</h2>
    <table className="valiz-table">
      <thead>
        <tr>
          <th>Durum</th>
          <th>Zaman</th>
          <th>Konum</th>
        </tr>
      </thead>
      <tbody>
        {durumGuncellemeleri.map((guncelleme, index) => (
          <tr key={index}>
            <td>{guncelleme.durum}</td>
            <td>{guncelleme.zaman}</td>
            <td>{guncelleme.konum}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
        {/* Açık Talepler Butonu */}
<button
  onClick={() => {
    setTalepGoster(!talepGoster);
    if (!talepGoster) {
      fetchAcikTalepler();
    }
  }}
>
  {talepGoster ? 'Açık Talepleri Gizle' : 'Açık Talepleri Göster'}
</button>

{/* Açık Talepler Tablosu */}
{talepGoster && acikTalepler.length > 0 && (
  <div>
    <h2>Açık Talepler</h2>
    <table className="talep-table">
      <thead>
        <tr>
          <th>İsim</th>
          <th>Soyisim</th>
          <th>Tür</th>
          <th>Tarih</th>
          <th>Durum</th>
          <th>Tazminat Tutarı</th>
        </tr>
      </thead>
      <tbody>
        {acikTalepler.map((talep, index) => (
          <tr key={index}>
            <td>{talep.isim}</td>
            <td>{talep.soyisim}</td>
            <td>{talep.tur}</td>
            <td>{new Date(talep.tarih).toLocaleDateString()}</td>
            <td>{talep.durum}</td>
            <td>{talep.tazminat_tutari} TL</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        {/* Güvenlik Kontrolü Sorgulama Section */}
<button
  onClick={() => {
    setGuvenlikKontrolGoster(!guvenlikKontrolGoster);
    if (guvenlikKontrolGoster) {
      setGuvenlikKontrolleri([]); // Clear the list when hiding
    }
  }}
>
  {guvenlikKontrolGoster ? 'Güvenlik Kontrollerini Gizle' : 'Güvenlik Kontrollerini Göster'}
</button>

{/* Güvenlik Kontrolü Input and Fetch Button */}
{guvenlikKontrolGoster && (
  <div className="guvenlik-kontrol-container">
    <h2>Güvenlik Kontrollerini Sorgula</h2>
    <label>
      Valiz ID:
      <input
        type="number"
        value={guvenlikValizId}
        onChange={(e) => setGuvenlikValizId(e.target.value)} // Update luggage ID
      />
    </label>
    <button onClick={fetchGuvenlikKontrolleri}>Sorgula</button>
  </div>
)}

{/* Güvenlik Kontrolleri Tablosu */}
{guvenlikKontrolGoster && guvenlikKontrolleri.length > 0 && (
  <div>
    <h2>Güvenlik Kontrolleri</h2>
    <table className="table">
      <thead>
        <tr>
          <th>Zaman</th>
          <th>Sonuç</th>
          <th>Detaylar</th>
          <th>Personel İsim</th>
          <th>Personel Soyisim</th>
        </tr>
      </thead>
      <tbody>
        {guvenlikKontrolleri.map((kontrol, index) => (
          <tr key={index}>
            <td>{new Date(kontrol.zaman).toLocaleString()}</td>
            <td>{kontrol.sonuc || "Bilinmiyor"}</td>
            <td>{kontrol.detaylar || "Bilinmiyor"}</td>
            <td>{kontrol.personel_isim || "Bilinmiyor"}</td>
            <td>{kontrol.personel_soyisim || "Bilinmiyor"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}




      </header>
    </div>
  );
}

export default App;
