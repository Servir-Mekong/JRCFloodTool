/**
 * @fileoverview Runs the Ecodash Tool application. The code is executed in the
 * user's browser. It communicates with the App Engine backend, renders output
 * to the screen, and handles user interactions.
 */

// define a number of global variabiles

var myName = [];
var DataArr = [];
var all_overlays = [];
var map;

 /**
 * Starts the Surface Water Tool application. The main entry point for the app.
 * @param {string} eeMapId The Earth Engine map ID.
 * @param {string} eeToken The Earth Engine map token.
 */
var boot = function(eeMapId, eeToken) {
	
	google.load('visualization', '1.0');

	var app = new App(eeMapId, 
					  eeToken
					  );
};



// ---------------------------------------------------------------------------------- //
// The application
// ---------------------------------------------------------------------------------- //
/**
 * The main Surface Water Tool application.
 * @param {google.maps.ImageMapType} mapType The map type to render on the map.
 */
var App = function(eeMapId, eeToken) {
  
  // Create and display the map.
  map = createMap();
 
  // Load the default image.
  refreshImage(eeMapId, eeToken);
  
 
  channel = new goog.appengine.Channel(eeToken);
    
  // create listeners for buttons and sliders
  setupListeners();
  
  // run the slider function to initialize the dates  
  slider();
  
 };

/**
 * Creates a Google Map for the given map type rendered.
 * The map is anchored to the DOM element with the CSS class 'map'.
 * @param {google.maps.ImageMapType} mapType The map type to include on the map.
 * @return {google.maps.Map} A map instance with the map type rendered.
 */
var createMap = function() {
  
  // set the map options
  var mapOptions = {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
	maxZoom: MAX_ZOOM,
	streetViewControl: false,
	mapTypeId: 'satellite'
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  return map;
};


/**
* setup the event listeners for the buttons and sliders
**/
function setupListeners() {

  document.getElementById('homebutton').addEventListener("click", homePage);
  document.getElementById('aboutbutton').addEventListener("click", aboutPage);
  document.getElementById('info-button').addEventListener("click", showInfo);
  document.getElementById('start-button').addEventListener("click", getStarted);
  document.getElementById('collapse-button').addEventListener("click", collapseMenu);
  document.getElementById('settings-button').addEventListener("click", collapseMenu);
  
  document.getElementById('updateMap').addEventListener("click", updateButton);
  
  document.getElementById('slider1').addEventListener("change", slider);
  document.getElementById('slider2').addEventListener("change", slider);
  document.getElementById('opacitySlider').addEventListener("change", opacitySliders);
  
}

/**
* function to show info screen
* using the info button
 */
var showInfo = function() {

   // get infoscreen by id
   var infoscreen = document.getElementById('general-info');

   // open or close screen
   if  (infoscreen.style.display === 'none') {
	infoscreen.style.display = 'block';
	} else {
      infoscreen.style.display = 'none';
    }
}


/**
* function to show info screen
* using the info button
 */
var showgraph = function() {

   // get infoscreen by id
   var graphscreen = document.getElementById('chart-info');

   // open or close screen
   if  (graphscreen.style.display === 'none') {
	graphscreen.style.display = 'block';
	} else {
      graphscreen.style.display = 'none';
    }
}


/**
* function to close info screen
* using the get started button
 */
var getStarted = function() {

   // get infoscreen by id
   var infoscreen = document.getElementById('general-info');

   // close the screen
   infoscreen.style.display = 'none';
}

/**
* function to collapse menu
**/
function collapseMenu() {

   var menu = document.getElementById('ui');
   var settings_button = document.getElementById('settings-button');

	if  (menu.style.display == 'none') {
		 menu.style.display = 'block';
		 settings_button.style.display="none";
	} else {
		menu.style.display = 'none';
		settings_button.style.display = 'block';	
    }
}

/**
* toggle between the home and about page
* go to the home page
**/
var homePage = function(){
	showmap = document.getElementById('map');
	showmap.style.display = "block";
	
	showUI = document.getElementById('ui');
	showUI.style.display = "block";
	
	hideAbout = document.getElementById('about');
	hideAbout.style.display = "hide";

	showLegend = document.getElementById('legend');
	showLegend.style.display = "block";
}

/**
* toggle between the home and about page
* go to the about page
**/
var aboutPage = function(){
	hidemap = document.getElementById('map');
	hidemap.style.display = "none";

	hideUI = document.getElementById('ui');
	hideUI.style.display = "none";

	showAbout = document.getElementById('about');
	showAbout.style.display = "block";

	hideLegend = document.getElementById('legend');
	hideLegend.style.display = "none";
}

/**
* hide the update button and show the map
**/
function updateButton() {

	update_button = document.getElementById('updateMap')
	
	ShowMap();
}



/**
* function to close info screen
* using the get started button
 */
var slider = function() {
	
	refStart = $("#slider1").val();
	refStop = $("#slider2").val();
	
	var slider1 = document.getElementById("sliderval1");
    slider1.innerHTML = refStart;

	var slider2 = document.getElementById("sliderval2");
    slider2.innerHTML = refStop;	
	
}

/**
* function to close info screen
* using the get started button
 */
var GetDates = function() {

	refStart = $("#slider1").val();
	refStop = $("#slider2").val();


	return [refStart, refStop]
}



/**
 * Update map
 */
var ShowMap = function() {

	// clear the map
	map.overlayMapTypes.clear();
	
	var Dates = GetDates();
	
	var params = {};
	
	// set the parameters
	params['refLow'] = Dates[0]
	params['refHigh'] = Dates[1]
	
	$(".spinner").toggle();

	$.ajax({
      url: "/details",
	  data: params,
      dataType: "json",
      success: function (data) {
		 var mapType = getEeMapType(data.eeMapId, data.eeToken);
		 map.overlayMapTypes.push(mapType);
		 $(".spinner").toggle();
		
      },
      error: function (data) {
        alert("An error occured! Please refresh the page.");
      }
    });	
	
	
}


	

// ---------------------------------------------------------------------------------- //
// Layer management
// ---------------------------------------------------------------------------------- //

/** Updates the image based on the current control panel config. */
var refreshImage = function(eeMapId, eeToken) {
  var mapType = getEeMapType(eeMapId, eeToken);
  map.overlayMapTypes.push(mapType);
};

var opacitySliders = function() {

  setLayerOpacity($("#opacitySlider").val());
  
}

var setLayerOpacity = function(value) {
  map.overlayMapTypes.forEach((function(mapType, index) {
    if (mapType) {
	  var overlay = map.overlayMapTypes.getAt(index);
      overlay.setOpacity(parseFloat(value));
    }
  }).bind(this));
};

// ---------------------------------------------------------------------------------- //
// Static helpers and constants
// ---------------------------------------------------------------------------------- //

/**
 * Generates a Google Maps map type (or layer) for the passed-in EE map id. See:
 * https://developers.google.com/maps/documentation/javascript/maptypes#ImageMapTypes
 * @param {string} eeMapId The Earth Engine map ID.
 * @param {string} eeToken The Earth Engine map token.
 * @return {google.maps.ImageMapType} A Google Maps ImageMapType object for the
 *     EE map with the given ID and token.
 */
var getEeMapType = function(eeMapId, eeToken) {
  var eeMapOptions = {
    getTileUrl: function(tile, zoom) {
      var url = EE_URL + '/map/';
      url += [eeMapId, zoom, tile.x, tile.y].join('/');
      url += '?token=' + eeToken;
      return url;
    },
    tileSize: new google.maps.Size(256, 256),
    name: 'FloodViewer',
	opacity: 1.0,
	mapTypeId: 'satellite'
  };
  return new google.maps.ImageMapType(eeMapOptions);
};

/** @type {string} The Earth Engine API URL. */
var EE_URL = 'https://earthengine.googleapis.com';

/** @type {number} The default zoom level for the map. */
var DEFAULT_ZOOM = 8;

/** @type {number} The max allowed zoom level for the map. */
var MAX_ZOOM = 25;

/** @type {Object} The default center of the map. */
var DEFAULT_CENTER = {lng: 95.8, lat: 20.4};

/** @type {string} The default date format. */
var DATE_FORMAT = 'yyyy-mm-dd';

/** The drawing manager	*/
var drawingManager;
