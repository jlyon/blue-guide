JsonQuery = (selector, data) ->
  that = this
  @data = data
  @status = false
  @selector = selector

  @constructActive = (fields) ->
    _.each @data.rows, (row) ->
      matches = {}
      _.each fields, (vals, field) ->
        if field is "search"
          vals = vals.toLowerCase()
          matches[field] = true if that.val(row, "Clinic Name").toLowerCase().indexOf(vals) isnt -1 or that.val(row, "Sponsor Name").toLowerCase().indexOf(vals) isnt -1 or that.val(row, "Full Address").toLowerCase().indexOf(vals) isnt -1
        else
          _.each vals, (val) ->
            matches[field] = true  if that.val(row, field)? and that.val(row, field).indexOf(val) isnt -1

      if (matches isnt `undefined` and _.keys(matches).length is _.keys(fields).length) or _.keys(fields).length is 0
        that.setVal row, "active", true
      else
        that.setVal row, "active", false

    $(@selector).trigger "queryUpdate"

  @active = (bounds) ->
    @arr2obj _.filter(@data.rows, (item) ->
      if !bounds?
        that.val item, "active"
      else
        gps =
          lat: that.val(item, "Latitude")
          lng: that.val(item, "Longitude")
        that.val(item, "active") and that.withinBounds(gps, bounds)
    )

  @withinBounds = (point, bounds) ->
    point.lat >= bounds._southWest.lat and point.lng >= bounds._southWest.lng and point.lat <= bounds._northEast.lat and point.lng <= bounds._northEast.lng

  @val = (row, key) ->
    row[@data.cols.indexOf(key)]

  @setVal = (row, key, val) ->
    row[@data.cols.indexOf(key)] = val
    val

  @fillActive = ->
    _.each query.data.rows, (row) ->
      query.setVal row, "active", true

  @arr2obj = (data) ->
    obj = []
    _.each data, (item) ->
      row = {}
      _.each item, (field, index) ->
        row[that.data.cols[index]] = field

      obj.push row
    obj

  @