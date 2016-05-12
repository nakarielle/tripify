// Globals
var tripifyMap;
var urlKey;
var lastChosenPlace = {
  lat: null,
  lng: null,
  name: null
};
var myPlaces =[];


// Map display & get URL key & turn autocomplete on
$(document).ready(function() {
  getUrl();

  L.mapbox.accessToken = mapAccessKey;
  tripifyMap = L.mapbox.map('map', 'mapbox.streets').setView([0, 0], 2);
  $("#placefinder").easyAutocomplete(options);

  $('#addplace').on('click', function() {
    addPlace(urlKey);
  });
});

//date picker widget
$(function() {
  $("#datepicker").datepicker({
  dateFormat: "dd-mm-yy",
  changeMonth: true,
  changeYear: true
  })
});

//add pin to map
var addPin = function(lat,lng,name) {
  var geojson = [
  {
    "type": "FeatureCollection",
    "features": [ {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [ lat, lng ]
        },
        "properties": {
          "marker-symbol": "airport",
          "marker-size": "medium",
          "marker-color": "#FF0000",
          "title": name
        }
    }]
  }];

  var pinLayer = L.mapbox.featureLayer().addTo(tripifyMap);
  pinLayer.setGeoJSON(geojson);
};

var addSavedPins = function(id) {
  var settings = {
    url: '/trip/' + id,
    method: 'get'
  }
  $.ajax(settings).done(function(stops) {
    stops.forEach(function(stop) {
      addPin(stop.lat,stop.lng,stop.name);
    })
  })
}



//autocomplete place names
var options = {
  url: function(input) {
    return "https://api.mapbox.com/geocoding/v5/mapbox.places/" + input +
    ".json?types=place%2Ccountry%2Cregion&access_token=" + mapAccessKey;
  },

  getValue: "place_name",

  ajaxSettings: {
      dataType: "json"
  },

  listLocation: "features",

  requestDelay: 300,

  theme: "round",

  placeholder: "Enter a place",

  list: {
    onChooseEvent: function() {
      var coords = $('#placefinder').getSelectedItemData().center;
      var placeName = $('#placefinder').getSelectedItemData().place_name;

      lastChosenPlace.lat = coords[0];
      lastChosenPlace.lng = coords[1];
      lastChosenPlace.name = placeName;
    }
  }
};


var getUrl = function() {
    $.ajax({
    url: '/trip/new',
    method: 'get'
  }).done(function(key) {
    urlKey = key.edit_url;
  });
}



var addPlace = function(key) {

  var settings = {
    url: '/trip/' + key,
    data: {name: lastChosenPlace.name, lng: lastChosenPlace.lng, lat: lastChosenPlace.lat, arrived_at: $('#datepicker').val() },
    method: 'post'
  }

  $.ajax(settings).done(function(stop) {
    console.log(stop);
    var $newPlace = $('<p>').text(stop.name);
    var $newDate = $('<span>').text(' ' + stop.arrived_at.split("-").reverse().join("/"));
    $newPlace.append($newDate);
    $('#tripform').append($newPlace);
    addPin(stop.lat,stop.lng,stop.name);
    makePieChart(stop.lat,stop.lng,stop.name,stop.arrived_at);
  });
}





var makePieChart = function(lat,long,name,date) {
  // clears chart every time a new city is added
  $('#chart').empty();
  var newarray =[];
  for(var i=0;i<myPlaces.length;i++) {
    var oneDay = 24*60*60*1000;
    // creates date object
    firstDate = myPlaces[i].date.split("-").reverse().join("-");
    firstDateObj = new Date(firstDate);
    var object = {};
    if (myPlaces[i+1] == undefined) {
      var today = new Date();
      var secondDate = today.getDate()+"-" + (today.getMonth()+1)+"-" + today.getFullYear();
      var newSecondDate = secondDate.split("-").reverse().join("-");
      var secondDateObj = new Date(newSecondDate);
    }
    else {
      var secondDate = myPlaces[i+1].date.split("-").reverse().join("-");
      var secondDateObj = new Date(secondDate);
      // calculate no. of days
    }
    var diffDays = Math.round(Math.abs((secondDateObj.getTime() - firstDateObj.getTime())/(oneDay)));
    object['country'] = myPlaces[i].country;
    object['count'] = diffDays;
    newarray.push(object);
    console.log(newarray);
  }
    var width = 360;
    var height = 360;
    var radius = Math.min(width, height) / 2;
    var color = d3.scale.ordinal().range(['#A60F2B', '#648C85', '#B3F2C9', '#528C18', '#C3F25C']);
    var svg = d3.select('#chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');
    var arc = d3.svg.arc().outerRadius(radius);
    var pie = d3.layout.pie().value(function(d) { return d.count; });
    var path = svg.selectAll('path')
                  .data(pie(newarray))
                  .enter()
                  .append('path')
                  .attr('d', arc)
                  .attr('fill', function(d, i) {
                    return color(d.data.country);
                  });
    var circle = d3.select("body")
                   .append("svg")
                   .attr('width', 100)
                   .attr('height', 100)
                   .selectAll('g')
                   .data(newarray)
                   .enter()
                   .append('g')
                   .append('circle')
                   .attr('cx',20)
                   .attr('cy',20)
                   .attr('r',5)
                   .attr('fill', function(d) {
                     console.log(d);
                     return color(d.country); })
                   .text(function(d) {
                     return d.country;
                   });

}



