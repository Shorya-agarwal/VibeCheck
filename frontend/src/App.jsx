import React, { useState } from 'react';
import axios from 'axios';
import StemPlayer from './StemPlayer';

function App() {
  const [file, setFile] = useState(null);
  const [stems, setStems] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleRemix = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Call the NEW remix endpoint
      const response = await axios.post('http://localhost:8000/remix', formData);
      setStems(response.data.stems);
    } catch (error) {
      console.error(error);
      alert("Remix failed! (Did you install Demucs?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎹 AI Remix Engine</h1>
      <p>Upload a song to separate Vocals, Drums, Bass, and Others.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input type="file" onChange={handleFileChange} />
        <button 
          onClick={handleRemix} 
          disabled={!file || loading}
          style={{ padding: '10px 20px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          {loading ? 'Separating Stems (Wait ~30s)...' : '✨ Separate Stems'}
        </button>
      </div>

      {stems && (
        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px' }}>
          <h2>Your Stems</h2>
          <StemPlayer label="Vocals" audioUrl={stems.vocals} color="#ec4899" />
          <StemPlayer label="Drums" audioUrl={stems.drums} color="#f59e0b" />
          <StemPlayer label="Bass" audioUrl={stems.bass} color="#8b5cf6" />
          <StemPlayer label="Other" audioUrl={stems.other} color="#10b981" />
        </div>
      )}
    </div>
  );
}

export default App;