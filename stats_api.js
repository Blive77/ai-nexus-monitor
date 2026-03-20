from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil, subprocess, json

app = FastAPI()

# Permite que o dashboard (qualquer origem) aceda à API
app.add_middleware(CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_cpu_temp():
    try:
        temps = psutil.sensors_temperatures()
        for key in ['coretemp', 'k10temp', 'cpu_thermal']:
            if key in temps:
                return round(temps[key][0].current, 1)
    except: pass
    return 0

@app.get("/stats")
def stats():
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    return {
        "cpu": psutil.cpu_percent(interval=0.5),
        "ram": mem.percent,
        "ram_used_gb": round(mem.used / 1e9, 1),
        "ram_total_gb": round(mem.total / 1e9, 1),
        "temp": get_cpu_temp(),
        "disk": disk.percent,
        "disk_used_gb": round(disk.used / 1e9, 1),
        "disk_total_gb": round(disk.total / 1e9, 1),
    }

@app.get("/health")
def health():
    return {"status": "ok"}
