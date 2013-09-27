var activeTab, query, rev, tab;

query = void 0;

tab = void 0;

rev = 0.14;

activeTab = void 0;

window.onload = function() {
  var $about, activate, data, filters, locationUpdated, map, params, queries, resizeMap, updateMarkers;
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
  locache.set("blueGuideData", data);
  filters.draw("#filters", "#showFilters");
  if ((data != null) && (data.rev != null) && data.rev === rev) {
    query = new JsonQuery("body", data);
  } else {
    /*
    `googleQuery = new GoogleSpreadsheetsQuery(filters, function(data) {
      locache.set("blueGuideData", data);
      query = new JsonQuery("body", data);
      console.log(data);
    });`
    googleQuery.get "select *"
    console.log data
    */

    jQuery.getJSON("json/data.json?rev=" + rev, {}, function(data) {
      locache.set("blueGuideData", data);
      return query = new JsonQuery("body", data);
    });
  }
  if (window.responsive !== "mobile") {
    $('.row-fluid>div').height($(window).height() - $('.navbar').height());
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
    geosearch: {
      provider: "Google",
      settings: {
        searchLabel: "Search for address...",
        zoomLevel: 13,
        showMarker: false,
        open: true
      }
    },
    locate: {
      html: ich.locateBtn()
    },
    layerUrl: "http://a.tiles.mapbox.com/v3/albatrossdigital.map-i5m0mag7/{z}/{x}/{y}.png",
    retinaLayerUrl: "http://a.tiles.mapbox.com/v3/albatrossdigital.map-bqcirtj9/{z}/{x}/{y}.png",
    fields: filters.displayFields,
    tabs: filters.tabs,
    pagerSize: window.responsive !== "mobile" ? 25 : 10
  };
  map = new Map(params);
  $("body").bind("queryUpdate", function() {
    updateMarkers();
    return activate();
  });
  map.map.on("geosearch_showlocation", function(e) {
    return locationUpdated(new L.LatLng(e.Location.Y, e.Location.X), e.Location.Label);
  });
  map.map.on("locationfound", function(e) {
    return locationUpdated(e.latlng, "your location");
  });
  map.map.on("dragend", function() {
    if ((map.lastBounds == null) || !query.withinBounds(map.map.getCenter(), map.markerBounds(map.lastBounds, 1))) {
      return updateMarkers();
    }
  });
  map.map.on("zoomend", function() {
    return updateMarkers(map.pagerStart);
  });
  $("#showLocate").bind("click", function() {
    $(this).toggleClass("active");
    $("body").toggleClass("locate-active");
    return map.scroll("body", 0);
  });
  $("#showFilters").bind("click", function() {
    return map.scroll(".right-sidebar", 0);
  });
  if (window.responsive === "mobile") {
    $about = ich.about();
    /*$search = $("#map .leaflet-top.leaflet-left").clone()
    #$search.find('.leaflet-control-geosearch').removeClass "leaflet-control-geosearch"
    $search.find('#leaflet-control-geosearch-submit').bind "click", ->
      $("#map #leaflet-control-geosearch-qry").val $(this).parent().find("#leaflet-control-geosearch-qry").val()
      $("#map #leaflet-control-geosearch-submit").trigger "click"
    $search.find('#geocode').bind "click", ->
      $("#map #geocode").trigger "click"
    */

    $("#main").append($about);
  } else {
    $("#map .leaflet-control-container").prepend(ich.about());
  }
  updateMarkers = function(pagerStart) {
    var newZoom;
    $("body").addClass("loading");
    data = query.active(map.markerBounds(map.map.getBounds()));
    if ((map.forceZoom != null) && data.length < map.options.pagerSize * .8 && map.forceZoom < 4) {
      newZoom = map.map.getZoom() - 1;
      if (newZoom < 0) {
        newZoom = 13;
      }
      map.map.setZoom(newZoom);
      return map.forceZoom = parseInt(map.forceZoom) + 1;
    } else {
      map.drawMarkers(data, pagerStart);
      $('#show-markers').addClass("icon-spin");
      if (activeTab == null) {
        return $("#tabs a:eq(0)").addClass("active");
      }
    }
  };
  activate = function() {
    $("body").addClass("left-sidebar-active").removeClass("overlay-active");
    return resizeMap();
  };
  locationUpdated = function(latlng, locationType) {
    map.locationType = locationType;
    map.addMarker(latlng);
    map.updateLocation(latlng);
    map.forceZoom = 1;
    filters.constructQuery();
    return activate();
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