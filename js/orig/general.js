var query, tab;
var rev = 0.1;
window.onload=function(){

  var filters = new Filters();
  var data = locache.get('blueGuideData');
  //data = false;
  //console.log(data);
  filters.draw('#filters');

  if (data && data.rev && data.rev == rev) {
    query = new JsonQuery('body', data);
  }
  else {
    googleQuery = new GoogleSpreadsheetsQuery(filters, function(data) {
      locache.set('blueGuideData', data);
          console.log(data);

      query = new JsonQuery('body', data);
    });
    googleQuery.get('select *');
  }

  map = new Map({
    id: 'map',
    updateSelector: 'body',
    draw: true,
    resultsSelector: '#results',
    startLat: 38.659777730712534,
    startLng: -105.8203125,
    locate: true,
    geosearch: {
      provider: 'Google',
      settings: {zoomLevel: 13}
    },
    layerUrl: 'http://a.tiles.mapbox.com/v3/albatrossdigital.map-idkom5ru/{z}/{x}/{y}.png',
    fields: filters.displayFields,
    tabs: filters.tabs
  });

  $('body').bind('queryUpdate', function() {
    updateMarkers();
  });

  $('body').bind('locationUpdate', function() {
    _.each(query.data.rows, function(row) {
      query.setVal(row, 'active', true);
    });
    console.log(query.data.rows);
    updateMarkers();
  });

  map.map.on('moveend', function () {
    updateMarkers();
  })

  function updateMarkers() {
    map.drawMarkers(query.active(map.map.getBounds()));
  }

}
