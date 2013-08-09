function JsonQuery(selector, data) {

  var that = this;
  this.data = data;
  this.status = false;
  this.selector = selector;

  this.constructActive = function(fields) {
   
    _.each(this.data.rows, function(row) {
      var matches = {};
      _.each(fields, function(vals, field) {
        _.each(vals, function(val) {
          if (that.val(row, field) != undefined && that.val(row, field).indexOf(val) != -1) {
            matches[field] = true;
          }
        });
      });

      if (matches != undefined && _.keys(matches).length == _.keys(fields).length) {
        that.setVal(row, 'active', true);
      }
      else {
        that.setVal(row, 'active', false);
      }
    });

    $(this.selector).trigger('queryUpdate');
  }

  this.active = function(bounds) {
    return this.arr2obj(_.filter(this.data.rows, function(item){
      if (bounds == undefined) {
        return that.val(item, 'active');
      }
      else {
        var gps = {lat: that.val(item, 'Latitude'), lng: that.val(item, 'Longitude')};
        return that.val(item, 'active') && 
          gps.lat >= bounds._southWest.lat && 
          gps.lng >= bounds._southWest.lng && 
          gps.lat <= bounds._northEast.lat && 
          gps.lng <= bounds._northEast.lng; 
      }
    }));
  }

  this.val = function(row, key) {
    return row[this.data.cols.indexOf(key)];
  }

  this.setVal = function(row, key, val) {
    row[this.data.cols.indexOf(key)] = val;
    return val;
  }

  this.arr2obj = function (data) {
    var obj = [];
    _.each(data, function(item) {
      var row = {};
      _.each(item, function(field, index) {
        row[that.data.cols[index]] = field;
      });
      obj.push(row);
    });
    return obj;
  }

}
