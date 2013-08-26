function Map(options) {
  this.styles = {};

  var that = this;
  this.options = _.extend({
    draw: false,
    style: 'popup',
    //layerUrl,
    startLat: 0,
    startLng: 0,
    startZoom: 8
  }, options);
  //this.markers = {};
  this.markerLayer = new L.FeatureGroup();

  this.drawMap = function() {
    // Create the map
    this.map = new L.Map(this.options.id, {
      center: new L.LatLng(this.options.startLat, this.options.startLng), 
      zoom: this.options.startZoom, 
      layers: new L.TileLayer(this.options.layerUrl) 
    });
    this.markerLayer.addTo(this.map);

    // Add the geosearch control
    if (this.options.geosearch != undefined) {
      var settings = _.extend(this.options.geosearch.settings == undefined ? {} : this.options.geosearch.settings, {zoomLevel: 13});
      settings.provider = new L.GeoSearch.Provider[this.options.geosearch.provider]();
      new L.Control.GeoSearch(settings).addTo(this.map);
      this.map.on('geosearch_showlocation', function(e) {
        // @todo!
        that.updateLocation(new L.LatLng(e.Location.Y, e.Location.X))
      });
    }

    // Add the locate button
    if (this.options.locate != undefined) {
      var settings = _.extend(this.options.locate.settings == undefined ? {} : this.options.locate.settings, {setView: true});
      jQuery('<button class="btn" id="geocode" onclick="locateUser();"><span class="icon-map-marker"></span>Get my location</button>').appendTo('#map .leaflet-top.leaflet-center');
      function locateUser() {
        this.map.locate(settings);
      }
      this.map.on('locationfound', function(e) {
        // @todo!
        console.log(e.latlng);
      });
    }

    return;
  }

  this.updateLocation = function(latlng) {
    this.location = latlng;
    $(this.options.updateSelector).trigger('locationUpdate');
  }

  this.drawMarkers = function (data){
    //this.map.removeLayer(this.markerLayer);
    this.markerLayer.clearLayers();

    // Re-order data array by distance to this.location
    var location = this.location != undefined ? this.location : this.map.getCenter();
    _.each(data, function(item, index) {
      item.id = index;
      item.distance = that.meters2miles(location.distanceTo(new L.LatLng(item.Latitude, item.Longitude)));
    });
    data.sort(function(a,b) { return a.distance - b.distance } );

    // Add new markers and update results
    var $results = $(this.options.resultsSelector);
    var activeColor = (activeTab != undefined && activeTab != 'All') ? _.filter(this.options.tabs, function(tab) {return tab.title == activeTab})[0].color : false;

    $results.html('');
    _.each(data, function(item, index) {
      if (item.Latitude? && item.Longitude? && index <= 1025) {
        item.color = activeColor ? activeColor : that.iconColor(item['Services Provided']);

        var marker = L.marker([item.Latitude, item.Longitude], {
          icon: L.AwesomeMarkers.icon({
            text: index,
            textFormat: 'letter',
            color: item.color
          }),
          title: item['Clinic Name'],
        })

        .bindPopup(ich.popupItem(item).html(), {
          closeButton: true
        })

        .on('popupopen', function(e) {
          console.log(e);
          var $item = $results.find('.item[rel='+this._leaflet_id+']');
          $item.addClass('active');
          $("html, body").animate({ scrollTop: $item.offset().top-60 }, 1000)
        })

        .on('popupclose', function(e) {
          var $item = $results.find('.item[rel='+this._leaflet_id+']');
          $item.removeClass('active');
        })

        .addTo(that.markerLayer);


        // Add the item to the results sidebar
        item.fields = '';
        _.each(that.options.fields, function(field) {
          if (item[field.col] != undefined) {
            var val = (typeof item[field.col] == 'string') ? item[field.col] : item[field.col].join(', ');
            item.fields += ich.fieldItem({label: field.label, value: val, primary: field.primary ? 'primary' : 'not-primary'}, true);
          }
        });
        item.id = marker._leaflet_id;
        item.letter = marker.options.icon.num2letter(index);

        var $resultItem = ich.listItem(item);
        $resultItem.find('.static-marker, h3 a').bind('click', function() {
          that.markerLayer._layers[$(this).parents('.item').attr('rel')].openPopup();
          return false;
        });
        
        $results.append($resultItem);
      }
    });
    return;
  }

  this.iconColor = function(services) {
    var color = '';
    if (typeof services == 'array') {
      _.each(this.options.tabs, function(tab) {
        if (tab.services.indexOf(service) != -1) {
          color = tab.color;
        }
      });
    }
    return color;
  }

  this.meters2miles = function(meters) {
    return meters*0.00062137;
  }

  if (this.options.draw) {
    this.drawMap();
    if (typeof this.options.draw != 'boolean') {
      this.drawMarkers(this.options.draw);
    }
  }
  return this;
}

