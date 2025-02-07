import requests
import time

root = 'https://www.robotevents.com/api/v2'

# Standard request function
def fetch(config, target, params):
    # HTTP header
    headers = {
        "accept": "application/json",
        "Authorization": "Bearer " + config["token"]
    }
    page = 1
    output = []

    # Provide for iteration through pages, if applicable
    while True:
        suffix = f"/{target}?per_page=250&page={str(page)}"
        endpoint = root + suffix
        response = requests.get(endpoint, headers=headers, params=params).json()
        output.extend(response["data"])

        if page >= response["meta"]["last_page"]:
            break

        page += 1
        time.sleep(1 + (page * 0.1))
    
    return output