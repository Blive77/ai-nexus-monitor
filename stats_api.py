from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil, subprocess, json, os, re, socket

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

def get_nginx_projects():
    projects = []
    sites_dir = '/etc/nginx/sites-enabled'
    if os.path.isdir(sites_dir):
        try:
            for f in os.listdir(sites_dir):
                if f == 'default': continue
                path = os.path.join(sites_dir, f)
                port = ""
                try:
                    with open(path, 'r') as file:
                        match = re.search(r'proxy_pass\s+http://[^:]+:(\d+)', file.read())
                        if match: port = f":{match.group(1)}"
                except: pass
                projects.append({"name": f, "port": port, "status": "RUNNING"})
        except: pass
    return projects

def check_system_services():
    services = [
        {"name": "🤖 OpenClaw b0b", "port": 11434, "id": "bob"},
        {"name": "🧠 Ollama API", "port": 11435, "id": "ollama"},
        {"name": "🕸️ OpenClaw Gateway", "port": 18789, "id": "ocg"},
        {"name": "⚙️ n8n Workflows", "port": 5678, "id": "n8n"},
        {"name": "📚 RAG / Qdrant", "port": 6333, "id": "rag"},
        {"name": "📊 AI Nexus Dashboard", "port": 3000, "id": "dash"},
        {"name": "🔍 Brave Search Proxy", "port": 8080, "id": "bsp"},
    ]
    res = []
    for s in services:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.1)
        result = sock.connect_ex(('127.0.0.1', s["port"]))
        sock.close()
        status = "RUNNING" if result == 0 else "STOPPED"
        res.append({"name": s["name"], "port": f":{s['port']}", "status": status, "id": s["id"]})
    return res

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
        "nginx_projects": get_nginx_projects(),
        "system_services": check_system_services(),
    }

@app.get("/health")
def health():
    return {"status": "ok"}
