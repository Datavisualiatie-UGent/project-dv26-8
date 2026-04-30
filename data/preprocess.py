#!/usr/bin/env python3
import argparse
import pandas as pd
import os

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

COLUMNS_TO_KEEP = ["code", "locatie", "datum", "uur5minuten", "totaal", "tegenrichting", "hoofdrichting"]

LOCATION_COLUMNS_TO_KEEP = ["code", "naam", "lat", "long", "eigenaar", "bouwjaar", "begindatum"]

CODE_FIXES = {"LOU": "HAV"}

# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------


def normalize_columns(df):
    df.columns = df.columns.str.strip().str.lower().str.replace("\ufeff", "")
    return df


def load_and_clean(path):
    """Load raw CSV and remove useless columns."""
    df = pd.read_csv(path, sep=";", encoding="utf-8", low_memory=False, skip_blank_lines=True)
    df = normalize_columns(df)
    df = df[COLUMNS_TO_KEEP].copy()

    df["code"] = df["code"].replace(CODE_FIXES)
    df["uur5minuten"] = df["uur5minuten"].str.zfill(8)
    df["timestamp"] = pd.to_datetime(df["datum"] + " " + df["uur5minuten"], errors="coerce")

    for col in ["totaal", "tegenrichting", "hoofdrichting"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def aggregate(df):
    """
    Aggregate counts by day, month, year, and hour. Also compute total counts per location.
    """
    numeric_cols = ["totaal", "tegenrichting", "hoofdrichting"]

    df_day = df.groupby(["code", "locatie", "datum"])[numeric_cols].sum().reset_index()
    df_month = (
        df.groupby(["code", "locatie", df["timestamp"].dt.to_period("M")])[numeric_cols]
        .sum()
        .reset_index()
        .rename(columns={"timestamp": "month"})
    )
    df_year = (
        df.groupby(["code", "locatie", df["timestamp"].dt.year])[numeric_cols]
        .sum()
        .reset_index()
        .rename(columns={"timestamp": "year"})
    )

    df_hour = (
        df.groupby(["code", "locatie", df["timestamp"].dt.floor("h")])[numeric_cols]
        .sum()
        .reset_index()
        .rename(columns={"timestamp": "hour"})
    )

    df_totals = df.groupby(["code", "locatie"])["totaal"].sum().reset_index()

    return df_day, df_month, df_year, df_hour, df_totals


def clean_locations(path, output="locations_clean.csv"):
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


def merge_locations_with_totals(loc_df, totals_df, output="locations_with_totals.csv"):
    merged = loc_df.merge(totals_df, how="left", on="code")
    merged.to_csv(output, sep=";", index=False)
    print(f"Merged locations with totals written to {output}")


# ------------------------------------------------------------
# CLI
# ------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(description="Preprocess Gent fietstelpaal data.")
    parser.add_argument("input", help="Path to raw count CSV")
    parser.add_argument(
        "--data-is-clean", action="store_true", help="Indicates that the input data is already cleaned and normalized"
    )
    parser.add_argument("--aggregate", action="store_true")
    parser.add_argument("--clean-locations", metavar="FILE", help="Path to locations CSV to clean")
    parser.add_argument("--totals", metavar="FILE", help="Optional path to totals CSV")

    args = parser.parse_args()

    if args.data_is_clean:
        df = pd.read_csv(args.input, sep=";", encoding="utf-8")
        df = normalize_columns(df)
        print("Loaded clean data")
    else:
        df = load_and_clean(args.input)
        df.to_csv("fietspalen_clean.csv", sep=";", index=False)
        print("Loaded and cleaned data")

    totals_df = None

    if args.aggregate:
        df_day, df_month, df_year, df_hour, totals_df = aggregate(df)
        df_day.to_csv("agg_day.csv", sep=";", index=False)
        df_month.to_csv("agg_month.csv", sep=";", index=False)
        df_year.to_csv("agg_year.csv", sep=";", index=False)
        df_hour.to_csv("agg_hour.csv", sep=";", index=False)
        totals_df.to_csv("total_counts_per_location.csv", sep=";", index=False)
        print("Aggregation complete")

    if args.clean_locations:
        loc_df = clean_locations(args.clean_locations)
        totals_df = load_totals_or_regenerate(df, args.totals)
        merge_locations_with_totals(loc_df, totals_df)

    print("Done.")


if __name__ == "__main__":
    main()
