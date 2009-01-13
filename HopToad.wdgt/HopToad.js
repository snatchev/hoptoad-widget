var TIMEOUT = null;

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    setupParts();
	$("#hoptoad-back, #hoptoad-front").click(function(){
		widget.openURL("http://hoptoadapp.com");
	});
}

//
// Function: remove()
// Called when the widget has been removed from the Dashboard
//
function remove()
{
    // Stop any timers to prevent CPU usage
    // Remove any preferences as needed
    clearInterval(TIMEOUT);
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
	clearInterval(TIMEOUT);
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

function loadExceptions() {
	var prefs = preferences();
	
	if (prefs.apiKey && prefs.apiKey != "" && prefs.subdomain && prefs.subdomain != "") {
		$("#inform").hide();
	
		$.ajax({
			type: 'get',
			dataType: 'xml',
			url: "http://" + prefs.subdomain + ".hoptoadapp.com/errors.xml?auth_token=" + prefs.apiKey,
			success: function(xml) {
				$(xml).find("group").each(function(){
					var message = $(this).find("error-message").text();
					var id = $(this).find("id").text();
					var count = $(this).find("notices-count").text();
					var updated_at = $(this).find("updated-at").text();
					var url = "http://" + prefs.subdomain + ".hoptoadapp.com/errors/" + id;
					
					var html = "";
					html += "<p onclick='widget.openURL(\"" + url + "\");' title='Go to HopToad' id='exception-" + id + "' class='exception'>";
					html += "<a>" + message + "</a> ";
					html += "<strong>" + count + "</strong> ~ ";
					html += "<abbr title='" + updated_at + "'>" + updated_at + "</abbr>";
					html += "</p>";
					
					if ($("#exception-" + id).length > 0) {
						$("#exception-" + id).remove();
					}
					
					$("#scrollArea").append(html);					
					$('#exception-' + id + ' abbr').timeago();
				});
			},
			error: function() {
				
			}
		});
		
		TIMEOUT = setInterval(loadExceptions, 60 * 1000);
	} else {
		$("#inform").show();
	}
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}