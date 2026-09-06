import os
from dotenv import load_dotenv
from pymongo import MongoClient

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
    # Get database (from URI or default to healthcare_dw)
    try:
        db = client.get_default_database()
        if db is None:
            db = client["healthcare_dw"]
    except Exception:
        db = client["healthcare_dw"]
except Exception as e:
    raise RuntimeError(f"❌ Failed to initialize MongoDB Client: {e}")