
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import json

app = FastAPI()

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async contract(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/bus/{bus_id}")
async def websocket_endpoint(websocket: WebSocket, bus_id: str):
    await manager.contract(websocket)
    try:
        while True:
            # Receive GPS data from driver mobile
            data = await websocket.receive_text()
            # Broadcast location to all tracking students
            await manager.broadcast(f"Bus {bus_id} update: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Bus {bus_id} disconnected")

@app.get("/")
def read_root():
    return {"status": "DIU Transport Backend Live"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
