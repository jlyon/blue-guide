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
    maxZoom: 14,
    pagerSize: 25
  }, options);
  this.markerLayer = new L.FeatureGroup();
  this.homeMarkerLayer = new L.FeatureGroup();
  this.resultNum = this.options.resultNum;
  this.init = false;
  this.drawMap = function() {
    var locateUser, settings;
    this.map = new L.Map(this.options.id, {
      center: new L.LatLng(this.options.startLat, this.options.startLng),
      zoom: this.options.startZoom,
      attributionControl: false,
      layers: new L.TileLayer(this.options.layerUrl)
    });
    this.markerLayer.addTo(this.map);
    this.homeMarkerLayer.addTo(this.map);
    if (this.options.geosearch != null) {
      settings = _.extend((this.options.geosearch.settings === undefined ? {} : this.options.geosearch.settings), {
        zoomLevel: this.options.maxZoom,
        submitButton: true
      });
      settings.provider = new L.GeoSearch.Provider[this.options.geosearch.provider]();
      new L.Control.GeoSearch(settings).addTo(this.map);
    }
    if (this.options.locate != null) {
      locateUser = function() {
        return this.map.locate(settings);
      };
      settings = _.extend((this.options.locate.settings === undefined ? {} : this.options.locate.settings), {
        setView: true,
        maxZoom: this.options.maxZoom
      });
      $(this.options.locate.html).bind("click touchstart", function(e) {
        that.map.locate(settings);
        return L.DomEvent.preventDefault(e);
      }).appendTo("#map .leaflet-top.leaflet-left");
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
  this.drawMarkers = function(data, pagerStart) {
    var $resultItem, $results, $text, activeColor, index, item, location, marker, pagerEnd, _i, _ref;
    if (!this.init) {
      this.init = true;
      return;
    }
    this.markerLayer.clearLayers();
    this.pagerStart = pagerStart != null ? pagerStart : 0;
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
        this.drawPager(data).appendTo($results);
      }
    }
    pagerEnd = this.pagerStart + this.options.pagerSize < data.length ? this.pagerStart + this.options.pagerSize : data.length;
    for (index = _i = _ref = this.pagerStart; _ref <= pagerEnd ? _i <= pagerEnd : _i >= pagerEnd; index = _ref <= pagerEnd ? ++_i : --_i) {
      item = data[index];
      if ((item != null) && (item.Latitude != null) && (item.Longitude != null)) {
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
        if (item["Phone Number"] !== "" && item["Phone Number"].indexOf("|" === -1)) {
          item["Phone Number"] = item["Phone Number"] + " |";
        }
        marker = L.marker([item.Latitude, item.Longitude], {
          icon: L.AwesomeMarkers.icon({
            text: index,
            textFormat: "letter",
            color: item.color
          }),
          title: item["Clinic Name"]
        }).on("click touchstart", function(e) {
          var $item;
          $item = $results.find(".item[rel=" + this._leaflet_id + "]");
          $results.find('.item.active').removeClass("active");
          $item.addClass("active");
          return that.scroll($results, $item);
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
        if (window.responsive === "mobile") {
          $resultItem.find(".static-marker").bind("click", function(e) {
            var $item;
            $item = $(this).parents(".item");
            if ($item.hasClass('active')) {
              return $item.removeClass("active");
            } else {
              return that.scroll("body", 0);
            }
          });
        }
        $resultItem.find(".static-marker, h3 a").bind("click", function(e) {
          var $item;
          $item = $(this).parents(".item");
          if ($item.hasClass("active")) {
            that.closeItem($item, true);
          } else {
            marker = that.markerLayer._layers[$item.attr("rel")];
            that.map.panTo(marker._latlng);
            if (window.responsive !== "mobile") {
              marker.openPopup();
            }
            $item.addClass("active");
          }
          return false;
        });
        $resultItem.find(".close").bind("click", function() {
          that.closeItem($(this).parents(".item"));
          if (window.responsive === "mobile") {
            return that.scroll("body", 0);
          }
        });
        $resultItem.find(".btn-directions").bind("click touchstart", function() {
          if (window.os === "android") {
            return navigator.app.loadUrl("http://maps.google.com/maps?daddr=" + item["Latitude"] + "," + item["Longitude"], {
              openExternal: true
            });
          } else if (window.os === "ios") {
            return window.location = 'maps:' + item["Latitude"] + "," + item["Longitude"];
          } else {
            return window.open("http://maps.google.com/maps?daddr=" + item["Latitude"] + "," + item["Longitude"]);
          }
        });
        if (window.os === "android" || window.os === "ios") {
          $resultItem.find(".website").bind("click", function() {
            navigator.app.loadUrl($(this).attr("href", {
              openExternal: true
            }));
            return false;
          });
        }
        $results.append($resultItem);
      }
    }
    if (data.length > this.resultNum) {
      this.drawPager(data).appendTo($results);
    }
    this.lastBounds = this.map.getBounds();
    this.forceZoom = void 0;
    this.scroll("body", 0);
    $("body").removeClass("loading");
  };
  this.scroll = function(parent, element) {
    var top;
    if (window.responsive === "mobile") {
      parent = "body";
      top = element === 0 ? 0 : $(element).offset().top - 75;
    } else {
      top = element === 0 ? 0 : $(parent).scrollTop() + $(element).offset().top - $(parent).offset().top;
    }
    return $(parent).animate({
      scrollTop: top
    }, {
      duration: 'slow',
      easing: 'swing'
    });
  };
  this.closeItem = function($item, noScroll) {
    $item.removeClass("active");
    if (window.responsive !== "mobile") {
      return that.markerLayer._layers[$item.attr("rel")].closePopup();
    } else {
      $(that.updateSelector).removeClass("left-sidebar-big");
      if ((noScroll != null) && !noScroll) {
        return that.scroll($results, 0);
      }
    }
  };
  this.drawPagerSummary = function(data) {
    return ich.pager({
      start: this.pagerStart,
      end: this.pagerStart + this.options.pagerSize < data.length ? this.pagerStart + this.options.pagerSize : data.length,
      total: data.length
    });
  };
  this.drawPager = function(data) {
    var $item, $pager, $text, endPages, i, max, min, _i, _ref;
    $text = this.drawPagerSummary(data);
    $pager = $text.find("ul");
    if (this.pagerStart > this.options.pagerSize * 2) {
      min = this.pagerStart - this.options.pagerSize * 2;
      endPages = 2;
    } else {
      min = 0;
      endPages = 4 - this.pagerStart / this.options.pagerSize;
    }
    max = (data.length < this.pagerStart + this.options.pagerSize * endPages ? data.length : this.pagerStart + this.options.pagerSize * endPages);
    if (this.pagerStart > 0) {
      ich.pagerItem({
        num: "&laquo;",
        rel: this.pagerStart - this.options.pagerSize
      }).appendTo($pager);
    }
    for (i = _i = min, _ref = this.options.pagerSize; _ref > 0 ? _i <= max : _i >= max; i = _i += _ref) {
      $item = ich.pagerItem({
        num: i / this.options.pagerSize + 1,
        rel: i,
        "class": this.pagerStart === i ? "active" : ""
      });
      $item.appendTo($pager);
    }
    if (this.pagerStart + this.options.pagerSize < data.length) {
      ich.pagerItem({
        num: "&raquo;",
        rel: this.pagerStart + this.options.pagerSize
      }).appendTo($pager);
    }
    $text.find('a').bind("click", function() {
      that.drawMarkers(data, parseInt($(this).attr("rel")));
      that.scroll($(that.options.resultsSelector), 0);
      return false;
    });
    return $text;
  };
  this.markerBounds = function(bounds, factor) {
    var lat, lng;
    factor = factor != null ? factor - 1 : 1;
    factor = 0;
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
//@ sourceMappingURL=map.js.map
*/