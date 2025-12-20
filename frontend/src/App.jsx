import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  // Initialize Wavesurfer
  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4F46E5',
        progressColor: '#818CF8',
        cursorColor: '#C7D2FE',
        barWidth: 2,
        barGap: 3,
        height: 100,
      });
    }
    return () => wavesurfer.current?.destroy();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Load audio into visualizer
      const objectUrl = URL.createObjectURL(selectedFile);
      wavesurfer.current.load(objectUrl);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/analyze', formData);
      setAnalysis(response.data);
    } catch (error) {
      console.error("Error analyzing audio", error);
      alert("Analysis failed!");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    wavesurfer.current?.playPause();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎵 VibeCheck</h1>
      <p>Upload a track to analyze its BPM and Mood.</p>
      
      {/* File Upload */}
      <input type="file" accept="audio/*" onChange={handleFileChange} style={{ marginBottom: '20px' }} />

      {/* Visualizer Container */}
      <div 
        ref={waveformRef} 
        style={{ width: '100%', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}
      ></div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={togglePlay} disabled={!file} style={{ padding: '10px 20px' }}>
          Play/Pause
        </button>
        <button 
          onClick={handleAnalyze} 
          disabled={!file || loading} 
          style={{ padding: '10px 20px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Analyzing...' : 'Analyze Vibe'}
        </button>
      </div>

      {/* Results */}
      {analysis && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
          <h2>Analysis Results</h2>
          <p><strong>Filename:</strong> {analysis.filename}</p>
          <p><strong>BPM:</strong> {analysis.bpm}</p>
          <p><strong>Spectral Brightness:</strong> {analysis.spectral_centroid}</p>
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e0e7ff', borderLeft: '4px solid #4F46E5' }}>
            <strong>✨ AI Mood Description:</strong>
            <p>{analysis.mood}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;