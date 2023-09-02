console.log("we are in this script")
var map = L.map('map').setView([38, -98], 5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var eventLayer = L.layerGroup().addTo(map);

var sidebar = L.control.sidebar('sidebar').addTo(map);
sidebar.open("home");
//setTimeout(() => sidebar.open("home"), 500)
function genLink(link, english) {
    return '<a target="_blank" href="'+link+'">' + english + '</a>'
}
function popUpForEvents(eventlist){
    var eventStr = "";
    eventlist.forEach( (x) => {
        eventStr += ('<b>' + x.EventName +'</b> <br />'
        + genLink(x.EventUrl, x.EventUrl) + '<br />'
        + x.date.getDayName() +', '+ x.date.getMonthName() + ' '
        + x.date.getUTCDate() + ' ' + x.date.getUTCFullYear() + '<br />'
        + genLink(x.gmaps_url, "View on Google Maps") + '<hr />');
    });
    return eventStr;
}
function renderEventsToShow(){
    eventLayer.clearLayers();
    var toShowByLatLon = {};
    eventsToShow.forEach( (x) => {
        latlonstr = String(x["Latitude"]) + "-" + String(x["Longitude"]);
        if(!(latlonstr in toShowByLatLon)){
            toShowByLatLon[latlonstr] = [];
        }
        toShowByLatLon[latlonstr].push(x);
    });
    Object.keys(toShowByLatLon).forEach(latlonstr => {
        var latlonevents = toShowByLatLon[latlonstr];
        L.marker([latlonevents[0].Latitude, latlonevents[0].Longitude])
         .addTo(eventLayer)
         .bindPopup(popUpForEvents(latlonevents));
    });
    // eventsToShow.forEach( (x) => {
    //     L.marker([x.Latitude, x.Longitude]).addTo(eventLayer)
        //  .bindPopup(x.EventName + '<hr />'
        //             + genLink(x.EventUrl) + '<br />'
        //             + x.date + '<br />'
        //             + genLink(x.gmaps_url));
    // });
    console.log("yesyes??");
}

const Http = new XMLHttpRequest();
const url='/api/events';
Http.open("GET", url);
Http.send();
console.log("we sent this boi");
var res = null;
var events = null;
var eventsToShow = null;
var eventsByType = null;
Http.onload = (e) => {
    res = Http.response;
    console.log("eh??");
    events = JSON.parse(Http.response)["events"];
    eventsByType = {};
    function addToEventsByType(e) {
        e.EventTypes.forEach((t) => {
            if(t in eventsByType){
                eventsByType[t].push(e);
            }
            else {
                eventsByType[t] = [];
                eventsByType[t].push(e);
            }
        });
    }
    events.forEach(addToEventsByType);
    populateEventTypes(eventsByType);
    events.forEach((e) => { e.date = new Date(e.date)});
    console.log("eh2??")
    eventsToShow = events;
    renderEventsToShow();
}
function populateEventTypes(eventsByType){

    Object.keys(eventsByType).forEach((et) => {
        var option = document.createElement("option");
        option.text = et;
        option.value = et;
        eventType.appendChild(option);
    })
}
var startDate = document.getElementById("start-date");
var endDate = document.getElementById("end-date");
var eventType = document.getElementById("event-type");

function filterEventsHandler() {
    if(startDate.value) {
        var startDateVal = new Date(startDate.value);
    }
    else {
        var startDateVal = new Date("2022-01-01");
    }
    if (endDate.value){
        var endDateVal = new Date(endDate.value);
    }
    else {
        var endDateVal = new Date("2222-01-01");
    }
    console.log(startDateVal + "->" + endDateVal);
    function filterEvent(x){
        var filt = (x.date >= startDateVal) && (x.date <= endDateVal);
        if(eventType.value && (eventType.value != "thedefaultoption")){
            filt = filt && (x.EventTypes.includes(eventType.value))
        }
        return filt
    }
    eventsToShow = events.filter(filterEvent);
    renderEventsToShow();
}


startDate.onchange = filterEventsHandler;
endDate.onchange = filterEventsHandler;
eventType.onchange = filterEventsHandler;



// date bs
Date.prototype.getMonthName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names[this.getUTCMonth()];
};

Date.prototype.getMonthNameShort = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names_short[this.getUTCMonth()];
};

Date.prototype.getDayName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].day_names[this.getUTCDay()];
};

Date.prototype.getDayNameShort = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].day_names_short[this.getUTCDay()];
};

Date.locale = {
    en: {
       month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
       month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
       day_names: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',' Friday', 'Saturday'],
       day_names_short: ['Sun','Mon', 'Tues', 'Weds', 'Thurs',' Fri', 'Sat']
    }
};


// official order
bikereg_order = ["Bike Tour",
"BMX",
"Brevet",
"Club Membership",
"Cycling Camp",
"Cyclocross",
"Fat Bike",
"Gift Card",
"Gran Fondo",
"Gravel Grinder",
"Hill Climb",
"Multisport",
"Off Road",
"Recreational",
"Road Race",
"Special Event",
"Time Trial",
"Track",
"Virtual",
"Virtual Challenge"]
