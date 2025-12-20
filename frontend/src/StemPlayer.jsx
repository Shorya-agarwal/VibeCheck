import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

const StemPlayer = ({ label, audioUrl, color }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: color,
        progressColor: '#333',
        height: 60,
        barWidth: 2,
        cursorWidth: 0,
      });

      wavesurfer.current.load(audioUrl);
    }
    return () => wavesurfer.current?.destroy();
  }, [audioUrl]);

  const toggleMute = () => {
    wavesurfer.current.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  // Expose play/pause to parent (optional/advanced), 
  // for now we just let them play individually or you can sync them later.
  const play = () => wavesurfer.current.playPause();

  return (
    <div style={{ marginBottom: '15px', background: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', textTransform: 'capitalize' }}>{label}</h3>
        <button 
            onClick={toggleMute}
            style={{ 
                background: isMuted ? '#ef4444' : '#10b981', 
                color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' 
            }}
        >
          {isMuted ? 'Muted' : 'Active'}
        </button>
      </div>
      <div ref={waveformRef}></div>
      <button onClick={play} style={{marginTop: '5px'}}>Play/Pause</button>
    </div>
  );
};

export default StemPlayer;