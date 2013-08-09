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
    pagerSize: 25
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
    unless @options.geosearch is `undefined`
      settings = _.extend((if @options.geosearch.settings is `undefined` then {} else @options.geosearch.settings),
        zoomLevel: 15
      )
      settings.provider = new L.GeoSearch.Provider[@options.geosearch.provider]()
      new L.Control.GeoSearch(settings).addTo @map

    # Add the locate button
    unless @options.locate is `undefined`
      locateUser = ->
        @map.locate settings
      settings = _.extend((if @options.locate.settings is `undefined` then {} else @options.locate.settings),
        setView: true
        maxZoom: 15
      )
      jQuery(@options.locate.html).bind "click", (e) ->
        that.map.locate settings
      .appendTo "#map .leaflet-top.leaflet-center"

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

  @drawMarkers = (data) ->
    @markerLayer.clearLayers()
    @pagerStart = 0
    
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
    $results.html ""
    if data.length is 0
      $results.append ich.noResults()
    else
      if data.length <= @resultNum 
        $text = ich.resultSummaryMatching
          num: data.length
      else
        @drawPager(data.length).appendTo $results

    # Cycle through each item and add a marker
    pagerEnd = if @pagerStart+@options.pagerSize > data.length then @pagerStart else data.length
    for index in [@pagerStart..pagerEnd]
      item = data[index];
      if item.Latitude isnt `undefined` and item.Longitude isnt `undefined` and index <= that.resultNum

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
              scrollTop: -66
            , 500

        $resultItem.find(".btn-directions").bind "click", ->
          window.open "http://maps.google.com/maps?daddr=" + item["Latitude"] + "," + item["Longitude"]

        $results.append $resultItem

    @lastBounds = @map.getBounds()
    return

  @drawPager = (data) ->
    $text = ich.pager
    $pager = $text.find "ul"
    min = (if @pagerStart > @options.pagerSize*2 then @pagerStart/@options.pagerSize - @options.pagerSize else 0)
    max = (if data.length < @pagerStart + @options.pagerSize*2 then ceil data.length / @options.pagerSize else @pagerStart / @options.pagerSize + @options.pagerSize)
    ich.pagerItem(num: "Prev", rel: @pagerStart-@options.pagerSize).appendTo $pager if @pagerStart > 0
    for i in [min..max]
      $item = ich.pagerItem
        num: i+1
        rel: i*@options.pagerSize
        active: if $pagerStart = i*@options.pagerSize then "active" else ""
      $item.appendTo $pager
    ich.pagerItem(num: "Next", rel: @pagerStart+@options.pagerSize).appendTo $pager if @pagerStart+@options.pagerSize >= data.length
    $text.find('a').bind "click", ->
      @pagerStart = parseInt $(this).attr "rel"
      @drawMarkers data
      false
    $text


  @markerBounds = (bounds, factor) ->
    factor = factor? ? factor-1 : 1
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
  