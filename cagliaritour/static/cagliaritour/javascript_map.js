
let map
let directionsService
let directionsRenderer
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Utility function to get a cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to initialize the map
function initMap() {
    // set the cookie to false first
setCookie('showInfoWindow', 'false', 1);
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();

    const locations = JSON.parse(document.getElementById('locationData').textContent);

    var firstLocation = locations[0];
    var secondLocation = locations[1];
    var infoWindow = [];

    var mapOptions = {
        center: {lat: 39.223841, lng: 9.121661}, // Coordinates for Cagliari

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
 var infoWindow = new google.maps.InfoWindow();

    // Adding markers to the map
    locations.forEach(function (location) {

        var marker = new google.maps.Marker({
            position: {lat: location.lat, lng: location.lng},
            map: map,
            animation: google.maps.Animation.DROP,

            title: location.name,
            icon: {
                url: "http://127.0.0.1:8000/" + location.icon,
                scaledSize: new google.maps.Size(40, 40) // Adjust the size as needed
            },
            // label: { color: '#000000', fontWeight: 'bold', fontSize: '14px', text: location.name },
            optimized: true,
        });

        var infowindowContent = `
    <div style="width: 220px; padding: 10px; overflow: hidden; box-sizing: border-box; border-radius: 8px; font-family: Arial, sans-serif;">
        <h6 style="margin: 0; padding: 0; font-size: 16px; color: #333;">${location.name}</h6>
        <img src="http://127.0.0.1:8000/${location.image}" alt="${location.name}" style="width: 100%; height: auto; margin: 10px 0; border-radius: 5px;" />
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; line-height: 1.4;">${location.description}</p>
        <div style="display: flex; justify-content: flex-end;">
            <button onclick="addToMainTravelList('${location.name}', '${location.description}')"
                    style="padding: 5px 15px; background-color: #007BFF; color: #fff; border: none; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: bold;">
                Add
            </button>
        </div>
    </div>
`;


        // Add listener for each marker click
        marker.addListener('click', function () {


  const showInfoWindow = getCookie('showInfoWindow') === 'true'; // Convert the string to a boolean



            if (showInfoWindow) {
                // Close previously opened InfoWindow
            infoWindow.close();

            // Set new content and open the InfoWindow
            infoWindow.setContent(infowindowContent);
            infoWindow.open(map, marker);
            } else {
              setContentForDiv(location);
            }


        });
    });


    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);
//drawRoute("Piazza Costituzione, 09121 Cagliari CA", "07030 Zona Industriale Province of Sassari",'DRIVING','red');


}
// Function to handle add button click
function addToMainTravelList(name, description) {
    // Add a new item to the mainTravelList
    const newItem = {
        number: mainTravelList.length + 1, // Assign a new number based on the list size
        name: name,
        time: 'N/A' // Add a default value for time if needed
    };

    mainTravelList.push(newItem); // Add the new item to the list

    // Refresh the list view to display the new item
     refreshListView();

    console.log("Added new item to mainTravelList:", newItem);
}

window.initMap = initMap;