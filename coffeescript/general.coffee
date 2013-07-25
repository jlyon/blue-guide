query = undefined
tab = undefined
rev = 0.1
activeTab = undefined
window.onload = ->
  
  #data = false;
  #console.log(data);
  updateMarkers = ->
    map.drawMarkers query.active(map.markerBounds(map.map.getBounds()))
    console.log "update"

  filters = new Filters()
  data = locache.get("blueGuideData")
  filters.draw "#filters"

  if data and data.rev and data.rev is rev
    query = new JsonQuery("body", data)
  else
    googleQuery = new GoogleSpreadsheetsQuery(filters, (data) ->
      locache.set "blueGuideData", data
      console.log data
      query = new JsonQuery("body", data)
    )
    googleQuery.get "select *"

  map = new Map(
    id: "map"
    updateSelector: "body"
    draw: true
    resultsSelector: "#results"
    startLat: 38.659777730712534
    startLng: -105.8203125
    locate: true
    geosearch:
      provider: "Google"
      settings:
        zoomLevel: 13

    layerUrl: "http://a.tiles.mapbox.com/v3/albatrossdigital.map-idkom5ru/{z}/{x}/{y}.png"
    fields: filters.displayFields
    tabs: filters.tabs
  )

  $("body").bind "queryUpdate", ->
    updateMarkers()

  $("body").bind "locationUpdate", ->
    _.each query.data.rows, (row) ->
      query.setVal row, "active", true
    updateMarkers()

  map.map.on "moveend", ->
    if !map.lastBounds? or !query.withinBounds(map.map.getCenter(), map.markerBounds map.lastBounds, 1.5)
      updateMarkers()
