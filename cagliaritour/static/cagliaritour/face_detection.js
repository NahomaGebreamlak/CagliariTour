     // Define the width and height globally for reusability
        const VIDEO_WIDTH = 250;
        const VIDEO_HEIGHT = 300;

        jQuery.noConflict();

        function startVideoOnCall() {
// Get the checkbox element
let facialAnalysisCheckbox = document.getElementById('facialAnalysis');

// Check if it is checked
if (facialAnalysisCheckbox.checked) {
    console.log('The checkbox is checked.');
      setCookie("requestSent", "false", 1); // Set the cookie to prevent further requests

            loadModelsAndStartVideo().then(() => {
                // Models and video loaded, now start face detection
            }).catch(error => {
                console.error("Error starting video:", error);
            });
} else {
    console.log('The checkbox is not checked.');
    generateDayButtons();
}


        }

        function loadModelsAndStartVideo() {
            return new Promise((resolve, reject) => {
                showDialog();

                const models = [
                    faceapi.nets.tinyFaceDetector.loadFromUri("/static/models"),
                    faceapi.nets.faceLandmark68Net.loadFromUri("/static/models"),
                    faceapi.nets.faceRecognitionNet.loadFromUri("/static/models"),
                    faceapi.nets.faceExpressionNet.loadFromUri("/static/models"),
                    faceapi.nets.ageGenderNet.loadFromUri("/static/models")
                ];

                let loadedModels = 0;
                models.forEach((model) => {
                    model.then(() => {
                        loadedModels++;
                        updateLoadingBar(Math.floor((loadedModels / models.length) * 100));

                        if (loadedModels === models.length) {
                            startVideo().then(() => resolve()).catch(reject); // Resolve once video starts
                        }
                    }).catch(reject); // Handle any loading errors
                });
            });
        }

        function startVideo() {
            return new Promise((resolve, reject) => {
                const video = document.getElementById("video");
                if (!video) {
                    reject(new Error("Video element not found"));
                    return;
                }

                navigator.mediaDevices.getUserMedia({video: {}})
                    .then(stream => {
                        video.srcObject = stream;
                        video.onloadedmetadata = () => {
                            video.play();

                            // Ensure video has valid dimensions
                            video.onplaying = () => {
                                // Set video dimensions in JavaScript as well
                                video.width = VIDEO_WIDTH;
                                video.height = VIDEO_HEIGHT;

                                performFaceDetection(video, stream); // Start face detection once video is ready

                                // Start a 10-second timer to update loading bar again
                                let startTime = Date.now();
                                let loadingInterval = setInterval(() => {
                                    let elapsedTime = Date.now() - startTime;
                                    let percentage = Math.round((elapsedTime / 10000) * 100);

                                    if (percentage >= 100) {
                                        clearInterval(loadingInterval); // Stop interval after 10 seconds
                                        hideDialog(); // Hide the dialog after 10 seconds
                                        stopVideoStream(stream); // Stop video stream after detection is done
                                        generateDayButtons();
                                    } else {
                                        updateLoadingBar(percentage);
                                    }
                                }, 100);

                                resolve();  // Resolve the promise when video starts
                            };
                        };
                    })
                    .catch(err => reject(err));  // Reject in case of errors
            });
        }

        function stopVideoStream(stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop all tracks to stop the camera
        }


        function performFaceDetection(video, stream) {
    const canvas = faceapi.createCanvasFromMedia(video);
    let container = document.querySelector(".canvaContainer");
    container.append(canvas);

    // Set canvas dimensions to match video
    canvas.width = 250;
    canvas.height = 300;

    const displaySize = { width: 250, height: 300 };
    faceapi.matchDimensions(canvas, displaySize);

    // Custom draw options (to change the color)
    const drawOptions = {
        lineWidth: 3,
        drawLines: true,
        color: '#000000', // Change to your desired color
    };

    // Perform face detection every 100ms
    setInterval(async () => {
        try {
            const detections = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions()
                .withAgeAndGender();

            // If no detections found, skip the rest of the process
            if (!detections) return;

            // Resize detections and clear previous drawings
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

            // Draw face landmarks if detections are found
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections, drawOptions);

            // Check cookie instead of a global variable
            const requestSentCookie = getCookie("requestSent");

            // Treat cookie being null as false
            const requestSent = requestSentCookie === "true" ? true : false;

            // Print the interpreted value of requestSent to the console
            console.log("Request sent value:", requestSent);

            // Only send a request if detections are available and the cookie is not set
            if (detections && !requestSent) {
                const fullFrame = getFullFrame(video);

                // Send the entire frame to Flask for further analysis
                if (fullFrame) {
                    setCookie("requestSent", "true", 1); // Set the cookie to prevent further requests

                    try {
                        const base64Image = convertCanvasToBase64(fullFrame);
                        const response = await sendImageToFlask(base64Image);
                        console.log('Age:', response.age);
                        console.log('Race:', response.race);
                        displayResults(response.age, response.race);
                    } catch (err) {
                        console.error('Error sending image to Flask:', err);
                    }
                }
            }
        } catch (err) {
            console.error('Error during face detection:', err);
        }
    }, 100); // Adjust the interval as necessary
}




        // Capture the full video frame from the video stream
        function getFullFrame(video) {
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = video.videoWidth;  // Full width of the video frame
            frameCanvas.height = video.videoHeight;  // Full height of the video frame

            const ctx = frameCanvas.getContext('2d');
            ctx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);  // Draw entire frame

            return frameCanvas;
        }

        // Convert the full frame canvas to base64
        function convertCanvasToBase64(canvas) {
            return canvas.toDataURL('image/jpeg', 0.8);  // Adjust quality if needed
        }

        // Send the full frame base64 image to Flask
        async function sendImageToFlask(base64Image) {
            const response = await fetch('http://127.0.0.1:8000/analyze_image/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image.split(',')[1]  // Remove the data:image/jpeg;base64, part
                })
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to send image to Flask');
            }

            const jsonResponse = await response.json();  // Expect a JSON response with age and race
            console.log('Flask Response:', jsonResponse);
            return jsonResponse;
        }

        // Function to set a cookie
        function setCookieRace(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "expires=" + date.toUTCString();
            document.cookie = name + "=" + value + ";" + expires + ";path=/";
        }

        // Function to get a cookie by name
        function getCookieRace(name) {
            const nameEQ = name + "=";
            const cookiesArray = document.cookie.split(';');
            for (let i = 0; i < cookiesArray.length; i++) {
                let cookie = cookiesArray[i].trim();
                if (cookie.indexOf(nameEQ) === 0) {
                    return cookie.substring(nameEQ.length);
                }
            }
            return null; // Return null if the cookie is not found
        }


        // Display results on the page
        function displayResults(age, race) {
            // const resultContainer = document.getElementById('results');
            // resultContainer.innerHTML = `Age: ${age}, Race: ${race}`;
            // Save age and race to cookies
            setCookieRace('age', age, 7); // Cookie will expire in 7 days
            setCookieRace('race', race, 7);
        }


        function interpolateAgePredictions(age) {
            // Your interpolation logic here
        }

        function showDialog() {
            document.getElementById("facialAnalysisDialog").style.display = "block";
        }

        function hideDialog() {
            document.getElementById("facialAnalysisDialog").style.display = "none";
        }

        function updateLoadingBar(percentage) {
            const loadingText = document.getElementById("loadingText");
            const loadingBar = document.getElementById("loadingBar");

            loadingText.innerText = `LOADING... ${percentage.toFixed(2)}%`;
            loadingBar.style.width = `${percentage}%`;
        }

        document.addEventListener("DOMContentLoaded", () => {
            // Add event listeners or other setup tasks here
        });