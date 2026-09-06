from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from api.db import db
from pydantic import BaseModel
import datetime

app = FastAPI(title="Healthcare Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "service": "Healthcare Analytics API"}

@app.get("/metrics/total-revenue")
def total_revenue():
    pipeline = [
        {"$group": {"_id": None, "total_revenue": {"$sum": "$revenue"}}}
    ]
    result = list(db["fact_sales"].aggregate(pipeline))
    total = result[0]["total_revenue"] if result else 0.0
    return {"total_revenue": float(total)}

@app.get("/metrics/top-medicines")
def top_medicines(limit: int = 10):
    pipeline = [
        {"$group": {"_id": "$medicine_name", "total_qty": {"$sum": "$quantity"}}},
        {"$sort": {"total_qty": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "medicine_name": "$_id", "total_qty": "$total_qty"}}
    ]
    result = list(db["fact_sales"].aggregate(pipeline))
    return result

@app.get("/alerts/low-stock")
def low_stock():
    cursor = db["dim_inventory"].find(
        {"low_stock_flag": True},
        {"_id": 0, "medicine_name": 1, "stock": 1}
    ).sort("stock", 1)
    return list(cursor)

@app.get("/alerts/expiry-risk")
def expiry_risk():
    cursor = db["dim_inventory"].find(
        {"expiry_risk_flag": True},
        {"_id": 0, "medicine_name": 1, "expiry_date": 1}
    ).sort("expiry_date", 1)
    records = []
    for doc in cursor:
        expiry_date = doc["expiry_date"]
        if hasattr(expiry_date, "strftime"):
            expiry_date = expiry_date.strftime("%Y-%m-%d")
        records.append({
            "medicine_name": doc["medicine_name"],
            "expiry_date": str(expiry_date)
        })
    return records

@app.get("/trends/monthly-revenue")
def monthly_revenue():
    pipeline = [
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-01",
                        "date": "$date"
                    }
                },
                "revenue": {"$sum": "$revenue"}
            }
        },
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "month": "$_id", "revenue": "$revenue"}}
    ]
    result = list(db["fact_sales"].aggregate(pipeline))
    for r in result:
        r["revenue"] = float(r["revenue"])
    return result

class SaleCreate(BaseModel):
    date: str          # "YYYY-MM-DD"
    medicine_name: str
    quantity: int
    price: float
    pharmacy_id: str

@app.post("/sales")
def create_sale(sale: SaleCreate):
    revenue = float(sale.quantity) * float(sale.price)

    try:
        sale_date = datetime.datetime.strptime(sale.date, "%Y-%m-%d")
    except Exception:
        sale_date = datetime.datetime.utcnow()

    doc = {
        "date": sale_date,
        "medicine_name": sale.medicine_name,
        "quantity": int(sale.quantity),
        "price": float(sale.price),
        "pharmacy_id": sale.pharmacy_id,
        "revenue": revenue
    }

    db["fact_sales"].insert_one(doc)

    return {"message": "✅ Sale added", "revenue": revenue}