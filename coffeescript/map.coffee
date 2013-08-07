Map = (options) ->
  @styles = {}
  that = this
  @options = _.extend(
    draw: false
    style: "popup"
    resultNum: 25
    #layerUrl,
    startLat: 0
    startLng: 0
    startZoom: 8
    maxZoom: 14
    pagerSize: 25
    maxMarkers: 25 #@todo: rm
  , options)
  
  #this.markers = {};
  @markerLayer = new L.FeatureGroup()
  @homeMarkerLayer = new L.FeatureGroup()
  @resultNum = @options.resultNum

  @drawMap = ->
    
    # Create the map
    @map = new L.Map(@options.id,
      center: new L.LatLng(@options.startLat, @options.startLng)
      zoom: @options.startZoom
      layers: new L.TileLayer(@options.layerUrl)
    )
    @markerLayer.addTo @map
    @homeMarkerLayer.addTo @map
    $("#map .leaflet-control-container").append ich.about()

    # Add the geosearch control
    if @options.geosearch?
      settings = _.extend((if @options.geosearch.settings is `undefined` then {} else @options.geosearch.settings),
        zoomLevel: @options.maxZoom
        submitButton: true
      )
      settings.provider = new L.GeoSearch.Provider[@options.geosearch.provider]()
      new L.Control.GeoSearch(settings).addTo @map

    # Add the locate button
    if @options.locate?
      locateUser = ->
        @map.locate settings
      settings = _.extend((if @options.locate.settings is `undefined` then {} else @options.locate.settings),
        setView: true
        maxZoom: @options.maxZoom
      )
      $(@options.locate.html).bind "click", (e) ->
        that.map.locate settings
      .appendTo "#map .leaflet-top.leaflet-center"
    console.log @map
    return

  @updateLocation = (latlng) ->
    @location = latlng
    #$(@options.updateSelector).trigger "locationUpdate"

  @addMarker = (latlng) ->
    @homeMarkerLayer.clearLayers()
    marker = L.marker(latlng,
      icon: L.AwesomeMarkers.icon(
        color: "orange"
        icon: "home"
      )
      title: "Home"
    ).addTo @homeMarkerLayer

  @drawMarkers = (data, pagerStart) ->
    @markerLayer.clearLayers()
    @pagerStart = if pagerStart? then pagerStart else 0
    
    # Re-order data array by distance to this.location
    location = (if @location isnt `undefined` then @location else @map.getCenter())
    _.each data, (item, index) ->
      item.id = index
      item.distance = that.meters2miles(location.distanceTo(new L.LatLng(item.Latitude, item.Longitude)))

    data.sort (a, b) ->
      a.distance - b.distance

    # Add new markers and update results
    $results = $(@options.resultsSelector)
    activeColor = (if (activeTab? and activeTab isnt "All Types") then _.filter(@options.tabs, (tab) ->
      tab.title is activeTab
    )[0].color else false)

    # Prep the #results div
    ###
    $results.html ""
    if data.length is 0
      $results.append ich.noResults()
    else
      if @resultNum is 100000
        $text = ich.resultSummaryAll
          num: data.length
          smaller: @options.resultNum
      else if data.length <= @resultNum 
        $text = ich.resultSummaryMatching
          num: data.length
      else
        $text = ich.resultSummary
          num: @resultNum
          total: data.length # @todo: _.keys? ; filter data to only those w lat/lon?
          location: if @locationType? then @locationType else "center of your map"
      $text.find("a").bind "click", ->
        that.resultNum = parseInt $(this).attr "rel"
        that.drawMarkers data
        false
      $results.append $text
###

    # Cycle through each item and add a marker
    $results.html ""
    if data.length is 0
      $results.append ich.noResults()
    else
      if data.length <= @resultNum 
        $text = ich.resultSummaryMatching
          num: data.length
      else
        @drawPager(data).appendTo $results


    # Cycle through each item and add a marker
    pagerEnd = if @pagerStart+@options.pagerSize < data.length then @pagerStart+@options.pagerSize else data.length

    for index in [@pagerStart..pagerEnd]
      item = data[index];
      if item? and item.Latitude? and item.Longitude?

        # Build the fields html
        item.fields = ""
        item.primaryFields = ""
        _.each that.options.fields, (field) ->
          if item[field.col]? and item[field.col] isnt ""
            val = (if (typeof item[field.col] is "string") then item[field.col] else item[field.col].join(", "))
            html = ich.fieldItem(
              label: field.label
              value: val
              primary: (if field.primary then "primary" else "not-primary")
            ,
            true)
            item.fields += html
            item.primaryFields += html if field.primary

        # Add the marker
        item.color = (if activeColor then activeColor else that.iconColor(item["Services Provided"]))
        item["Phone Number"] = item["Phone Number"] + " |" if item["Phone Number"] isnt ""
        
        marker = L.marker([item.Latitude, item.Longitude],
          icon: L.AwesomeMarkers.icon(
            text: index
            textFormat: "letter"
            color: item.color
          )
          title: item["Clinic Name"]
        )

        .on("click", (e) ->
          $item = $results.find(".item[rel=" + @_leaflet_id + "]")
          $item.addClass "active"
          $("html, body").animate
            scrollTop: $item.offset().top - 70
          , 1000
        )

        if that.options.showPopup
          marker.bindPopup(ich.popupItem(item).html(),
            closeButton: true
          )

          .on("popupclose", (e) ->
            $item = $results.find(".item[rel=" + @_leaflet_id + "]")
            $item.removeClass "active"
          )

        marker.addTo(that.markerLayer)
        
        # Add the item to the results sidebar
        item.id = marker._leaflet_id
        item.letter = marker.options.icon.num2letter(index)
        item.distance = Math.round(item.distance * 10) / 10
        $resultItem = ich.listItem(item)

        $resultItem.find(".static-marker, h3 a").bind "click", ->
          $item = $(this).parents(".item")
          marker = that.markerLayer._layers[$item.attr("rel")]
          marker.openPopup()
          that.map.panTo(marker._latlng)
          if window.responsive is "mobile"
            $item.parent().find('.item').removeClass "active"
            $("html, body").animate
              scrollTop: $item.offset().top - 70
            , 1000
          $item.addClass "active"
          false

        $resultItem.find(".close").bind "click", ->
          $item = $(this).parents(".item")
          $item.removeClass "active"
          if window.responsive isnt "mobile"
            that.markerLayer._layers[$item.attr("rel")].closePopup()
          else
            $(that.updateSelector).removeClass "left-sidebar-big"
            $("html, body").animate
              scrollTop: 0
            , 750

        $resultItem.find(".btn-directions").bind "click", ->
          #window.location = 'gps:' + item["Latitude"] + "," + item["Longitude"]
          window.open "http://maps.google.com/maps?daddr=" + item["Latitude"] + "," + item["Longitude"]

        $results.append $resultItem

    if data.length > @resultNum then @drawPager(data).appendTo $results
    @lastBounds = @map.getBounds()
    @forceZoom = undefined
    return

  @drawPager = (data) ->
    $text = ich.pager
      start: @pagerStart
      end: if (@pagerStart + @options.pagerSize < data.length) then @pagerStart + @options.pagerSize else data.length
      total: data.length
    $pager = $text.find "ul"
    if @pagerStart > @options.pagerSize*2
      min = @pagerStart - @options.pagerSize*2
      endPages = 2
    else
      min = 0
      endPages = 4 - @pagerStart/@options.pagerSize
    max = (if data.length < @pagerStart + @options.pagerSize*endPages then data.length else @pagerStart + @options.pagerSize*endPages)
    ich.pagerItem(num: "&laquo;", rel: @pagerStart-@options.pagerSize).appendTo $pager if @pagerStart > 0
    for i in [min..max] by @options.pagerSize
      $item = ich.pagerItem
        num: i/@options.pagerSize + 1
        rel: i
        class: if @pagerStart == i then "active" else ""
      $item.appendTo $pager
    ich.pagerItem(num: "&raquo;", rel: @pagerStart+@options.pagerSize).appendTo $pager if @pagerStart + @options.pagerSize < data.length
    $text.find('a').bind "click", ->
      that.drawMarkers data, parseInt $(this).attr "rel"
      false
    $text

  @markerBounds = (bounds, factor) ->
    factor = if factor? then factor-1 else 1
    lat = Math.abs(bounds._southWest.lat - bounds._northEast.lat) * factor
    lng = Math.abs(bounds._southWest.lng - bounds._northEast.lng) * factor
    "_southWest":
      lat: bounds._southWest.lat - lat
      lng: bounds._southWest.lng - lng
    "_northEast":
      lat: bounds._northEast.lat + lat
      lng: bounds._northEast.lng + lng


  @iconColor = (services) ->
    color = ""
    if services? and services.length? and services.length > 0
      service = services[0]
      _.each @options.tabs, (tab) ->
        color = tab.color  unless tab.services.indexOf(service) is -1
    color


  @meters2miles = (meters) ->
    meters * 0.00062137

  if @options.draw
    @drawMap()
    @drawMarkers @options.draw  unless typeof @options.draw is "boolean"
  
  @
  