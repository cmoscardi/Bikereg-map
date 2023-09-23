#!/home/codespace/.python/current/bin/python

from flask import Flask, render_template, request
import pandas as pd
import glob
import json
import requests
from datetime import datetime
import time
import os

app = Flask(__name__)
BIKEREG_URL="https://www.bikereg.com/events/CalendarFeed.aspx?et=&rg=0&ns=&ne=15&pid=&states=&t=rss&type="
br_url = "https://www.bikereg.com/api/search"

def trydate(x):
    x = x[6:-7]
    try:
        return datetime.fromtimestamp((int(x) / 1000) + 4 * 3600).date().strftime("%Y-%m-%d")
    except:
        print(x)
        raise

def make_br_call(startpage=0):
    br_page_url = br_url + "?startpage={}".format(startpage)
    rj = requests.get(br_page_url).json()["MatchingEvents"]
    rdf = pd.DataFrame(rj)  
    if len(rdf) == 0:
        return rdf
    rdf["date"] = rdf["EventDate"].apply(trydate)
    return rdf

def load_br_data():
    print("loading BR data...")
    responses = []
    latest_df = ['x']
    i = 0
    while len(latest_df) > 0:
        print("loading page {}".format(i))
        latest_df = make_br_call(startpage=i)
        print("{} results".format(len(latest_df)))
        responses.append(latest_df)
        print("====")
        time.sleep(.5)
        i = i + 1
    events =  pd.concat(responses, ignore_index=True)
    events.to_json("events.json")
    return events

bikereg_events = pd.read_pickle("events.pkl")
gmaps_func = lambda x: "https://maps.google.com?q={},{}".format(x["Latitude"], x["Longitude"])
bikereg_events["gmaps_url"] = bikereg_events.apply(gmaps_func, axis=1)

@app.route("/api/events")
def events():
    # this is so we can add other status info if needed
    argsdict = request.args
    fields_to_return = ["EventName", "EventUrl", "date", "Latitude", "Longitude", "EventTypes", "gmaps_url"]
    return {"events": bikereg_events[fields_to_return].dropna(subset=["Latitude", "Longitude"]).to_dict(orient='records')}

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    import sys
    if len(sys.argv) == 1:
        load_br_data()
    else:
        app.run(debug=True)
