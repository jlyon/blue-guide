function JsonQuery(selector, data) {

  var that = this;
  this.data = data;
  this.status = false;
  this.selector = selector;

  this.constructActive = function(fields) {
   
    _.each(this.data, function(row) {
      var matches = {};
      _.each(fields, function(vals, field) {
        _.each(vals, function(val) {
          if (row[field] != undefined && row[field].indexOf(val) != -1) {
            matches[field] = true;
          }
        });
      });

      if (matches != undefined && _.keys(matches).length == _.keys(fields).length) {
        row.active = true;
      }
      else {
        row.active = false;
      }

    });

    $(this.selector).trigger('queryUpdate');
  }

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
  query.parse(response);
}