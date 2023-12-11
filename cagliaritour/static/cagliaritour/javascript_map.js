let map
let directionsService
let directionsRenderer

function initMap() {

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    const locations = JSON.parse(document.getElementById('locationData').textContent);

    var firstLocation = locations[0];
    var secondLocation = locations[1];
    var infoWindow = [];

    var mapOptions = {
        center: {lat: firstLocation.lat, lng: firstLocation.lng},
        zoom: 15,
        styles: [{
            featureType: 'poi',
            stylers: [{visibility: 'off'}] // Hide points of interest
        }],
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.BOTTOM_CENTER,
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_CENTER,
        },
        fullscreenControl: true,
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    //  directionsRenderer.setMap(map);
    // // set this for drawing routes
    //getLatitudeData();
    locations.forEach(function (location) {

        var marker = new google.maps.Marker({
            position: {lat: location.lat, lng: location.lng},
            map: map,
            animation: google.maps.Animation.DROP,

            title: location.name,
            icon: "http://127.0.0.1:8000/static/images/" + location.icon,
            // label: { color: '#000000', fontWeight: 'bold', fontSize: '14px', text: location.name },
            optimized: true,
        });

        var infowindow = new google.maps.InfoWindow({
            content: location.name
        });

        infoWindow.push(infowindow)

        marker.addListener('click', function () {
            infoWindow.forEach(function (iw) {
                iw.close();
            });

            setContentForDiv(location.name);
            draw_popular_time_chart();

            infowindow.open(map, marker)
            //  alert("this is me" + location.name);

        });
    });

    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);
//drawRoute("Piazza Costituzione, 09121 Cagliari CA", "07030 Zona Industriale Province of Sassari",'DRIVING','red');


}


function setContentForDiv(placename) {

// Change content of a div element using jQuery
    // Change content of a Bootstrap card using jQuery
    showWeatherCard();
    var cardContent = `<div class="card-body">
                    <div class="card-title" onclick="infoCloser()">${placename}<i class="fas fa-times cancel-button" ></i></div>
                     <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Duomo_di_Cagliari_Sardegna.jpg" class="card-img-top" alt="Image Alt Text">
                    <p class="card-text">some discription about this place</p>
                    <label for="daySelector">Select a day:</label>
    <select id="daySelector" class="form-control form-control-sm">
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
    </select>
<a href="https://www.google.com/">
            <img src="http://127.0.0.1:8000/static/images/google_on_white_hdpi.png"  height="20px" alt="Powered by Google">

<canvas id="popularTimesChart" ></canvas>
    </a>
    
                  </div>`;
    jQuery('#infoWindowBox').height(530);
    jQuery('#infoWindowBox').html(cardContent);
}


// Function to draw multiple routes on the map
function drawRoutesOnMap(routes) {
    const lineSymbol = {path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 6};

    routes.forEach((route, index) => {
        // console.log(index % 2 === 0 ? "solid" : "Dash");
        // Change line type
var polylineSelector = index % 2 === 0
  ? {
      strokeColor: route.color,
      strokeWeight: 6
    }
  : {
      strokeOpacity: 0,
      icons: [{ icon: lineSymbol, offset: '0', repeat: '20px' }],
      strokeColor: route.color,
      strokeWeight: 6,
      strokeDashStyle: '5,5'
    };

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            polylineOptions: polylineSelector
        });

        const request = {
            origin: route.start,
            destination: route.end,
            travelMode: 'DRIVING'
        };

        directionsService.route(request, function (response, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            } else {
                console.error('Directions request failed. Status:', status);
            }
        });
    });
}


// function to draw line
function drawLine(firstLocation, secondLocation) {

    var origin = new google.maps.LatLng(firstLocation.lat, firstLocation.lng);
    var destination = new google.maps.LatLng(secondLocation.lat, secondLocation.lng);

    var line = new google.maps.Polyline({
        path: [origin, destination], geodesic: true, strokeColor: '#aa03e8', strokeOpacity: 1.0, strokeWeight: 2
    });

    line.setMap(map);


}

function renderDirections(result, color) {


    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setOptions({
        polylineOptions: polylineOptions
    });
    directionsRenderer.setMap(map);
    directionsRenderer.setDirections(result);
}


function drawRoute(startingAddress, destinationAddress, travelMode, color) {
    console.log("destination New One afternoon 1:-  " + destinationAddress);
    var _DisplayRenderer = new google.maps.DirectionsRenderer();
    var polylineOptions = {
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 3
    };
    // Define the waypoints and origin/destination
    var waypoints = [{location: startingAddress}, {location: destinationAddress}];
    // Set polyline options with the specified color

    directionsService.route({
        origin: startingAddress,
        destination: destinationAddress,
        waypoints: waypoints,
        travelMode: travelMode
    }, function (response, status) {
        if (status === 'OK') {
            // Set the polyline options
            _DisplayRenderer.setOptions({
                polylineOptions: polylineOptions
            });
            _DisplayRenderer.setMap(map);
            _DisplayRenderer.setDirections(response);

        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });

}

window.initMap = initMap;

// Wait for the document to be ready
var $j = jQuery.noConflict();

$j(document).ready(function () {
    // Select the collapse element by its ID
    var collapseElement = jQuery('#form');
// When the form hide button is clicked
    jQuery('#hideFormButton').on('click', function () {
        event.preventDefault(); // Prevent the default behavior of the button click

        // Hide the form
        collapseElement.hide();
        // Show the toggle button
        jQuery('#collapseButton').show();
    });
    // When the collapse is shown
    collapseElement.on('shown.bs.collapse', function () {
        // Hide the button
        collapseElement.show();
        jQuery('#collapseButton').hide();

    });

    // When the collapse is hidden
    collapseElement.on('hidden.bs.collapse', function () {
        // Show the button
        jQuery('#collapseButton').show();
        collapseElement.hide();
    });
});

function infoCloser() {

    jQuery('#collapseButtonInfo').show();
    jQuery('#infoWindowBox').hide();
    jQuery('#infoWindowBox').height(350);
    loadWeatherCard();
}

function showWeatherCard() {
    jQuery('#collapseButtonInfo').hide();
    jQuery('#infoWindowBox').show();
}


function showForm(flag) {
    if (flag) {
        jQuery('#form').show();
        jQuery('#collapseButton').hide();
    } else {
        jQuery('#form').hide();
        jQuery('#collapseButton').show();

    }
}


// Wait for the document to be ready for info box
$j(document).ready(function () {

    loadWeatherCard();
    // Select the collapse element by its ID
    var collapseElement = jQuery('#infoWindowBox');
    jQuery('#collapseButtonInfo').hide();

// When the form hide button is clicked
    jQuery('#hideBoxButton').on('click', function () {
        event.preventDefault(); // Prevent the default behavior of the button click

        // Hide the form
        collapseElement.hide();
        // Show the toggle button
        jQuery('#collapseButtonInfo').show();
    });

    // When the collapse is shown
    collapseElement.on('shown.bs.collapse', function () {
        // Hide the button
        jQuery('#infoWindowBox').height(300);
        collapseElement.show();
        jQuery('#collapseButtonInfo').hide();

    });

    // When the collapse is hidden
    collapseElement.on('hidden.bs.collapse', function () {
        // Show the button
        jQuery('#collapseButtonInfo').show();
        collapseElement.hide();

    });


});

// draw popular chart

function getBarColor(value) {
    if (value > 75) {
        return '#FF0000';
    } else if (value > 50) {
        return '#0b0b93';
    } else {
        return '#2f6dce';
    }
}

function draw_popular_time_chart() {
    // Get the data for the graph
    const popularTimesData = [{
        'name': 'Monday',
        'data': [0, 0, 0, 0, 0, 0, 0, 0, 33, 44, 47, 52, 61, 67, 71, 70, 70, 73, 70, 56, 38, 21, 0, 0]
    }, {
        'name': 'Tuesday',
        'data': [0, 0, 0, 0, 0, 0, 0, 0, 42, 58, 58, 53, 53, 61, 68, 75, 66, 54, 46, 35, 25, 17, 0, 0]
    }, {
        'name': 'Wednesday',
        'data': [0, 0, 0, 0, 0, 0, 0, 0, 38, 55, 62, 71, 79, 80, 89, 87, 78, 57, 45, 34, 25, 13, 0, 0]
    }, {
        'name': 'Thursday',
        'data': [0, 0, 0, 0, 0, 0, 0, 0, 25, 38, 54, 64, 76, 86, 92, 96, 81, 64, 46, 32, 26, 21, 0, 0]
    }, {
        'name': 'Friday',
        'data': [0, 0, 0, 0, 0, 0, 0, 0, 31, 49, 66, 72, 75, 76, 88, 92, 86, 65, 50, 31, 21, 9, 0, 0]
    }, {
        'name': 'Saturday',
        'data': [0, 0, 0, 0, 0, 0, 0, 0, 25, 46, 64, 75, 72, 78, 83, 99, 100, 75, 56, 44, 39, 31, 0, 0]
    }, {
        'name': 'Sunday',
        'data': [0, 0, 0, 0, 0, 0, 0, 0, 12, 25, 40, 53, 71, 82, 92, 92, 90, 77, 64, 48, 29, 15, 0, 0]
    }];
    const daySelector = document.getElementById('daySelector');
    const chartData = popularTimesData.find(day => day.name === daySelector.value);
// remove 0 from the data
    const modifiedData = chartData.data.slice(8, 22);

    const chart = new Chart(document.getElementById('popularTimesChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: Array.from({length: modifiedData.length}, (_, i) => i + 8), // Labels from 8 to 21
            datasets: [{
                label: chartData.name,
                data: modifiedData,
                backgroundColor: chartData.data.map(value => getBarColor(value)),
                borderRadius: 2,

            }],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Popular Times'
                }
            },

        }
    });

    daySelector.addEventListener('change', () => {
        const selectedDay = daySelector.value;
        const selectedChartData = popularTimesData.find(day => day.name === selectedDay);

// Extract the data from index 8 to index 21 (excluding the last 2 numbers)
        const modifiedData = selectedChartData.data.slice(8, 22);

        chart.data.labels = Array.from({length: modifiedData.length}, (_, i) => i + 8);
        chart.data.datasets[0].label = selectedChartData.name;
        chart.data.datasets[0].data = modifiedData;
        chart.data.datasets[0].backgroundColor = modifiedData.map(value => getBarColor(value));
        chart.update();

    });
}


// a function to find latitude and longitude of a city
function getLatitudeData() {


// Replace 'YOUR_CITY_NAME' with the name of your city
    const cityName = 'Cagliari';

// Use the Nominatim API to get city details
    const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data[0]) {
                const boundingBox = data[0].boundingbox;
                const minLatitude = parseFloat(boundingBox[0]);
                const minLongitude = parseFloat(boundingBox[2]);
                const maxLatitude = parseFloat(boundingBox[1]);
                const maxLongitude = parseFloat(boundingBox[3]);

                // Now you can use these values in your Google Maps initialization
                console.log(`Min Latitude: ${minLatitude}, Min Longitude: ${minLongitude}`);
                console.log(`Max Latitude: ${maxLatitude}, Max Longitude: ${maxLongitude}`);
            } else {
                console.error('City not found');
            }
        })
        .catch(error => console.error('Error fetching data:', error));

}





