
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime

app = FastAPI()

# Simple in-memory storage for bus locations
# Note: In a production environment with multiple serverless instances, 
# you would use Redis or a database.
bus_locations: Dict[str, dict] = {}

class LocationUpdate(BaseModel):
    bus_id: str
    lat: float
    lng: float
    occupancy: int
    route: str
    status: str

@app.get("/api/health")
def health():
    return {"status": "online", "environment": "vercel-serverless"}

@app.post("/api/update")
async def update_location(data: LocationUpdate):
    bus_locations[data.bus_id] = {
        "lat": data.lat,
        "lng": data.lng,
        "occupancy": data.occupancy,
        "route": data.route,
        "status": data.status,
        "last_updated": datetime.utcnow().isoformat()
    }
    return {"status": "success"}

@app.get("/api/locations")
async def get_locations():
    return bus_locations

@app.get("/api/locations/{bus_id}")
async def get_bus_location(bus_id: str):
    if bus_id not in bus_locations:
        raise HTTPException(status_code=404, detail="Bus not found")
    return bus_locations[bus_id]
