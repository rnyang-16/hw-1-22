var APIKey = "8abbafa9c94bf05eadba7309fe3791f9";
var city = "Bellevue";
var cur_coord = null;
var num_forecast_days = 5;

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function convert_unix_stamp_to_date(stamp) {
    var date = new Date(stamp * 1000);
    return (date.getMonth() + 1).toString() + '/' 
        + date.getDate().toString() + '/'
        + date.getFullYear().toString();
}

function show_forecast_weather(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q="
        + city + "&units=metric&appid=" + APIKey;

    $.ajax({
    url: queryURL,
    method: "GET",
    })
    // We store all of the retrieved data inside of an object called "response"
    .then(function(response) {
        $("#forecast_weather").empty()

        for (i = 0; i < num_forecast_days; i++) {
            var display_div = $("<div>");
            display_div.attr("class", "col m-3 p-3 rounded");
            display_div.attr("style", "background-color:#007bff");

            var data = response.list[i*8+7];
            
            // date
            var date_str = convert_unix_stamp_to_date(data.dt);
            var date_el = $("<h2>");
            date_el.text(date_str);
            date_el.attr("class", "text-white");
            display_div.append(date_el);

            // icon
            var iconcode = data.weather[0].icon;
            var temp_icon = $("<img>");
            temp_icon.attr("src", "https://openweathermap.org/img/wn/" + iconcode + ".png");
            temp_icon.attr("class", "img-fluid");
            display_div.append(temp_icon);

            // temp
            var temp_str = data.main.temp;
            var temp_el = $("<p>");
            temp_el.text("Temp: " + temp_str + "°C");
            temp_el.attr("class", "text-white");
            display_div.append(temp_el);

            // humidity
            var hmd_str = data.main.humidity;
            var hum_el = $("<p>");
            hum_el.text("Humidity: " + hmd_str);
            hum_el.attr("class", "text-white");
            display_div.append(hum_el);

            $("#forecast_weather").append(display_div);
        }
    });
}

function show_current_UV(coord) {
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + coord.lat + "&lon=" + coord.lon
        + "&appid=" + APIKey;

    $.ajax({
    url: queryURL,
    method: "GET"
    })
    // We store all of the retrieved data inside of an object called "response"
    .then(function(response) {

        var cur_uv_index_str = $("<p>");
        cur_uv_index_str.text("UV Index: ");
        cur_uv_index_font = $("<font>");
        if (response.value<=2.4) {
            cur_uv_index_font.attr("style", "background-color:green");
            cur_uv_index_font.attr("color", "white");
        } else if (response.value>2.4 && response.value<=5.4 ) {
            cur_uv_index_font.attr("style", "background-color:yellow");
            cur_uv_index_font.attr("color", "black");
        } else if (response.value>5.4 && response.value<=7.4 ) {
            cur_uv_index_font.attr("style", "background-color:orange");
            cur_uv_index_font.attr("color", "white");
        } else if (response.value>7.4 && response.value<=10.4 ) {
            cur_uv_index_font.attr("style", "background-color:red");
            cur_uv_index_font.attr("color", "white");
        } else if (response.value>10.4) {
            cur_uv_index_font.attr("style", "background-color:violet");
            cur_uv_index_font.attr("color", "white");
        }
        
        cur_uv_index_font.text(response.value);
        cur_uv_index_str.append(cur_uv_index_font)

        $("#current_weather").append(cur_uv_index_str);
    });
}

function update_history(city) {
    var record_history = loadRecordHistory();
    if (record_history.includes(city.toLowerCase())) {
        record_history.splice(record_history.indexOf(city.toLowerCase()), 1);
    }
    record_history.push(city.toLowerCase());
    localStorage.setItem("record_history", JSON.stringify(record_history));
}

function _show_all_weather_content(city, response) {
    // update history
    update_history(city);

    // clear page content
    $("#current_weather").empty()

    // create updated content
    $("#city_name").text(capitalizeFirstLetter(city) + moment().format(' (M/DD/YYYY)'));
    var cur_temp_str = $("<p>");
    cur_temp_str.text("Temperature: " + response.main.temp + "°C");
    $("#current_weather").append(cur_temp_str);

    var cur_temp_icon = $("<img>");
    var iconcode = response.weather[0].icon;
    cur_temp_icon.attr("src", "https://openweathermap.org/img/wn/" + iconcode + ".png");
    cur_temp_icon.attr("class", "img-fluid");
    $("#city_name").append(cur_temp_icon);

    var cur_humidity_str = $("<p>");
    cur_humidity_str.text("Humidity: " + response.main.humidity + "%");
    $("#current_weather").append(cur_humidity_str);

    var cur_wind_speed_str = $("<p>");
    cur_wind_speed_str.text("Wind Speed: " + response.wind.speed + "m/s");
    $("#current_weather").append(cur_wind_speed_str);

    show_current_UV(response.coord);
    render_search_history();
}

function show_current_weather(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?" +
      "q=" + city + "&units=metric&appid=" + APIKey;

    $.ajax({
    url: queryURL,
    method: "GET",
    })
    // We store all of the retrieved data inside of an object called "response"
    .then(function(response) {
        _show_all_weather_content(city, response);
    });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPositionWeather);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPositionWeather(position) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?"
      + "lat=" + position.coords.latitude
      + "&lon=" + position.coords.longitude
      + "&units=metric&appid=" + APIKey;
    $.ajax({
    url: queryURL,
    method: "GET",
    })
    // We store all of the retrieved data inside of an object called "response"
    .then(function(response) {
        city = response.name;
        _show_all_weather_content(city, response);
    });
}

function loadRecordHistory() {
    var record_history = localStorage.getItem("record_history");
    if (record_history == null) {
        return [];
    } else {
        return JSON.parse(record_history);  
    }
  };

function render_search_history() {
    var record_history = loadRecordHistory();
    $("#search_history").empty();
    for (i = 0; i < record_history.length; i++) {
        var list_el = $("<li>");
        list_el.attr("class", "list-group-item");
        var btn_el = $("<button>");
        btn_el.attr("type", "button");
        btn_el.attr("class", "history_btn btn btn-outline-secondary");
        btn_el.text(capitalizeFirstLetter(record_history[record_history.length-1-i]));
        list_el.append(btn_el);
        $("#search_history").append(list_el);
    }
    // add back listeners
    $(".history_btn").on("click", function() {
        var city = $(this).text();
        search_city_name(city);
    }); 
}

function search_city_name(city) {
    show_current_weather(city);
    show_forecast_weather(city);
}

$(document).ready(function() {
    // history button
    $(".history_btn").on("click", function() {
        var city = $(this).text();
        search_city_name(city);
    }); 

    // search button
    $("#search_buttton").on("click", function() {
        var city = $("#search_city").val();
        search_city_name(city);
    });

    // location button
    $("#use_location_buttton").on("click", function() {
        getLocation(city);
    });
});

record_history = loadRecordHistory();
if (record_history.length > 0) {
    city = record_history[record_history.length-1];
}
search_city_name(city);

