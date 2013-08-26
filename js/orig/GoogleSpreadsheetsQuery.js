var googleQuery;
var start = new Date();
function GoogleSpreadsheetsQuery(filters, callback) {

  var that = this;
  this.filters = filters;
  this.status = false;
  this.callback = callback;

  this.get = function(query, force) {
     if (query != undefined) {
      locache.remove('blueGuideData');
      var data = {
        key: '0Alw0s_pQVmyXdEwxTjlaTlE3NnU0bl8wZEZxZTVHYnc',
        tq: query
      }
      $.ajax({
        url: 'https://spreadsheets.google.com/a/albatrossdigital.com/tq',
        type: "GET",
        data: data,
        dataType: "jsonp",
        jsonpCallback: "google.visualization.Query.setResponse"
      });
    }
    else {
      this.data = data;
      return data;
    }
  }

  this.constructCoords = function() {
    this.status = 'constructCoords';
    this.get('select M, L, B, K, O, T, C');
  }

  this.constructDetails = function() {
    this.status = 'details';
    this.get('select M, L, B, K, O, T, C');
  }

  this.constructActive = function(fields) {
    var groups = [];
    _.each(fields, function(values, field) {
      var group = [];
      _.each(values, function(value) {
        var col = that.colId2Int(that.filters.fields[field].startCol) + that.filters.fields[field].options.indexOf(value);
        group.push(that.int2ColId(col) + "='X'");
      });
      groups.push(group.join(" or "));
    });
    this.status = 'active';
    this.get('select * where (' + groups.join(') and (') + ')', true);
  }
 
  this.parse = function(response) {
    var data = this.data != undefined ? this.data : locache.get('blueGuideData');
    var status = data ? true : false;
    var startCol = this.colId2Int(this.filters.fields['Safety-Net Type'].startCol);
    data = data ? data : [];
    var fields;
    if (response.table != undefined) {

      // Update/set the values
      _.each(response.table.rows, function(cols){
        var row = {active: false};
        var arrRow = [];
        _.each(cols.c, function(item, index) {
          var col = that.colId2Int(response.table.cols[index].id);
          if (col < startCol) { 
            row[response.table.cols[index].label.replace(/Clinic Information |Service Access |Address and Contact Information |Appointment Requirements |SEP Requirements /gi, '')] = item.v;

            //row[col] = item.v;
          }
          else if (item.v != '') {
            var previous = null;
            var value = [];
            _.each(that.filters.fields, function(field, fieldName) {
              if (col >= that.colId2Int(field.startCol) || previous == null) {
                previous = fieldName;
              }
            });
            if (row[previous] == undefined) {
              row[previous] = [];
            }
            row[previous].push(response.table.cols[index].label.replace(previous+' ', ''));
          }
        });

        if (fields == undefined) {
          fields = _.keys(row);
        }
        _.each(row, function(val, key) {
          arrRow[fields.indexOf(key)] = val;
        });

        // Filling arr for first time
        if (!status) {
          data.push(arrRow);
        }
        // Just extending values, or setting active
        //else {
        //  var index = _.find(data, function(item){ return (row.Latitude == item.Latitude && row.Longitude == item.Longitude); });
        //  index = _.extend(index, row);
        //}

      });
      this.data = {rev: rev, cols: fields, rows: data};
      console.log(this.data);

    }
    this.status = false;
    callback(this.data);
  }

  this.colId2Int = function(id) {
    var base = 'A'.charCodeAt(0);
    return id.length == 1 ? id.charCodeAt(0) - base : (id.charCodeAt(0) - base +1)*26 + id.charCodeAt(1) - base;   
  }

  this.int2ColId = function(id) {
    var base = 'A'.charCodeAt(0);
    return id < 26 ? String.fromCharCode(id + base) : String.fromCharCode(base + Math.floor(id/26) -1, base + id%26);   
  }


  // From http://www.movable-type.co.uk/scripts/latlong.html
  /*this.distance = function (latlon1, latlon2) {
    var R = 6371; // km
    var dLat = (latlon2.lat-latlon1.lat).toRad();
    var dLon = (latlon2.lon-latlon1.lon).toRad();
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    d = d * 0.621371; // Convert to miles
    return d;
  }*/

  this.active = function() {
    return _.filter(this.data, function(item){ return item.active; });
  }



}


// Simulate google.visualization.Query.setResponse
var google = {};
google.visualization = {};
google.visualization.Query = {};
google.visualization.Query.setResponse = function(response) {
  //console.log(response);
  googleQuery.parse(response);
}