GoogleSpreadsheetsQuery = (filters, callback) ->
  that = this
  @filters = filters
  @status = false
  @callback = callback
  @get = (query, force) ->
    unless query is `undefined`
      locache.remove "blueGuideData"
      data =
        key: "0Alw0s_pQVmyXdEwxTjlaTlE3NnU0bl8wZEZxZTVHYnc"
        tq: query

      $.ajax
        url: "https://spreadsheets.google.com/a/albatrossdigital.com/tq"
        type: "GET"
        data: data
        dataType: "jsonp"
        jsonpCallback: "google.visualization.Query.setResponse"

    else
      @data = data
      data

  @constructCoords = ->
    @status = "constructCoords"
    @get "select M, L, B, K, O, T, C"

  @constructDetails = ->
    @status = "details"
    @get "select M, L, B, K, O, T, C"

  @constructActive = (fields) ->
    groups = []
    _.each fields, (values, field) ->
      group = []
      _.each values, (value) ->
        col = that.colId2Int(that.filters.fields[field].startCol) + that.filters.fields[field].options.indexOf(value)
        group.push that.int2ColId(col) + "='X'"

      groups.push group.join(" or ")

    @status = "active"
    @get "select * where (" + groups.join(") and (") + ")", true

  @parse = (response) ->
    data = (if @data isnt `undefined` then @data else locache.get("blueGuideData"))
    status = (if data then true else false)
    startCol = @colId2Int(@filters.fields["Safety-Net Type"].startCol)
    data = (if data then data else [])
    fields = undefined
    if response.table?
      
      # Update/set the values
      _.each response.table.rows, (cols) ->
        row = active: false
        arrRow = []
        _.each cols.c, (item, index) ->
          col = that.colId2Int(response.table.cols[index].id)
          if col < startCol
            row[response.table.cols[index].label.replace(/Clinic Information |Service Access |Address and Contact Information |Appointment Requirements |SEP Requirements |Safety-Net Type |Services Provided |Age Groups Served |Works With |Languages Spoken |Payment Assistance & Special Accommodations /g, "")] = item.v
          
          #row[col] = item.v;
          else unless item.v is ""
            previous = null
            value = []
            _.each that.filters.fields, (field, fieldName) ->
              previous = fieldName  if col >= that.colId2Int(field.startCol) or not previous?

            row[previous] = [] if !row[previous]?
            row[previous].push response.table.cols[index].label.replace(previous + " ", "")

        fields = _.keys(row) if fields is undefined
        _.each row, (val, key) ->
          arrRow[fields.indexOf(key)] = val
        
        # Filling arr for first time
        data.push arrRow unless status
      
      # Just extending values, or setting active
      #else {
      #  var index = _.find(data, function(item){ return (row.Latitude == item.Latitude && row.Longitude == item.Longitude); });
      #  index = _.extend(index, row);
      #}
      @data =
        rev: rev
        cols: fields
        rows: data

      console.log @data
    @status = false
    callback @data

  @colId2Int = (id) ->
    base = "A".charCodeAt(0)
    (if id.length is 1 then id.charCodeAt(0) - base else (id.charCodeAt(0) - base + 1) * 26 + id.charCodeAt(1) - base)

  @int2ColId = (id) ->
    base = "A".charCodeAt(0)
    (if id < 26 then String.fromCharCode(id + base) else String.fromCharCode(base + Math.floor(id / 26) - 1, base + id % 26))

  
  # From http://www.movable-type.co.uk/scripts/latlong.html
  #this.distance = function (latlon1, latlon2) {
  #    var R = 6371; // km
  #    var dLat = (latlon2.lat-latlon1.lat).toRad();
  #    var dLon = (latlon2.lon-latlon1.lon).toRad();
  #    var lat1 = lat1.toRad();
  #    var lat2 = lat2.toRad();
  #
  #    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  #            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  #    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  #    var d = R * c;
  #    d = d * 0.621371; // Convert to miles
  #    return d;
  #  }
  @active = ->
    _.filter @data, (item) ->
      item.active

  @

googleQuery = undefined
start = new Date()

# Simulate google.visualization.Query.setResponse
google = {}
google.visualization = {}
google.visualization.Query = {}
google.visualization.Query.setResponse = (response) ->
  
  #console.log(response);
  googleQuery.parse response