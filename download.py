import requests
import json
import time
import os


def downloadfile(name, url, overwrite=False, chunk_size=8192, timeout=30, throttle=1.0):
    # Check existence before making the request
    if (not overwrite) and os.path.exists(name):
        print(f"{name} already exists, skipping download.")
        return False

    start = time.monotonic()

    with requests.get(url, stream=True, timeout=timeout) as r:
        r.raise_for_status()
        temp = name + ".part"
        with open(temp, "wb") as f:
            for chunk in r.iter_content(chunk_size=chunk_size):
                if chunk:  # filters out keep-alive chunks
                    f.write(chunk)
        os.rename(temp, name)

    elapsed = time.monotonic() - start
    remaining = throttle - elapsed
    if remaining > 0:
        time.sleep(remaining)

    return True


def scrape(base, urls):
    for url in urls:

        filename = f"{base}/{url.split('/')[-1]}"
        downloadfile(filename, url)

        # Ensure we don't start the next download sooner than min_interval_s


def getID(url):
    # https://auslan.org.au/dictionary/video/1234.mp4 to 1234
    parts = url.split("/")
    filename = parts[-1]
    id = filename.split(".")[0]
    return id


# python download.py urls.txt
if __name__ == "__main__":

    import sys

    if len(sys.argv) < 3:
        print("Please provide the input file as an argument.")
    else:
        file = sys.argv[1]
        folder = sys.argv[2]
        with open(file) as f:
            urls = f.read().splitlines()
        scrape(folder, urls)
