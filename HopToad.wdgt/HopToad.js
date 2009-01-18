var TIMEOUT  = null;
var NOTIFIER = null;
var MINUTE   = 60 * 1000;
var DEBUG    = true;

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
	setupParts();
	loadExceptions();
	growlNotifier();
	log("load", "widget has been loaded");
}

//
// Function: remove()
// Called when the widget has been removed from the Dashboard
//
function remove()
{
    // Stop any timers to prevent CPU usage
    // Remove any preferences as needed
    clearTimeout(TIMEOUT);
    clearTimeout(GROWL);
    widget.setPreferenceForKey(null, createInstancePreferenceKey("HopToadApiKey"));
    widget.setPreferenceForKey(null, createInstancePreferenceKey("HopToadSubdomain"));

	log("remove", "credentials has been removed");
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide()
{
    // Stop any timers to prevent CPU usage
	// clearInterval(TIMEOUT);
	log("hide", "widget has been hid");
}

//
// Function: show()
// Called when the widget has been shown
//
function show()
{
	log("show", "widget has been shown");
}

//
// Function: showBack(event)
// Called when the info button is clicked to show the back of the widget
//
// event: onClick event from the info button
//
function showBack(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }

	var prefs = preferences();
	
	$("#apiKey").val(prefs.apiKey);
	$("#subdomain").val(prefs.subdomain);
	$("#author")[0].onclick = function(){
		widget.openURL("http://simplesideias.com.br");
	}
}

//
// Function: showFront(event)
// Called when the done button is clicked from the back of the widget
//
// event: onClick event from the done button
//
function showFront(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }

	$("#hoptoad-back, #hoptoad-front").click(function(){
		widget.openURL("http://hoptoadapp.com");
	});
	
	$("#reload").click(function(){
		loadExceptions(true);
		displayGrowlMessage();
	});
	
	loadExceptions();
}

function saveProject(event)
{
	widget.setPreferenceForKey($("#apiKey").val().toString(), createInstancePreferenceKey("HopToadApiKey"));
	widget.setPreferenceForKey($("#subdomain").val().toString(), createInstancePreferenceKey("HopToadSubdomain"));
	
	$('#apiKey').val("");
	$('#subdomain').val("");
	showFront(event);
	
	log("preferences", "api key and subdomain has been saved");
}

function preferences() {
	return {
		apiKey: widget.preferenceForKey(createInstancePreferenceKey("HopToadApiKey")),
		subdomain: widget.preferenceForKey(createInstancePreferenceKey("HopToadSubdomain"))
	}
}

function growlNotifier() {
	clearTimeout(NOTIFIER);
	log("notification", "trying to display using growl");
	
	var cmd = '/usr/bin/osascript GrowlNotifier.scpt';
	widget.system(cmd, function(){});
	
	NOTIFIER = setTimeout(growlNotifier, 1 * MINUTE);
}

function loadExceptions(should_growl) {
	clearTimeout(TIMEOUT);
	
	var prefs = preferences();
	
	log("loadExceptions", "loading exceptions");
	
	if (prefs.apiKey && prefs.apiKey != "" && prefs.subdomain && prefs.subdomain != "") {
		var cmd = "/usr/bin/osascript HopToad.scpt " + prefs.subdomain + " " + prefs.apiKey;
		
		$("#inform").hide();
		
		log("step", "about to execute command");
		log("run", cmd);
		
		widget.system(cmd, function(cmd){
			log("step", "command executed");
			var output = cmd.outputString;
			
			if (output.match(/exception/gim)) {
				$("#scrollArea")
					.html(output)
					.removeClass('hide');
					
				$('#no-exceptions')
					.addClass('hide');
				
				$("abbr").timeago();
				growlNotifier();
			} else if (output.match(/no-results/)) {
				$('#no-exceptions')
					.removeClass('hide');
				
				$('#scrollArea, #inform')
					.addClass("hide");
			} else {
				$("#scrollArea, #inform")
					.addClass("hide");
				
				$("#unable")
					.removeClass("hide");
			}
		});
		
		TIMEOUT = setTimeout(loadExceptions, MINUTE);
	} else {
		$("#inform").show();
		log("loadExceptions", "no credentials found");
	}
}

function log(title, message) {
	if (DEBUG) {
		widget.system('MESSAGE="' + title + ': ' + message + '" /usr/bin/osascript logger.scpt');
	}
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
}