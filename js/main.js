var activeTab, query, rev, tab;

query = void 0;

tab = void 0;

rev = 0.1;

activeTab = void 0;

window.onload = function() {
  var data, filters, locationUpdated, map, params, queries, resizeMap, updateMarkers;
  queries = [
    {
      context: "mobile",
      match: function() {
        return window.responsive = "mobile";
      }
    }, {
      context: "desktop",
      match: function() {
        return window.responsive = "desktop";
      }
    }
  ];
  MQ.init(queries);
  filters = new Filters();
  data = locache.get("blueGuideData");
  filters.draw("#filters", "#showFilters");
  if (data && data.rev && data.rev === rev) {
    query = new JsonQuery("body", data);
  } else {
    googleQuery = new GoogleSpreadsheetsQuery(filters, function(data) {
      locache.set("blueGuideData", data);
      query = new JsonQuery("body", data);
    });;
    googleQuery.get("select *");
  }
  params = {
    id: "map",
    updateSelector: "body",
    draw: true,
    resultsSelector: "#results",
    showPopup: window.responsive !== "mobile",
    startLat: 38.659777730712534,
    startLng: -105.8203125,
    startZoom: 7,
    locate: {
      html: ich.locateBtn()
    },
    layerUrl: "http://a.tiles.mapbox.com/v3/albatrossdigital.map-i5m0mag7/{z}/{x}/{y}.png",
    fields: filters.displayFields,
    tabs: filters.tabs
  };
  if (window.responsive !== "mobile" || 1 === 1) {
    params.geosearch = {
      provider: "Google",
      settings: {
        zoomLevel: 13
      }
    };
  }
  map = new Map(params);
  $("body").bind("queryUpdate", function() {
    updateMarkers();
    return $("body").addClass("left-sidebar-active");
  });
  map.map.on("geosearch_showlocation", function(e) {
    return locationUpdated(new L.LatLng(e.Location.Y, e.Location.X));
  });
  map.map.on("locationfound", function(e) {
    return locationUpdated(e.latlng);
  });
  map.map.on("dragend", function() {
    if ((map.lastBounds == null) || !query.withinBounds(map.map.getCenter(), map.markerBounds(map.lastBounds, 1.5))) {
      return updateMarkers();
    }
  });
  map.map.on("zoomend", function() {
    return updateMarkers();
  });
  updateMarkers = function() {
    $('#show-markers').addClass("icon-spin");
    map.drawMarkers(query.active(map.markerBounds(map.map.getBounds())));
    $('#show-markers').addClass("icon-spin");
    if (activeTab == null) {
      $("#tabs a:eq(0)").addClass("active");
    }
    return console.log("update");
  };
  locationUpdated = function(latlng) {
    map.addMarker(latlng);
    map.updateLocation(latlng);
    query.fillActive();
    updateMarkers();
    $("body").addClass("left-sidebar-active");
    return resizeMap();
  };
  resizeMap = function() {
    return window.setTimeout(function() {
      return map.map.invalidateSize({
        animate: true
      });
    }, 500);
  };
};

/*
//@ sourceMappingURL=main.js.map
*/