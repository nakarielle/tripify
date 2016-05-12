// Globals
var tripifyMap;
var urlKey;
var lastChosenPlace = {
  lat: null,
  lng: null,
  name: null
};
var myPlaces = [];
var distance = 0;


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
    var obj = {};
    obj['date'] = stop.arrived_at;
    obj['country'] = stop.name;
    obj['lat'] = stop.lat;
    obj['lng'] = stop.lng;
    myPlaces.push(obj);
    makePieChart(stop.lat,stop.lng,stop.name,stop.arrived_at);
  });
}

var makePieChart = function(lat,long,name,date) {
  // clears chart every time a new city is added
  $('#chart').empty();
  $('#barchart').empty();
  var newarray =[];
  for(var i=0;i<myPlaces.length;i++) {
    var oneDay = 24*60*60*1000;
    // creates date object
    firstDate = myPlaces[i].date;
    firstDateObj = new Date(firstDate);
    if (myPlaces[i+1] == undefined) {
    }
    else {
      var secondDate = myPlaces[i+1].date;
      var secondDateObj = new Date(secondDate);
        // calculate no. of days
      var diffDays = Math.round(Math.abs((secondDateObj.getTime() - firstDateObj.getTime())/(oneDay)));
      var object = {};
      object['country'] = myPlaces[i].country;
      object['count'] = diffDays;
      newarray.push(object);
      distance = distance + calcCrow(myPlaces[i].lat,myPlaces[i].lng,myPlaces[i+1].lat,myPlaces[i+1].lng);
    }
    console.log(newarray);
  }
    var width = 360;
    var height = 360;
    var radius = Math.min(width, height) / 2;
    var color = d3.scale.ordinal().range(['#A60F2B', '#B3F2C9', '#528C18', '#C3F25C']);
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
                  .attr('fill', function(d) {
                    console.log(d);
                    return color(d.country);
                  });
    var svg1 = d3.select('#barchart')
                .append('svg')
                .attr('width', 1000)
                .attr('height', height);
    var bar = svg1.append('rect')
                  .attr('height',50)
                  .attr('width',distance/100);


}
function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}
function toRad(Value) {
    return Value * Math.PI / 180;
}
