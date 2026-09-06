import os
import pandas as pd

RAW_DIR = os.path.join("data", "raw")
PROCESSED_DIR = os.path.join("data", "processed")

def ensure_dirs():
    os.makedirs(PROCESSED_DIR, exist_ok=True)

def load_raw():
    sales = pd.read_csv(os.path.join(RAW_DIR, "sales.csv"))
    inventory = pd.read_csv(os.path.join(RAW_DIR, "inventory.csv"))
    deliveries = pd.read_csv(os.path.join(RAW_DIR, "deliveries.csv"))
    return sales, inventory, deliveries

def transform_sales(sales: pd.DataFrame) -> pd.DataFrame:
    # Clean + types
    sales = sales.dropna(subset=["date", "medicine_name", "quantity", "price", "pharmacy_id"]).copy()
    sales["date"] = pd.to_datetime(sales["date"], errors="coerce")
    sales = sales.dropna(subset=["date"])

    sales["quantity"] = pd.to_numeric(sales["quantity"], errors="coerce")
    sales["price"] = pd.to_numeric(sales["price"], errors="coerce")
    sales = sales.dropna(subset=["quantity", "price"])

    # Business feature
    sales["revenue"] = sales["quantity"] * sales["price"]

    # Normalize text
    sales["medicine_name"] = sales["medicine_name"].astype(str).str.strip()
    sales["pharmacy_id"] = sales["pharmacy_id"].astype(str).str.strip()

    return sales

def transform_inventory(inventory: pd.DataFrame) -> pd.DataFrame:
    inventory = inventory.dropna(subset=["medicine_name", "stock", "expiry_date", "supplier_id"]).copy()

    inventory["stock"] = pd.to_numeric(inventory["stock"], errors="coerce")
    inventory["expiry_date"] = pd.to_datetime(inventory["expiry_date"], errors="coerce")
    inventory = inventory.dropna(subset=["stock", "expiry_date"])

    inventory["medicine_name"] = inventory["medicine_name"].astype(str).str.strip()
    inventory["supplier_id"] = inventory["supplier_id"].astype(str).str.strip()

    # Flags (you can tune thresholds later)
    inventory["low_stock_flag"] = inventory["stock"] < 50
    inventory["expiry_risk_flag"] = inventory["expiry_date"] <= (pd.Timestamp.today() + pd.Timedelta(days=60))

    return inventory

def transform_deliveries(deliveries: pd.DataFrame) -> pd.DataFrame:
    deliveries = deliveries.dropna(subset=["supplier_id", "medicine_name", "delivered_qty", "delivery_date"]).copy()

    deliveries["delivered_qty"] = pd.to_numeric(deliveries["delivered_qty"], errors="coerce")
    deliveries["delivery_date"] = pd.to_datetime(deliveries["delivery_date"], errors="coerce")
    deliveries = deliveries.dropna(subset=["delivered_qty", "delivery_date"])

    deliveries["medicine_name"] = deliveries["medicine_name"].astype(str).str.strip()
    deliveries["supplier_id"] = deliveries["supplier_id"].astype(str).str.strip()

    return deliveries

def save_processed(sales, inventory, deliveries):
    sales.to_csv(os.path.join(PROCESSED_DIR, "sales_clean.csv"), index=False)
    inventory.to_csv(os.path.join(PROCESSED_DIR, "inventory_clean.csv"), index=False)
    deliveries.to_csv(os.path.join(PROCESSED_DIR, "deliveries_clean.csv"), index=False)

def run():
    ensure_dirs()
    sales, inventory, deliveries = load_raw()

    sales_clean = transform_sales(sales)
    inventory_clean = transform_inventory(inventory)
    deliveries_clean = transform_deliveries(deliveries)

    save_processed(sales_clean, inventory_clean, deliveries_clean)

    print("Processing complete!")
    print("Saved to data/processed/:")
    print("- sales_clean.csv")
    print("- inventory_clean.csv")
    print("- deliveries_clean.csv")

    print("\n--- Quick Preview ---")
    print(sales_clean.head())
    print(inventory_clean.head())
    print(deliveries_clean.head())

if __name__ == "__main__":
    run()