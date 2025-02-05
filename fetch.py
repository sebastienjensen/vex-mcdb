import os
import requests
import time
from dotenv import load_dotenv

root = 'https://www.robotevents.com/api/v2'

# HTTP header
load_dotenv()
headers = {
    'accept': 'application/json',
    'Authorization': 'Bearer ' + os.environ.get('TOKEN')
}

# Standard request function
def fetch(target, params):
    page = 1
    output = []

    # Provide for iteration through pages, if applicable
    while True:
        suffix = f'/{target}?per_page=250&page={str(page)}'
        endpoint = root + suffix
        response = requests.get(endpoint, headers=headers, params=params).json()
        output.extend(response['data'])

        if page >= response["meta"]["last_page"]:
            break

        page += 1
        time.sleep(1)
    
    return output
