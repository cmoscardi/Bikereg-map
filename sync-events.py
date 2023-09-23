#!/home/codespace/.python/current/bin/python

import glob
import json
from datetime import datetime
import time
import os

import pandas as pd
import requests


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
    # add google maps url
    gmaps_func = lambda x: "https://maps.google.com?q={},{}".format(x["Latitude"], x["Longitude"])
    events["gmaps_url"] = events.apply(gmaps_func, axis=1)

    # save off
    events.to_json("events.json", orient='records')
    return events




if __name__ == "__main__":
    load_br_data()
