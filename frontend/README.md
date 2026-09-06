# 🏥 Healthcare Analytics Dashboard  
### Data Engineering Pipeline + FastAPI + React

A full-stack **data engineering and analytics platform** for pharmacy and healthcare sales data.  
This system processes sales data, stores it in PostgreSQL, exposes analytics APIs using FastAPI, and visualizes insights with a React dashboard.

---

# 🚀 Project Overview

This project demonstrates a **complete data pipeline workflow**:

1. Sales data is stored in a **PostgreSQL database**
2. Data is processed through a **data engineering pipeline**
3. Analytics APIs are built using **FastAPI**
4. A **React dashboard** visualizes healthcare insights

The dashboard helps analyze:

- Total revenue
- Top selling medicines
- Low stock alerts
- Expiring medicines
- Monthly revenue trends

---

# 🧱 System Architecture

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
React Dashboard (Charts & Alerts)
```

---

# 🛠 Tech Stack

### Backend
- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Uvicorn

### Frontend
- React
- Axios
- Recharts

### Data Engineering
- ETL Pipeline
- Data aggregation queries
- Analytics APIs

---

# 📊 Dashboard Features

✔ Add new pharmacy sales  
✔ Total revenue analytics  
✔ Top medicines bar chart  
✔ Monthly revenue line chart  
✔ Low stock alerts  
✔ Expiry risk alerts  

---

# 📂 Project Structure

```
Healthcare_Data_Engineering_Platform
│
├── backend
│   ├── api
│   ├── database
│   ├── models
│   └── main.py
│
├── frontend
│   ├── src
│   │   └── App.jsx
│   └── package.json
│
├── pipeline
│   └── pipeline.py
│
├── screenshots
│
└── README.md
```

---

# ⚙️ Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/geeth_dhananjaya/Healthcare_Data_Engineering_Platform.git
cd Healthcare_Data_Engineering_Platform
```

---

# Backend Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI server:

```bash
uvicorn api.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

API Documentation:

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Go to frontend folder:

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

# 📡 API Endpoints

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

# 📈 Data Engineering Pipeline

The pipeline performs:

1. Extract sales data
2. Transform data for analytics
3. Load aggregated results into the database

Analytics metrics generated:

- revenue metrics
- medicine sales ranking
- inventory alerts
- expiry monitoring

---

# 🔒 Future Improvements

Possible improvements:

- Docker deployment
- Scheduled ETL jobs
- Authentication system
- Advanced analytics
- Machine learning predictions

---

# 👨‍💻 Author

**Geeth Isuru**

Software Engineering & Data Engineering Student

GitHub:  
https://github.com/YOUR_USERNAME

LinkedIn:  
(Add your LinkedIn profile here)

---

# ⭐ Support

If you like this project, please give it a ⭐ on GitHub.