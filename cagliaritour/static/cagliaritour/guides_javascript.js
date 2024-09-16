var mainTravelList = [];

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

async function populateList(targetListId, bgcolor, date) {
    const list = document.getElementById(targetListId);
    var listdata = [];

    try {
        const response = await fetch('/getroute/5/');
        const data = await response.json();

        const guide = data.guide;
        const OptionalList = data.optional_guide;
        const selectedDay = date.split(' - ')[1];;
        const selectedGuide = guide.find((day) => day.day == selectedDay);
        var routesData = [];
        if (selectedGuide) {
            for (let i = 0; i < selectedGuide.POIs.length; i++) {
                const poi = selectedGuide.POIs[i];
                const visitTime = selectedGuide.visitTime[i];
                listdata.push({number: i + 1, name: poi, time: visitTime});
                if (i + 1 < selectedGuide.POIs.length && targetListId == "list1") {
                    const currentPoi = selectedGuide.POIs[i];
                    const nextPoi = selectedGuide.POIs[i + 1];
                    var randomColor = getRandomColor();
                    routesData.push({
                        poinumber: i + 1,
                        start: currentPoi + " , Cagliari",
                        end: nextPoi + " , Cagliari",
                        color: randomColor
                    });
                }
            }
        } else {
            console.log(`No data found for the selected day: ${selectedDay}`);
        }

        drawRoutesOnMap(routesData);

        if (targetListId == "list1") {
            mainTravelList = [...listdata];
        }

        listdata.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.style.backgroundColor = bgcolor;
            listItem.draggable = true;
            listItem.classList.add('list-group-item');
            listItem.innerHTML = `
                <span id="itemNumber">${item.number},</span>
                <span>${item.name},</span>
                <span>${item.time}</span>
                <button class="btn btn-danger delete-btn">Delete</button>
                <button class="btn"><i class="fa-solid fa-up-down-left-right"></i></button>
            `;
            list.appendChild(listItem);
        });

        // Add delete button functionality
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const listItem = this.parentElement;
                const itemIndex = Array.from(list.children).indexOf(listItem);
                mainTravelList.splice(itemIndex, 1); // Remove from mainTravelList
                refreshListView(); // Refresh the list view
            });
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

function showRouteSelectionList(dayName, date) {
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
    <button type="button" class="btn btn-success btn-lg mr-2">
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

    populateList("list1", "#87CEFA", dayName);
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

    drake.on('drop', function(el, target, source, sibling) {
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

function refreshListView() {
    const list = document.getElementById('list1');
    list.innerHTML = '';

    mainTravelList.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.style.backgroundColor = "#87CEFA";
        listItem.draggable = true;
        listItem.classList.add('list-group-item');
        listItem.innerHTML = `
            <span id="itemNumber">${index + 1},</span>
            <span>${item.name},</span>
            <span>${item.time}</span>
            <button class="btn btn-danger delete-btn">Delete</button>
            <button class="btn"><i class="fa-solid fa-up-down-left-right"></i></button>
        `;
        list.appendChild(listItem);
    });

    // Reattach delete button event listeners
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const listItem = this.parentElement;
            const itemIndex = Array.from(list.children).indexOf(listItem);
            mainTravelList.splice(itemIndex, 1);
            refreshListView();
        });
    });
}
