
Notes on Usage:

 - The markers and list represent various museums within the city of Dallas, TX.
 - Click on a marker to display that venue's name, google streetview picture, and a link to that venue's wikipedia page
 - Click on a list item to display the information window for that item's marker
 - Sift through the list by typing in a venue's name in the search bar. This will filter both the list and the markers associated with      that venue.

Notes on Code:

 - A Model with 5 venues' information has been hardcoded into app.js
 - A google.map has been created using google.maps.api
 - Using information from the Model, markers have been instantiated on the map
 - When clicked, each marker will run a function gathering the wikipedia and streetview information for that marker and this information    will be displayed in an google infowindow.
 - Using knockout.js, a list has been placed on the page which contains the names of all the venues
 - When a venue is clicked, that venue's marker will be activated and will open the infowindow with that venue's information
 - A search bar has been created and when a user inputs text into this search bar, the venue list and markers will be sifted through.

Notes on Sources:

 - knockout.js
 - bootstrap.css
 - bootstrap.js
 - jquery.js
 - google.maps.api