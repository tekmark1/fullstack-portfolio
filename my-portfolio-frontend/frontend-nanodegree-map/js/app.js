/* ======= Model ======= */

var venueList = [

		{
			name : 'Sixth Floor Museum',
			latlng : {lat: 32.780274, lng: -96.808535},
			address : '411 Elm St, Dallas',
			id : 0	
		},
		{
			name : 'Perot Museum of Nature and Science',
			latlng : {lat: 32.787184, lng: -96.806762},
			address : '2201 N Field St, Dallas',
			id : 1		
		},
		{
			name : 'George W. Bush Presidential Center',
			latlng : {lat: 32.841254, lng: -96.778099},
			address : '2943 SMU Boulevard, Dallas',
			id : 2
		},
		{
			name : 'Old Red Museum',
			latlng : {lat: 32.778200, lng: -96.806468},
			address : '600 Commerce St, Dallas',
			id : 3
		},
		{
			name : 'Dallas Museum of Art',
			latlng : {lat: 32.787785, lng: -96.800904},
			address : '1717 N Harwood St, Dallas',
			id : 4	
		}
];

//Generates HTML. This function will take in the articleList array from the ViewModel and will produce the infowindow content.
function HTMLModel() {

	this.generateHTML = function(articles) {

		var infowindowContent = "";

		//run a loop through the articleList array and set the infowindowContent with this info.
		for (var i = 0; i < articles.length; i++) {

			var content = articles[i].content;
			var name = articles[i].name;
			var url = articles[i].url;
			var streetview = articles[i].streetview;
			
			infowindowContent = "<div class='popup map-info' ><h1>" + name + "</h1><img src='" + streetview + "'><div id='wikilinks'><li><a href='" + url + "''>" + content + "</a></li></div></div>";
		};

		return infowindowContent;
	};
};

//instantiate a new HTMLModel for global use.
var HTML = new HTMLModel();

//ViewModel
var ViewModel = function() {

	var self = this;

	//observableArray for article information. Information from self.articles will be pushed
	//into this array. This array will then be used by model.generateHTML to create infowindowContent.
	this.articleList = ko.observableArray();

	//the information that is collected in this function will be supplied to self.articleList for generateHTML;
	//this information will be gathered in the apiData ajax call.
	this.article = function(name, url, streetview, content) {
		this.name = name;
		this.url = url;
		this.streetview = streetview;
		this.content = content;
	}

	//create infowindow object
	var infowindow = new google.maps.InfoWindow();

	//function that contains marker information
	this.createMarker = function(name, latlng, id, address) {
		
		this.identifier = ko.observable(name);

		this.name = name;
		this.latlng = latlng;
		this.id = id;
		this.address = address;

		var marker = new google.maps.Marker({
			animation: google.maps.Animation.DROP,
			position: latlng,
			map: map
		});

		//sets visibility for filtering purposes
		this.isVisible = ko.observable(false);

    	this.isVisible.subscribe(function(currentState) {
    		if (currentState) {
    			marker.setMap(map);
    		} else {
    			marker.setMap(null);
    		}
    	});

    	this.isVisible(true);

    	this.marker = marker;
	};

	//Instantiate markers into array
	this.markers = [
		new self.createMarker(venueList[0].name, venueList[0].latlng, venueList[0].id, venueList[0].address),
		new self.createMarker(venueList[1].name, venueList[1].latlng, venueList[1].id, venueList[1].address),
		new self.createMarker(venueList[2].name, venueList[2].latlng, venueList[2].id, venueList[2].address),
		new self.createMarker(venueList[3].name, venueList[3].latlng, venueList[3].id, venueList[3].address),
		new self.createMarker(venueList[4].name, venueList[4].latlng, venueList[4].id, venueList[4].address)
	];

	//place this.markers array into observable array
	this.markerArray = ko.observableArray(self.markers);

	this.query = ko.observable('');

	//filter marker and list names when they match text inputed into search bar
	this.filterMarkers = ko.computed(function() {

		var search = self.query().toLowerCase();

		return ko.utils.arrayFilter(self.markerArray(), function(marker) {
			var doesMatch = marker.identifier().toLowerCase().indexOf(search) >= 0;

			marker.isVisible(doesMatch);

			return doesMatch;
		});
	});

	//a function which accepts an input and creates an ajax call for that input
	this.apiData = function(marker) {

		var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.name + '&limit=3&format=json&callback=wikiCallback';
		
		//ajax parameters
		parameters = {
			url: wikiUrl,
			dataType: "jsonp",
			success: function( response ) {

				//remove all of the information in the self.articleList array to get it ready for new input
				self.articleList.removeAll();

				//set a variable which is equal to response and set a variable to equal the first response
				var articles = response[1];
				var content = articles[0];

				//set wikipedia url for infowindow
				var url = 'http://en.wikipedia.org/wiki/' + content;

				//set url for google streetview
				var streetViewUrl = "http://maps.googleapis.com/maps/api/streetview?size=200x150&location=" + marker.address + "";

				//push ajax info into self.articleList using self.article;
				self.articleList.push(new self.article(marker.name, url, streetViewUrl, content));
				
			},
			//error function to be completed upon error
			//error outputs are designated based upon the status of the error
			error: function(jqXHR, exception) {

				self.articleList.removeAll();

				var wikiFail = '';
		        if (jqXHR.status === 0) {
		            wikiFail = 'Not connect.\n Verify Network.';
		        } else if (jqXHR.status == 404) {
		            wikiFail = 'Requested page not found. [404]';
		        } else if (jqXHR.status == 500) {
		            wikiFail = 'Internal Server Error [500].';
		        } else if (exception === 'parsererror') {
		            wikiFail = 'Requested JSON parse failed.';
		        } else if (exception === 'timeout') {
		            wikiFail = 'Time out error.';
		        } else if (exception === 'abort') {
		            wikiFail = 'Ajax request aborted.';
		        } else {
		            wikiFail = 'Uncaught Error.\n';
		        }
		        self.articleList.push(wikiFail);
	        } 
		};
		$.ajax(parameters);
	};

	//function to be used for data-binds on list items
	self.openInfoWindow = function(marker) {
		//make ajax call for clicked list item
		self.apiData(marker);

		//wait 300ms for ajax call to be finished and then open infowindow with HTML string
		//generated from HTML.generateHTML
		window.setTimeout(function() {
			infowindow.setContent(HTML.generateHTML(self.articleList()));
			infowindow.open(map, marker.marker);
		}, 300);

		//create toggleBounce animation for marker when list item is clicked
		if (marker.marker.getAnimation() !== null) {
			marker.marker.setAnimation(null);
		} else {
			marker.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() { marker.marker.setAnimation(null); }, 1450);
		};
	};

	//using an IIFE statement, every marker in self.markers will have a click function which opens
	//the infowindow with information for that marker.
	//also includes toggleBounce animation for markers
	for (var i = 0; i < self.markers.length; i++) {

		var indexedNumber = self.markers[i]

		indexedNumber.marker.addListener('click', (function(markerCopy) {
			
			return function() {
				self.apiData(markerCopy);

				window.setTimeout(function() {
					infowindow.setContent(HTML.generateHTML(self.articleList()));
					infowindow.open(map, markerCopy.marker);
				}, 300);

				if (markerCopy.marker.getAnimation() !== null) {
					markerCopy.marker.setAnimation(null);
				} else {
					markerCopy.marker.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(function() { markerCopy.marker.setAnimation(null); }, 1450);
				};
			};

		})(indexedNumber));
	};
};

var map;

//create map and event listener to close other window if another marker is clicked
var initMap = function() {
	var self = this;

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 32.814073, lng: -96.792243},
		zoom: 13
	});

	google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
    });

};

//create an error statement if google comes back as undefines
//this function is placed in the google.maps.api script in index.html
function googleError() {

	var $errorMap = $('#map');

	if (typeof google === 'undefined') {
    	$errorMap.append('<h2>Error loading or retrieving Google Map</h2>');
    };
}

//wrap initMap() and ko bindings in a function so they can be run with google.api callback
function runApp() {
	initMap();
	ko.applyBindings(new ViewModel());
};
