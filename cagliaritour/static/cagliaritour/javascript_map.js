let map

function initMap() {
    const locations = JSON.parse(document.getElementById('locationData').textContent);

    var firstLocation = locations[0];
    var secondLocation = locations[1];
    var infoWindow = [];

    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: firstLocation.lat, lng: firstLocation.lng},
        zoom: 14,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR, position: google.maps.ControlPosition.BOTTOM_CENTER,

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

    });
    const icons = {
        cathedral: {
            icon: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.rawpixel.com%2Fsearch%2Ftown&psig=AOvVaw0ek0W_WauXbSZJWWMwmb74&ust=1698140014850000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCIDb8tfui4IDFQAAAAAdAAAAABAF",
        }, stadium: {
            icon: "https://maps.google.com/mapfiles/kml/pal2/icon49.png",
        }, info: {
            icon: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.rawpixel.com%2Fsearch%2Ftown&psig=AOvVaw0ek0W_WauXbSZJWWMwmb74&ust=1698140014850000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCIDb8tfui4IDFQAAAAAdAAAAABAF",
        },
    };
    locations.forEach(function (location) {
        var marker = new google.maps.Marker({
            position: {lat: location.lat, lng: location.lng},
            map: map,
            title: location.name,
            icon: icons["stadium"].icon
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

            infowindow.open(map, marker)
            //  alert("this is me" + location.name);

        });
    });

    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);
//        drawLine (firstLocation , secondLocation)
// drawRoute("64CG+X8 Cagliari, Metropolitan City of Cagliari", "V.le Regina Margherita, 33, 09124 Cagliari CA",'DRIVING','red');
// drawRoute("64CG+X8 Cagliari, Metropolitan City of Cagliari", "V.le Regina Margherita, 33, 09124 Cagliari CA",'WALKING','blue');


}


function setContentForDiv(placename) {

// Change content of a div element using jQuery
    // Change content of a Bootstrap card using jQuery

    var cardContent = `<div class="card-body">
                    <h5 class="card-title">${placename}</h5>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Duomo_di_Cagliari_Sardegna.jpg" class="card-img-top" alt="Image Alt Text">
                    <p class="card-text">some discription about this place</p>
                  </div>`;
    $('#infoWindowBox').html(cardContent);
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


    // Create a DirectionsService object to use the route method and get a result
    var directionsService = new google.maps.DirectionsService;

    // Create a DirectionsRenderer object to display the route
    var directionsDisplay = new google.maps.DirectionsRenderer({
        map: map, polylineOptions: {
            strokeColor: color // Set the desired color here
        }
    });

    // Define the waypoints and origin/destination
    var waypoints = [{location: startingAddress}, {location: destinationAddress}];

    // Request the route
    directionsService.route({
        origin: startingAddress, destination: destinationAddress, waypoints: waypoints, travelMode: travelMode// You can also use BICYCLING, WALKING, etc.
    }, function (response, status) {
        if (status === 'OK') {
            // Display the route on the map
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });


}

window.initMap = initMap;

// Wait for the document to be ready
$(document).ready(function () {
    // Select the collapse element by its ID
    var collapseElement = $('#form');
// When the form hide button is clicked
    $('#hideFormButton').on('click', function () {
        event.preventDefault(); // Prevent the default behavior of the button click

        // Hide the form
        collapseElement.hide();
        // Show the toggle button
        $('#collapseButton').show();
    });
    // When the collapse is shown
    collapseElement.on('shown.bs.collapse', function () {
        // Hide the button
        collapseElement.show();
        $('#collapseButton').hide();

    });

    // When the collapse is hidden
    collapseElement.on('hidden.bs.collapse', function () {
        // Show the button
        $('#collapseButton').show();
        collapseElement.hide();
    });
});


// Wait for the document to be ready for info box
$(document).ready(function () {
    // Select the collapse element by its ID
    var collapseElement = $('#infoWindowBox');
    $('#collapseButtonInfo').hide();
// When the form hide button is clicked
    $('#hideBoxButton').on('click', function () {
        event.preventDefault(); // Prevent the default behavior of the button click

        // Hide the form
        collapseElement.hide();
        // Show the toggle button
        $('#collapseButtonInfo').show();
    });

    // When the collapse is shown
    collapseElement.on('shown.bs.collapse', function () {
        // Hide the button
        collapseElement.show();
        $('#collapseButtonInfo').hide();

    });

    // When the collapse is hidden
    collapseElement.on('hidden.bs.collapse', function () {
        // Show the button
        $('#collapseButtonInfo').show();
        collapseElement.hide();
    });
});


