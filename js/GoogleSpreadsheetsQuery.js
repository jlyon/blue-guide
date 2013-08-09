var GoogleSpreadsheetsQuery, google, googleQuery, start;

GoogleSpreadsheetsQuery = function(filters, callback) {
  var that;
  that = this;
  this.filters = filters;
  this.status = false;
  this.callback = callback;
  this.get = function(query, force) {
    var data;
    if (query !== undefined) {
      locache.remove("blueGuideData");
      data = {
        key: "0Alw0s_pQVmyXdEwxTjlaTlE3NnU0bl8wZEZxZTVHYnc",
        tq: query
      };
      return $.ajax({
        url: "https://spreadsheets.google.com/a/albatrossdigital.com/tq",
        type: "GET",
        data: data,
        dataType: "jsonp",
        jsonpCallback: "google.visualization.Query.setResponse"
      });
    } else {
      this.data = data;
      return data;
    }
  };
  this.constructCoords = function() {
    this.status = "constructCoords";
    return this.get("select M, L, B, K, O, T, C");
  };
  this.constructDetails = function() {
    this.status = "details";
    return this.get("select M, L, B, K, O, T, C");
  };
  this.constructActive = function(fields) {
    var groups;
    groups = [];
    _.each(fields, function(values, field) {
      var group;
      group = [];
      _.each(values, function(value) {
        var col;
        col = that.colId2Int(that.filters.fields[field].startCol) + that.filters.fields[field].options.indexOf(value);
        return group.push(that.int2ColId(col) + "='X'");
      });
      return groups.push(group.join(" or "));
    });
    this.status = "active";
    return this.get("select * where (" + groups.join(") and (") + ")", true);
  };
  this.parse = function(response) {
    var data, fields, startCol, status;
    data = (this.data !== undefined ? this.data : locache.get("blueGuideData"));
    status = (data ? true : false);
    startCol = this.colId2Int(this.filters.fields["Safety-Net Type"].startCol);
    data = (data ? data : []);
    fields = void 0;
    if (response.table != null) {
      _.each(response.table.rows, function(cols) {
        var arrRow, row;
        row = {
          active: false
        };
        arrRow = [];
        _.each(cols.c, function(item, index) {
          var col, previous, value;
          col = that.colId2Int(response.table.cols[index].id);
          if (col < startCol) {
            return row[response.table.cols[index].label.replace(/Clinic Information |Service Access |Address and Contact Information |Appointment Requirements |SEP Requirements |Safety-Net Type |Services Provided |Age Groups Served |Works With |Languages Spoken |Payment Assistance & Special Accommodations /g, "")] = item.v;
          } else if (item.v !== "") {
            previous = null;
            value = [];
            _.each(that.filters.fields, function(field, fieldName) {
              if (col >= that.colId2Int(field.startCol) || (previous == null)) {
                return previous = fieldName;
              }
            });
            if (row[previous] == null) {
              row[previous] = [];
            }
            return row[previous].push(response.table.cols[index].label.replace(previous + " ", ""));
          }
        });
        if (fields === void 0) {
          fields = _.keys(row);
        }
        _.each(row, function(val, key) {
          return arrRow[fields.indexOf(key)] = val;
        });
        if (!status) {
          return data.push(arrRow);
        }
      });
      this.data = {
        rev: rev,
        cols: fields,
        rows: data
      };
    }
    this.status = false;
    return callback(this.data);
  };
  this.colId2Int = function(id) {
    var base;
    base = "A".charCodeAt(0);
    if (id.length === 1) {
      return id.charCodeAt(0) - base;
    } else {
      return (id.charCodeAt(0) - base + 1) * 26 + id.charCodeAt(1) - base;
    }
  };
  this.int2ColId = function(id) {
    var base;
    base = "A".charCodeAt(0);
    if (id < 26) {
      return String.fromCharCode(id + base);
    } else {
      return String.fromCharCode(base + Math.floor(id / 26) - 1, base + id % 26);
    }
  };
  this.active = function() {
    return _.filter(this.data, function(item) {
      return item.active;
    });
  };
  return this;
};

googleQuery = void 0;

start = new Date();

google = {};

google.visualization = {};

google.visualization.Query = {};

google.visualization.Query.setResponse = function(response) {
  return googleQuery.parse(response);
};

/*
//@ sourceMappingURL=GoogleSpreadsheetsQuery.js.map
*/