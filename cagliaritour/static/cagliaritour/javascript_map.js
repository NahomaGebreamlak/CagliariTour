let map
let directionsService
let directionsRenderer

// Function to initialize the map
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

            // Function to display some information about the place
            setContentForDiv(location);
            // Function to draw popular times graph

            infowindow.open(map, marker)
            //  alert("this is me" + location.name);

        });
    });

    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);
//drawRoute("Piazza Costituzione, 09121 Cagliari CA", "07030 Zona Industriale Province of Sassari",'DRIVING','red');


}


function setContentForDiv(placeInfo) {

// Function to hide and display the weather card
    showWeatherCard();

     // Content of the div
    var cardContent = `<div class="card-body">
                    <div class="card-title" onclick="infoCloser()">${placeInfo.name}<i class="fas fa-times cancel-button" ></i></div>
                     <img src="http://127.0.0.1:8000/${placeInfo.image}" class="card-img-top" alt="Image of ${placeInfo.name}">
                    <p class="card-text" style="font-size: 14px">${placeInfo.description}</p>
                  </div>`;
    jQuery('#infoWindowBox').height(760);
    jQuery('#infoWindowBox').html(cardContent);
    draw_popular_time_chart( `${placeInfo.placeId}`);


}

// Function to draw multiple routes on the map
function drawRoutesOnMap(routes) {
    let routeTypeInfoList = [];
    const lineSymbol = {path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 6};
    const directionsService = new google.maps.DirectionsService();

    // Promises array to track directions requests
    const directionPromises = [];

    routes.forEach((route, index) => {
        const polylineSelector = index % 2 === 0
            ? {
                strokeColor: route.color,
                strokeWeight: 6
            }
            : {
                strokeOpacity: 0,
                icons: [{icon: lineSymbol, offset: '0', repeat: '20px'}],
                strokeColor: route.color,
                strokeWeight: 6,
                strokeDashStyle: '5,5'
            };

        const directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            polylineOptions: polylineSelector,
            suppressMarkers: true
        });
        // Get the travel mode form value of travel mode
        const selectElement = document.getElementById('id_moving_preference');

// Get the selected value
        const selectedValue = selectElement.value;


        const request = {
            origin: route.start,
            destination: route.end,
            travelMode: selectedValue
        };

        // Create a Promise for each directions request
        const directionPromise = new Promise((resolve, reject) => {
            directionsService.route(request, function (response, status) {
                if (status === 'OK') {
                    directionsRenderer.setDirections(response);
                    // Add numbered markers along the route
                    const routepath = response.routes[0].legs[0];
                    for (let i = 0; i < routepath.steps.length; i++) {
                        addNumberedMarker(map, routepath.steps[i].start_location, route.poinumber, route.color);
                    }

                    let concatenatedRouteTypeInfo = "";
                    if (response.routes.length > 0 && response.routes[0].legs.length > 0 && response.routes[0].legs[0].steps.length > 0) {
                        const steps = response.routes[0].legs[0].steps;
                        const travelModes = steps.map((step) => step.travel_mode);
                        const uniqueTravelModes = [...new Set(travelModes)];
                        for (const mode of uniqueTravelModes) {
                            concatenatedRouteTypeInfo += mode + "_";
                        }
                    } else {
                        console.error("No valid route found in the response.");
                    }

                    const routeTypeInfo = getRouteTypeInfo(concatenatedRouteTypeInfo.slice(0, concatenatedRouteTypeInfo.lastIndexOf('_')));
                    routeTypeInfo["number"] = route.poinumber;
                    routeTypeInfoList.push(routeTypeInfo);
                    resolve();  // Resolve the Promise once directions are processed
                } else {
                    console.error('Directions request failed. Status:', status);
                    reject();  // Reject the Promise if there's an error
                }
            });
        });

        directionPromises.push(directionPromise);
    });

    // Wait for all directions requests to complete before creating the legend
    Promise.all(directionPromises).then(() => {
        routeTypeInfoList.sort((a, b) => b.number - a.number);

        addLegend(routeTypeInfoList);
    });
}


// Function to get route type information
function getRouteTypeInfo(routeType) {
    switch (routeType) {
        case 'WALKING':
            return {label: 'Walking', icon: '🚶'};
        case 'TRANSIT':
            return {label: 'Transit', icon: '🚍'};
        case 'WALKING_TRANSIT':
            return {label: 'Walking and Transit', icon: '🚶🚍'};
        case 'TRANSIT_WALKING':
            return {label: 'Transit and Walking', icon: '🚍🚶'};
        case 'DRIVING':
            return {label: 'Driving', icon: '🚗'};
        case 'WALKING_DRIVING':
            return {label: 'Walking and Driving', icon: '🚶🚗'};
        case 'DRIVING_WALKING':
            return {label: 'Driving and Walking', icon: '🚗🚶'};
        // Add more cases as needed
        default:
            return {label: 'Unknown', icon: '❓'};
    }
}

// Function to add a legend on the map
function addLegend(routeTypeInfoList) {

    for (const routeTypeInfo of routeTypeInfoList) {
        const legendDiv = document.createElement('div');
        legendDiv.innerHTML = `<p style="font-size: 20px; background-color: #e0e0e0"> ${routeTypeInfo.number},${routeTypeInfo.icon} ${routeTypeInfo.label}</p>`;
        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legendDiv);
    }
}


// Function to add markers to the steps
function addNumberedMarker(map, location, number, color) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        label: {
            text: number.toString(),
            color: 'white'
        },
        icon: getMarkerIcon(color),

    });
}

function getMarkerIcon(color) {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 10, // Adjust the scale based on your preference
    };
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


function drawRoute(startingAddress, destinationAddress, travelMode, color) {
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

 async function draw_popular_time_chart(placeId) {
    var cardcontent =
        ` <div class="card-body">   <label htmlFor="daySelector">Select a day:</label>
    <select id="daySelector" className="form-control form-control-sm">
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
    </a>
    <canvas id="popularTimesChart"></canvas> </div>`;

    var popularTimesData;

    try {
        const response = await fetch(`/popular_times/${placeId}`);
        const responseData = await response.json();
        popularTimesData = JSON.parse(responseData["data"]);

        if (!popularTimesData || popularTimesData.length === 0) {
            // Handle case where there is no data
            console.log('No data available.');
            return;
        }
   // Append the card content only if there is data
    jQuery('#infoWindowBox').append(cardcontent);
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

    } catch (e) {
        // Handle errors if necessary
        console.error('Error fetching or parsing data:', e);
        return;
    }


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





