// Here we put our variables 
// ========================


// ====================


// Here we put any Function
// Here we create the function to give us the Iframe 
// Function takes two argument (latitude,longtiude)
function iFrame(latitude,longtiude) {
	// body...
	// We create a jQuery iframe
	var frame = $('<iframe>')
	// forming a source for the iFrame
	frame.attr("src","https://opensky-network.org/iframe?c="+latitude+","+longtiude+"&z=13width="+"100%"+"height=100%" )
	frame.attr("width","100%")
	frame.attr("height","450")
	// posted into a div
	$('#map_opensky').html(frame);
				};
				// running this function for test 
		iFrame(60.332231,75.332231);