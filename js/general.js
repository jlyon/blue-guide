var query;
window.onload=function(){

  var filters = new Filters();
  var data = locache.get('blueGuideData');
  //data = false;
  console.log(data);
  filters.draw('#filters');

  if (data) {
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

  $('body').on('queryUpdate', function() {
    map.drawMarkers(query.active());
  });

  map = new Map({
    id: 'map',
    resultsSelector: '#results',
    startLat: 38.659777730712534,
    startLng: -105.8203125,
    layerUrl: 'http://a.tiles.mapbox.com/v3/mapbox.world-bright/{z}/{x}/{y}.png'
  });

}
