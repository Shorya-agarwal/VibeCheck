import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
import uvicorn
import shutil

# Initialize App
app = FastAPI()

# Allow React to talk to this Backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    # 1. Save the uploaded file temporarily
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 2. Load audio with Librosa
        # y = audio time series, sr = sampling rate
        y, sr = librosa.load(temp_filename, duration=30) # Limit to 30s for speed

        # 3. Extract Features
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
        
        # 4. "GenAI" Simulation (Mocking the AI for now)
        # Real implementation: Send these stats to OpenAI API to get a description
        mood_description = generate_mood_with_ai(tempo, spectral_centroid)

        return {
            "filename": file.filename,
            "bpm": round(float(tempo), 1),
            "spectral_centroid": round(float(spectral_centroid), 1),
            "mood": mood_description
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

def generate_mood_with_ai(bpm, centroid):
    # This is where you would call OpenAI API
    # For now, we use simple logic to prove the concept works
    if bpm > 120 and centroid > 2000:
        return "High Energy / Bright. Perfect for a workout or dance floor."
    elif bpm < 100:
        return "Chill / Lo-Fi. Good for studying or relaxing."
    else:
        return "Moderate Tempo / Balanced. A versatile track."

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)