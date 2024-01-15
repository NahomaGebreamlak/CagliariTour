// Thi javascript file hold functions for showing guide tours on map
var mainTravelList = [];

function getRandomColor() {
    // Generate a random hexadecimal color code
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function refreshMap() {
    var routesData = [];
    for (let i = 0; i < mainTravelList.length; i++) {
        if (i + 1 < mainTravelList.length) {
            const currentPoi = mainTravelList[i]["name"];
            const nextPoi = mainTravelList[i + 1]["name"];
            var randomColor = getRandomColor();

            // Call drawRoute function with current POI as start and next POI as destination
            routesData.push({
                poinumber: i + 1,
                start: currentPoi + " , Cagliari",
                end: nextPoi + " , Cagliari",
                color: randomColor
            });

            //     console.log(i + " Start: " + currentPoi + ", end: " + nextPoi + "\n");
        }
    }
    // Draw routes on the map
    drawRoutesOnMap(routesData);

}


// Function to populate the list
async function populateList(targetListId, bgcolor, date) {
    const list = document.getElementById(targetListId);
    var listdata = [];

    try {
        // An Ajax Function to get route Data From Django Server
        const response = await fetch('/getroute/');
        const data = await response.json();

        const guide = data.guide;

        // Select a specific day
        const selectedDay = '15/08/2023';
        const selectedGuide = guide.find((day) => day.day === selectedDay);
        var routesData = [];
        // Check if the day was found
        if (selectedGuide) {
            // Loop through each Point of Interest (POI) and visit time for the selected day
            for (let i = 0; i < selectedGuide.POIs.length; i++) {
                const poi = selectedGuide.POIs[i];
                const visitTime = selectedGuide.visitTime[i];
                const poiText = `  POI: ${poi}, Visit Time: ${visitTime}`;
                listdata.push({number: i + 1, name: poi, time: visitTime});
                // Check if there is another POI available in the next iteration
                if (i + 1 < selectedGuide.POIs.length && targetListId == "list1") {
                    const currentPoi = selectedGuide.POIs[i];
                    const nextPoi = selectedGuide.POIs[i + 1];
                    var randomColor = getRandomColor();

                    // Call drawRoute function with current POI as start and next POI as destination
                    routesData.push({
                        poinumber: i + 1,
                        start: currentPoi + " , Cagliari",
                        end: nextPoi + " , Cagliari",
                        color: randomColor
                    });

                    // console.log(i + " Start: " + currentPoi + ", end: " + nextPoi + "\n");
                }

            }
        } else {
            console.log(`No data found for the selected day: ${selectedDay}`);
        }

        // Draw routes on the map
        drawRoutesOnMap(routesData);


        if (targetListId == "list1") {
            mainTravelList = [...listdata];
        }

        listdata.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.style.backgroundColor = bgcolor; // Set random background color
            listItem.draggable = true;
            listItem.classList.add('list-group-item');
            listItem.innerHTML = `
        <span id="itemNumber">${item.number},</span>
        <span>${item.name},</span>
        <span>${item.time}</span>
        <button class="btn"><i class="fa-solid fa-up-down-left-right"></i></button>`;
            list.appendChild(listItem);
        });


    } catch (error) {
        console.error('Error:', error);
    }
}


// Function to show List of days form
function showRouteSelectionList(dayName, date) {

    var cardContent = `<div class="card-body p-0 m-0">
                    <div class="card-title text-center" onclick="infoCloser()"> <h3>Your Guide  <i class="fas fa-angle-up"></i> </h3></div>
                     <div style="width: 280px; margin-top: 20px; overflow-y: auto; max-height: 200px;" style="margin: 0px; padding: 0px;background-color: lightskyblue">
  <div class="card p-0 m-0" style="background-color: lightskyblue">
    <div class="card-header text-center font-weight-bold">
    <h6>  ${dayName} <button class="btn btn-primary rounded circle" onclick="refreshMap()"><i class="fas fa-sync"></i></button></h6>
    </div>
    <div class="card-body p-0" style="background-color: deepskyblue">
      <ul class="list-group list-group-flush card" id="list1" style="background-color: lightskyblue;">
        
        
      </ul>
    </div>
  </div>
</div>


           <div style="width: 280px; margin-top: 20px; overflow-y: auto; max-height: 200px;" style="margin: 0px; padding: 0px; background-color: lightcoral">
  <div class="card p-0 m-0" style="background-color: lightcoral">
    <div class="card-header text-center font-weight-bold">
     <h6> Remove </h6> 
    </div>
    <div class="card-body p-0 m-0" style="background-color: lightcoral">
      <ul class="list-group list-group-flush card" id="list2" style="background-color: lightcoral;">
      </ul>
    </div>
  </div>
</div>



<div style="width: 280px; margin-top: 20px; overflow-y: auto; max-height: 200px;" style="margin: 0px; padding: 0px; background-color: lightyellow">
  <div class="card p-0 m-0" style="background-color: lightyellow">
    <div class="card-header text-center font-weight-bold">
      <h6>Add</h6>
    </div>
    <div class="card-body p-0 m-0" style="background-color: lightyellow">
      <ul class="list-group list-group-flush card" id="list3" style="background-color: lightyellow;">  
        
      </ul>
    </div>
  </div>
</div>




<div class="text-center" style="padding-top: 20px">
<button type="button" class="btn-success"> <h5> <i class="fa-regular fa-envelope"></i> Send </h5></button>
</div>

                  </div>`;

    jQuery('#infoWindowBox').height(760);
    jQuery('#infoWindowBox').html(cardContent);

    populateList("list1", "#87CEFA", date);
    populateList("list2", "#F08080", date);
    populateList("list3", "#FFFFE0", date);

    setUpDragAndDropFunctionality();

}

// A function to set Up Drag and Drop functionality using Dragula
function setUpDragAndDropFunctionality() {
// Set up drag-and-drop using dragula
    const drake = dragula([document.getElementById('list1'), document.getElementById('list2'), document.getElementById('list3')], {
        moves: (el, container, handle) => !handle.classList.contains('btn'), // exclude the button from dragging
        accepts: (el, target, source, sibling) => {
            // Set the drag color to the target list's background color
            el.style.backgroundColor = target.style.backgroundColor;
            return true;
        },
    });

    drake.on('drop', function (el, target, source, sibling) {
        const parent = el.parentNode;
        const childNodes = parent.childNodes;

        let index = 0;
        for (const child of childNodes) {
            if (child === el) {
                break;
            }
            index++;
        }


        const draggedItemText = el.textContent.trim();
        const splitText = draggedItemText.split(',');


        if (target.id === 'list1' && source.id === 'list1') {
            const poi = splitText[1].replace(/\n/g, '').replace(/\s+/g, ' ').trim();
            const visitTime = splitText[2].replace(/\n/g, '').replace(/\s+/g, ' ').trim();
            const newItem = {name: poi, time: visitTime};

            // Remove the item from its current position
            mainTravelList.splice(index, 1);

            // Insert the item at the specified position
            mainTravelList.splice(sibling ? indexBefore(sibling) : mainTravelList.length, 0, newItem);

            refreshListView();
            console.log("Item moved and sorted.........");
        } else if (target.id === 'list1') {
            const poi = splitText[1].replace(/\n/g, '').replace(/\s+/g, ' ').trim();
            const visitTime = splitText[2].replace(/\n/g, '').replace(/\s+/g, ' ').trim();
            newItem = {number: index, name: poi, time: visitTime}
            // Insert the new item at the specified position

            mainTravelList.splice(index - 1, 0, newItem);
            for (let i = index; i < mainTravelList.length; i++) {
                mainTravelList[i].number += 1;
            }
            refreshListView();
            console.log("Item add.........");
        }


        // Item removed from list
        if (source.id === 'list1') {
            const poi = splitText[1].replace(/\n/g, '').replace(/\s+/g, ' ').trim();

            // Find the index of the item to be removed
            const indexOfRemovedItem = mainTravelList.findIndex(item => item.name === poi);

            if (indexOfRemovedItem !== -1) {
                // Remove the item
                mainTravelList.splice(indexOfRemovedItem, 1);

                // Update the numbers after the removed item
                for (let i = indexOfRemovedItem; i < mainTravelList.length; i++) {
                    mainTravelList[i].number = i + 1;
                }

                refreshListView();
                console.log("Item removed from List one .........");
            }
        }
        console.log('Updated MainTravelList:', mainTravelList);

    });
}


// Function to refresh the list view based on mainTravelList
function refreshListView() {
    // Clear the existing list
    const list = document.getElementById('list1'); // Replace 'yourListId' with the actual ID of your list

    list.innerHTML = '';

    // Recreate the list based on mainTravelList
    mainTravelList.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.style.backgroundColor = "#87CEFA"; // Set random background color
        listItem.draggable = true;
        listItem.classList.add('list-group-item');
        listItem.innerHTML = `
        <span id="itemNumber">${item.number},</span>
        <span>${item.name},</span>
        <span>${item.time}</span>
        <button class="btn"><i class="fa-solid fa-up-down-left-right"></i></button>`;
        list.appendChild(listItem);
    });
}