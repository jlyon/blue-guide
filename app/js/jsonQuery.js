var JsonQuery;

JsonQuery = function(selector, data) {
  var that;
  that = this;
  this.data = data;
  this.status = false;
  this.selector = selector;
  this.constructActive = function(fields) {
    _.each(this.data.rows, function(row) {
      var matches;
      matches = {};
      _.each(fields, function(vals, field) {
        if (field === "search") {
          vals = vals.toLowerCase();
          if (that.val(row, "Clinic Name").toLowerCase().indexOf(vals) !== -1 || that.val(row, "Sponsor Name").toLowerCase().indexOf(vals) !== -1 || that.val(row, "Full Address").toLowerCase().indexOf(vals) !== -1) {
            return matches[field] = true;
          }
        } else {
          return _.each(vals, function(val) {
            if ((that.val(row, field) != null) && that.val(row, field).indexOf(val) !== -1) {
              return matches[field] = true;
            }
          });
        }
      });
      if (((matches != null) && _.keys(matches).length === _.keys(fields).length) || _.keys(fields).length === 0) {
        return that.setVal(row, "active", true);
      } else {
        return that.setVal(row, "active", false);
      }
    });
    return $(this.selector).trigger("queryUpdate");
  };
  this.active = function(bounds) {
    return this.arr2obj(_.filter(this.data.rows, function(item) {
      var gps;
      if (bounds == null) {
        return that.val(item, "active");
      } else {
        gps = {
          lat: that.val(item, "Latitude"),
          lng: that.val(item, "Longitude")
        };
        return that.val(item, "active") && that.withinBounds(gps, bounds);
      }
    }));
  };
  this.withinBounds = function(point, bounds) {
    return point.lat >= bounds._southWest.lat && point.lng >= bounds._southWest.lng && point.lat <= bounds._northEast.lat && point.lng <= bounds._northEast.lng;
  };
  this.val = function(row, key) {
    return row[this.data.cols.indexOf(key)];
  };
  this.setVal = function(row, key, val) {
    row[this.data.cols.indexOf(key)] = val;
    return val;
  };
  this.fillActive = function() {
    return _.each(query.data.rows, function(row) {
      return query.setVal(row, "active", true);
    });
  };
  this.arr2obj = function(data) {
    var obj;
    obj = [];
    _.each(data, function(item) {
      var row;
      row = {};
      _.each(item, function(field, index) {
        return row[that.data.cols[index]] = field;
      });
      return obj.push(row);
    });
    return obj;
  };
  return this;
};

/*
//@ sourceMappingURL=jsonQuery.js.map
*/