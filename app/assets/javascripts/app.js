// Globals
var tripifyMap;
var editUrl;
var tripObject;
var tripId;
var lastChosenPlace = {
  lat: null,
  lng: null,
  name: null
};
var myPlaces = [];
var distance = 0;


// Map display & get URL key & turn autocomplete on
$(document).ready(function() {

  L.mapbox.accessToken = mapAccessKey;
  tripifyMap = L.mapbox.map('map', 'mapbox.streets').setView([20, 20], 2);
  // Disable drag and zoom handlers.
  tripifyMap.dragging.disable();
  tripifyMap.touchZoom.disable();
  tripifyMap.doubleClickZoom.disable();
  tripifyMap.scrollWheelZoom.disable();
  tripifyMap.keyboard.disable();
  // tripifyMap.
  $("#placefinder").easyAutocomplete(options);
  $('#addplace').on('click', function() {
    if (tripObject == undefined){
      getUrl()
    } else {
      console.log("new trip already generated");
      addPlace(tripId);
    }

    if (tripObject != undefined) {
     console.log(tripObject.disp_url);
    }

    $('#saveBtn').show();

    console.log($('#saveBtn'));
  });
  $('#saveBtn').on('click', function() {
    displayModal(tripObject);
  });
  addSavedData(tripId);
});


var displayModal = function(trip) {
  $('#modal-content').toggleClass('active');
  var $displayUrl = $('<div>').text('Your saved trip page: http://tripifywdi6.herokuapp.com/' + trip.disp_url);
  var $editUrl = $('<div>').text('To edit your trip later: http://tripifywdi6.herokuapp.com/' + trip.edit_url);
  var $closeBtn = $('<button>').text('Close').addClass('button', 'icon', 'plus', 'loud');
  $($closeBtn).on('click', function() {
    $('#modal-content').toggleClass('active');
    $('#modal-text').empty();
  })
  var $emailLink = $('<a href="mailto:?subject=Your Tripify Links&amp;body=Your saved trip page: http://tripifywdi6.herokuapp.com/' + trip.disp_url +' To edit your trip later: http://tripifywdi6.herokuapp.com/' + trip.edit_url + '"><i class="fa fa-envelope fa-2x" aria-hidden="true"></i></a>');
  $('#modal-text').append($displayUrl).append($editUrl).append($closeBtn).append($emailLink);
}

//date picker widget
$(function() {
  $("#datepicker").datepicker({
  dateFormat: "dd-mm-yy",
  changeMonth: true,
  changeYear: true,
  yearRange: "1960:2020"

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
    // var $place = $('<p>').text(stop.name + ' ' + stop.arrived_at.split("-").reverse().join("/"));
    // $('#triplist').append($place);

    //display text for place
    var $tablerow = $('<tr>');
    var $newPlace = $('<td>').text(stop.name);
    var $newDate = $('<td>').text(' ' + stop.arrived_at.split("-").reverse().join("/"));
    $tablerow.append($newPlace).append($newDate);

    $('#table-stop').append($tablerow);
    console.log($newPlace);
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
  }).done(function(trip) {
    editUrl = trip.edit_url;
    tripId = trip.id;
    tripObject = trip;
    // display Url on the page , the modal is diplaying the urls so not needed anymore
    // $('#url-info').append($('<p>').text("Display Only Url : " + tripObject.disp_url))
    addPlace(tripId);
  });
}

var addPlace = function(tripId) {

  var settings = {
    url: '/trip/' + tripId,
    data: {name: lastChosenPlace.name, lng: lastChosenPlace.lng, lat: lastChosenPlace.lat, arrived_at: $('#datepicker').val() },
    method: 'post'
  }

  $.ajax(settings).done(function(stop) {
    //display text for place
    var $tablerow = $('<tr>');
    var $newPlace = $('<td>').text(stop.name);
    var $newDate = $('<td>').text(' ' + stop.arrived_at.split("-").reverse().join("/"));
    $tablerow.append($newPlace).append($newDate);

    $('#table-stop').append($tablerow);
    console.log($newPlace);

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
    var width = ($(document.body).height() * .3);
    // changed height to 30% of total height of window
    var height = ($(document.body).height() * .3);
    var radius = Math.min(width, height) / 3;
    var color = d3.scale.ordinal().range(['#2ca02c','#5254a3','#1f77b4','#9c9ede','#a55194','#e7ba52','#bcbddc','#A60F2B', '#B3F2C9', '#528C18', '#C3F25C']);
    var svg = d3.select('#chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate('+ ((width/3)+35)  +',' + ((height/3)+35) + ')');
    var arc = d3.svg.arc().outerRadius(radius).innerRadius(30);
    var text = svg.append("text");
    var arcout = d3.svg.arc().outerRadius(radius+10).innerRadius(20);
    var pie = d3.layout.pie().value(function(d) {console.log(d); return d.count; });
    var animation = d3.interpolate(function(d) {console.log(d); return d.count; });
    var path = svg.selectAll('path')
                  .data(pie(newarray))
                  .enter()
                  .append('path')
                  .attr('d', arc)
                  .attr('id',function(d) {return d.data.country;})
                  .attr('fill', function(d,i) {
                    return color(d.data.country);
                  }).on('mouseover',function(d) {
                        d3.select(this)
                          .transition()
                          .duration(1000)
                          .attr("d", arcout);
                        svg.append('text')
                          .text(d.data.country)
                          .attr('class','country')
                          .style('color','white')
                          .attr('transform', 'translate(-25,0)');
                  }).on('mouseout', function(d) {
                        d3.select(this)
                          .transition()
                          .duration(1000)
                          .attr('d', arc);
                        svg.selectAll('.country')
                           .remove();
                  });
    var days = text.selectAll('textPath')
                  .data(newarray)
                  .enter()
                  .append('textPath')
                  .attr('xlink:href',function(d) {return '#'+d.country;})
                  .text(function(d){return d.count;})
                  .style('font-size','20px')
                  .attr("startOffset",'.05');
    var svg1 = d3.select('#barchart')
                .append('svg')
                .attr('width', width*3)
                .attr('height', height);
    var bar = svg1.append("g").append('rect')
                  .attr('height',50)
                  .attr('width',distance/300)
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
                         if (myPlaces.length >=2) {
                         return Math.floor(distance) + " Kms";}
                       });
    var text = svg1.append("text")
                   .text(function() {
                     if (myPlaces.length >=2) {
                     return "Km's Travelled"}
                   })
                   .attr('transform','translate(20,40)');
    var transform = bar.attr('transform','translate(30,100)');

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
