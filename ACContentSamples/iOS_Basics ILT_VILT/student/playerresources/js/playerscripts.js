function loadXMLDoc(dname)
 {
    if (window.ActiveXObject)
    {
        xhttp = new ActiveXObject("Microsoft.XMLDOM");
        xhttp.async = false;
        xhttp.load(dname)
        return xhttp;
    }
    else
    {
        xhttp = new XMLHttpRequest();
        xhttp.open("GET", dname, false);
        xhttp.send("");
        return xhttp.responseXML;
    }
}

function getURLParam(parameter_name)
{
  parameter_name = parameter_name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+parameter_name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function buildNav()
 {
	var showQuiz = getURLParam('showQuiz');
    xml = loadXMLDoc("imsmanifest.xml");

	if (showQuiz != 1)
	{
    	xsl = loadXMLDoc("playerresources/manifesttransformnoq.xsl");
	}
	else
	{
		xsl = loadXMLDoc("playerresources/manifesttransform.xsl");
	}
	
    // code for IE
    if (window.ActiveXObject)
    {
        ex = xml.transformNode(xsl);
        document.getElementById("tableofcontents").innerHTML = ex;
    }
    // code for non-IE etc.
    else if (document.implementation && document.implementation.createDocument)
    {
        xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsl);
        resultDocument = xsltProcessor.transformToFragment(xml, document);
        document.getElementById("tableofcontents").appendChild(resultDocument);
    }
}

function populateContentFrame()
 {
    firstIdentifierRef = xml.getElementsByTagName("resource")[0].attributes.getNamedItem("href").nodeValue + "?hideErrors=1";
    frames['contentFrame'].location.href = firstIdentifierRef;
}