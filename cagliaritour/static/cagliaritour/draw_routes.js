// Function to draw multiple routes on the map
function drawRoutesOnMap(routes) {
    let routeTypeInfoList = [];
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

        // Get the travel mode form value of travel mode
        const selectElement = document.getElementById('id_moving_preference');

        // Get the selected value
        const selectedValue = selectElement.value;

        const showHideButton = document.createElement('button');

        showHideButton.innerHTML = '<i class="fa fa-eye"></i>';

        showHideButton.style.marginRight = '10px';
        showHideButton.classList.add('btn', 'btn-info');

// Add click event listener to toggle visibility of directions renderer
        showHideButton.addEventListener('click', function () {
            if (directionsRenderer.getMap() === null) {
                directionsRenderer.setMap(map);
                showHideButton.innerHTML = '<i class="fa fa-eye-slash"></i>'; // Replace eye icon with eye slash icon
            } else {
                directionsRenderer.setMap(null);
                showHideButton.innerHTML = '<i class="fa fa-eye"></i>'; // Replace eye slash icon with eye icon
            }
        });


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
    const legendContainer = document.getElementById("routeInfobox");

    if (!legendContainer) {
        console.error(`Container with ID not found.`);
        return;
    }

    // Clear existing content of the container
    legendContainer.innerHTML = '';

    for (const routeTypeInfo of routeTypeInfoList) {
        const legendDiv = document.createElement('div');

        let busNumbersHTML = '';
        if (routeTypeInfo.busNumbers && routeTypeInfo.busNumbers.length > 0) {
            // If busNumbers is not empty, include it in the legend
            busNumbersHTML = ` Bus N. ${routeTypeInfo.busNumbers}`;
        }

        legendDiv.innerHTML = `
            <p style="font-size: 15px; display: inline-block;" class="btn btn-light">
                Route
                <span style="font-size: 15px; display: inline-block; background-color: #007bff; color: #fff; border-radius: 50%; width: 30px; height: 30px; text-align: center; line-height: 30px;">
                    ${routeTypeInfo.number}
                </span>
                &rarr;
                <span style="font-size: 20px; display: inline-block; background-color: #007bff; color: #fff; border-radius: 50%; width: 30px; height: 30px; text-align: center; line-height: 30px;">
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
