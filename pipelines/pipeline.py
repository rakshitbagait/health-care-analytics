from ingestion.ingest import ingest_all
from processing.transform import run as transform_run
from warehouse.load import run as load_run

def run_pipeline():
    print("🚀 Starting Full ETL Pipeline...")

    print("\n1) Ingestion")
    ingest_all()

    print("\n2) Transform")
    transform_run()

    print("\n3) Load to Warehouse")
    load_run()

    print("\n ETL Pipeline Completed Successfully!")

if __name__ == "__main__":
    run_pipeline()