var Map;

Map = function(options) {
  var that;
  this.styles = {};
  that = this;
  this.options = _.extend({
    draw: false,
    style: "popup",
    resultNum: 25,
    startLat: 0,
    startLng: 0,
    startZoom: 8,
    pagerSize: 25
  }, options);
  this.markerLayer = new L.FeatureGroup();
  this.homeMarkerLayer = new L.FeatureGroup();
  this.resultNum = this.options.resultNum;
  this.drawMap = function() {
    var locateUser, settings;
    this.map = new L.Map(this.options.id, {
      center: new L.LatLng(this.options.startLat, this.options.startLng),
      zoom: this.options.startZoom,
      layers: new L.TileLayer(this.options.layerUrl)
    });
    this.markerLayer.addTo(this.map);
    this.homeMarkerLayer.addTo(this.map);
    $("#map .leaflet-control-container").append(ich.about());
    if (this.options.geosearch !== undefined) {
      settings = _.extend((this.options.geosearch.settings === undefined ? {} : this.options.geosearch.settings), {
        zoomLevel: 15
      });
      settings.provider = new L.GeoSearch.Provider[this.options.geosearch.provider]();
      new L.Control.GeoSearch(settings).addTo(this.map);
    }
    if (this.options.locate !== undefined) {
      locateUser = function() {
        return this.map.locate(settings);
      };
      settings = _.extend((this.options.locate.settings === undefined ? {} : this.options.locate.settings), {
        setView: true,
        maxZoom: 15
      });
      jQuery(this.options.locate.html).bind("click", function(e) {
        return that.map.locate(settings);
      }).appendTo("#map .leaflet-top.leaflet-center");
    }
  };
  this.updateLocation = function(latlng) {
    return this.location = latlng;
  };
  this.addMarker = function(latlng) {
    var marker;
    this.homeMarkerLayer.clearLayers();
    return marker = L.marker(latlng, {
      icon: L.AwesomeMarkers.icon({
        color: "orange",
        icon: "home"
      }),
      title: "Home"
    }).addTo(this.homeMarkerLayer);
  };
  this.drawMarkers = function(data) {
    var $resultItem, $results, $text, activeColor, index, item, location, marker, pagerEnd, _i, _ref;
    this.markerLayer.clearLayers();
    this.pagerStart = 0;
    location = (this.location !== undefined ? this.location : this.map.getCenter());
    _.each(data, function(item, index) {
      item.id = index;
      return item.distance = that.meters2miles(location.distanceTo(new L.LatLng(item.Latitude, item.Longitude)));
    });
    data.sort(function(a, b) {
      return a.distance - b.distance;
    });
    $results = $(this.options.resultsSelector);
    activeColor = ((typeof activeTab !== "undefined" && activeTab !== null) && activeTab !== "All Types" ? _.filter(this.options.tabs, function(tab) {
      return tab.title === activeTab;
    })[0].color : false);
    $results.html("");
    if (data.length === 0) {
      $results.append(ich.noResults());
    } else {
      if (data.length <= this.resultNum) {
        $text = ich.resultSummaryMatching({
          num: data.length
        });
      } else {
        this.drawPager(data.length).appendTo($results);
      }
    }
    pagerEnd = this.pagerStart + this.options.pagerSize > data.length ? this.pagerStart : data.length;
    for (index = _i = _ref = this.pagerStart; _ref <= pagerEnd ? _i <= pagerEnd : _i >= pagerEnd; index = _ref <= pagerEnd ? ++_i : --_i) {
      item = data[index];
      if (item.Latitude !== undefined && item.Longitude !== undefined && index <= that.resultNum) {
        item.fields = "";
        item.primaryFields = "";
        _.each(that.options.fields, function(field) {
          var html, val;
          if ((item[field.col] != null) && item[field.col] !== "") {
            val = (typeof item[field.col] === "string" ? item[field.col] : item[field.col].join(", "));
            html = ich.fieldItem({
              label: field.label,
              value: val,
              primary: (field.primary ? "primary" : "not-primary")
            }, true);
            item.fields += html;
            if (field.primary) {
              return item.primaryFields += html;
            }
          }
        });
        item.color = (activeColor ? activeColor : that.iconColor(item["Services Provided"]));
        if (item["Phone Number"] !== "") {
          item["Phone Number"] = item["Phone Number"] + " |";
        }
        marker = L.marker([item.Latitude, item.Longitude], {
          icon: L.AwesomeMarkers.icon({
            text: index,
            textFormat: "letter",
            color: item.color
          }),
          title: item["Clinic Name"]
        }).on("click", function(e) {
          var $item;
          $item = $results.find(".item[rel=" + this._leaflet_id + "]");
          $item.addClass("active");
          return $("html, body").animate({
            scrollTop: $item.offset().top - 70
          }, 1000);
        });
        if (that.options.showPopup) {
          marker.bindPopup(ich.popupItem(item).html(), {
            closeButton: true
          }).on("popupclose", function(e) {
            var $item;
            $item = $results.find(".item[rel=" + this._leaflet_id + "]");
            return $item.removeClass("active");
          });
        }
        marker.addTo(that.markerLayer);
        item.id = marker._leaflet_id;
        item.letter = marker.options.icon.num2letter(index);
        item.distance = Math.round(item.distance * 10) / 10;
        $resultItem = ich.listItem(item);
        $resultItem.find(".static-marker, h3 a").bind("click", function() {
          var $item;
          $item = $(this).parents(".item");
          marker = that.markerLayer._layers[$item.attr("rel")];
          marker.openPopup();
          that.map.panTo(marker._latlng);
          if (window.responsive === "mobile") {
            $item.parent().find('.item').removeClass("active");
            $("html, body").animate({
              scrollTop: $item.offset().top - 70
            }, 1000);
          }
          $item.addClass("active");
          return false;
        });
        $resultItem.find(".close").bind("click", function() {
          var $item;
          $item = $(this).parents(".item");
          $item.removeClass("active");
          if (window.responsive !== "mobile") {
            return that.markerLayer._layers[$item.attr("rel")].closePopup();
          } else {
            $(that.updateSelector).removeClass("left-sidebar-big");
            return $("html, body").animate({
              scrollTop: -66
            }, 500);
          }
        });
        $resultItem.find(".btn-directions").bind("click", function() {
          return window.open("http://maps.google.com/maps?daddr=" + item["Latitude"] + "," + item["Longitude"]);
        });
        $results.append($resultItem);
      }
    }
    this.lastBounds = this.map.getBounds();
  };
  this.drawPager = function(data) {
    var $item, $pager, $pagerStart, $text, i, max, min, _i;
    $text = ich.pager;
    $pager = $text.find("ul");
    min = (this.pagerStart > this.options.pagerSize * 2 ? this.pagerStart / this.options.pagerSize - this.options.pagerSize : 0);
    max = (data.length < this.pagerStart + this.options.pagerSize * 2 ? ceil(data.length / this.options.pagerSize) : this.pagerStart / this.options.pagerSize + this.options.pagerSize);
    if (this.pagerStart > 0) {
      ich.pagerItem({
        num: "Prev",
        rel: this.pagerStart - this.options.pagerSize
      }).appendTo($pager);
    }
    for (i = _i = min; min <= max ? _i <= max : _i >= max; i = min <= max ? ++_i : --_i) {
      $item = ich.pagerItem({
        num: i + 1,
        rel: i * this.options.pagerSize,
        active: ($pagerStart = i * this.options.pagerSize) ? "active" : ""
      });
      $item.appendTo($pager);
    }
    if (this.pagerStart + this.options.pagerSize >= data.length) {
      ich.pagerItem({
        num: "Next",
        rel: this.pagerStart + this.options.pagerSize
      }).appendTo($pager);
    }
    $text.find('a').bind("click", function() {
      this.pagerStart = parseInt($(this).attr("rel"));
      this.drawMarkers(data);
      return false;
    });
    return $text;
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
    var color, service;
    color = "";
    if ((services != null) && (services.length != null) && services.length > 0) {
      service = services[0];
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
//@ sourceMappingURL=map1.js.map
*/