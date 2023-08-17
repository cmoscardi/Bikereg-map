from flask import Flask, render_template
import feedparser
import pandas as pd
import glob
import json

app = Flask(__name__)
BIKEREG_URL="https://www.bikereg.com/events/CalendarFeed.aspx?et=&rg=0&ns=&ne=15&pid=&states=&t=rss&type="

def load_pn_file(pn_fname):
    print('loading file', pn_fname)
    cols_to_keep = ["feature_name", "prim_lat_dec", "prim_long_dec"]
    pn_df = pd.read_csv(pn_fname, delimiter="|", usecols=cols_to_keep)
    pn_df["feature_name"] = pn_df["feature_name"].str.lower()
    pn_df["state_name"] = pn_fname.split(".")[0].split("_")[-1].lower()
    # match bikereg format for ease-of-merge
    pn_df["citystate"] = pn_df["feature_name"] + ", " + pn_df["state_name"]
    return pn_df

def load_and_clean_geo_index():
    index_files = glob.glob("place_names/DomesticNames*.txt")
    placenames = pd.concat((load_pn_file(fname) for fname in index_files), ignore_index=True)
    # 1 possibility per city,state
    return placenames.drop_duplicates(subset=["feature_name", "state_name"])

def parse_events_list():
    feed = feedparser.parse(BIKEREG_URL)
    entries = pd.DataFrame(feed['entries'])
    entries["citystate"] = entries["title"].str.split(" - ").str[-1].str.lower()
    return entries
    

events_list = parse_events_list()
placenames = load_and_clean_geo_index()
combined = events_list.merge(placenames, on='citystate')

@app.route("/api/events")
def events():
    # this is so we can add other status info if needed
    return combined
    .to_dict(orient='records')

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
