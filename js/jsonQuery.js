function JsonQuery(selector, data) {

  var that = this;
  this.data = data;
  this.status = false;

  this.constructActive = function(fields) {
    console.log(fields);
    console.log(fields.length);

    //var filtered = _.filter(this.data, function(item){ return true; });
    //console.log(filtered);
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
      //console.log(_.filter(matches, function(item){ return item != null; }).length);

    });

    console.log(this.active());

    /*var groups = [];
    _.each(fields, function(values, field) {
      var group = [];
      _.each(values, function(value) {
        var col = that.colId2Int(that.filters.fields[field].startCol) + that.filters.fields[field].options.indexOf(value);
        group.push(that.int2ColId(col) + "='X'");
      });
      groups.push(group.join(" or "));
    });
    this.status = 'active';
    this.get('select * where (' + groups.join(') and (') + ')', true);*/

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