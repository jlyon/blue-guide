function Map(options) {
  var that = this;

  this.options = _.extend({
    startLat: 0,
    startLng: 0,
    startZoom: 8
  }, options);
  this.markers = [];

  // Create the map
  this.map = new L.Map(this.options.id, {
    center: new L.LatLng(this.options.startLat, this.options.startLng), 
    zoom: this.options.startZoom, 
    layers: new L.TileLayer(this.options.layerUrl) 
  });

  // Update the map markers
  this.drawMarkers = function(data) {
    console.log('draw');
    // Remove existing markers
    _.each(this.markers, function(marker) {
      that.map.removeLayer(marker);
    });
    this.markers = [];

    // Add new markers and update results
    var $selector = $(this.options.resultsSelector);
    $selector.html('');
    _.each(data, function(item, index) {
      if (item.Latitude != undefined && item.Longitude != undefined) {
        item.id = that.markers.length;
        var marker = L.marker([item.Latitude, item.Longitude], {
          icon: L.AwesomeMarkers.icon({
            icon: 'coffee', 
            color: 'blue'
          }),
          title: item['Clinic Name'],
          id: item.id
        }).bindPopup(ich.popupItem(item).html(), {
          closeButton: true
        }).on('popupopen', function(e) {
          var $item = $selector.find('.item[rel='+this.options.id+']');
          $item.addClass('active');
          console.log($item.offset().top);
          $("html, body").animate({ scrollTop: $item.offset().top-60 }, 1000);
        }).on('popupclose', function(e) {
          var $item = $selector.find('.item[rel='+this.options.id+']');
          $item.removeClass('active');
        }).addTo(that.map);
        that.markers.push(marker);
        $selector.append(ich.listItem(item));
      }     
    });
  }

}