import os
import shutil
import subprocess
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# 1. CORS (Allow React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Mount a "static" folder to serve the audio files
# This makes files in the 'separated' folder accessible via URL
track_folder = Path("separated")
track_folder.mkdir(exist_ok=True)
app.mount("/tracks", StaticFiles(directory=track_folder), name="tracks")

@app.post("/remix")
async def remix_audio(file: UploadFile = File(...)):
    temp_filename = f"temp_{file.filename}"
    
    try:
        # Save uploaded file
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 3. RUN DEMUCS (The AI Magic)
        # -n htdemucs_ft : Use the "Fine-Tuned" model (best quality/speed balance)
        # --two-stems=vocals : Optional optimization if you only wanted vocals (we want all 4)
        output_dir = "separated"
        
        # We run this as a subprocess (like typing in terminal)
        # This blocks until finished (simple for MVP)
        command = [
            "demucs", 
            "--out", output_dir, 
            "-n", "htdemucs_ft", 
            temp_filename
        ]
        
        print("Starting Separation... this may take a minute on CPU.")
        subprocess.run(command, check=True)

        # 4. Locate the output files
        # Demucs creates folder: separated/htdemucs_ft/temp_songname/
        filename_no_ext = Path(temp_filename).stem
        model_name = "htdemucs_ft"
        result_path = Path(output_dir) / model_name / filename_no_ext

        if not result_path.exists():
            raise HTTPException(status_code=500, detail="Demucs failed to produce output")

        # 5. Return URLs to the frontend
        # The frontend will look for: http://localhost:8000/tracks/...
        base_url = "http://localhost:8000/tracks"
        relative_path = f"{model_name}/{filename_no_ext}"
        
        return {
            "status": "success",
            "stems": {
                "vocals": f"{base_url}/{relative_path}/vocals.wav",
                "drums": f"{base_url}/{relative_path}/drums.wav",
                "bass": f"{base_url}/{relative_path}/bass.wav",
                "other": f"{base_url}/{relative_path}/other.wav",
            }
        }

    except subprocess.CalledProcessError as e:
        print(f"Demucs Error: {e}")
        raise HTTPException(status_code=500, detail="AI Processing Failed")
        
    except Exception as e:
        print(f"General Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        # Cleanup input file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)