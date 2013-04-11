
Susmap = function() {
    var this_ = this;

    this.styles = new PageStyles();
    this.hashManager = new LocationHashManager(this_);

    this.root = Drupal.settings.sus_map.root;
    this.nodeData = jQuery.parseJSON(Drupal.settings.sus_map.nodeData);
    this.markerSet = [];
    
    this.infoWindow = [];
    this.infoWindowStopProp = false;
   
    this.markerTitle = jQuery('#sus-map-marker-title');
    this.markerTitle.content = jQuery('#sus-map-marker-title').find("span");
    this.jsNodeTypes = [];
    this.visMarkers = [];
    this.buildingDataByName = {};
    
    this.searchable = {};
    this.searchable.titles = [];
    this.searchable.nidsByTitle = {};
    
    this.nidsByNtype = {};
    this.nidsByTaxTerm = {};
    this.taxTermsByJSName = {};
    
    this.filterData = [
                    {catTitle:"Built Environment",
                        catCheckbox:"BuiltEnvironment",
                        nodeTypes:[]
                    },
                    {catTitle:"Environmental Office",
                        catCheckbox:"EnvironmentalOffice",
                        nodeTypes:[]
                    },
                    {catTitle:"Natural Environment",
                        catCheckbox:"NaturalEnvironment",
                        nodeTypes:[]
                    },
                    {catTitle:"Sustainable Dining",
                        catCheckbox:"SustainableDining",
                        nodeTypes:[]
                    },
                    {catTitle:"Transportation",
                        catCheckbox:"Transportation",
                        nodeTypes:[]
                    },
                    {catTitle:"Waste Management",
                        catCheckbox:"WasteManagement",
                        nodeTypes:[]
                    }
                ];

    this.init();

    this.renderMap();

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
            var jsName = "type:"+key.replace(/ /g, "");
            this_.jsNodeTypes.push(jsName);
            
            var nodeDat = this_.addNodeCategory(k);
            if (nodeDat.catID) 
                this_.filterData[nodeDat.catID-1].nodeTypes.push({
                                                                name:key, 
                                                                jsName:jsName, 
                                                                url:this_.root+'/js/markers/'+nodeDat.url
                                                            });
        });

        // load node data into markers, json
        $.each(this_.nodeData, function(key, val) {
            (function () {
                
                if ($.inArray(val.title, this_.searchable.titles) == -1) {
                    this_.searchable.titles.push(val.title);
                }
                if (this_.searchable.nidsByTitle[val.title]) {
                    this_.searchable.nidsByTitle[val.title].push(key);
                } else {
                    this_.searchable.nidsByTitle[val.title] = [key];
                }
                
                var nodeType = val.type;
                var readableNodeType = nodeType.substring(5).removeDash().toTitleCase().deleteZeros();
                var jsNodeType = "type:"+readableNodeType.replace(/ /g, "");
                var fileData = this_.addNodeCategory(nodeType.substr(5));
                var fileName = fileData.url;
                
                if (!this_.nidsByNtype[jsNodeType]) {
                    this_.nidsByNtype[jsNodeType] = [key];
                } else {
                    this_.nidsByNtype[jsNodeType].push(key)
                }
                
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
                    
                    $.each(val.taxonomy, function(k,v) {
                        if (k != "Building") {
                            $.each(v, function(kk,vv) {
                                var jsName = "term:"+vv.replace(/ /g, "");
                                if (!this_.nidsByTaxTerm[jsName]) {
                                    this_.nidsByTaxTerm[jsName] = [key];
                                    this_.taxTermsByJSName[jsName] = vv;
                                } else {
                                    this_.nidsByTaxTerm[jsName].push(key)
                                }
                            });
                        }
                    });
                    
                }

                if (readableNodeType == "Building") {
                    this_.nodeData[key].type = readableNodeType;
                    this_.nodeData[key].nType = readableNodeType;
                    marker = this_.setBuildingMarker(key, val);
                    this_.buildingDataByName[bldg].nid = key;
                } else {
                    this_.nodeData[key].type = readableNodeType;
                    this_.nodeData[key].nType = jsNodeType;
                    marker = this_.setMarker(key, val, fileName);
                    
                }

                marker.nid = key;
                
                this_.markerSet.push(marker);

                // info window
                var infoWindow = new InfoWindow(this_, marker);
                google.maps.event.addListener(marker, 'click', function() {
                    this_.openInfoWindow(infoWindow, marker);
                });
                
                this_.nodeData[key].marker = marker;
                this_.nodeData[key].infoWin = infoWindow;
                
            }());
        });
    }(jQuery));
    
    
    
    this.filter = new Filter(this_);
        this.filter.addToDOM();
    this.attachHandles();    
    initializeUWMap(this_);
    this.hashManager.updateMap(null, true, true);
}

Susmap.prototype.setMarker = function(key, val, fileName) {
    var this_ = this;
    
    var z = 50-parseFloat(val.location.lat);
    z = parseInt(z*100000);

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(parseFloat(val.location.lat), parseFloat(val.location.lng)),
        map: this_.map,
        icon: this_.root+"js/markers/"+fileName,
        shadow: this_.root+"js/markers/icon-shadow.png",
        visible: false,
        zIndex: z
    });
    marker.zReset = z;
    google.maps.event.addListener(marker, 'mouseover', function(e, i) {
        this_.openIconTitle(e, marker.nid, 22);
    });
    google.maps.event.addListener(marker, 'mouseout', function() {    
        this_.markerTitle.hide();
    });

    return marker;
}

Susmap.prototype.setBuildingMarker = function(key, val) {
    var this_ = this;

    var icon = {
        url: this_.root+"js/markers/building/building-icon.png",
        anchor: new google.maps.Point(20, 20)
    };
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(parseFloat(val.location.lat), parseFloat(val.location.lng)),
        map: this_.map,
        icon: icon,
        flat: true,
        zIndex: 1000
    });
    marker.zReset = 1000;

    google.maps.event.addListener(marker, 'mouseover', function(e, i) {
        if (this_.infoWindowStopProp) {
            return false;
        }
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
        
        this_.markerTitle.stop(true,true).hide();
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
    var left = this.map.getDiv().style.marginLeft.split(" ")[0].parseNum()+30+"px";
    
    this.markerTitle.content.html(this_.nodeData[nid].title);
    this.markerTitle.css({left:x, top:y, "margin-left":left, "margin-top":-15-vOff+"px"}).stop(true,true).fadeIn(250);
}

Susmap.prototype.openInfoWindow = function(infoWindow, marker, noUpdate) {
    var this_ = this;
    if (!noUpdate) {
        this.hashManager.updateMap({infoWin:marker.nid});
    }
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
    name = name.replace(/_/g, '-');
    var url = "";
    (function($) {
        var icons = jQuery.parseJSON(Drupal.settings.sus_map.markerNames);
        $.each(icons, function(k,v) {
            if (v.indexOf(name) > -1) {
                url = v;
                return false;
            }
        });
        }(jQuery));
    return {url:url, catID:url.substr(0, 1).parseNum()};
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
    this.attachInfoWindowHandles();
    this.attachWindowHandles();
}
Susmap.prototype.attachInfoWindowHandles = function() {
    var this_ = this;
    (function($) {
        $(document).delegate("#sus-map-info-window", "mouseenter mousemove", function() {
            this_.infoWindowStopProp = true;
        });
        $(document).delegate("#sus-map-info-window", "mouseleave", function() {
            this_.infoWindowStopProp = false;
        });
    }(jQuery));
}

Susmap.prototype.attachWindowHandles = function() {
    var this_ = this;
    
    (function($) {
        $(window).on("resize", function() {
            google.maps.event.trigger(this_.map, 'resize');
            if ($(this_.map.getDiv()).width() < 700) {
                this_.filter.container.stop(true, true).animate({right:"-240px"}, function() {
                    $(this).hide();
                });
            } else {
                this_.filter.container.stop(true, true).show().animate({right:"-8px"});
            }
        });
    }(jQuery));
}

Susmap.prototype.renderMap = function() {
    var this_ = this;
    
    google.maps.event.addListener(this_.map, "zoom_changed", function() {
        console.log(this_.map.getZoom());
    });

    (function($) {
        google.maps.event.trigger(this_.map, 'resize');
        $(window).resize();
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
    setTimeout(function() {
        MAP.filter.loadIcons();
    }, 1000);
});