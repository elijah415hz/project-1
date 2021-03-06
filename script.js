$(document).ready(function () {
    $('.collapsible').collapsible();
});
// create references and variables
var addressInputEle = $('#userAddress')
var federalOfficialsMenu = $('#federalOfficials')
var stateOfficialsMenu = $('#stateOfficials')
var localOfficialsMenu = $('#localOfficials')
var submitBtnClicked = false
var offices = [];
var officials = [];
var index = "";
var officeIndex = "";
var preloader = "";

// Function to set up API for Algolia autocomplete
(function () {
    var placesAutocomplete = places({
        appId: 'pl1GM2GV06CF',
        apiKey: 'e2ceea5d1cad7790d5412914a90a42b5',
        container: document.querySelector('#userAddress'),
    });
    placesAutocomplete.configure({
        aroundLatLngViaIP: false,
        countries: ['us']
    });
})();

// Ajax request to Google Civic Info
function getOfficials(address) {
    var queryURL = "https://www.googleapis.com/civicinfo/v2/representatives?key=AIzaSyAY3D8Rvr86w2k066vbIV1mpziRwWCO2kc&address="
    queryURL += address

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        offices = response.offices
        officials = response.officials
        addOfficialButtons(offices, officials)
    }).done(function () {
        // Animate sidebar to show that officials have arrived
        setTimeout(function () {
            if (!submitBtnClicked) {
                // set var to true so animations can't be fired while they are currently running
                submitBtnClicked = true
                // separate menu headers and make them shake twice
                $('.collapsible-header').animate({ marginTop: '10px', marginBottom: '10px' }, 100)
                $('.collapsible-header').effect('shake', { direction: 'left', distance: '10', times: 1 }, 200)
                $('.collapsible-header').animate({ marginTop: '0', marginBottom: '0' }, 200, function () {
                    // after final animation runs, set var back to false so animations can be fired again
                    submitBtnClicked = false

                })
            }
        }, 500)
    })
}

// function adds officials to dropdown menus
function addOfficialButtons(offices, officials) {
    // empty out current collapsible menus when user submits new location
    federalOfficialsMenu.empty()
    stateOfficialsMenu.empty()
    localOfficialsMenu.empty()
    // create header buttons for each collapsible menu
    federalOfficialsMenu.html('<div class="collapsible-header"><i class="material-icons">account_balance</i>Federal Officials</div>')
    stateOfficialsMenu.html('<div class="collapsible-header"><i class="material-icons">account_balance</i>State Officials</div>')
    localOfficialsMenu.html('<div class="collapsible-header"><i class="material-icons">account_balance</i>Local Officials</div>')


    for (let i = 0; i < offices.length; i++) {
        // Get level value of office to parse officials into Federal, State, Local
        var level = offices[i].levels[0]
        // Get indices of officials with that office title
        var officialIndexArr = offices[i].officialIndices
        // Loop over indices and add officials to the page
        for (var j = 0; j < officialIndexArr.length; j++) {
            var officialIndex = officialIndexArr[j]
            // Make element to hold official
            var newOfficialBtn = $('<div>')
            // Grab official's name
            var officialName = officials[officialIndex].name
            // Add styling to make collapsible dropdowns work
            newOfficialBtn.attr('class', 'collapsible-body')
            // Add name
            newOfficialBtn.text(officialName)
            // Add index of the office
            newOfficialBtn.attr("data-office-index", i)
            // Add index of official
            newOfficialBtn.attr("data-official-index", officialIndexArr[j])
            // Append to appropriate menu
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
}

// retrieve elected officials for location when user click's submit
$('#submitBtn').on('click', function (event) {
    event.preventDefault();
    // get user input
    var userAddress = addressInputEle.val()
    addressInputEle.blur();
    // Close any open menus
    // create reference to any active menu if it exists
    var activeEle = document.querySelector('.collapsible-header.active')
    // if there is an active menu...
    if (activeEle) {
        // simulate a click of that menu to close it
        activeEle.click()
    }
    // get user's elected officials
    getOfficials(userAddress);
    
})

// When user chooses a representative:
$(".sidebar").click(function (event) {
    // Clear out anything currently appended to the main display div
    if (!($(event.target).hasClass("collapsible-body"))) return;
    // collapsible-body
    $('.main').empty();
    // Testing click event...

    index = event.target.getAttribute("data-official-index")
    officeIndex = event.target.getAttribute("data-office-index")

    // Creates and appends information card
    var mediaQuery = window.matchMedia("(max-width: 992px)")
    if (mediaQuery.matches) {
        var infoCard = $("<div class='card'>")
    } else {
        var infoCard = $("<div class = 'card horizontal'>")
    }
    $(".main").append(infoCard)

    // Creates image placement on card, if we have an image URL to reference
    if (officials[index].photoUrl) {
        var cardImage = $("<div class = 'card-image'>");
        infoCard.append(cardImage);

        var repPic = $("<img src = '' alt = 'Picture of Representative'>");
        if (mediaQuery.matches) {
            repPic.css({ width: "50%", margin: "auto" })
        }
        repPic.attr("src", officials[index].photoUrl);
        $('.card-image').append(repPic);
    };

    // Create a div to hold info about the rep
    var repContentBox = $("<div class = 'card-stacked'>");
    infoCard.append(repContentBox);
    var repInfo = $("<div class = 'card-content'>");
    repContentBox.append(repInfo);

    // If statements check to be sure that relevant information exists in the object, displays it only if it does
    // Name
    if (officials[index].name) {
        var repName = `<p>Name: ${officials[index].name}</p>`;
        repInfo.append(repName);
    };
    // Title
    if (offices[officeIndex].name) {
        var repTitle = `<p>Title: ${offices[officeIndex].name}`
        repInfo.append(repTitle);
    };
    // Political Party
    if (officials[index].party) {
        var repParty = `<p>Party: ${officials[index].party}</p>`;
        repInfo.append(repParty);
    };
    // Phone Number
    if (officials[index].phones[0]) {
        var repPhone = `<p>Phone: ${officials[index].phones[0]}</p>`;
        repInfo.append(repPhone);
    };
    // Email address
    if (officials[index].emails) {
        var repEmail = `<p>Email: ${officials[index].emails[0]}</p>`;
        repInfo.append(repEmail);
    };
    // Address - For address to run properly without stopping the function, we first have to check if the address array exists at all, then within that if statement, check if the individual items exist, and display them accordingly.
    if (officials[index].address) {
        if (officials[index].address[0].line1) {
            var repAddress1 = `<p>Address: ${officials[index].address[0].line1}</p>`;
            repInfo.append(repAddress1);
        };
        if (officials[index].address[0].line2) {
            var repAddress2 = `<p>${officials[index].address[0].line2}</p>`;
            repInfo.append(repAddress2);
        };
        if (officials[index].address[0].line3) {
            var repAddress3 = `<p>${officials[index].address[0].line3}</p>`;
            repInfo.append(repAddress3);
        };
        if (officials[index].address[0].city && officials[index].address[0].state && officials[index].address[0].zip) {
            var repCityStateZip = `<p>${officials[index].address[0].city}, ${officials[index].address[0].state}, ${officials[index].address[0].zip}</p>`;
            repInfo.append(repCityStateZip);
        }
    };
    // Website
    if (officials[index].urls) {
        var repWebsite = `<a href = '${officials[index].urls[0]}'>Website</a>`;
        repInfo.append(repWebsite);
    };

    // Creates loading bar as news loads in
    preloader = $("<div class='progress'><div class='indeterminate'></div></div><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>");
    $(".main").append(preloader);
    // Scrolls down to main on small screens
    var mediaQuery = window.matchMedia("(max-width: 600px)")
    if (mediaQuery.matches) {
        $(".main")[0].scrollIntoView();
    }

    // Runs getNews function to display news stories:
    getNews();
})

// This function pulls the 5 most recent news stories from the NYT API and displays them on the page.
function getNews() {
    $.ajax({
        url: `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${officials[index].name}&api-key=IWE6hnGq7VzMyE3QxJe363KNU2gJmwbY`,
        method: "GET"
    }).then(function (stories) {
        // Creates a div to hold the news stories and displays it on the page.
        var newsCard = $("<div class = 'card horizontal'>");
        $(".main").append(newsCard);
        var repNewsBox = $("<div class = 'card-stacked'>");
        newsCard.append(repNewsBox);
        var repNews = $("<div class = 'card-content'>");
        repNewsBox.append(repNews);
        var newsHeader = $("<h4>Recent News:</h4>");
        repNews.append(newsHeader);

        // Displays up to 5 stories on page
        for (var i = 0; i < 5; i++) {
            // Create and append headline as hyperlink
            var headline = stories.response.docs[i].headline.main;
            var storyUrl = stories.response.docs[i].web_url;
            var displayHeadline = $(`<a href = "${storyUrl}" style = 'font-weight: bold;'>${headline}</a>`);
            repNews.append(displayHeadline);
            // Create and append author and type (opinion, etc)
            var byLine = stories.response.docs[i].byline.original;
            var articleType = stories.response.docs[i].section_name;
            var authorP = $(`<p>${byLine} - ${articleType}</p>`);
            if (byLine) {
                repNews.append(authorP);
            }
            // Create and append story abstract
            var summary = stories.response.docs[i].abstract;
            var storySummary = $("<p>");
            storySummary.html(`${summary}<br><br>`);
            repNews.append(storySummary);
            console.log(stories);
        }
    }).done(function () {
        // Once news has loaded in, removes the preloader from the screen
        preloader.remove();
    })
}

// Event listener to zoom back out on any blur event
// $('input, select, textarea').on('focus blur', function(event) {
//     $('meta[name=viewport]').attr('content', 'width=device-width,initial-scale=1');
//   });