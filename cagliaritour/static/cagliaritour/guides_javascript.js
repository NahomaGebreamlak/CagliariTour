var mainTravelList = [];
var selectedDay;

let cachedData = null; // To store the data fetched from the URL

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function refreshMap() {
    clearRoutes();
       mainTravelList=  getDayFromCookie(selectedDay);
    var routesData = [];
    for (let i = 0; i < mainTravelList.length; i++) {
        if (i + 1 < mainTravelList.length) {
            const currentPoi = mainTravelList[i]["name"];
            const nextPoi = mainTravelList[i + 1]["name"];
            var randomColor = getRandomColor();
            routesData.push({
                poinumber: i + 1,
                start: currentPoi + " , Cagliari",
                end: nextPoi + " , Cagliari",
                color: randomColor
            });
            console.log(i + " Start: " + currentPoi + ", end: " + nextPoi + "\n");
        }
    }
    drawRoutesOnMap(routesData);
}




// Function to fetch data only if not already cached
async function fetchData(isFirstTime) {
    if (cachedData !== null && isFirstTime === false) {
        console.log("Using cached data");
        console.log(cachedData);
        return cachedData;
    }

    console.log("Fetching data from URL...");
    const age = getCookieRace('age');
    const race = getCookieRace('race');
    const numberofdays = getCookie("numberofdays");
    const publicTransportPercentage = document.getElementById('public-transport-range').value / 100; // Range is 0 to 100
    const taxiChecked = document.getElementById('taxi').checked;

     // Construct the URL dynamically with the selected values
     const url = `http://192.167.133.40:8080/getroute/${numberofdays}/?age=${age}&race=${race}&public_transport=${publicTransportPercentage}&taxi=${taxiChecked}`;
     console.log(url);
    try {
        const response = await fetch(url);
        cachedData = await response.json();// Cache the data
        return cachedData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}


async function populateList(targetListId, bgcolor, date, isFirstTime) {
    const list = document.getElementById(targetListId);
    var listdata = [];

    try {

        const data = await fetchData(isFirstTime);

         // Validate that `data` and `data.guide` are defined
        if (!data || !Array.isArray(data.guide)) {
            console.error("Invalid data format: guide is not available or not an array.");
            return;
        }
          // Extract guide and optional guide data

        const guide = data.guide;
        selectedDay = date.split(' - ')[1];
        const selectedGuide = guide.find(day => day.day === selectedDay);
        let routesData = [];

        if (selectedGuide) {
            for (let i = 0; i < selectedGuide.POIs.length; i++) {
                const poi = selectedGuide.POIs[i];
                const visitTime = selectedGuide.visitTime[i];
                listdata.push({number: i + 1, name: poi, time: visitTime});

                if (i + 1 < selectedGuide.POIs.length && targetListId === "list1") {
                    const currentPoi = selectedGuide.POIs[i];
                    const nextPoi = selectedGuide.POIs[i + 1];
                    const randomColor = getRandomColor();
                    routesData.push({
                        poinumber: i + 1,
                        start: `${currentPoi}, Cagliari`,
                        end: `${nextPoi}, Cagliari`,
                        color: randomColor
                    });
                }
            }
        } else {
            console.log(`No data found for the selected day: ${selectedDay}`);
        }

        mainTravelList = [...listdata];

        saveDayToCookie(selectedDay, mainTravelList);  // Save initial data to cookie

        // Draw routes on the map
        drawRoutesOnMap(routesData);

        // Cache the main travel list data if targeting the main list
        if (targetListId === "list1") {
          //  mainTravelList = [...listdata];
            // Cache main travel list and save it to cookie
       mainTravelList=  getDayFromCookie(selectedDay);
        }

        // Clear previous content
        list.innerHTML = "";

        // Populate the list with the fetched data
        listdata.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.style.cssText = `
                display: flex;
                flex-direction: column;
                background-color: ${bgcolor};
                padding: 12px 15px;
                margin-bottom: 8px;
                border-radius: 8px;
                color: #333;
                font-size: 0.95rem;
            `;

            // First Row: Place name and time
            const textRow = document.createElement("div");
            textRow.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            textRow.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <span style="font-weight: bold; margin-right: 10px;">${item.number}.</span>
                    <span class="place-name">${item.name}</span>
                </div>
                <div class="text-muted small" style="flex-shrink: 0;">${item.time}</div>
            `;

            // Second Row: Action buttons with alignment and left spacing
            const buttonRow = document.createElement("div");
            buttonRow.style.cssText = `
                display: flex;
                justify-content: flex-end;
                margin-top: 8px;
                gap: 10px;
                padding-left: 30px;
            `;
            buttonRow.innerHTML = `
                <button class="btn btn-danger btn-sm delete-btn" style="padding: 5px; width: 30px; height: 30px;">
                    <i class="fa fa-trash" style="color: white;"></i>
                </button>
                <button class="btn" style="padding: 5px; width: 30px; height: 30px;">
                    <i class="fa-solid fa-up-down-left-right"></i>
                </button>
            `;

            // Add the delete button functionality
            buttonRow.querySelector('.delete-btn').addEventListener('click', function () {
               //  const itemIndex = Array.from(list.children).indexOf(listItem);
               //  mainTravelList.splice(itemIndex, 1); // Update mainTravelList
               //  listItem.remove(); // Remove item from the UI
               // saveDayToCookie(selectedDay, mainTravelList);

            deleteFromMainTravelList(item.name);

            });

            // Append rows to list item
            listItem.appendChild(textRow);
            listItem.appendChild(buttonRow);
            list.appendChild(listItem);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}


// Retrieve and parse the day's travel list from the cookie


function showRouteSelectionList(dayName, date,isFirstTime) {
    var cardContent = `<div class="card-body p-0 m-0">
                    <div class="card-title text-center" onclick="infoCloser()"> <h3>Your Guide  <i class="fas fa-angle-up"></i> </h3></div>
                     <div style="width: 280px; margin-top: 20px; overflow-y: auto; height: 550px;" style="margin: 0px; padding: 0px;background-color: lightskyblue">
  <div class="card p-0 m-0" style="background-color: lightskyblue">
    <div class="card-header text-center font-weight-bold">
    <h6>  ${dayName} <button class="btn btn-primary rounded circle" onclick="refreshMap()"><i class="fas fa-sync"></i></button></h6>
    </div>
    <div class="card-body p-0" style="background-color: deepskyblue;">
      <ul class="list-group list-group-flush card" id="list1" style="background-color: lightskyblue;">
        
        
      </ul>
    </div>
  </div>
</div>


<div class="d-flex justify-content-center" style="padding-top: 20px">
    <button type="button" class="btn btn-success btn-lg mr-2" onclick="sendFeedbackRoute()">
        <h5 class="m-0">
            <i class="fa-regular fa-envelope"></i> Send
        </h5>
    </button>
    <button type="button" class="btn btn-primary btn-lg" style="margin-left: 10px" onclick="refreshMap()">
        <h5 class="m-0">
            <i class="fa-solid fa-sync-alt"></i> Update
        </h5>
    </button>
</div>
                  </div>`;

    jQuery('#infoWindowBox').height(860);
    jQuery('#infoWindowBox').html(cardContent);

    populateList("list1", "#87CEFA", dayName,isFirstTime);
    setUpDragAndDropFunctionality();
}


function setUpDragAndDropFunctionality() {
    const drake = dragula([document.getElementById('list1')], { // Only allow rearranging within 'list1'
        moves: (el, container, handle) => !handle.classList.contains('btn'),
        accepts: (el, target, source, sibling) => {
            el.style.backgroundColor = target.style.backgroundColor;
            return true;
        },
    });

    drake.on('drop', function (el, target, source, sibling) {
        const parent = el.parentNode;
        const newIndex = Array.from(parent.children).indexOf(el);
        const itemText = el.textContent.trim().split(',');

        const poi = itemText[1].replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        const visitTime = itemText[2].replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        const newItem = {name: poi, time: visitTime};

        // Update mainTravelList order
        const oldIndex = mainTravelList.findIndex(item => item.name === poi && item.time === visitTime);
        mainTravelList.splice(oldIndex, 1); // Remove from old position
        mainTravelList.splice(newIndex, 0, newItem); // Insert at new position

        refreshListView();
    });
}
function refreshListView(isNewItem = false) {
    const list = document.getElementById('list1');
    list.innerHTML = ''; // Clear existing list items

    // Safely retrieve and validate `guide`
    const guide = cachedData?.guide;
    if (!Array.isArray(guide)) {
        console.error("Error: `guide` is not an array or missing in `cachedData`.");
        return;
    }

    // Find the specific day's data
    const dayData = guide.find(day => day.day === selectedDay);
    if (!dayData || !Array.isArray(dayData.POIs) || !Array.isArray(dayData.visitTime)) {
        console.error(`Error: No data found for selected day (${selectedDay}), or POIs/visitTime are not arrays.`);
        return;
    }

    // Merge POIs and visitTime for easier processing
    const mainTravelList = dayData.POIs.map((name, index) => ({
        name,
        time: dayData.visitTime[index] || "N/A",
    }));

    console.log("mainTravelList in refreshListView:", mainTravelList);

    // Iterate through the list and build the UI
    mainTravelList.forEach((item, index) => {
        const listItem = document.createElement('li');

        // Apply yellow color only to the newly added item (last item in the list)
        const backgroundColor = (isNewItem && index === mainTravelList.length - 1) ? '#FFFFE0' : '#87CEFA';

        listItem.className = 'list-group-item';
        listItem.style.cssText = `
            display: flex;
            flex-direction: column;
            background-color: ${backgroundColor};
            padding: 12px 15px;
            margin-bottom: 8px;
            border-radius: 8px;
            color: #333;
            font-size: 0.95rem;
        `;
        listItem.draggable = true;

        // First Row: Place name and time
        const textRow = document.createElement("div");
        textRow.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        textRow.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; margin-right: 10px;">${index + 1}.</span>
                <span class="place-name">${item.name}</span>
            </div>
            <div class="text-muted small" style="flex-shrink: 0;">${item.time}</div>
        `;

        // Second Row: Action buttons with alignment and left spacing
        const buttonRow = document.createElement("div");
        buttonRow.style.cssText = `
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
            gap: 10px;
            padding-left: 30px;
        `;
        buttonRow.innerHTML = `
            <button class="btn btn-danger btn-sm delete-btn" style="padding: 5px; width: 30px; height: 30px;">
                <i class="fa fa-trash" style="color: white;"></i>
            </button>
            <button class="btn" style="padding: 5px; width: 30px; height: 30px;">
                <i class="fa-solid fa-up-down-left-right"></i>
            </button>
        `;

        // Add the delete button functionality
        buttonRow.querySelector('.delete-btn').addEventListener('click', function () {
            // const itemIndex = Array.from(list.children).indexOf(listItem);
            // dayData.POIs.splice(itemIndex, 1); // Remove POI
            // dayData.visitTime.splice(itemIndex, 1); // Remove corresponding time
            // refreshListView(); // Refresh list view after deletion
        deleteFromMainTravelList(item.name);

        });

        // Append rows to list item
        listItem.appendChild(textRow);
        listItem.appendChild(buttonRow);
        list.appendChild(listItem);
    });
}



function deleteFromMainTravelList(name) {
    // Ensure cachedData is initialized
    let mainTravelList = cachedData || {};

    // Ensure `guide` exists in `cachedData`
    if (!mainTravelList.guide || !Array.isArray(mainTravelList.guide)) {
        console.error("Error: `guide` is not initialized or not an array.");
        return;
    }

    // Find the correct day's data in the `guide` array
    let dayEntry = mainTravelList.guide.find(entry => entry.day === selectedDay);

    if (!dayEntry || !Array.isArray(dayEntry.POIs)) {
        console.error(`Error: No entry found for the selected day (${selectedDay}) or POIs are not valid.`);
        return;
    }

    // Find the index of the POI to delete
    const poiIndex = dayEntry.POIs.findIndex(poi => poi === name);

    if (poiIndex === -1) {
        console.error(`Error: POI "${name}" not found in the selected day's list.`);
        return;
    }

    // Remove the POI and its corresponding visit time
    dayEntry.POIs.splice(poiIndex, 1);
    dayEntry.visitTime.splice(poiIndex, 1);

    // Update the global cachedData
    cachedData = mainTravelList;

    // Save updated data to the cookie
    saveDayToCookie(selectedDay, cachedData);

    // Refresh the list view
    refreshListView();

    // Debug logs
    console.log("Updated cachedData after deletion:", cachedData);
    console.log("Updated day entry after deletion:", dayEntry);
}





// Save a specific day's travel list to a cookie
function saveDayToCookie(date, dayList) {
    // Replace invalid characters in the date to ensure it is cookie-safe
    const safeDate = date.replace(/\//g, "-"); // Replace "/" with "-"
    const encodedDayList = encodeURIComponent(JSON.stringify(dayList));

    // Debugging output to check saved data
    console.log("Saving travel list to cookie:", safeDate, dayList);

    document.cookie = `${safeDate}=${encodedDayList}; path=/;`;
}

// Retrieve a specific day's travel list from the cookie
function getDayFromCookie(date) {
    // Replace invalid characters in the date to match the saved format
    const safeDate = date.replace(/\//g, "-");
    const cookieValue = document.cookie
        .split("; ")
        .find(row => row.startsWith(`${safeDate}=`))
        ?.split("=")[1];

    const parsedData = cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : null;

    // Debugging output to verify loaded data
    console.log("Loaded travel list from cookie for date:", safeDate, parsedData);

    return parsedData;
}

// Retrieve all saved days' travel lists from cookies
function getAllDaysFromCookies() {
    const cookies = document.cookie.split("; ");
    const allDaysData = {};

    cookies.forEach(cookie => {
        const [key, value] = cookie.split("=");
        try {
            const decodedKey = decodeURIComponent(key);
            const decodedValue = JSON.parse(decodeURIComponent(value));

            // Add only keys that look like dates (e.g., "16-11-2024")
            if (/^\d{2}-\d{2}-\d{4}$/.test(decodedKey)) {
                allDaysData[decodedKey] = decodedValue;
            }
        } catch (error) {
            console.warn(`Skipping invalid cookie: ${key}`, error);
        }
    });

    // Debugging output to verify all loaded data
    console.log("Loaded all days' travel lists from cookies:", allDaysData);

    return allDaysData;
}

// Send feedback route to the backend
function sendFeedbackRoute() {
    // Retrieve all saved routes for all days from cookies

    if (Object.keys(cachedData).length === 0) {
        console.error("No saved routes found in cookies.");

        return;
    }

    // Debug print the routes data before sending to verify its format
    console.log("Sending all routes for feedback:", cachedData);


    fetch("/feedback/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
           },
        body: JSON.stringify(cachedData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Feedback response:", data);
        alert("Feedback received! Reward calculated: " + data.total_reward);
    })
    .catch(error => {
        console.error("Error sending feedback:", error);
    });

}

