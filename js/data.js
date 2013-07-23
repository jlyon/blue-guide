// Fusion Tables table id
var dataTable = '1Xvmrj3MwiK9BSZMdsSBz3kRYpcFtT1NkdoR4CpY';

// This is the Fusion Tables column that all of the lookups from the map are keyed on
var keyCol = "'DEVELOPMENT NAME'"

var vizColors = ['#394553', '#acacac', '#4aa6d7', '#c5dffa', '#ff792f', '#fdc689', '#7cc576', '#9476c5', '#f8b3d1'];


google.load('visualization', '1', { packages: ['table', 'controls'] });


// Placeholder
var dataActive = false;
var activeTab = 'pie';
var activeKey = '';
var googLoaded = false;

// This is called from map.js when a marker is clicked
function updateData(key, address) {
  if (dataActive) {
    drawData(key);
  }
  jQuery('#dataTitle').html('<h2>REQUEST DETAILS FOR '+key+'<span>, '+address+'</span></h2>');
  activeKey = key;
}

// Called from the onClick attribute in the show data button in map popups
function showData() {
  dataActive = true;
  var height = $(window).height();
  jQuery('#data').css('margin-top', height+'px').show().animate({'margin-top': Math.round(height*.65) +'px'}, 1000);
  drawData(activeKey);
}

// Data tabs
jQuery('#nav li a').bind('click', function() {
  activeTab = jQuery(this).attr('href').replace('#', '');
  drawData(activeKey);
  return false;
});


function drawData(key) {
  activeKey = key;

  if (activeTab == 'pie') {
    jQuery('#pieChart1, #pieChart2').show();
    if (jQuery('#pieChart1, #pieChart2').attr('data-key') !=key) {
      jQuery('#pieChart1, #pieChart2').attr('data-key', key);
      jQuery('#pieChart1').makeLoading();
      drawPie(key);
    }
    jQuery('#dashboard').hide();
  }
  else {
    jQuery('#dashboard').show();
    if (jQuery('#pieChart1, #pieChart2').attr('data-key') !=key || jQuery('#pieChart1, #pieChart2').attr('data-tab') != activeTab) {
      drawTable();
    }
    jQuery('#pieChart1, #pieChart2').hide();
    jQuery('#dashboard').attr('data-key', key).attr('data-tab', activeTab);
  }
  jQuery('#nav li').removeClass('active');
  jQuery('#nav li a[href="#'+activeTab+'"]').parent().addClass('active');
}

jQuery.fn.makeLoading = function() {
  jQuery(this).html('Loading...');
}


// Hide data button in the data header
jQuery('#hideData').bind('click', function() {
  dataActive = false;
  jQuery('#data').animate({'margin-top': $(window).height()+'px'}, 1000).fadeOut();
})


function drawTable() {
  var key = activeKey;

  // Prepare the data                      
  var query = "SELECT * FROM " + dataTable;
  //
  if (key != undefined) {
    query += " WHERE "+keyCol+" = '" + key + "'";
  }

  var queryText = encodeURIComponent(query);
  var gvizQuery = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText);
  // Apply query language statement.
  //query.setQuery("SELECT A, B, D, G, H, I, J, L");
  // Send the query with a callback function.
  gvizQuery.send(handleQueryResponse);
}

function handleQueryResponse(response) {

  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var data = response.getDataTable();  
  console.log(data);



  var daysPicker = new google.visualization.ControlWrapper({
    'controlType': 'NumberRangeFilter',
    'containerId': 'daysControl',
    'options': {
      'filterColumnLabel': 'DAYS OUTSTANDING',
      'ui': {
      'labelStacking': 'vertical',
        'allowTyping': false,
        'allowMultiple': false
      }
    }
  }); 

  var categoryPicker = new google.visualization.ControlWrapper({
    'controlType': 'CategoryFilter',
    'containerId': 'categoryControl',
    'options': {
      'filterColumnLabel': 'REPAIR CATEGORY',
      'ui': {
      'labelStacking': 'vertical',
        'allowTyping': false,
        'allowMultiple': true
      }
    }
  });

  var detailPicker = new google.visualization.ControlWrapper({
    'controlType': 'StringFilter',
    'containerId': 'detailControl',
    'options': {
      'filterColumnLabel': 'ITEM DETAIL',
      'ui': {
      'labelStacking': 'vertical',
        'allowTyping': true
      }
    }
  });

  // Define a Table
  var dataChart = new google.visualization.ChartWrapper({
    'chartType': 'Table',
    'containerId': 'dashboardData',
    'options': {
      //'height': 630,
      //'width': window.innerWidth -68,
      'page': 'enable',
      'pageSize': 25,
      'alternatingRowStyle': true,
      'sortColumn': 7,
      'sortAscending': false,
      'cssClassNames': {headerRow: 'table-header-background', tableRow: 'table-row', oddTableRow: 'odd-table-row', selectedTableRow: 'google-hover-table-row', hoverTableRow: 'google-hover-table-row', headerCell: 'table-header-background', tableCell: '', rowNumberCell: ''}
    },
    //'view': {'columns': [0, 1]}
  });

  // Create a dashboard
  new google.visualization.Dashboard(document.getElementById('dashboard')).
    bind(daysPicker, dataChart).
    bind(categoryPicker, dataChart).
    bind(detailPicker, dataChart).
    draw(data);

}



function drawPie(keyValue) {
  console.log('draw');

  function response(x) {
    if (!x || !x.rows) return [];
    var category = [['', '']];
    var outstanding = [['Category'], ['']];

    _.each(x.rows, function(value) {
      category.push([value[0], parseInt(value[1])]);
      outstanding[0].push(value[0]);
      outstanding[1].push(parseInt(value[2]/value[1]));
    });

    google.visualization.drawChart({
      containerId: 'pieChart1',
      dataTable: category,
      chartType: 'PieChart',
      options: {
        title: 'Oustanding Requests by Category',
        'width': 350,
        'height': 400,
        'is3D': true,
        'tooltip': {showColorCode: true},
        legend: {position: 'none'},
        chartArea: {width:"80%",height:"80%"},
        colors: vizColors
      }
    });
console.log(outstanding);
    google.visualization.drawChart({
      containerId: 'pieChart2',
      dataTable: outstanding,
      chartType: 'BarChart',
      options: {
        title: 'Average Days Outstanding per Category',
        'width': 650,
        'height': 400,
        'is3D': true,
        'tooltip': {showColorCode: true},
        pieSliceText: 'value',
        vAxis: {title: "Category"},
        hAxis: {title: "Average Days Outstanding"},
        chartArea: {width:"50%"},
        colors: vizColors
      }
    });

  }
  // enter  enter your google fusion tables api key below
  var query = "SELECT 'REPAIR CATEGORY', COUNT(), SUM('DAYS OUTSTANDING') FROM " + dataTable + " WHERE "+keyCol+" = '" + keyValue + "' GROUP BY 'REPAIR CATEGORY'";
  var url = 'https://www.googleapis.com/fusiontables/v1/query?sql='+encodeURIComponent(query)+'&key=' + key + '&typed=false&callback=jsonp';

  $.ajax({
    url: url,
    dataType: 'jsonp',
    jsonpCallback: 'jsonp',
    success: response,
    error: response
  });

}


//google.setOnLoadCallback(drawData);

/*

google.load('visualization', '1', { packages: ['table', 'controls'] });

function drawTable() {
  var query = "SELECT development_name, number FROM " + dataTable;
  /*var team = document.getElementById('team').value;
  if (team) {
    query += " WHERE 'Scoring Team' = '" + team + "'";
  }
  console.log(query);
  var queryText = encodeURIComponent(query);
  var gvizQuery = new google.visualization.Query(
      'http://www.google.com/fusiontables/gvizdata?tq=' + queryText);

  gvizQuery.send(function(response) {
    var table = new google.visualization.Table(document.getElementById('data'));
    table.draw(response.getDataTable(), {
      showRowNumber: true
    });
  });

  // Define a slider control for the 'Donuts eaten' column
  var yearPicker = new google.visualization.ControlWrapper({
    'controlType': 'NumberRangeFilter',
    'containerId': 'yearControl',
    'options': {
      'filterColumnLabel': 'Year Built',
      'ui': {
        'labelStacking': 'vertical',
        'allowTyping': false,
        'allowMultiple': false
      }
    }
  });
}





google.setOnLoadCallback(drawTable);*/