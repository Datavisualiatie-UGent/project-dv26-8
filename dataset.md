# 🚲 Gent Fietstelpalen Dataset

**Data Source, Cleaning Pipeline, and Usage Guide**

This project uses open data from **Stad Gent** ([https://data.stad.gent](https://data.stad.gent)), specifically datasets tagged *Fietstelpaal*. These datasets contain bicycle counts measured every **5 minutes** at automated counting poles across the city.

---

## 📥 Data Source

We download the data using the Stad Gent API:

- **Raw counts**: CSV files (semicolon-separated `;`)
- **Location metadata**: coordinates, owner, installation year, etc.
- **Granularity**: 5-minute intervals
- **Key fields**:
  - `code` – identifier of the counting pole
  - `locatie` – human-readable name
  - `totaal`, `hoofdrichting`, `tegenrichting` – counts
  - `datum`, `uur5minuten` – date (ISO) + time

---

## 🧼 Cleaning & Transformation Pipeline

### 1. Clean raw 5-minute data

Run:

```bash
python preprocess.py fietspalen_raw.csv
```

What happens:

- CSV is read using `;` separator (Gent standard)
- Empty lines are ignored
- Column names are normalized:
  - lowercase
  - trimmed
  - BOM characters removed
- Only relevant columns are kept:
  - `code`, `locatie`, `datum`, `uur5minuten`, `totaal`, `tegenrichting`, `hoofdrichting`
- Data is standardized:
  - `code` → uppercase + whitespace removed
  - known fixes applied (`LOU → HAV`)
  - `uur5minuten` → zero-padded (`0:00:00 → 00:00:00`)
- A timestamp column is created:
  - `timestamp = datum + uur5minuten`
- Numeric columns are converted safely (`errors="coerce"`)

Cleaning rules:

- Rows with missing `totaal` are removed
- Missing `locatie` values are **allowed** (handled later)

Output:

```text
../FietsStadGent-Framework/src/data/fietspalen_clean.csv
```

---

### 2. Generate aggregated datasets

Run:

```bash
python preprocess.py fietspalen_raw.csv --aggregate
```

or using cleaned data:

```bash
python preprocess.py ../FietsStadGent-Framework/src/data/fietspalen_clean.csv --data-is-clean --aggregate
```

This generates:

| File                            | Description                 |
| ------------------------------- | --------------------------- |
| `agg_hour.csv`                  | Hourly totals per location  |
| `agg_day.csv`                   | Daily totals per location   |
| `agg_month.csv`                 | Monthly totals per location |
| `agg_year.csv`                  | Yearly totals per location  |
| `total_counts_per_location.csv` | Total counts per location   |

Details:

- Grouping keys: `code`, `locatie`
- Time-based aggregations use `timestamp`
- Monthly aggregation uses `to_period("M")`
- Hourly aggregation uses `floor("h")`
- Outputs are written using `;` separator

---

### 3. 🗺️ Clean location data

Run:

```bash
python preprocess.py fietspalen_raw.csv --clean-locations locations_raw.csv
```

What it does:

- Reads CSV using `;`
- Normalizes column names
- Keeps only:

  ```text
  code, naam, lat, long, eigenaar, bouwjaar, begindatum
  ```

- Converts coordinates to numeric values

Outputs:

```text
../FietsStadGent-Framework/src/data/locations_clean.csv
```

---

### 4. 🔗 Merge locations with totals

When `--clean-locations` is used, the script also produces:

```text
../FietsStadGent-Framework/src/data/locations_with_totals.csv
```

This file combines:

- cleaned location metadata
- total counts per location

Additional logic:

- merge is done on `code`
- missing `locatie` values are filled using `naam`

---

### Totals resolution logic

Totals are loaded in this order:

1. `--totals FILE` (if provided)
2. existing `total_counts_per_location.csv`
3. regenerated from current dataset

---

### 5. Run full pipeline

```bash
python preprocess.py fietspalen_raw.csv --aggregate --clean-locations locations_raw.csv
```

---

## ⚙️ CLI Options

| Option                   | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `input`                  | Path to raw or cleaned count CSV                     |
| `--data-is-clean`        | Skip cleaning and assume input is already normalized |
| `--aggregate`            | Generate aggregated datasets                         |
| `--clean-locations FILE` | Clean location metadata CSV                          |
| `--totals FILE`          | Optional totals file                                 |

---

## 📂 Output Files

All main outputs are written to:

```text
./FietsStadGent-Framework/src/data/
```

| File                        | Description               |
| --------------------------- | ------------------------- |
| `fietspalen_clean.csv`      | Cleaned 5-minute data     |
| `agg_hour.csv`              | Hourly aggregation        |
| `agg_day.csv`               | Daily aggregation         |
| `agg_month.csv`             | Monthly aggregation       |
| `agg_year.csv`              | Yearly aggregation        |
| `locations_clean.csv`       | Cleaned location metadata |
| `locations_with_totals.csv` | Locations + totals        |

Additionally:

| File                            | Location     |
| ------------------------------- | ------------ |
| `total_counts_per_location.csv` | ./data       |

---

## ⚠️ Important Notes

- All CSV files use **semicolon (`;`) as separator**
- Cleaned datasets must include a valid `timestamp` column
- When using `--data-is-clean`:
  - the script ensures `timestamp` exists or rebuilds it
- Missing `locatie` values are handled during merge (not dropped)

---

## 🧠 Design Rationale

- **Robust CSV handling** → supports BOM, empty lines, inconsistent formatting
- **Strict numeric cleaning** → avoids corrupted aggregations
- **Timestamp-centric design** → all time logic derived from one column
- **Pre-aggregation** → fast dashboards (e.g. Observable)
- **Separation of concerns**:

  - Python → preprocessing
  - Frontend → visualization
