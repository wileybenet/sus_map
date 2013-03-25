
function initInfoWindowNS() {
    InfoWindow = function(Susmap, m) {
        var this_ = this;
        (function($) {
            this_.Susmap = Susmap;
            this_.marker = m;
            this_.curMarker = null;
            this_.nid = m.nid;
            this_.loadIcon = '<img class="info-window-loader" src="'+this_.Susmap.root+'css/images/load-icon.gif" />';
            this_.div = $('#sus-map-info-window');
            this_.title = $('#sus-map-info-window').find('.info-window-title');
            this_.subtitle = $('#sus-map-info-window').find('.info-window-subtitle');
            this_.content = $('#sus-map-info-window').find('.info-window-content');
            this_.tax = $('#sus-map-info-window').find('.info-window-tax');
            this_.image = $('#sus-map-info-window').find('.info-window-image');
            this_.imageBuilding = $('#sus-map-info-window').find('.info-window-image-building');
            this_.close = $('#sus-map-info-window').find('.info-window-close');
            this_.imageAnchor = {x: 22, y: -150};
        }(jQuery));
    }
    InfoWindow.prototype = new google.maps.OverlayView();

    InfoWindow.prototype.open = function(map, point, id) {
        this.map = map;
        this.setMap(map);
        this.latlng = ( point.hasOwnProperty('x') ) ? this.getProjection().fromDivPixelToLatLng(point) : point;
    }
    InfoWindow.prototype.draw = function() {
        var pane = this.div;
        var overlayProjection = this.getProjection();
        var infowindowPosition = overlayProjection.fromLatLngToDivPixel(this.latlng);
        var dy = (this.nType == "Building")?20:0;
        pane.css({
        left: infowindowPosition.x + this.imageAnchor.x,
        top : infowindowPosition.y + this.imageAnchor.y + dy
        });
    }
    InfoWindow.prototype.onAdd = function() {
        var this_ = this;
        
        this.disableEvents();
        
        if (this.Susmap.curMarker) {
            this.markerFade(this.Susmap.curMarker);
        }
        
        this.Susmap.curMarker = this.marker;       
        
        this.markerFocus(this.Susmap.curMarker);
        
        (function($) {
            
            this_.clearDiv();
            
            this_.nType = this_.Susmap.nodeData[this_.nid].type;
            this_.taxonomy = this_.Susmap.nodeData[this_.nid].taxonomy;
            this_.building = (this_.taxonomy.Building)?this_.taxonomy.Building[0]:null;
            this_.subtitle.html(
                ((this_.nType=="Building")?"":(((this_.building)?(setLink(this_.building, "building")+" &raquo; "):"")))+
                ((this_.nType!="Building")?setLink(this_.nType, "info-nType"):this_.nType)
            );
            this_.title.html(this_.Susmap.nodeData[this_.nid].title);
            var terms = "";
            $.each(this_.Susmap.nodeData[this_.nid].taxonomy, function(k,v) {
                if (k != "Building") {
                    terms += k+"<br />";
                    $.each(v, function(key,val) {
                        terms += setLink(val, "taxonomy")+"<br />";
                    });
                }
            });
            if (this_.nType=="Building") {
                var title = this_.Susmap.nodeData[this_.nid].title;
                var childNodes = this_.Susmap.buildingDataByName[title].childNodes;
                if (childNodes) {
                    $.each(childNodes, function(k,v) {
                        terms += Mustache.render($('#sus-map-building-nodes-template').html(), v);
                    });
                }
                terms += '<div class="c-b"></div>';
            }
            this_.tax.html(terms);
            this_.content.html(this_.Susmap.nodeData[this_.nid].body);
            if (this_.Susmap.nodeData[this_.nid].image) {
                this_.image.attr({src:"/sites/default/files/"+this_.Susmap.nodeData[this_.nid].image}).fadeIn();
                if (this_.nType=="Building")
                    this_.imageBuilding.attr({src:"/sites/default/files/"+this_.Susmap.nodeData[this_.nid].image}).show();
            }
            google.maps.event.addListener(this_.marker, 'visible_changed', function() {
                if (this_.div.is(':visible')) {
                    return this_.onDivRemove();
                }
            });
            
            // attach infowindow link handles
            this_.div.find(".sus-map-link").click(function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                this_.handleLink($(this));
            });
            this_.div.find(".info-window-close").click(function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                return this_.onDivRemove();
            });
            this_.div.click(function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
            });
            
        }(jQuery));
        
        var panes = this.getPanes();
        panes.floatPane.appendChild(this.div.show().get(0)); 
        this.focus();
    }
    InfoWindow.prototype.focus = function() {
        var projection = this.getProjection();
        var point = projection.fromLatLngToDivPixel(this.latlng);
        var gPoint = new google.maps.Point(point.x+170, point.y-30);  
        var mapCenterLatLng = projection.fromDivPixelToLatLng(gPoint);
        this.map.panTo(mapCenterLatLng);
    }
    InfoWindow.prototype.onRemove = function() {
        var this_ = this;
        (function($) {
            this_.content.html("");
        }(jQuery));
    }
    InfoWindow.prototype.onDivRemove = function() {
        var this_ = this;
        this_.div.remove();
        this_.markerFade(this_.Susmap.curMarker);
        this.Susmap.hashManager.hashSelectNode(false);
        this_.Susmap.infoWindowStopProp = false;
        return false;
    }
    InfoWindow.prototype.clearDiv = function() {
        var this_ = this;
        (function($) {
            this_.title.html("");
            this_.subtitle.html("");
            this_.content.html(this_.loadIcon);
            this_.tax.html("");
            var emptyImg = {src:"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="};
            this_.image.attr(emptyImg).hide();
            this_.imageBuilding.attr(emptyImg).hide();
            var h = this_.content.find('.info-window-loader').parent().height();
            this_.content.find('.info-window-loader').css({top: h/2-16+"px"});
            this_.Susmap.infoWindowStopProp = false;
        }(jQuery));
    }
    InfoWindow.prototype.handleLink = function($div) {
        var this_ = this;
        var action = $div.attr("action");
        var nodeSet = $div.html().replace(/ /g, "").replace(/amp;/g, "");
        if (action == "info-nType") {
            (function($) {
                if ($('#sus-map-filter-deselect').hasClass("sus-map-filter-base-de-selected")) {
                    $('#sus-map-filter-deselect').click();
                }
                if (!$('#'+nodeSet).hasClass("sus-map-filter-base-selector-selected")) {
                    $('#'+nodeSet).click();
                }
            });
        } else if (action == "taxonomy") {
            //this_.Susmap.hashManager.hashSelectSet(false);
            (function($) {
                if ($('#sus-map-filter-deselect').hasClass("sus-map-filter-base-de-selected")) {
                    $('#sus-map-filter-deselect').click();
                }
            }(jQuery));
            this_.Susmap.hashManager.hashSelectSet($div.html().replace(/ /g, "").replace(/amp;/g, ""), true);
            this_.Susmap.setMarkerVisibility($div.html().replace(/ /g, "").replace(/amp;/g, ""), true);
        } else if (action == "building") {
            var nid = this_.Susmap.buildingDataByName[$div.html().replace(/amp;/g, "")].nid+"";
            var marker = this_.Susmap.markerFromNID(nid);
            var infoWindow = new InfoWindow(this_.Susmap, marker);
            this_.Susmap.openInfoWindow(infoWindow, marker);
            this_.Susmap.hashManager.hashSelectNode(nid);
        }
    }
    InfoWindow.prototype.markerFocus = function(marker) {
        var this_ = this;
        marker.setZIndex(250000);
    }
    InfoWindow.prototype.markerFade = function(marker) {
        var this_ = this;
        marker.setZIndex(marker.zReset);
    }
    InfoWindow.prototype.disableEvents = function() {
        // We want to cancel all the events so they do not go to the map
        var events = ['mousedown', 'mouseup',
            'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend', 'touchmove',
            'dblclick', 'contextmenu'];

        var div = this.div.get(0);
        this.listeners = [];
        for (var i = 0, event; event = events[i]; i++) {
            var listener = google.maps.event.addDomListener(div, event, function(e) {
                                e.cancelBubble = true;
                                if (e.stopPropagation) {
                                    e.stopPropagation();
                                }
                            });
            this.listeners.push(listener);
        }
    }
}