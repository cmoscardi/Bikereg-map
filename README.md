## Bikereg map
It's bikereg, but in map form


## dev notes
i think we're gonna need a backend (or a free geocoding API and CORS get-aroundder).

backend will
- geocode
- cache bikereg RSS
- yuck
- maybe email if geocoding doesn't work

## geocode strategy
this file has the goods (we just need to do city/state)
- https://prd-tnm.s3.amazonaws.com/StagedProducts/GeographicNames/DomesticNames/DomesticNames_AllStates_Text.zip