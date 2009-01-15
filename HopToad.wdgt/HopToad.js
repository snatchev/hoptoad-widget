var TIMEOUT = null;
var NOTIFY = null;
var MINUTE = 60 * 1000;

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    setupParts();
	loadExceptions();
	notify();
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
    clearTimeout(NOTIFY);
    widget.setPreferenceForKey(null, createInstancePreferenceKey("HopToadApiKey"));
    widget.setPreferenceForKey(null, createInstancePreferenceKey("HopToadSubdomain"));
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide()
{
    // Stop any timers to prevent CPU usage
	// clearInterval(TIMEOUT);
}

//
// Function: show()
// Called when the widget has been shown
//
function show()
{
	
}

//
// Function: sync()
// Called when the widget has been synchronized with .Mac
//
function sync()
{
    // Retrieve any preference values that you need to be synchronized here
    // Use this for an instance key's value:
    // instancePreferenceValue = widget.preferenceForKey(null, createInstancePreferenceKey("your-key"));
    //
    // Or this for global key's value:
    // globalPreferenceValue = widget.preferenceForKey(null, "your-key");
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
	
	loadExceptions();
}

function saveProject(event)
{
	widget.setPreferenceForKey($("#apiKey").val().toString(), createInstancePreferenceKey("HopToadApiKey"));
	widget.setPreferenceForKey($("#subdomain").val().toString(), createInstancePreferenceKey("HopToadSubdomain"));
	
	$('#apiKey').val("");
	$('#subdomain').val("");
	showFront(event);
}

function preferences() {
	return {
		apiKey: widget.preferenceForKey(createInstancePreferenceKey("HopToadApiKey")),
		subdomain: widget.preferenceForKey(createInstancePreferenceKey("HopToadSubdomain"))
	}
}

function notify() {
	var count = $('p.exception').length;
	
	if (count > 0) {
		var growl = "/usr/bin/osascript notifier.scpt " + count;
		widget.system(growl, function(){});
	}
	
	NOTIFY = setTimeout(notify, 10 * MINUTE);
}

function loadExceptions() {
	clearTimeout(TIMEOUT);
	
	var prefs = preferences();
	log("subdomain", prefs.subdomain);
	log("api key", prefs.apiKey);
	
	if (prefs.apiKey && prefs.apiKey != "" && prefs.subdomain && prefs.subdomain != "") {
		var cmd = "/usr/bin/osascript hop_toad.scpt " + prefs.subdomain + " " + prefs.apiKey;
		
		$("#inform").hide();
		
		log("step", "about to execute command");
		log("run", cmd);
		
		widget.system(cmd, function(cmd){
			log("step", "command executed");
			var output = cmd.outputString;
			
			if (output.match(/exception/gim)) {
				$("#scrollArea").html(output);
				$("abbr").timeago();
			} else {
				$("#scrollArea, #inform").addClass("hide");
				$("#unable").removeClass("hide");
			}
		});
		
		TIMEOUT = setTimeout(loadExceptions, 60 * 1000);
	} else {
		$("#inform").show();
	}
}

function log(title, message) {
	// $("#scrollArea").append("<strong>" + title.toString() + ":</strong> " + message.toString() + "<br>");
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}