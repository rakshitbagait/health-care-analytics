# 🏥 Healthcare Data Engineering Platform

A full-stack **Healthcare Analytics Dashboard** built with **Python, FastAPI, PostgreSQL, and React**.  
This project demonstrates a **data engineering pipeline + analytics API + visualization dashboard** for pharmacy sales and inventory analytics.

---

## 🚀 Project Overview

This system collects pharmacy sales data, processes it through a **data pipeline**, stores it in **PostgreSQL**, and visualizes insights through a **React analytics dashboard**.

The platform provides analytics such as:

- 💰 Total Revenue
- 📊 Top Selling Medicines
- ⚠ Low Stock Alerts
- ⏳ Expiry Risk Medicines
- 📈 Monthly Revenue Trends

---

## 🧱 System Architecture

```
Sales Data
   │
   ▼
PostgreSQL Database
   │
   ▼
FastAPI Analytics API
   │
   ▼
React Dashboard (Charts & Tables)
```

---

## 🛠 Tech Stack

### Backend
- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Uvicorn

### Frontend
- React
- Vite
- Axios
- Recharts
- Tailwind CSS

### Data Engineering
- ETL Pipeline
- Data Aggregation Queries
- Analytics APIs

---

## 📊 Dashboard Features

✔ Add new pharmacy sales  
✔ Real-time analytics dashboard  
✔ Top medicines visualization  
✔ Monthly revenue chart  
✔ Low stock monitoring  
✔ Expiry risk detection  

---



## ⚙️ Installation Guide

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Healthcare_Data_Engineering_Platform.git
cd Healthcare_Data_Engineering_Platform
```

---

## 🔧 Backend Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
uvicorn api.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

API documentation:

```
http://127.0.0.1:8000/docs
```

---

## 💻 Frontend Setup

Go to frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 📡 API Endpoints

### Total Revenue

```
GET /metrics/total-revenue
```

### Top Medicines

```
GET /metrics/top-medicines
```

### Low Stock Alerts

```
GET /alerts/low-stock
```

### Expiry Risk

```
GET /alerts/expiry-risk
```

### Monthly Revenue

```
GET /trends/monthly-revenue
```

### Add Sale

```
POST /sales
```

Example request:

```json
{
  "date": "2025-01-10",
  "medicine_name": "Paracetamol",
  "quantity": 20,
  "price": 4.5,
  "pharmacy_id": "P001"
}
```

---

## 📈 Data Engineering Pipeline

The pipeline performs:

1. Extract pharmacy sales data
2. Transform data for analytics
3. Load aggregated results into the database

Generated analytics include:

- revenue metrics
- medicine rankings
- stock alerts
- expiry monitoring

---

## 🔮 Future Improvements

Planned improvements:

- Docker deployment
- Scheduled ETL jobs
- Authentication system
- Machine learning predictions
- Advanced analytics dashboard

---

## 👨‍💻 Author

**Geeth Isuru**

 Data Engineering Student

GitHub:  
https://github.com/GeethDhananjaya

LinkedIn:  
https://www.linkedin.com/in/geeth-dhananjaya-15a4aa349?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BRi6vtZPQTbqxHgkB28hwzg%3D%3D

---

## ⭐ Support

If you found this project helpful, please give it a ⭐ on GitHub!
