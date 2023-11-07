  // Function to update the displayed time
        function updateDateTime() {

            // Get the current date and time
            const currentDateTime = new Date();

// Format the date in the format "MM/DD/YYYY"
            const formattedDate = `${currentDateTime.getMonth() + 1}/${currentDateTime.getDate()}/${currentDateTime.getFullYear()}`;

// Format the time in 12-hour format with AM/PM
            const hours = currentDateTime.getHours() % 12 || 12;
            const minutes = currentDateTime.getMinutes();
            const amPm = currentDateTime.getHours() >= 12 ? 'PM' : 'AM';
            const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${amPm}`;

// Display the formatted date and time in the respective elements
            // Check if the element with ID 'date' exists
            var dateElement = document.getElementById('date');
            if (dateElement) {
                dateElement.textContent = formattedDate;
            }

// Check if the element with ID 'time' exists before setting its
            var timeElement = document.getElementById('time');
            if (timeElement) {
                timeElement.textContent = formattedTime;
            }


        }

        // Update the time immediately when the page loads
        updateDateTime();

        // Update the time every second (1000 milliseconds)
        setInterval(updateDateTime, 1000);
