// A function to be called when the marker is pressed
// To show some information about the marked place on the right side info window
// function setContentForDiv(placeInfo) {
//
// // Function to hide and display the weather card
//     showWeatherCard();
//
//      // Content of the div
//     var cardContent = `<div class="card-body">
//                     <div class="card-title" onclick="infoCloser()">${placeInfo.name}<i class="fas fa-times cancel-button" ></i></div>
//                      <img src="http://127.0.0.1:8000/${placeInfo.image}" class="card-img-top" alt="Image of ${placeInfo.name}">
//                     <p class="card-text" style="font-size: 14px">${placeInfo.description}</p>
//                   </div>`;
//     jQuery('#infoWindowBox').height(760);
//     jQuery('#infoWindowBox').html(cardContent);
//     draw_popular_time_chart( `${placeInfo.placeId}`);
//
//
// }

function setContentForDiv(placeInfo) {
    // Function to hide and display the weather card
    showWeatherCard();

    // Extract filename from the path
    var filename = placeInfo.image.substring(placeInfo.image.lastIndexOf('/') + 1);

    // Encode the filename
    var encodedFilename = encodeURIComponent(filename);

    // Truncate description if it exceeds 300 characters
    var truncatedDescription = placeInfo.description.length > 300 ? placeInfo.description.substring(0, 300) + "..." : placeInfo.description;

    // Content of the div
    var cardContent = `<div class="card-body">
                        <div class="card-title" onclick="infoCloser()">${placeInfo.name}<i class="fas fa-times cancel-button" ></i></div>
                        <img src="${placeInfo.image.substring(0, placeInfo.image.lastIndexOf('/') + 1)}${encodedFilename}" class="card-img-top" alt="Image of ${placeInfo.name}">
                        <p class="card-text" style="font-size: 14px">${truncatedDescription}</p>
                    </div>`;
    jQuery('#infoWindowBox').height(760);
    jQuery('#infoWindowBox').html(cardContent);
    draw_popular_time_chart(`${placeInfo.placeId}`);
}




// A function to show collapse the info button
// and display the info window
function showWeatherCard() {
    jQuery('#collapseButtonInfo').hide();
    jQuery('#infoWindowBox').show();
}

// A function to draw the popular time graph
 async function draw_popular_time_chart(placeId) {
    console.log("this function get called.....");
    var cardcontent =
        ` <div class="card-body">   <label htmlFor="daySelector">Select a day:</label>
    <select id="daySelector" className="form-control form-control-sm">
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
    </select>
    <a href="https://www.google.com/">
        <img src="http://127.0.0.1:8000/static/images/google_on_white_hdpi.png"  height="20px" alt="Powered by Google">
    </a>
    <canvas id="popularTimesChart"></canvas> </div>`;


    try {
        // A request send to get Live popular data from the server
        const response = await fetch(`/popular_times/${placeId}`);
        const responseData = await response.json();
      var  popularTimesData = JSON.parse(responseData["data"]);

  // Since there are some places which doesn't have popular times graph check if there is data
        if (!popularTimesData || popularTimesData.length === 0) {
            // Handle case where there is no data

            console.log('No data available.');

            return;
        }
        else {
            // Append the card content only if there is data
    jQuery('#infoWindowBox').append(cardcontent);
        const daySelector = document.getElementById('daySelector');
        const chartData = popularTimesData.find(day => day.name === daySelector.value);

        // remove 0 from the data
        const modifiedData = chartData.data.slice(8, 22);

        const chart = new Chart(document.getElementById('popularTimesChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: Array.from({length: modifiedData.length}, (_, i) => i + 8), // Labels from 8 to 21
                datasets: [{
                    label: chartData.name,
                    data: modifiedData,
                    backgroundColor: chartData.data.map(value => getBarColor(value)),
                    borderRadius: 2,
                }],
            },
            options: {
                plugins: {
                    legend: {
                        display: false,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Popular Times'
                    }
                },
            }
        });
// Selectes a day and shows that selected day popular times graph
        daySelector.addEventListener('change', () => {
            const selectedDay = daySelector.value;
            const selectedChartData = popularTimesData.find(day => day.name === selectedDay);

            // Extract the data from index 8 to index 21 (excluding the last 2 numbers)
            const modifiedData = selectedChartData.data.slice(8, 22);

            chart.data.labels = Array.from({length: modifiedData.length}, (_, i) => i + 8);
            chart.data.datasets[0].label = selectedChartData.name;
            chart.data.datasets[0].data = modifiedData;
            chart.data.datasets[0].backgroundColor = modifiedData.map(value => getBarColor(value));
            chart.update();
        });
        }


    } catch (e) {
        // Handle errors if necessary
         // Change height of the info box
               jQuery('#infoWindowBox').height(550);
        //console.error('Error fetching or parsing data:', e);
        return;
    }


}
// A function to close the info window and show weather card
function infoCloser() {

    jQuery('#collapseButtonInfo').show();
    jQuery('#infoWindowBox').hide();
    jQuery('#infoWindowBox').height(350);
    loadWeatherCard();
}





// A function to return colors for popular time bar chart based on numbers
function getBarColor(value) {
    if (value > 75) {
        return '#FF0000';
    } else if (value > 50) {
        return '#0b0b93';
    } else {
        return '#2f6dce';
    }
}