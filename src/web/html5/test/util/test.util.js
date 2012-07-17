function compareXML(sourceXML, targetXML)
{
	var sourceJSON = $.xml2json(sourceXML);
	var targetJSON = $.xml2json(targetXML);
	return (JSON.stringify(sourceJSON) === JSON.stringify(targetJSON));
}