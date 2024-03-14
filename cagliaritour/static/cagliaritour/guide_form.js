// A file more related to collapsing and showing the form and side panels



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





// Function to show and hide the form
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
// A function to show the weather card automatically
    loadWeatherCard();
    // Select the collapse element by its ID
    var collapseElement = jQuery('#infoWindowBox');
    jQuery('#collapseButtonInfo').hide();
    //Hide route div
   jQuery('#routeInfoContainer').hide();

   // hide clear button
    jQuery('#clear_button_Div').hide();


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
// A fuction to calculate date difference to display number of Day buttons
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

    return differenceInDays;
}
function generateDayButtons() {
    jQuery('#infoWindowBox').hide();

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
            jQuery('#infoWindowBox').show();

            // Remove 'clicked' class from all buttons
            const allButtons = document.querySelectorAll('.dayButton');
            allButtons.forEach(button => button.classList.remove('clicked'));

            // Add 'clicked' class to the clicked button
            dayButton.classList.add('clicked');

            showRouteSelectionList(DayNameWithDate, formattedDate);
            showRouteInfoDiv();
            // show home button
         jQuery('#collapseButton').hide();
    jQuery('#clear_button_Div').show();

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

      // jQuery('#infoWindowBox').hide();
}

// A function to hide route info route
function showRouteInfoDiv(){
    jQuery('#routeInfoContainer').show();
}

// Function to reset the map
function clearMap() {
   jQuery('#collapseButton').show();
// clear container
jQuery('#routeInfoContainer').hide();
 const daysContainer = document.getElementById('daysContainer');

    // Clear existing content
    daysContainer.innerHTML = '';
// hide guide form
showForm(false);
// clear infobox
infoCloser();
//clear routes
clearRoutes();
showWeatherCard();
// hide the clear button
 jQuery('#clear_button_Div').hide();

    }
