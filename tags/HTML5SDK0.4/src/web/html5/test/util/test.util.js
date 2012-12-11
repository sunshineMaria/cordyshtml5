function compareXML(sourceXML, targetXML)
{
	sourceXMLDoc = $.parseXML(sourceXML);
	targetXMLDoc = $.parseXML(targetXML);	
	return ($.cordys.json.xml2jsstring(sourceXMLDoc) === $.cordys.json.xml2jsstring(targetXMLDoc));
}