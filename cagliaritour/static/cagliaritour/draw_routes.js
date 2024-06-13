// Function to draw multiple routes on the map
let routeTypeInfoList = [];
let directionsRenderersList = [];
// Define a global array to hold references to numbered markers
let numberedMarkers = [];

function drawRoutesOnMap(routes) {

    const lineSymbol = {path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 6};
    const directionsService = new google.maps.DirectionsService();

    // Promises array to track directions requests
    const directionPromises = [];

    routes.forEach((route, index) => {

        // make odd numbers dashes lines and full lines for even numbers
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

        directionsRenderersList.push(directionsRenderer);


        // Get the travel mode form value of travel mode
        const selectElement = document.getElementById('id_moving_preference');

        // Get the selected value
        const selectedValue = selectElement.value;

        const showHideButton = document.createElement('button');

        showHideButton.innerHTML = '<i class="fa fa-eye-slash"></i>';


showHideButton.style.marginRight = '10px';
showHideButton.style.padding = '10px 20px'; // Adjust padding for button size
showHideButton.style.fontSize = '18px'; // Adjust font size for button text/icon size
showHideButton.style.width = 'auto'; // Optional: adjust width if needed
showHideButton.style.height = 'auto'; // Optional: adjust height if needed
showHideButton.classList.add('btn', 'btn-info');

// Add click event listener to toggle visibility of directions renderer
        showHideButton.addEventListener('click', function () {
            if (directionsRenderer.getMap() === null) {
                directionsRenderer.setMap(map);
                // Show numbered markers
                numberedMarkers[index].forEach(marker => {
                    marker.setMap(map);
                });
                showHideButton.innerHTML = '<i class="fa fa-eye-slash"></i>';


            } else {
                directionsRenderer.setMap(null);
                removeNumberedMarkers(index);
                showHideButton.innerHTML = '<i class="fa fa-eye"></i>';

            }
        });


        const request = {
            origin: route.start,
            destination: route.end,
            travelMode: selectedValue
        };



        // If selected travel mode is not 'Car', check distance and set travel mode accordingly
        // if (selectedValue !== 'DRIVING') {
        //     const distanceThreshold = 0; // Set your distance threshold in meters here
        //     const distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(route.start.lat, route.start.lng), new google.maps.LatLng(route.end.lat, route.end.lng));
        //     if (distance > distanceThreshold) {
        //         request.travelMode = 'TRANSIT'; // Use bus if distance is greater than threshold
        //     } else {
        //         request.travelMode = 'WALKING'; // Use walking if distance is within threshold
        //     }
        // }




        // Create a Promise for each directions request
        const directionPromise = new Promise((resolve, reject) => {
            directionsService.route(request, function (response, status) {
                if (status === 'OK') {
                     directionsRenderer.setOptions({ preserveViewport: true });
                    directionsRenderer.setDirections(response);
                    // Add numbered markers along the route
                    const routepath = response.routes[0].legs[0];
                    const markers = [];
                    for (let i = 0; i < routepath.steps.length; i++) {
                        if (i % 2 === 0) { // Check if i is even
                            const marker = addNumberedMarker(map, routepath.steps[i].start_location, route.poinumber, route.color);
                            markers.push(marker);
                        }
                    }
                    numberedMarkers[index] = markers; // Store markers for this index


                    let concatenatedRouteTypeInfo = "";
                    var busNumbers;
                    if (response.routes.length > 0 && response.routes[0].legs.length > 0 && response.routes[0].legs[0].steps.length > 0) {
                        const steps = response.routes[0].legs[0].steps;
                        const travelModes = steps.map((step) => step.travel_mode);
                        const uniqueTravelModes = [...new Set(travelModes)];
                        for (const mode of uniqueTravelModes) {
                            concatenatedRouteTypeInfo += mode + "_";
                        }

                        // Access the bus numbers function when the travel mode is in transit
                        if (selectedValue === 'TRANSIT') {
                            busNumbers = getBusNumbers(response);
                            console.log('Bus Numbers:', busNumbers);
                        }

                    } else {
                        console.error("No valid route found in the response.");
                    }

                    const routeTypeInfo = getRouteTypeInfo(concatenatedRouteTypeInfo.slice(0, concatenatedRouteTypeInfo.lastIndexOf('_')));
                    routeTypeInfo["number"] = route.poinumber;
                    routeTypeInfo["color"] =  route.color;
                    routeTypeInfo["btn"] = showHideButton;
                    routeTypeInfo['busNumbers'] = busNumbers;
                    routeTypeInfoList.push(routeTypeInfo);
                    resolve();// Resolve the Promise once directions are processed
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
        routeTypeInfoList.sort((a, b) => a.number - b.number);
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
    const legendContainer = document.getElementById("routeInfobox");

    if (!legendContainer) {
        console.error(`Container with ID not found.`);
        return;
    }
    let divtype = 'route-circle_drive';
    let fontsize = '25px';
   var travel_mode = document.getElementById('id_moving_preference').value;
    if(travel_mode === 'TRANSIT'){
         divtype ='route-circle_bus';
         fontsize ='20px';
    }

    // Clear existing content of the container
    legendContainer.innerHTML = '';

    for (let i = 0; i < routeTypeInfoList.length; i++) {
        const routeTypeInfo = routeTypeInfoList[i];
        const legendDiv = document.createElement('div');

        let busNumbersHTML = '';

        if (routeTypeInfo.busNumbers && routeTypeInfo.busNumbers.length > 0) {
            // If busNumbers is not empty, include it in the legend
            busNumbersHTML = ` Bus N. ${routeTypeInfo.busNumbers}`;

        }

        // Check if routeTypeInfoList[i+1] exists before accessing its color property
        let nextRouteColor = '#000000' +
            '';
        if (routeTypeInfoList[i + 1]) {
            nextRouteColor = routeTypeInfoList[i + 1].color;
        }

        console.log(`${routeTypeInfo.color}  ${routeTypeInfoList.length}`);
        legendDiv.innerHTML = `
            <p style="font-size: ${fontsize}; display: inline-block; max-width: 500px" class="btn btn-light">
                Route
                <span style="background-color: ${routeTypeInfo.color};" class="${divtype}">
                    ${routeTypeInfo.number}
                </span>
              <span style="font-size: 30px;">&rarr;</span>  
                <span style="background-color: ${nextRouteColor};" class="${divtype}">
               
                    ${routeTypeInfo.number + 1}
                </span>
                ${routeTypeInfo.icon}${busNumbersHTML}
            </p>`;

        // Append the button before the text in legendDiv
        legendDiv.appendChild(routeTypeInfo.btn);

        legendContainer.appendChild(legendDiv);
    }
}


function clearLegend() {
    // Get all elements in the left bottom control position
    const leftBottomControl = map.controls[google.maps.ControlPosition.LEFT_BOTTOM];

    // Iterate through the elements and remove them
    for (let i = 0; i < leftBottomControl.length; i++) {
        const control = leftBottomControl.getAt(i);
        leftBottomControl.removeAt(i);
        control.remove();
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
    // Push the marker reference into the numberedMarkers array
    return marker;
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


// function to get bus numbers from the directions response
function getBusNumbers(response) {
    const busNumbers = [];

    // Check if the response contains valid routes and legs
    if (response.routes.length > 0 && response.routes[0].legs.length > 0) {
        const legs = response.routes[0].legs;

        // Iterate through each leg to check for transit details
        legs.forEach((leg) => {
            // Check if the leg has transit details
            if (leg.steps && leg.steps.length > 0) {
                const steps = leg.steps;

                // Iterate through each step to extract bus numbers
                steps.forEach((step) => {
                    if (step.transit && step.transit.line && step.transit.line.short_name) {
                        const busNumber = step.transit.line.short_name;
                        busNumbers.push(busNumber);
                    }
                });
            }
        });
    }
    // Concatenate bus numbers with hyphen ("-")
    const concatenatedBusNumbers = busNumbers.join('-');

    return concatenatedBusNumbers;

}

// Function to make route card Collapsible
function showRouteCard() {
    var routeInfobox = document.getElementById('routeInfobox');
    var routeInfoMinimize = document.getElementById('routeInfoMinimize');

    // Toggle the visibility of routeInfobox
    routeInfobox.classList.toggle('collapsed');

    // Change the text/icon of the button based on the current state
    if (routeInfobox.classList.contains('collapsed')) {
        routeInfoMinimize.innerHTML = '<b>Route Details<i class="fas fa-angle-up"></i></b>';
    } else {
        routeInfoMinimize.innerHTML = '<b>Route Details<i class="fas fa-angle-down"></i></b>';
    }
}


function clearRoutes() {
    // Remove all directions renderers from the map

    directionsRenderersList.forEach(function (renderer,index) {
        renderer.setMap(null);
        removeNumberedMarkers(index);

    });
// Iterate through each numbered marker and remove it from the map
//     numberedMarkers.forEach(function (markers) {
//         markers.setMap(null);
//     });
    numberedMarkers = [];
    // Clear the routeTypeInfoList
    routeTypeInfoList = [];


}


function removeNumberedMarkers(index) {
    if (numberedMarkers[index]) {
        numberedMarkers[index].forEach(marker => {
            marker.setMap(null);
        });

    }
}