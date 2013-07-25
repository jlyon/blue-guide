var Map;

Map = function(options) {
  var that;
  this.styles = {};
  that = this;
  this.options = _.extend({
    draw: false,
    style: "popup",
    startLat: 0,
    startLng: 0,
    startZoom: 8
  }, options);
  this.markerLayer = new L.FeatureGroup();
  this.drawMap = function() {
    var locateUser, settings;
    this.map = new L.Map(this.options.id, {
      center: new L.LatLng(this.options.startLat, this.options.startLng),
      zoom: this.options.startZoom,
      layers: new L.TileLayer(this.options.layerUrl)
    });
    this.markerLayer.addTo(this.map);
    if (this.options.geosearch !== undefined) {
      settings = _.extend((this.options.geosearch.settings === undefined ? {} : this.options.geosearch.settings), {
        zoomLevel: 13
      });
      settings.provider = new L.GeoSearch.Provider[this.options.geosearch.provider]();
      new L.Control.GeoSearch(settings).addTo(this.map);
      this.map.on("geosearch_showlocation", function(e) {
        return that.updateLocation(new L.LatLng(e.Location.Y, e.Location.X));
      });
    }
    if (this.options.locate !== undefined) {
      locateUser = function() {
        return this.map.locate(settings);
      };
      settings = _.extend((this.options.locate.settings === undefined ? {} : this.options.locate.settings), {
        setView: true
      });
      jQuery("<button class=\"btn\" id=\"geocode\" onclick=\"locateUser();\"><span class=\"icon-map-marker\"></span>Get my location</button>").appendTo("#map .leaflet-top.leaflet-center");
      this.map.on("locationfound", function(e) {
        return console.log(e.latlng);
      });
    }
  };
  this.updateLocation = function(latlng) {
    this.location = latlng;
    return $(this.options.updateSelector).trigger("locationUpdate");
  };
  this.drawMarkers = function(data) {
    var $results, activeColor, location;
    this.markerLayer.clearLayers();
    location = (this.location !== undefined ? this.location : this.map.getCenter());
    _.each(data, function(item, index) {
      item.id = index;
      return item.distance = that.meters2miles(location.distanceTo(new L.LatLng(item.Latitude, item.Longitude)));
    });
    data.sort(function(a, b) {
      return a.distance - b.distance;
    });
    $results = $(this.options.resultsSelector);
    activeColor = ((typeof activeTab !== "undefined" && activeTab !== null) && activeTab !== "All" ? _.filter(this.options.tabs, function(tab) {
      return tab.title === activeTab;
    })[0].color : false);
    $results.html("");
    _.each(data, function(item, index) {
      var $resultItem, marker;
      if (item.Latitude !== undefined && item.Longitude !== undefined && index <= 1025) {
        item.color = (activeColor ? activeColor : that.iconColor(item["Services Provided"]));
        marker = L.marker([item.Latitude, item.Longitude], {
          icon: L.AwesomeMarkers.icon({
            text: index,
            textFormat: "letter",
            color: item.color
          }),
          title: item["Clinic Name"]
        }).bindPopup(ich.popupItem(item).html(), {
          closeButton: true
        }).on("popupopen", function(e) {
          var $item;
          console.log(e);
          $item = $results.find(".item[rel=" + this._leaflet_id + "]");
          $item.addClass("active");
          return $("html, body").animate({
            scrollTop: $item.offset().top - 60
          }, 1000);
        }).on("popupclose", function(e) {
          var $item;
          $item = $results.find(".item[rel=" + this._leaflet_id + "]");
          return $item.removeClass("active");
        }).addTo(that.markerLayer);
        item.fields = "";
        _.each(that.options.fields, function(field) {
          var val;
          if (item[field.col] != null) {
            val = (typeof item[field.col] === "string" ? item[field.col] : item[field.col].join(", "));
            return item.fields += ich.fieldItem({
              label: field.label,
              value: val,
              primary: (field.primary ? "primary" : "not-primary")
            }, true);
          }
        });
        item.id = marker._leaflet_id;
        item.letter = marker.options.icon.num2letter(index);
        $resultItem = ich.listItem(item);
        $resultItem.find(".static-marker, h3 a").bind("click", function() {
          that.markerLayer._layers[$(this).parents(".item").attr("rel")].openPopup();
          return false;
        });
        return $results.append($resultItem);
      }
    });
    this.lastBounds = this.map.getBounds();
  };
  this.markerBounds = function(bounds, factor) {
    var lat, lng, _ref;
    factor = (_ref = factor != null) != null ? _ref : factor - {
      1: 1
    };
    lat = Math.abs(bounds._southWest.lat - bounds._northEast.lat) * factor;
    lng = Math.abs(bounds._southWest.lng - bounds._northEast.lng) * factor;
    return {
      "_southWest": {
        lat: bounds._southWest.lat - lat,
        lng: bounds._southWest.lng - lng
      },
      "_northEast": {
        lat: bounds._northEast.lat + lat,
        lng: bounds._northEast.lng + lng
      }
    };
  };
  this.iconColor = function(services) {
    var color;
    color = "";
    if (typeof services === "array") {
      _.each(this.options.tabs, function(tab) {
        if (tab.services.indexOf(service) !== -1) {
          return color = tab.color;
        }
      });
    }
    return color;
  };
  this.meters2miles = function(meters) {
    return meters * 0.00062137;
  };
  if (this.options.draw) {
    this.drawMap();
    if (typeof this.options.draw !== "boolean") {
      this.drawMarkers(this.options.draw);
    }
  }
  return this;
};

/*
//@ sourceMappingURL=map.js.map
*/