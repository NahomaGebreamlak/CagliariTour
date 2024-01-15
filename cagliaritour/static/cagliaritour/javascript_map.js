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

    // Adding markers to the map
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
// Add listener for each marker click
        marker.addListener('click', function () {
            infoWindow.forEach(function (iw) {
                iw.close();
            });

            // Function to display some information about the place
            setContentForDiv(location);


            infowindow.open(map, marker)


        });
    });

    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);
//drawRoute("Piazza Costituzione, 09121 Cagliari CA", "07030 Zona Industriale Province of Sassari",'DRIVING','red');


}


window.initMap = initMap;



