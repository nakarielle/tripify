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
          "marker-color": "#0000FF",
          "title": name
        }
    }]
  }];

  var pinLayer = L.mapbox.featureLayer().addTo(tripifyMap);
  pinLayer.setGeoJSON(geojson);
};

//display page
var addSavedData = function(id) {
  var settings = {
    url: '/trip/' + id,
    method: 'get'
  }
  $.ajax(settings).done(function(stops) {
    stops.forEach(function(stop) {
      addPin(stop.lat,stop.lng,stop.name);
      makePieChart(stop.lat,stop.lng,stop.name,stop.arrived_at);
    var $place = $('<p>').text(stop.name + ' ' + stop.arrived_at.split("-").reverse().join("/"));
    $('#triplist').append($place);
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

  placeholder: "Enter first destination",

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
    //display text for place
    var $newPlace = $('<p>').text(stop.name);
    var $newDate = $('<span>').text(' ' + stop.arrived_at.split("-").reverse().join("/"));
    $newPlace.append($newDate);
    $('#tripform').append($newPlace);

    addPin(stop.lat,stop.lng,stop.name);
    makePieChart(stop.lat,stop.lng,stop.name,stop.arrived_at);
    //reset input boxes
    $('#placefinder').attr("placeholder", "Enter next destination").val("").focus().blur();
    $('#datepicker').attr("placeholder", "Date").val("");
  });
}

var makePieChart = function(lat,lng,name,date) {
    var obj = {};
    obj['date'] = date;
    obj['country'] = name;
    obj['lat'] = lat;
    obj['lng'] = lng;
    myPlaces.push(obj);
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
      console.log(newarray);
      distance = distance + calcCrow(myPlaces[i].lat,myPlaces[i].lng,myPlaces[i+1].lat,myPlaces[i+1].lng);
    }
  }
    var width = 400;
    var height = 400;
    var radius = Math.min(width, height) / 4;
    var color = d3.scale.ordinal().range(['#2ca02c','#5254a3','#1f77b4','#9c9ede','#a55194','#e7ba52','#bcbddc','#A60F2B', '#B3F2C9', '#528C18', '#C3F25C']);
    var svg = d3.select('#chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');
    var arc = d3.svg.arc().outerRadius(radius);
    var arcout = d3.svg.arc().outerRadius(radius+50);
    var pie = d3.layout.pie().value(function(d) {console.log(d); return d.count; });
    var animation = d3.interpolate(function(d) {console.log(d); return d.count; });
    var path = svg.selectAll('path')
                  .data(pie(newarray))
                  .enter()
                  .append('path')
                  .attr('d', arc)
                  .attr('fill', function(d,i) {
                    console.log(d.data);
                    return color(d.data.country);
                  }).on("mouseover",function(d) {
                        d3.select(this).transition()
                        .duration(1000)
                        .attr("d", arcout);
                  }).on("mouseout", function(d) {
                        d3.select(this).transition()
                        .duration(1000)
                        .attr("d", arc);
                  });
    var svg1 = d3.select('#barchart')
                .append('svg')
                .attr('width', 1000)
                .attr('height', 120);
    var bar = svg1.append("g").append('rect')
                  .attr('height',50)
                  .attr('width',distance/500)
                  .transition().delay(3)
                  .duration(300)
                  .style('fill',function() {
                    if (distance<30000)
                    {
                      return 'red';
                    }
                    else if (distance>30000 && distance<100000) {
                      return 'blue';
                    }
                    else {
                      return 'green';
                    }
                  });
    var transform1 = svg1.selectAll("g")
                       .append('text')
                       .attr("font-size", "30px")
                       .attr("transform", 'translate(10,80)')
                       .text(function() {
                         if (myPlaces.length >=2)
                         return Math.floor(distance) + " Kms"
                       });

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
