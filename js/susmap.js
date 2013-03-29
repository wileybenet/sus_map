
Susmap = function() {
    var this_ = this;

    this.styles = new PageStyles();

    this.root = Drupal.settings.sus_map.root;
    this.nodeData = jQuery.parseJSON(Drupal.settings.sus_map.nodeData);
    this.markerSet = [];
    
    this.infoWindow = [];
    this.infoWindowStopProp = false;
   
    this.markerTitle = jQuery('#sus-map-marker-title');
    this.markerTitle.content = jQuery('#sus-map-marker-title').find("span");
    this.nodeTypes = [];
    this.visMarkers = [];
    this.buildingDataByName = {};

    this.init();

    this.hashManager = new LocationHashManager(this_);

    this.renderMap();

    this.hashManager.loadInit();

    loadGoogleAnalytics();
};

Susmap.prototype.init = function() {
    var this_ = this;


    // create google map
    var myLatLng = new google.maps.LatLng(47.653851681095, -122.30780562698);
    var mapOptions = {
        center: myLatLng,
        panControl: false,
        zoom: 16,
        zoomControlOptions: {
                style:google.maps.ZoomControlStyle.SMALL
            },
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(document.getElementById("sus-map"), mapOptions);

    (function($) {

        var phpNodes = Drupal.settings.sus_map.nodes;
        $.each(phpNodes, function(k, val) {
            var key = (k+"").replace(/_/g, " ").toTitleCase().deleteZeros();
            this_.nodeTypes[key] = [];
        });

        // load node data into markers, json
        $.each(this_.nodeData, function(key, val) {
            (function () {                
                var nodeType = val.type;
                var readableNodeType = nodeType.substring(5).removeDash().toTitleCase().deleteZeros();
                var fileName = this_.addNodeCategory(nodeType);

                var marker;
                
                if (val.taxonomy) {
                    var bldg = val.taxonomy.Building;
                    if (bldg) {
                        if (!this_.buildingDataByName[bldg])
                            this_.buildingDataByName[bldg] = {};
                        if (readableNodeType != "Building") {
                            var ob = {nid:key, url:this_.root+"js/markers/"+fileName, name:val.title};
                            if (this_.buildingDataByName[bldg].childNodes) {
                                this_.buildingDataByName[bldg].childNodes.push(ob);
                            } else {
                                this_.buildingDataByName[bldg].childNodes = [ob];
                            }
                        }
                    }
                }

                if (readableNodeType == "Building") {
                    marker = this_.setBuildingMarker(key, val);
                    this_.buildingDataByName[bldg].nid = key;
                } else {

                    var z = 50-parseFloat(val.location.lat);
                    z = parseInt(z*100000);

                    marker = new google.maps.Marker({
                        position: new google.maps.LatLng(parseFloat(val.location.lat), parseFloat(val.location.lng)),
                        //title: val.title,
                        map: this_.map,
                        icon: this_.root+"js/markers/"+fileName,
                        shadow: this_.root+"js/markers/icon-shadow.png",
                        zIndex: z
                    });
                    marker.zReset = z;
                    google.maps.event.addListener(marker, 'mouseover', function(e, i) {
                        this_.openIconTitle(e, marker.nid, 22);
                    });
                    google.maps.event.addListener(marker, 'mouseout', function() {    
                        this_.markerTitle.hide();
                    });

                    // clear map
                    marker.setVisible(false);
                }

                this_.nodeData[key].type = readableNodeType;
                this_.nodeData[key].nType = readableNodeType.replace(/ /g, "");

                marker.nid = key;
                
                this_.markerSet.push(marker);

                // info window
                var infoWindow = new InfoWindow(this_, marker);
                google.maps.event.addListener(marker, 'click', function() {
                    this_.hashManager.hashSelectNode(marker.nid);
                    this_.openInfoWindow(infoWindow, marker);
                });

            }());
        });

        // Add marker filter to the DOM
        this_.filter = new Filter(this_.root);
        $('#sus-map-filter-box').append(this_.filter.HTML);

        this_.attachHandles();

    }(jQuery));
    initializeUWMap(this_);
}

Susmap.prototype.setBuildingMarker = function(key, val) {
    var this_ = this;

    var icon = {
        url: this_.root+"js/markers/building/building-icon.png",
        anchor: new google.maps.Point(20, 20)
    };
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(parseFloat(val.location.lat), parseFloat(val.location.lng)),
        //title: val.title,
        map: this_.map,
        icon: icon,
        flat: true,
        zIndex: 1000
    });
    marker.zReset = 1000;

    google.maps.event.addListener(marker, 'mouseover', function(e, i) {
        var icon = {
            url: this_.root+"js/markers/building/building-hover.png",
            anchor: new google.maps.Point(20, 20)
        };
        this_.openIconTitle(e, marker.nid);
        marker.setIcon(icon);
    });
    google.maps.event.addListener(marker, 'mouseout', function() {
        var icon = {
            url: this_.root+"js/markers/building/building-icon.png",
            anchor: new google.maps.Point(20, 20)
        };
        marker.setIcon(icon);
        
        this_.markerTitle.stop(true,true).fadeOut();
    });
    return marker;
}

Susmap.prototype.getPixelFromLatLng = function(e) {
    var this_ = this;
    
    var topRight = this_.map.getProjection().fromLatLngToPoint(this_.map.getBounds().getNorthEast()); 
    var bottomLeft = this_.map.getProjection().fromLatLngToPoint(this_.map.getBounds().getSouthWest()); 
    var scale = Math.pow(2,this_.map.getZoom()); 
    var worldPoint = this_.map.getProjection().fromLatLngToPoint(e.latLng); 
    var loc = new google.maps.Point((worldPoint.x-bottomLeft.x)*scale,(worldPoint.y-topRight.y)*scale);
    loc.x = Math.floor(loc.x);
    loc.y = Math.floor(loc.y);
    return loc;
}

Susmap.prototype.openIconTitle = function(e, nid, vOff) {
    var this_ = this;
    
    if (this_.infoWindowStopProp) {
        return false;
    }
    vOff = vOff || 0;
    var loc = this_.getPixelFromLatLng(e);
    
    var x = loc.x,
        y = loc.y;
    var left = this.map.getDiv().style.marginLeft.split(" ")[0].parseNum()+28+"px";
    
    this.markerTitle.content.html(this_.nodeData[nid].title);
    this.markerTitle.css({left:x, top:y, "margin-left":left, "margin-top":-15-vOff+"px"}).stop(true,true).fadeIn(250);
}

Susmap.prototype.openInfoWindow = function(infoWindow, marker) {
    var this_ = this;
    infoWindow.open(this_.map, marker.position);
}

Susmap.prototype.resetMarkerZs = function() {
    var this_ = this;
    (function($) {
        $.each(this_.visMarkers, function(k,v) {
            v.setZIndex(v.zReset);
        });
    }(jQuery));
}
Susmap.prototype.markerFromNID = function(nid) {
    var this_ = this;
    var marker;
    (function($) {
        $.each(this_.markerSet, function(k,v) {
            if (v.nid == nid) {
                marker = v;
            }
        });
    }(jQuery));
    return marker;
}
Susmap.prototype.addNodeCategory = function(name) {
    var this_ = this;
    name = name.replace(/_/g, '-').substr(5);
    var toReturn = "";
    (function($) {
        var icons = jQuery.parseJSON(Drupal.settings.sus_map.markerNames);
        $.each(icons, function(k,v) {
            if (v.indexOf(name) > -1) {
                toReturn = v;
                return false;
            }
        });
        }(jQuery));
    return toReturn;
}

Susmap.prototype.setMarkerVisibility = function(field, vis) {
    var this_ = this;
    (function ($) {
        $.each(this_.markerSet, function(key, val) {
            (function () {
                var marker = val;
                if (this_.isInSetField(marker.nid, field)) {
                    marker.setVisible(vis);
                    var index = $.inArray(marker, this_.visMarkers);
                    if (index > -1) {
                        this_.visMarkers.splice(index, 1);
                    } else {
                        this_.visMarkers.push(marker);
                    }
                }
            }());
        });
    }(jQuery));
}

Susmap.prototype.clearMarkers = function() {
    var this_ = this;
    jQuery.each(this_.visMarkers, function(k,v) {
        v.setVisible(false);
    });
    this.visMarkers = [];
}

Susmap.prototype.isInSetField = function(id, field) {
    var this_ = this;
    var vals = this_.nodeData[id];
    var ret = -1;
    if (vals.nType != "Building") {
        var fields = [vals.nType];
        (function ($) {
            $.each(vals.taxonomy, function(k,v) {
                if (v) {
                    if (k != "Building") {
                        $.each(v, function(key,val) {
                            fields.push(val.replace(/ /g, ""));
                        });
                    }
                }
            });
            ret =  $.inArray(field, fields);
        }(jQuery));
    }
    return ret >= 0;
}

Susmap.prototype.attachHandles = function() {
    var this_ = this;
    this.attachFilterHandles();
    this.attachInfoWindowHandles();
}
Susmap.prototype.attachInfoWindowHandles = function() {
    var this_ = this;
    (function($) {
        $(document).delegate("#sus-map-info-window", "mouseenter", function() {
            this_.infoWindowStopProp = true;
        });
        $(document).delegate("#sus-map-info-window", "mouseleave", function() {
            this_.infoWindowStopProp = false;
        });
        $(document).delegate(".tax-building", "click", function() {
            var building = $(this).text();
        });
        $(document).delegate(".filter-ntype", "click", function() {
            var nType = $(this).text().replace(/ /g, "");
            $('#'+nType).addClass("sus-map-filter-base-selector-selected");
            this_.setMarkerVisibility(nType, true);
            this_.hashManager.hashSelectSet(nType);
        });
        $(document).delegate(".info-window-tax-header", "click", function() {
            $('.info-window-tax').animate({height:"200px"});
        });
    }(jQuery));
}
Susmap.prototype.attachFilterHandles = function() {
    var this_ = this;
    (function($) {
        $(document).delegate('.sus-map-filter-base-selector, .sus-map-filter-base-selector-selected', 'click', function() {
            if ($(this).hasClass('sus-map-filter-base-selector-selected')) {
                $(this).removeClass('sus-map-filter-base-selector-selected');
                if ($('.sus-map-filter-base-selector-selected').length == 0) {
                    $('#sus-map-filter-deselect').removeClass('sus-map-filter-base-de-selected');
                    $('#sus-map-filter-deselect').attr("title", "Select All Items");
                    $('#deselect-x-img').hide();
                }
                this_.setMarkerVisibility($(this).attr("id"), false);
            } else {
                $(this).addClass('sus-map-filter-base-selector-selected');
                $('#sus-map-filter-deselect').addClass('sus-map-filter-base-de-selected');
                $('#sus-map-filter-deselect').attr("title", "Deselect All Items");
                $('#deselect-x-img').show();
                this_.setMarkerVisibility($(this).attr("id"), true);
            }
            this_.hashManager.hashSelectSet($(this).attr("id"));
        });
        $(document).delegate('.sus-map-filter-base-selector', 'mouseenter', function() {
            var off = $(this).offset();
            var title = $(this).find("img").attr("alt");
            $('#sus-map-filter-base-title').html(title);
            $('#sus-map-filter-base-title').stop(true,true).css({left:off.left+"px", top:off.top+"px"}).show();
        });
        $(document).delegate('.sus-map-filter-base-selector', 'mouseleave', function() {
            $('#sus-map-filter-base-title').stop(true).hide();
        });

        $(document).delegate('#sus-map-filter-deselect', 'click', function() {
            if ($(this).hasClass('sus-map-filter-base-de-selected')) {
                $('.sus-map-filter-base-selector-selected').each(function(k,v) {
                    this_.setMarkerVisibility($(this).attr("id"), false);
                    this_.hashManager.hashSelectSet($(this).attr("id"));
                });
                $('.sus-map-filter-base-selector').removeClass('sus-map-filter-base-selector-selected');
                $('#sus-map-filter-deselect').removeClass('sus-map-filter-base-de-selected');
                $('#sus-map-filter-deselect').attr("title", "Select All Items");
                $('#deselect-x-img').hide();
            } else {
                $('.sus-map-filter-base-selector').click();
            }
        });
    }(jQuery));
}

Susmap.prototype.renderMap = function() {
    var this_ = this;

    (function($) {
        google.maps.event.trigger(this_.map, 'resize');
        $('#sus-map-load-bar').animate({width:"100%"}, 1, function() {
            $('.screen-overlay').fadeOut(function(){$(this).remove()});
            var gmw = $(window).width();
            $('#sus-map').width(gmw);
            $(window).resize();
        });
    }(jQuery));
}

var MAP;
jQuery(document).ready(function($) {
    $('body').html('<div id="map-container"></div>');
    $('#map-container').html('<div id="sus-map"></div>');
    initInfoWindowNS();
    addTemplatesToDOM();
    MAP = new Susmap();
});