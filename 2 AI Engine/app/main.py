import os
os.system("pip3 install python-multipart")

import json
from typing import List
from fastapi import Depends, FastAPI, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import shutil

app = FastAPI()

#To override CROS origion problem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.getcwd() + '/myfirstproject-305412-bd26f6fbb24b.json'

#default api to show that continer is up
@app.get("/")
async def root():
    return {"message": "Speech Recognition System is started and listening for commands!"}



#Install required libraries
@app.get("/install_dependencies/")
def install_dependencies_api():
	try:
		os.system("sudo apt-get update")
		os.system("sudo apt-get upgrade")
		os.system("sudo apt-get -y install apt-utils gcc libpq-dev libsndfile-dev")
		os.system("pip3 install --upgrade pip")
		os.system("pip3 install sklearn")
		os.system("pip3 install numpy")
		os.system("pip3 install numba")
		os.system("pip3 install librosa")
		os.system("pip3 install keras")
		os.system("pip3 install --no-cache-dir --default-timeout=100 --upgrade tensorflow")
		os.system("pip3 install --upgrade google-cloud-storage")
		os.system("pip3 install --upgrade google-cloud-bigquery")
		return {"message": "Installed!"}
	except Exception as e:
		return {"message" : str(e)}



#Greet user
@app.get("/hello/")
async def hello_api(name: str):
	return {"message":f"Hello {name}, from the AI server!"}



#Download dataset
@app.get("/download/")
def download_api(root: str, table: str):
	try:
		from download_dataset import download_data
		res = download_data(root, table)
		return {"message" : res}
	except Exception as e:
		return {"message" : str(e)}



#Initilize model
@app.get("/train_model/")
def train_model_api(from_scratch: bool):
	try:
		from model import train_model
		summary = train_model(from_scratch)
		return {"message" : summary}
	except Exception as e:
		return {"message" : str(e)}



#Upload file to predict
@app.post("/upload_file/")
def upload_file_api(audio: UploadFile = File(...)):
	try:
		with open("predict.wav", "wb") as buffer:
			shutil.copyfileobj(audio.file, buffer)
		return {"message": audio.filename}
	except Exception as e:
		return {"message" : str(e)}		


#Predict the uploaded file
@app.get("/predict/")
def predict_api():
	try:
		import librosa
		from model import predict_audio
		audio, sample_rate = librosa.load('predict.wav', sr = 16000)
		prediction = predict_audio(audio, sample_rate)
		return {"message": prediction}
	except Exception as e:
		return {"message" : str(e)}