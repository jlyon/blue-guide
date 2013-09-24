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
    #maxMarkers: 25 #@todo: rm
  , options)

  #this.markers = {};
  @markerLayer = new L.FeatureGroup()
  @homeMarkerLayer = new L.FeatureGroup()
  @resultNum = @options.resultNum
  @init = false;

  @drawMap = ->
    # Create the map
    @map = new L.Map(@options.id,
      center: new L.LatLng(@options.startLat, @options.startLng)
      zoom: @options.startZoom
      attributionControl: false
      layers: new L.TileLayer @options.layerUrl
    )
    @markerLayer.addTo @map
    @homeMarkerLayer.addTo @map

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
      $(@options.locate.html).bind "click touchstart", (e) ->
        that.map.locate settings
        L.DomEvent.preventDefault e
      .appendTo "#map .leaflet-top.leaflet-left"

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
    if !@init
      @init = true
      return

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

    # Cycle through each item and add a marker
    $results.html ""
    if data.length is 0
      $results.append ich.noResults()
    else
      if data.length <= @resultNum
        $text = ich.resultSummaryMatching
          num: data.length
      else
        #@drawPagerSummary(data).appendTo $results
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
        item["Phone Number"] = item["Phone Number"] + " |" if item["Phone Number"] isnt "" and item["Phone Number"].indexOf "|" is -1

        marker = L.marker([item.Latitude, item.Longitude],
          icon: L.AwesomeMarkers.icon(
            text: index
            textFormat: "letter"
            color: item.color
          )
          title: item["Clinic Name"]
        )

        .on("click touchstart", (e) ->
          $item = $results.find(".item[rel=" + @_leaflet_id + "]")
          $results.find('.item.active').removeClass "active"
          $item.addClass "active"
          that.scroll $results, $item
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

        if window.responsive is "mobile"
          $resultItem.find(".static-marker").bind "click", (e) ->
            $item = $(this).parents(".item")
            if $item.hasClass('active')
              $item.removeClass "active"
            else
              that.scroll "body", 0

        $resultItem.find(".static-marker, h3 a").bind "click", (e) ->
          $item = $(this).parents(".item")
          if $item.hasClass "active"
            that.closeItem $item, true
          else
            marker = that.markerLayer._layers[$item.attr("rel")]
            #marker.zIndexOffset 1000
            that.map.panTo(marker._latlng)
            if window.responsive isnt "mobile"
              marker.openPopup()
            $item.addClass "active"
          false

        $resultItem.find(".close").bind "click", ->
          that.closeItem($(this).parents(".item"))
          that.scroll "body", 0 if window.responsive is "mobile"

        $resultItem.find(".btn-directions").bind "click touchstart", ->
          if window.os is "android"
            navigator.app.loadUrl "http://maps.google.com/maps?daddr=" + item["Latitude"] + "," + item["Longitude"], { openExternal: true }
            #window.location = 'gps:' + item["Latitude"] + "," + item["Longitude"]
          else if window.os is "ios"
            window.location = 'maps:' + item["Latitude"] + "," + item["Longitude"]
          else
            window.open "http://maps.google.com/maps?daddr=" + item["Latitude"] + "," + item["Longitude"]

        if window.os is "android" or window.os is "ios"
          $resultItem.find(".website").bind "click", ->
            navigator.app.loadUrl $(this).attr "href", { openExternal: true }
            false

        $results.append $resultItem

    if data.length > @resultNum then @drawPager(data).appendTo $results
    @lastBounds = @map.getBounds()
    @forceZoom = undefined
    @scroll "body", 0
    $("body").removeClass "loading"
    return

  @scroll = (parent, element) ->
    if window.responsive is "mobile"
      parent = "body"
      top = if element is 0 then 0 else $(element).offset().top - 75
    else
      top = if element is 0 then 0 else $(parent).scrollTop() + $(element).offset().top - $(parent).offset().top
    $(parent).animate({ scrollTop: top }, { duration: 'slow', easing: 'swing'})

  @closeItem = ($item, noScroll) ->
    $item.removeClass "active"
    if window.responsive isnt "mobile"
      that.markerLayer._layers[$item.attr("rel")].closePopup()
    else
      $(that.updateSelector).removeClass "left-sidebar-big"
      if noScroll? and !noScroll
        that.scroll $results, 0

  @drawPagerSummary = (data) ->
    return ich.pager
      start: @pagerStart
      end: if (@pagerStart + @options.pagerSize < data.length) then @pagerStart + @options.pagerSize else data.length
      total: data.length

  @drawPager = (data) ->
    $text = @drawPagerSummary data
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
      that.scroll $(that.options.resultsSelector), 0
      false
    $text

  @markerBounds = (bounds, factor) ->
    factor = if factor? then factor-1 else 1
    factor = 0
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

