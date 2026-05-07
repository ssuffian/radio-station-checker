#!/usr/bin/env python3
"""
Local poll runner — appends one row to data/votes.csv every minute.
Run from the repo root: python poll_local.py
Stop with Ctrl+C. Commit and push manually when done.
"""
import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

URL = "https://q99fm.com/api/v1/polls?ids=3936_7047"
CSV = Path(__file__).parent / "data" / "votes.csv"


def fetch():
    with urllib.request.urlopen(URL, timeout=10) as r:
        return json.load(r)


def record():
    data = fetch()["data"]["3936_7047"]["options"]
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    row = f"{ts},{data['47295']},{data['47296']},{data['47297']}"
    with CSV.open("a") as f:
        f.write(row + "\n")
    print(row)


if __name__ == "__main__":
    print(f"Polling every 60s → {CSV}. Ctrl+C to stop.\n")
    while True:
        try:
            record()
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(60)
