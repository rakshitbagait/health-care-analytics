import os
import pandas as pd

# Base project directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RAW_DIR = os.path.join(BASE_DIR, "data", "raw")


def validate_file(path: str):
    """Check if file exists before reading"""
    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ File not found: {path}")


def read_csv(file_name: str) -> pd.DataFrame:
    """Read CSV safely with validation"""
    file_path = os.path.join(RAW_DIR, file_name)
    validate_file(file_path)

    df = pd.read_csv(file_path)
    print(f"✅ Loaded {file_name} | Rows: {len(df)} | Columns: {len(df.columns)}")
    return df


def ingest_all():
    """Main ingestion function"""
    print("🔄 Starting Data Ingestion...\n")

    sales = read_csv("sales.csv")
    inventory = read_csv("inventory.csv")
    deliveries = read_csv("deliveries.csv")

    print("\n📊 Quick Preview:")
    print(sales.head())
    print(inventory.head())
    print(deliveries.head())

    print("\n✅ Ingestion Completed Successfully!\n")

    return {
        "sales": sales,
        "inventory": inventory,
        "deliveries": deliveries
    }


if __name__ == "__main__":
    ingest_all()