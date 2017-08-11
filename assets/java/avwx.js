// This file contains the script necessary to pull
// and push the data for the Mavrick Project1
// --------------------------------------------------------

// Create glocal variables here
// ------------------------------------------------

// flight status output icao
var destFlight;

// Create variables for all the weather data
var weather = {
	skyConditions: "",
	wind : "",
	visibility: "",
	temperature : "",
	latitude: "",
	longitude: ""
};

// Flight information Object
var flightData =
{
	// Airline Code
	airline: "",
	// Origin airport
	departure: "",
	// Desination airport
	arrival: "",
	// Arrival time in moment.js format
	arrivalTime: moment(),
	// Status E.G Enroute, Arrived, Scheduled
	status: "",
	// Function to load object
	load: function(argAirline,argDept,argArriv,argTime,argZone,argStatus){
		this.airline = argAirline;
		this.departure = argDept;
		this.arrival = argArriv;
		this.arrivalTime = moment.unix(argTime);
		// Prettys the 'En' to 'Enroute'
		if(argStatus == "En"){
			this.status="Enroute";
		}
		else{
			this.status = argStatus;
		}
	},
	// Function to write information to DOM
	writeToHTML: function(){
		// output to DOM
		$('#airline').text(this.airline);
		$('#departure').text(this.departure);
		$('#destination').text(this.arrival);
		// moment.js format the output
		var timeString = this.arrivalTime.format("ddd, MMM Do , h:mm");
		$('#arrivaltime').text(timeString);
		$('#status').text(this.status);
	}
}


// Create functions here
// -------------------------------------------------
// Function for https://avwx.rest API AJAX GET request
// link: https://avwx.rest/api/metar/KIAH?options=info,translate
// Lookup key is by ICAO
function avwx(link) {
	// Create ajax call for new search item
	$.ajax({
		url: link,
		method: "GET"
	})
		// After the data comes back from the API
		.done(function(res){
			// Storing an array of results in the results variable
			var results = res;
			// Store the relevant data that will be displayed in the
			// weather results div
			weather.skyConditions = results.Translations.Clouds;
			weather.skyConditions = weather.skyConditions.replace("- Reported AGL","");
			weather.wind = results.Translations.Wind;
			weather.visibility = results.Translations.Visibility;
			weather.temperature = results.Translations.Temperature;
			// Push the above to html
			$("#skyCondition").text(weather.skyConditions);
			$("#wind").text(weather.wind);
			$("#visibility").text(weather.visibility);
			$("#temperature").text(weather.temperature);		
		})
}

// Autocomplete function for city name
// Also used to get corresponding icao and latitude/longitude
$(document).ready($(function() {
    var data = airportsArray;
    // Below is the name of the textfield that will be autocomplete    
    $('#searchInput').autocomplete({
        // This shows the min length of charcters that must be typed before the autocomplete looks for a match.
        minLength: 2,
        // Define the data to be used.
        // map method is used to perform function on every value in the array  
		source: $.map(data, function (item) {
                return {
                	// The label property is displayed in the suggestions menu
                    label: item.name,
                    // The value will be inserted into the input element when a user selects an item
                    value: item.icao,
                    // Create values for longitude and latitude to pass to iFrame
                    value1: item.lon,
                    value2: item.lat
                }
	    }),
	    // Initialize the autocomplete with the search callback specified
	    search: function(event,ui){
	    	// Bind an event listener to the autocompletesearch event
	    	$('#searchInput').on("autocompletesearch", function(event,ui){});
	    }, 
        // Once a value in the drop down list is selected, do the following:
        select: function(event, ui) {
        	// Put the selected value in the search box
        	$('#searchInput').val(ui.item.value);
            // Save the longitude and latitude values
            weather.longitude = ui.item.value1;
            weather.latitude = ui.item.value2;
            return false;
        }
    });
}));

// Here we create the function to give us the Iframe 
// Function takes two argument (latitude,longtiude)
function iFrame(latitude,longtiude) {
	// We create a jQuery iframe
	var frame = $('<iframe>');
	// forming a source for the iFrame
	frame.attr("src","https://opensky-network.org/iframe?c="+latitude+","+longtiude+"&z=13width="+"100%"+"height=100%" );
	frame.attr("width","100%");
	frame.attr("height","450");
	// posted into a div
	$('#map_opensky').html(frame);
};

// Main Function to grab Flight Status
// requires FlightInput as string as the flight number
function retrieveFlightStatus(flightInput){
	//AJAX to HAM's node.js server
	$.ajax({
		url: 'https://watson-easy.herokuapp.com/flights',
		data: {
			args:{
				'ident': flightInput,
				'howMany': 10
			}
		},
		type: 'POST',
		dataType: 'JSON'
	}).done(function(response) {
		// If the flight DNE
		if (response.error) {
			console.log('Failed to fetch flight: ' + response.error);
			return;
		}
		// set some loop variables
		var i =0;
		var found = false
		// simplify the response
		var flightArray = response.FlightInfoStatusResult.flights;
		// Go looping for a departed flight
		while(i < flightArray.length && !found){
			// Check for flight that has actually departed
			if (flightArray[i].actual_departure_time.epoch > 0) {
				// Load that flight data to the flight object
				flightData.load(flightArray[i].airline,flightArray[i].origin.airport_name,flightArray[i].destination.airport_name,flightArray[i].estimated_arrival_time.epoch,flightArray[i].estimated_arrival_time.tz,flightArray[i].status)
				// set to Found so loop exits.
				found = true ;
			}
			else{	// else iterate
				i++;
			}
		};
		// Write to the DOM
		flightData.writeToHTML();
		destFlight = response.FlightInfoStatusResult.flights[i].destination.code;
		// Construct a URL to search for the airport selected 
		var queryURL = "https://avwx.rest/api/metar/" +
					 destFlight + "?options=info,translate";
		// Get weather information and push to html
		avwx(queryURL);
		// Update the longitude an latitude of airport
		search(destFlight, airportsArray);
		// Get the iframe
		iFrame(weather.latitude, weather.longitude);
	});
};

// Function to search for ICAO in airports array
function search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].icao === nameKey) {
			weather.longitude = myArray[i].lon;
            weather.latitude = myArray[i].lat;
        }
    }
}

// Function to empty out all the divs
function emptyAll(){
	$("#skyCondition").empty();
	$("#wind").empty();
	$("#visibility").empty();
	$("#temperature").empty();
	$('#airline').empty();
	$('#departure').empty();
	$('#destination').empty();
	$('#arrivaltime').empty();
	$('#status').empty();
}

// Execute the main code here
// -------------------------------------------------

// Event listener for search button being clicked

$("#btn_search").on("click", function(event) {
	// When the search button is clicked
	// if(event.keyCode === 13) {
		// Empty out all divs
		emptyAll();
		// Save the search value in a variable
		var searchValue = $("#searchInput").val().trim();
		// 	Check if a flight number has been entered or not
		var flightOrNot = searchValue.substr(searchValue.length - 1);
	// }
	// Only run this code if there is something in the input box
	// and if enter is pressed and if it is not a flight number
	if(searchValue!== "" & isNaN(flightOrNot) === true ) {
		// This line grabs the input (ICAO) from the search box
		var searchValue = $("#searchInput").val().trim();
		// Construct a URL to search for the airport selected 
		var queryURL = "https://avwx.rest/api/metar/" +
						searchValue + "?options=info,translate";
		// Get weather information and push to html
		avwx(queryURL);
		// Get the iframe
		iFrame(weather.latitude, weather.longitude);
	} else if (searchValue!== "" & isNaN(flightOrNot) === false) {
		// This line grabs the input (ICAO) from the search box
		var searchValue = $("#searchInput").val().trim();
		// Update the flight status and store destination icao
		retrieveFlightStatus(searchValue);
	};
});

// Event listener for enter button being pressed.
$("#searchInput").on("keypress", function(event) {
	// When the enter key is pressed
	if(event.keyCode === 13) {
		// Empty out all divs
		emptyAll();
		// Save the search value in a variable
		var searchValue = $("#searchInput").val().trim();
		// 	Check if a flight number has been entered or not
		var flightOrNot = searchValue.substr(searchValue.length - 1);
	}
	// Only run this code if there is something in the input box
	// and if enter is pressed and if it is not a flight number
	if(searchValue!== "" & event.keyCode ===13 & isNaN(flightOrNot) === true ) {
		// This line grabs the input (ICAO) from the search box
		var searchValue = $("#searchInput").val().trim();
		// Construct a URL to search for the airport selected 
		var queryURL = "https://avwx.rest/api/metar/" +
						searchValue + "?options=info,translate";
		// Get weather information and push to html
		avwx(queryURL);
		// Get the iframe
		iFrame(weather.latitude, weather.longitude);
	} else if (searchValue!== "" & event.keyCode ===13 & isNaN(flightOrNot) === false) {
		// This line grabs the input (ICAO) from the search box
		var searchValue = $("#searchInput").val().trim();
		// Update the flight status and store destination icao
		retrieveFlightStatus(searchValue);
	};
});



