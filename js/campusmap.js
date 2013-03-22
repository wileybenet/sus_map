// Modified Campus Map
/***** Campus Map Object****/
function CampusMap() {};
    CampusMap.prototype.name = "Campus";
    CampusMap.prototype.alt = "UW Map";
    CampusMap.prototype.tileSize = new google.maps.Size(256,256);
    CampusMap.prototype.maxZoom = 19;
    CampusMap.prototype.minZoom = 1;
    CampusMap.prototype.scrollwheel= false;
    CampusMap.prototype.streetViewControl = true;
    CampusMap.prototype.withinLoadingBounds = function(coord, zoom) {
        //[TODO] make this more efficient?
        //      -UWInfoWindow has a projection that can be used?
        return !(coord.x > Math.floor(84049/Math.pow(2,19-zoom)) || 
                coord.x < Math.floor(83996/Math.pow(2,19-zoom))  ||
                coord.y < Math.floor(182980/Math.pow(2,19-zoom)) ||
                coord.y > Math.floor(183017/Math.pow(2,19-zoom))
                );
    }
CampusMap.prototype.getTile = function(coord, zoom, ownerDocument) {
    var div = ownerDocument.createElement('DIV');
    if(!this.withinLoadingBounds(coord, zoom)) {
        div.style.width = '256px';
        div.style.height = '256px';
        div.style.background = '#FFFFFF';
        return div;
    }
    var img = ownerDocument.createElement('IMG');
    div.style.width = '256px';
    div.style.height = '256px';
    div.style.background = '#FFFFFF';
    img.style.opacity = '.9';
    img.src = 'http://www.washington.edu/maps/wp-content/themes/maps/tiles/' + zoom + '_' + coord.x + '_' + coord.y + '.png';
    img.onerror = function() {
        div.removeChild(img);
    }
    div.appendChild(img);
    return div;
};
