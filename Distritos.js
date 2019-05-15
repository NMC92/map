//---onload---
function loadSVG()
{
    var SVGFile="Distritos.svg"
    var loadXML = new XMLHttpRequest;
    loadXML.onload = callback;
    loadXML.open("GET", SVGFile, true);
    loadXML.send();
    function callback()
    {
        //---responseText---
        var svgFileString=loadXML.responseText
        mySVG.svg(svgFileString)
        showSourceSVG()
    }
}