import os
import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("❌ MONGO_URI not found in environment. Please check your .env file.")

# Check for default placeholders
if "<db_password>" in MONGO_URI or "<hostname>" in MONGO_URI:
    raise ValueError(
        "❌ MONGO_URI contains default placeholders ('<db_password>' or '<hostname>'). "
        "Please update your .env file with your actual MongoDB credentials."
    )

try:
    client = MongoClient(MONGO_URI)
    try:
        db = client.get_default_database()
        if db is None:
            db = client["healthcare_dw"]
    except Exception:
        db = client["healthcare_dw"]
except Exception as e:
    raise RuntimeError(f"❌ Failed to initialize MongoDB Client: {e}")

PROCESSED_DIR = os.path.join("data", "processed")


def load_table(file_name, collection_name):
    path = os.path.join(PROCESSED_DIR, file_name)

    if not os.path.exists(path):
        raise FileNotFoundError(f"Processed file not found: {path}")

    df = pd.read_csv(path)

    # Convert date / timestamp columns to actual datetime objects
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
    if "expiry_date" in df.columns:
        df["expiry_date"] = pd.to_datetime(df["expiry_date"])
    if "delivery_date" in df.columns:
        df["delivery_date"] = pd.to_datetime(df["delivery_date"])

    records = df.to_dict(orient="records")

    cleaned_records = []
    for r in records:
        cleaned_r = {}
        for k, v in r.items():
            if isinstance(v, pd.Timestamp):
                cleaned_r[k] = v.to_pydatetime()
            elif pd.isna(v):
                cleaned_r[k] = None
            else:
                cleaned_r[k] = v
        cleaned_records.append(cleaned_r)

    collection = db[collection_name]
    collection.delete_many({})
    if cleaned_records:
        collection.insert_many(cleaned_records)

    print(f"✅ Loaded {file_name} → Collection: {collection_name} | Count: {len(cleaned_records)}")


def run():
    print("📦 Loading data into MongoDB...\n")

    load_table("sales_clean.csv", "fact_sales")
    load_table("inventory_clean.csv", "dim_inventory")
    load_table("deliveries_clean.csv", "fact_deliveries")

    print("\n Data successfully loaded into MongoDB!")


if __name__ == "__main__":
    run()