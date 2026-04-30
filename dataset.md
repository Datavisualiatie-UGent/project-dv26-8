# 🚲 Gent Fietstelpalen Dataset

**Data Source, Cleaning Pipeline, and Usage Guide**

This project uses open data from **Stad Gent** ([https://data.stad.gent](https://data.stad.gent)), specifically datasets tagged *Fietstelpaal*. These datasets contain bicycle counts measured every **5 minutes** at automated counting poles across the city.

---

## 📥 Data Source

We download the data using the Stad Gent API:

- **Raw counts**: CSV files with 5-minute measurements
- **Location metadata**: coordinates, owner, installation year, etc.
- **Granularity**: 5-minute intervals
- **Key fields**:
  - `code` – short identifier of the counting pole
  - `locatie` – human-readable name
  - `totaal`, `hoofdrichting`, `tegenrichting` – counts
  - `datum`, `uur5minuten` – date ISO + time

---

## 🧼 Cleaning & Transformation Pipeline

### 1. Clean raw 5-minute data

Run:

```bash
python preprocess.py fietspalen_raw.csv
```

What happens:

- Column names are normalized (lowercase, trimmed, BOM removed)
- Only relevant columns are kept:
  - `code`, `locatie`, `datum`, `uur5minuten`, `totaal`, `tegenrichting`, `hoofdrichting`
- Known code inconsistencies are fixed:
  - `LOU → HAV`
- A timestamp column is created:
  - `timestamp = datum + uur5minuten`
- Numeric columns are converted safely (invalid values → `NaN`)
- **Rows with missing or invalid `code`, `locatie`, or `timestamp` are dropped** (prevents spurious 0.0 rows in all outputs)
- Output:

```text
../FietsStadGent-Framework/src/data/fietspalen_clean.csv
```

---

### 2. Generate aggregated datasets

Run:

```bash
python preprocess.py fietspalen_raw.csv --aggregate
```

or, for already cleaned data:

```bash
python preprocess.py ../FietsStadGent-Framework/src/data/fietspalen_clean.csv --data-is-clean --aggregate
```

This produces several pre-aggregated datasets (in `../FietsStadGent-Framework/src/data/`):

| File                | Description                 |
| ------------------- | --------------------------- |
| `agg_hour.csv`      | Hourly totals per location  |
| `agg_day.csv`       | Daily totals per location   |
| `agg_month.csv`     | Monthly totals per location |
| `agg_year.csv`      | Yearly totals per location  |
| `total_counts_per_location.csv` | Total counts per location   |

Details:

- Aggregations are grouped by `code` and `locatie`
- Time-based aggregations use the computed `timestamp`
- Monthly data is stored as a **period (`YYYY-MM`)**
- Hourly data is rounded down (`floor("h")`)
- All aggregations are based on already cleaned data (no empty or invalid rows)

---

### 3. 🗺️ Clean location data

Run:

```bash
python preprocess.py fietspalen_raw.csv --clean-locations locations_raw.csv
```

What it does:

- Normalizes column names
- Keeps only relevant columns:
  - `code`, `naam`, `lat`, `long`, `eigenaar`, `bouwjaar`, `begindatum`
- Converts coordinates to numeric values
- Output:

```text
../FietsStadGent-Framework/src/data/locations_clean.csv
```

---

### 4. 🔗 Merge locations with totals

When `--clean-locations` is used, the script also creates:

```text
../FietsStadGent-Framework/src/data/locations_with_totals.csv
```

This file combines:

- Cleaned location metadata
- Total counts per location

Totals are resolved in this order:

1. `--totals FILE` (if provided)
2. existing `total_counts_per_location.csv`
3. regenerated from raw data

---

### 5. Run all Cleaning & Transformations

```bash
python preprocess.py fietspalen_raw.csv --aggregate --clean-locations locations_raw.csv
```

---

## ⚙️ CLI Options

| Option                   | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `input`                  | Path to raw count CSV or cleaned CSV                 |
| `--data-is-clean`        | Skip cleaning and assume input is already cleaned    |
| `--aggregate`            | Generate aggregated datasets                         |
| `--clean-locations FILE` | Clean location metadata CSV                          |
| `--totals FILE`          | Optional totals file for merging                     |

## All files produced (in `./FietsStadGent-Framework/src/data/`)

| File                            | Description                             |
| ------------------------------- | --------------------------------------- |
| `fietspalen_clean.csv`          | Cleaned raw 5-minute data               |
| `agg_hour.csv`                  | Hourly totals per location              |
| `agg_day.csv`                   | Daily totals per location               |
| `agg_month.csv`                 | Monthly totals per location (YYYY-MM)   |
| `agg_year.csv`                  | Yearly totals per location              |
| `total_counts_per_location.csv` | Total counts per location (summary)     |
| `locations_clean.csv`           | Cleaned location metadata               |
| `locations_with_totals.csv`     | Locations merged with total counts      |

---

## 🧠 Design Rationale

- **Pre-aggregation** → faster dashboards (e.g. Observable)
- **Strict cleaning** → prevents spurious/empty rows in all outputs
- **Flexible date parsing** → supports inconsistent raw data
- **Resilient totals logic** → avoids missing file issues
- **Separation of concerns**:
  - Python → heavy preprocessing
  - Visualization tools → lightweight queries
