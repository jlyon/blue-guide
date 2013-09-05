Blue Guide
==========

A complete system to visualize healthcare providers for ___. For a live demo, go to http://blueguide.cohealthinitiative.org.

This documentation was prepared by [Albatross Digital](http://albatrossdigital.com), who worked with the [Colorado Health Initiative](http:// cohealthinitiative.org) to build the inital Colorado Blue Guide.

Overview
--------

This document walks you through the process of setting up your map. The process of creating the clinic map is separated into two parts:

1. Data collection, geocoding and formatting
2. Setting up and customizing the map

The [Colorado Health Initiative](http:// cohealthinitiative.org) is available to assist in Step 1. [Albatross Digital](http://albatrossdigital.com) can help you geocode, set up and customize your map (for a fee).

1. Data collection, geocoding and formatting
--------------------------------------------

###Copy the Google Doc
We have created a Google Doc template to help you collect, geocode, and export your data in a format that the map application can read.
* [Open the Blue Guide Template spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0AlaP5UvLJD2wdG1JdFBxbHl5YTVxb0RYOUZBYlhYNUE*gid=0).
* Go to File -> Make a copy and enter a new file name.

###Enter your data
Open your new spreadsheet and start filling in content.  The Example sheet (tab at the bottom) contains 20 entries from the Colorado Blue Guide and should be helpful in filling out your own data. Here is a brief overview of the fields:
* Columns `A-J`, `O-Q` are text fields that should be self-explanitory.
* Column `K` (Full Address) is a formula and will automatically be completed from the other address columns.
* Columns `L`, `M`, `N` will be completed during the geocoding process (below).
* Columns `R-T`, `U-X` are either Y/N fields or text fields.  See the Example sheet.
* Columns `Y-DA` are binary on/off columns.  If the clinic provides the service, enter an `X`. If not, leave it blank.  There can be multiple entries per category. See the Example sheet.

Staff members from the Colorado Health Initiative are available for assistance. Contact @todo.

###Geocode your data
We need latitudes and longitudes for each address in order to plot them on the map. This process is called geocoding. The Google Spreadsheet has Mapbox's [Geo for Google Docs](https://github.com/mapbox/geo-googledocs) plugin installed for easy geocoding. Geocode addresses after they have been entered:
* Highlight the Full Address column (`K`)
* In the document menu, click on `Geo` (right after `Help`). Go to Geo -> Geocode addresses.
* You will be asked to verify the app.  Give it permission by connecting it to your Google account.
* Go to Geo -> Geocode addresses again.
* Select a geocoding server. We recommend `mapquest`, and filling in with `google`.
* The script will run through each row, generating values for Columns `L`, `M`, `N`.
* After the script has run, ensure that there are values in each columns `L`, `M`, `N`, and that Column `O` is Email. You may need to cut/paste data as the Geocoding script can move columns around.

###Export your data to JSON for the map app
The final step is to export the Google Spreadsheet into compact format that the map app can read.  We use [JSON](http://en.wikipedia.org/wiki/JSON).
@todo

2. Setting up the map app
-------------------------

We are open-sourcing the entire Blue Guide application.  The application uses the Leaflet HTML5 mapping library.  The look and feel of the map can be cusomtized by tweaking the CSS stylesheets and customizing the map tiles.  See the Customizing section below for details.

###Create your Github repository by forking the Colorado Blue Guide
The Colorado Blue Guide uses Github to host the entire map app.  [Github's hosting service](http://pages.github.com/) is completely free, as long as you are alright with your data being open-sourced.  [Read more about working with Git](https://help.github.com/articles/set-up-git).
* To generate User and Organization pages, you'll need to create a repository named `username.github.io` or `orgname.github.io` first. The username or organization name must be your own or Pages will not build. 
* Go to https://github.com/jlyon/colorado-blue-guide and click on the Fork link in the upper-right.
* The Blue Guide with 20 demo data points will now be available at `username.github.io/reponame`.
* [Set up your custom (.com/.org) domain](https://help.github.com/articles/setting-up-a-custom-domain-with-pages).

###Load in your data
Copy the file that you created in the Export step above into the json dir such that `json/data.json` exists.  If everything went right, you should be able to see your points and filter based on your categories right out of the box.

###Customizing the map
The map was built using [Leaflet.js](http://leafletjs.com/), and uses many web technologies, including [incanhaz.js](http://icanhazjs.com/) for templates, [CoffeeScript](http://coffeescript.org/) to preprocess javascript and [SASS](http://sass-lang.com/)/[Compass](http://compass-style.org/) to preprocess CSS styles.  Everything can be compiled and watched at once using [Grunt](http://gruntjs.com/) (requires node.js):
```
cd .grunt
sudo bash install.sh
grunt
```

[Albatross Digital](http://albatrossdigital.com) is available for paid support. Email contact@albatrossdigital.com for more information.

####Customizing the text and HTML
All of the text can be edited in index.html. The top of the file has the generate page structure, including the header and logo. Below there are `<script>` tags that have templates for different page elements (the splash page, the sidebar results, the popups, etc).

####Customizing the map tiles
By default, the open-source Colorado Blue Guide ships with map tiles from Open Street Map, which are admmittedly not very pretty.  There are many different layers possible.  We recommend [MapBox](http://mapbox.com), which will allow you to customize the tiles in an easy-to-use web interface. [See additional providers](https://github.com/leaflet-extras/leaflet-providers).

To switch out the map tiles, edit the `layerUrl` attribute in `coffeescript/main.coffee`, line 57.  To use mapbox (MAP_ID) will be something like `albatrossdigital.map-********`:
```
layerUrl: "http://a.tiles.mapbox.com/v3/MAP_ID/{z}/{x}/{y}.png"
```
####Customizing the styles
You should edit files in `sass/`, not the CSS files. Most of the spreadsheets are broken out into various components in `sass/components/`.

####Customizing the filters
The filters can be customized by editing the `@tabs` and `@fields` arrays in `coffeescript/filters.coffee`.




