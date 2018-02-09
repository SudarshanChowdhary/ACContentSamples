function clientSideInclude(id, url) {
  var req = false;
  // For IE
  if (window.ActiveXObject) {
	req = new ActiveXObject("Msxml2.XMLHTTP");
  } else if (window.XMLHttpRequest) {
    // For real browsers
	req = new XMLHttpRequest();
  }
 var element = document.getElementById(id);
 if (!element) {
  alert("Bad id " + id + 
   "passed to clientSideInclude." +
   "You need a div or span element " +
   "with this id in your page.");
  return;
 }
  if (req) {
    // Synchronous request, wait till we have it all
    req.open('GET', url, false);
    req.send(null);
    element.innerHTML = req.responseText;
  } else {
    element.innerHTML =
   "Sorry, your browser does not support " +
      "XMLHTTPRequest objects. This page requires " +
      "Internet Explorer 5 or better for Windows, " +
      "or Firefox for any system, or Safari. Other " +
      "compatible browsers may also exist.";
  }
}