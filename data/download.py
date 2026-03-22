import requests

URL = "https://data.stad.gent/api/explore/v2.1"
URL_CATALOG = URL + "/catalog/datasets"

PARAMS = {"select": "dataset_id", "where": '"Fietstelpaal"', "limit": 100, "offset": 0}

r = requests.get(url = URL_CATALOG, params = PARAMS)

data = r.json()

size = data["total_count"]


with open("data_fietspalen.csv", "w", encoding="utf-8") as f:
    for i, result in enumerate(data["results"]):
        id = result["dataset_id"]
        if id != "fietstelpalen-gent":
            print(f"{i + 1}/{size}: {id}")
            url = f"{URL_CATALOG}/{id}/exports/csv"

            r = requests.get(url = url)

            f.write(r.text)


with open("data_locaties.csv", "w", encoding="utf-8") as f:
    id = "fietstelpalen-gent"
    print(f"{size}/{size}: {id}")
    url = f"{URL_CATALOG}/{id}/exports/csv"

    r = requests.get(url = url)

    f.write(r.text)

