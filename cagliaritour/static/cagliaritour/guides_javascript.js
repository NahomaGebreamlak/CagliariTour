// Thi javascript file hold functions for showing guide tours on map


function getRandomColor() {
    // Generate a random hexadecimal color code
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function generateDayButtons(numDays) {
    const daysContainer = document.getElementById('daysContainer');

    // Clear existing content
    daysContainer.innerHTML = '';
    numDays = calculateDateDifference();
    // Create day buttons
    for (let i = 1; i <= numDays; i++) {
        const dayButton = document.createElement('button');
        const dayName = `Day ${i}`;
        const today = new Date();
        today.setDate(today.getDate() + i - 1); // Adjust the date based on the loop index

        const options = {day: '2-digit', month: '2-digit', year: 'numeric'};
        const formattedDate = today.toLocaleDateString('en-GB', options);
        const DayNameWithDate = `${dayName} - ${formattedDate}`;
        dayButton.innerText = `Day ${i}`;
        dayButton.className = 'dayButton';
        daysContainer.appendChild(dayButton);

        // Add click event listener to each button
        dayButton.addEventListener('click', function () {
            // Remove 'clicked' class from all buttons
            const allButtons = document.querySelectorAll('.dayButton');
            allButtons.forEach(button => button.classList.remove('clicked'));

            // Add 'clicked' class to the clicked button
            dayButton.classList.add('clicked');
            showRouteSelectionList(DayNameWithDate, formattedDate);
        });
    }
    // Calculate the total width of buttons
    const totalWidth = Array.from(daysContainer.children).reduce((acc, button) => {
        return acc + button.offsetWidth + parseInt(window.getComputedStyle(button).marginRight, 10);
    }, 0);

    // Set the width of the container
    daysContainer.style.width = `${totalWidth + 50}px`;
    // to hide the form
    showForm(false);
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
                        start: currentPoi + " , Cagliari",
                        end: nextPoi + " , Cagliari",
                        color: randomColor
                    });

                    console.log(i + " Start: " + currentPoi + ", end: " + nextPoi + "\n");
                }

            }
        } else {
            console.log(`No data found for the selected day: ${selectedDay}`);
        }

        // Draw routes on the map
        drawRoutesOnMap(routesData);
        console.log('Length of the list add ' + listdata.length);
        listdata.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.style.backgroundColor = bgcolor; // Set random background color
            listItem.draggable = true;
            listItem.classList.add('list-group-item');
            listItem.innerHTML = `
        <span>${item.number}</span>
        <span>${item.name}</span>
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
    <h6>  ${dayName} </h6>
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
    // Set up drag-and-drop using dragula
    const drake = dragula([document.getElementById('list1'), document.getElementById('list2'), document.getElementById('list3')], {
        moves: (el, container, handle) => !handle.classList.contains('btn'), // exclude the button from dragging
        accepts: (el, target, source, sibling) => {
            // Set the drag color to the target list's background color
            el.style.backgroundColor = target.style.backgroundColor;
            return true;
        },
    });

    // Reset the background color when the drag ends
    drake.on('dragend', (el, source) => {
        el.style.backgroundColor = '';
    });
}


function calculateDateDifference() {
    // Get the selected departure date from the input
    const departureDateInput = document.getElementById('id_departure_date');
    const departureDateValue = departureDateInput.value;

    // Convert the selected date string to a Date object
    const departureDate = new Date(departureDateValue);

    // Get the current date
    const currentDate = new Date();

    // Calculate the difference in days
    const differenceInDays = Math.floor((departureDate - currentDate) / (1000 * 60 * 60 * 24));

    // return result

    return differenceInDays;
}