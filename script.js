// create references and variables
var addressInputEle = $('#userAddress')
var federalOfficialsMenu = $('#federalOfficials')
var stateOfficialsMenu = $('#stateOfficials')
var localOfficialsMenu = $('#localOfficials')
var federal = []
var state = []
var local = []
var offices;

// Ajax request to Google Civic Info
function getOfficials(address) {
    var queryURL = "https://www.googleapis.com/civicinfo/v2/representatives?key=AIzaSyAY3D8Rvr86w2k066vbIV1mpziRwWCO2kc&address="
    queryURL += address

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var offices = response.offices
        var officials = response.officials
        addOfficialButtons(offices, officials)
    })
}

// function adds officials to dropdown menus
function addOfficialButtons(offices, officials) {
    // empty out current dropdown menus when user submits new location
    federalOfficialsMenu.empty()
    stateOfficialsMenu.empty()
    localOfficialsMenu.empty()
    // create disabled select buttons for each dropdown menu
    federalOfficialsMenu.html('<option disabled selected>Federal Officials</option>')
    stateOfficialsMenu.html('<option disabled selected>State Officials</option>')
    localOfficialsMenu.html('<option disabled selected>Local Officials</option>')

    for (let i = 0; i < offices.length; i++) {
        var level = offices[i].levels[0]
        var newOfficialBtn = $('<option>')
        var officialName = officials[i].name
        newOfficialBtn.text(officialName)
        newOfficialBtn.attr("data-index", i)
        switch (level) {
            case "country":
                federalOfficialsMenu.append(newOfficialBtn)
                break;
            case "administrativeArea1":
                stateOfficialsMenu.append(newOfficialBtn)
                break;
            case "administrativeArea2":
            case "locality":
                localOfficialsMenu.append(newOfficialBtn)
                break;
        }
    }
    
}

// retrieve elected officials for location when user click's submit
$('#submitBtn').on('click', function (event) {
    event.preventDefault()
    // get user input
    var userAddress = addressInputEle.val()
    // get user's elected officials
    getOfficials(userAddress)
    clickRep()
})

// repBtn is a placeholder for the buttons created under each dropdown. Replace it with whatever setting will capture those. 

// I've used federal[0] as a placeholder in the information displays, as I'm not sure how we reference the correct array. If statement for each dropdown?
function clickRep(){
    // When user chooses a representative:
    $(".sidebar").click(function(event){
        // Clear out anything currently appended to the main display div
        $('.main').empty();
        // Testing click event...
        console.log(event.target.tagName)
        // create an img tag
        var repPic = $("<img src = '' alt = 'Picture of Representative'>");
        // Grab the img URL from the API object, if it exists
        repPic.attr("src", federal[0].photoUrl);
        // Display the image on the page
        $('.main').append(repPic);
        // Create a div to hold info about the rep
        var repInfo = $("<div>");
        // Insert information from API object:
        repInfo.html(
            `<p>Name: ${federal[0].name}</p>
            <p>Party: ${federal[0].party}</p>
            <p>Phone: ${federal[0].phones[0]}</p>
            <p>Address: ${federal[0].address[0].line1}, ${federal[0].address[0].city}, ${federal[0].address[0].state}, ${federal[0].address[0].zip}</p>
            <p>Website: ${federal[0].urls[0]}</p>`
        );
        // Display info on the page
        $('.main').append(repInfo);

    })
    };
