from fastapi import FastAPI
from pydantic import BaseModel
import datetime

app = FastAPI(
    title="AgriMandi ML & Analytics Service",
    version="0.1.0",
    description="Isolated forecasting, anomaly detection, and matching analytics for AgriMandi Maharashtra."
)

class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: str

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "service": "agrimandi-ml-service",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
