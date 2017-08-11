// functions for the retrevial of flight information status
//
//Global Variable to cirumvent return issue
// var destinationFromFlight;
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
		destinationFromFlight = response.FlightInfoStatusResult.flights[i].destination.code;
	});
}

// Testing code - Can be safely deleted
// $("#btn_search").on("click", function(event) {
// 	// Only run this code if there is something in the input box
// 	//if(searchValue!== "") {
// 		// // This line grabs the input from the search box
// 		// var searchValue = $("#searchInput").val().trim();
// 		// // Construct a URL to search for the airport selected
// 		// var queryURL = "https://avwx.rest/api/metar/" +
// 		// 				searchValue + "?options=info,translate";
// 		// Get weather information and push to html
// 		retrieveFlightStatus($("#searchInput").val().trim());
// 		// Get the iframe
// 		// iFrame(weather.latitude, weather.longitude);
// 	// };
// });
