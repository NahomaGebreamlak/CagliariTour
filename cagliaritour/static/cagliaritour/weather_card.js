// this function is used to load the weather card displayed on the map overlay screen
function loadWeatherCard() {

  const json_weather = JSON.parse(document.getElementById('weatherCard').textContent);
// console.log(json_weather);
            var cardContent = `            <!-- Weather information  -->

     <p onclick="infoCloser()"  id="hideBoxButton" class="text-center font-weight-bold" style="font-size: 20px;">
         ${json_weather.city}  <i class="fas fa-angle-up"></i></p>

                        <div class="col m-0 p-0">
                            <span class="text-start font-weight-normal" style="font-size: 18px;" id="time"> </span>
                            <br />
                            <span class="text-start font-weight-normal" style="font-size: 18px;" id="date"></span>
                        </div>


                        <div class="row align-content-start ">
                            <div class="col col-6">
                                <div class="table-borderless">
                                    <table>
                                        <tr>
                                            <td>
                                                <span class="font-weight-bold" style="font-size: 25px;">
                                                   ${json_weather.temperature }&deg;C </span>
                                            </td>
                                            <td>
                                                <img src="http://openweathermap.org/img/w/${json_weather.icon }.png"
                                                    alt="weather icon" height="80px" width="80px" />

                                            </td>
                                        </tr>

                                    </table>

                                </div>
                            </div>

                            <div class="col col-6 text-center align-items-center d-flex">
                                <div class="flex-grow-1" style="font-size: 15px;">
                                    <div><i class="fas fa-wind fa-fw" style="color: blue;"></i> <span class="ms-1">
                                        ${json_weather.wind_speed} m/s </span></div>
                                    <div><i class="fas fa-tint fa-fw" style="color:blue;"></i> <span class="ms-1"> ${json_weather.wind_direction}&deg;</span></div>
                                </div>
                            </div>
                            <span style="font-size: 20px;">${json_weather.description }</span> <br /><br />


                            <div class="row align-content-start">
                                <div class="col col-6 text-center align-items-center d-flex">
                                    <div class="flex-grow-1" style="font-size: 15px;">
                                        <div><i class="fas fa-tint" style="color: blue;"></i> Humidity <span
                                                class="ms-1"> </span> <br /> ${json_weather.humidity }%
                                        </div>
                                        <div><i class="fas fa-sun" style="color: blue;"></i> Sunrise <span class="ms-1">
                                            </span> <br /> ${json_weather.sunrise }</div>
                                    </div>
                                </div>
                                <div class="col col-6 text-center align-items-center d-flex">
                                    <div class="flex-grow-1" style="font-size: 15px;">
                                        <div><i class="fas fa-thermometer-half" style="color: blue;"></i> Uv index
                                            <span class="ms-1"> </span> <br /> 5 of 11
                                        </div>
                                        <div><i class="fas fa-cloud-sun" style="color: blue;"></i> Sunset <span
                                                class="ms-1"> </span> <br /> ${json_weather.sunset } </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    `;

            jQuery('#infoWindowBox').html(cardContent);
        }

function showWeatherCard() {
    jQuery('#collapseButtonInfo').hide();
    jQuery('#infoWindowBox').show();
}