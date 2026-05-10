#!/usr/bin/env python3
import argparse
import pandas as pd
import os

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

COLUMNS_TO_KEEP = [
    "code",
    "locatie",
    "datum",
    "uur5minuten",
    "totaal",
    "tegenrichting",
    "hoofdrichting",
]

LOCATION_COLUMNS_TO_KEEP = [
    "code",
    "naam",
    "lat",
    "long",
    "eigenaar",
    "bouwjaar",
    "begindatum",
]

CODE_FIXES = {"LOU": "HAV", "DAZK": "DAZ"}

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------


def normalize_columns(df):
    """Normalize column names by stripping whitespace, converting to lowercase, and removing BOM characters."""
    df.columns = df.columns.str.strip().str.lower().str.replace("\ufeff", "")
    return df


def fix_time(x):
    if pd.isna(x):
        return None
    x = str(x)

    if ":" in x:
        return x[:5]

    if len(x) == 4:
        return x[:2] + ":" + x[2:]

    return None


def load_and_clean(path):
    """Load raw CSV and remove useless columns."""
    df = pd.read_csv(
        path, sep=";", encoding="utf-8", low_memory=False, skip_blank_lines=True
    )
    df = normalize_columns(df)

    print(f"Loaded {len(df)} rows from {path}.")

    df = df[COLUMNS_TO_KEEP].copy()
    df["code"] = df["code"].astype("string").str.strip().str.upper().replace(CODE_FIXES)
    df["locatie"] = df["locatie"].astype("string").str.strip()
    df["uur5minuten"] = (
        df["uur5minuten"].astype(str).str.extract(r"(\d{1,2}:\d{2}|\d{3,4})")[0]
    )
    df["uur5minuten"] = df["uur5minuten"].apply(fix_time)

    df["timestamp"] = pd.to_datetime(
        df["datum"].astype("string") + " " + df["uur5minuten"], errors="coerce"
    )

    for col in ["totaal", "tegenrichting", "hoofdrichting"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").round(0).astype("Int64")

    # Keep rows with missing location names, but require a valid code and timestamp.
    df = df.dropna(subset=["totaal"])

    print(f"Cleaned data has {len(df)} rows after processing.")

    return df


def aggregate(df):
    """
    Aggregate counts by day, month, year, and hour. Also compute total counts per location.
    """
    numeric_cols = ["totaal", "tegenrichting", "hoofdrichting"]

    df["month"] = df["timestamp"].dt.to_period("M")
    df["year"] = df["timestamp"].dt.year.astype("Int64")
    df["hour"] = df["timestamp"].dt.floor("h")

    df_day = df.groupby(["code", "locatie", "datum"])[numeric_cols].sum().reset_index()
    df_month = (
        df.groupby(["code", "locatie", "month"])[numeric_cols].sum().reset_index()
    )
    df_year = df.groupby(["code", "locatie", "year"])[numeric_cols].sum().reset_index()
    df_hour = df.groupby(["code", "locatie", "hour"])[numeric_cols].sum().reset_index()
    df_totals = df.groupby(["code", "locatie"])["totaal"].sum().reset_index()

    return df_day, df_month, df_year, df_hour, df_totals


def clean_locations(
    path, output="../FietsStadGent-Framework/src/data/locations_clean.csv"
):
    """
    Clean the raw location CSV by removing useless metadata columns
    and keeping only the columns in LOCATION_COLUMNS_TO_KEEP.
    """
    df = pd.read_csv(path, sep=";", encoding="utf-8", skip_blank_lines=True)
    df = normalize_columns(df)

    df_clean = df[LOCATION_COLUMNS_TO_KEEP].copy()
    df_clean["lat"] = pd.to_numeric(df_clean["lat"], errors="coerce")
    df_clean["long"] = pd.to_numeric(df_clean["long"], errors="coerce")

    df_clean.to_csv(output, sep=";", index=False)

    print(f"Cleaned locations written to {output}")
    return df_clean


def load_totals_or_regenerate(df, totals_path):
    if totals_path and os.path.exists(totals_path):
        print(f"Loading totals from {totals_path}")
        return pd.read_csv(totals_path, sep=";")

    if os.path.exists("total_counts_per_location.csv"):
        print("Using existing total_counts_per_location.csv")
        return pd.read_csv("total_counts_per_location.csv", sep=";")

    print("No totals file found — regenerating totals...")
    _, _, _, _, totals_df = aggregate(df)
    totals_df.to_csv("total_counts_per_location.csv", sep=";", index=False)
    return totals_df


def merge_locations_with_totals(
    loc_df,
    totals_df,
    output="../FietsStadGent-Framework/src/data/locations_with_totals.csv",
):
    merged = loc_df.merge(totals_df, how="left", on="code")
    merged["locatie"] = merged["locatie"].fillna(merged["naam"])
    merged["totaal"] = merged["totaal"].fillna(0).astype("Int64")
    merged.to_csv(output, sep=";", index=False)
    print(f"Merged locations with totals written to {output}")


# ------------------------------------------------------------
# CLI
# ------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(description="Preprocess Gent fietstelpaal data.")
    parser.add_argument("input", help="Path to raw count CSV")
    parser.add_argument(
        "--data-is-clean",
        action="store_true",
        help="Indicates that the input data is already cleaned and normalized",
    )
    parser.add_argument("--aggregate", action="store_true")
    parser.add_argument(
        "--clean-locations", metavar="FILE", help="Path to locations CSV to clean"
    )
    parser.add_argument("--totals", metavar="FILE", help="Optional path to totals CSV")

    args = parser.parse_args()

    if args.data_is_clean:
        # Use utf-8-sig to handle BOM if present
        df = pd.read_csv(args.input, sep=";", encoding="utf-8-sig")
        df = normalize_columns(df)
        # Ensure timestamp column exists and is datetime
        if "timestamp" not in df.columns:
            if "datum" in df.columns and "uur5minuten" in df.columns:
                df["uur5minuten"] = df["uur5minuten"].astype(str).str.zfill(8)
                df["timestamp"] = pd.to_datetime(
                    df["datum"] + " " + df["uur5minuten"], errors="coerce"
                )
        else:
            df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        print("Loaded clean data")
    else:
        df = load_and_clean(args.input)
        df.to_csv(
            "../FietsStadGent-Framework/src/data/fietspalen_clean.csv",
            sep=";",
            index=False,
        )
        print(
            "Cleaned data written to ../FietsStadGent-Framework/src/data/fietspalen_clean.csv"
        )
        print("Loaded and cleaned data")

    totals_df = None

    if args.aggregate:
        df_day, df_month, df_year, df_hour, totals_df = aggregate(df)
        df_day.to_csv(
            "../FietsStadGent-Framework/src/data/agg_day.csv", sep=";", index=False
        )
        print(
            "Aggregated by day written to ../FietsStadGent-Framework/src/data/agg_day.csv"
        )
        df_month.to_csv(
            "../FietsStadGent-Framework/src/data/agg_month.csv", sep=";", index=False
        )
        print(
            "Aggregated by month written to ../FietsStadGent-Framework/src/data/agg_month.csv"
        )
        df_year.to_csv(
            "../FietsStadGent-Framework/src/data/agg_year.csv", sep=";", index=False
        )
        print(
            "Aggregated by year written to ../FietsStadGent-Framework/src/data/agg_year.csv"
        )
        df_hour.to_csv(
            "../FietsStadGent-Framework/src/data/agg_hour.csv", sep=";", index=False
        )
        print(
            "Aggregated by hour written to ../FietsStadGent-Framework/src/data/agg_hour.csv"
        )
        totals_df.to_csv("total_counts_per_location.csv", sep=";", index=False)
        print("Total counts per location written to total_counts_per_location.csv")
        print("Aggregation complete")

    if args.clean_locations:
        loc_df = clean_locations(args.clean_locations)
        totals_df = load_totals_or_regenerate(df, args.totals)
        merge_locations_with_totals(loc_df, totals_df)

    print("Done.")


if __name__ == "__main__":
    main()
