
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
            this_.taxHeader = $('#sus-map-info-window').find('.info-window-tax-header');
            this_.tax = $('#sus-map-info-window').find('.info-window-tax').hide();
            this_.image = $('#sus-map-info-window').find('.info-window-image');
            this_.imageBuilding = $('#sus-map-info-window').find('.info-window-image-building');
            this_.close = $('#sus-map-info-window').find('.info-window-close');
            this_.imageAnchor = {x: 22, y: -110};
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
        
        if (this.marker != this.Susmap.curMarker) {
            this_.div.hide()
        }
        
        this.Susmap.curMarker = this.marker;
        
        this.markerFocus(this.Susmap.curMarker);
        
        (function($) {
            
            this_.clearDiv();
            this_.div.fadeIn();
            
            this_.type = this_.Susmap.nodeData[this_.nid].type;
            this_.nType = this_.Susmap.nodeData[this_.nid].nType;
            this_.url = this_.Susmap.nodeData[this_.nid].url;
            this_.taxonomy = this_.Susmap.nodeData[this_.nid].taxonomy;
            this_.building = (this_.taxonomy.Building)?this_.taxonomy.Building[0]:null;
            var buildID = (this_.building) ? this_.Susmap.buildingDataByName[this_.building].nid : "";
            this_.subtitle.html(
                ((this_.nType=="Building")?"":(((this_.building)?(setLink(this_.building, buildID, "building")+" &raquo; "):"")))+
                ((this_.nType!="Building")?setLink(this_.type, this_.nType, "nType"):this_.nType)
            );
            this_.title.html(this_.Susmap.nodeData[this_.nid].title);
            this_.subtitle.find('.info-window-link-building').on("click", function() {this_.Susmap.hashManager.updateMap({infoWin:$(this).attr("action")});});
            this_.subtitle.find('.info-window-link-nType').on("click", function() {this_.Susmap.hashManager.updateMap({nodeSet:$(this).attr("action"), repeat:true});});
            
            
            if (this_.nType=="Building") {
                var susLoc = "Features <br />";
                this_.taxHeader.hide();
                var title = this_.Susmap.nodeData[this_.nid].title;
                var childNodes = this_.Susmap.buildingDataByName[title].childNodes;
                if (childNodes) {
                    $.each(childNodes.sort(iconCompare), function(k,v) {
                        v.jsName = "type:"+v.url.srcToNtype();
                        susLoc += Mustache.render($('#sus-map-building-nodes-template').html(), v);
                    });
                    susLoc += '<div class="c-b"></div>';
                }
                this_.content.html(susLoc);
                this_.content.find('.sus-map-building-childNode').on("click", function() {
                    var ob = {
                        infoWin:$(this).attr("action"),
                        nodeSet:$(this).attr("id"),
                        repeat:true
                    };
                    this_.Susmap.hashManager.updateMap(ob);
                });
            } else {
                var terms = "";
                this_.taxHeader.find('.tax-header-title').html("Related Content");
                $.each(this_.Susmap.nodeData[this_.nid].taxonomy, function(k,v) {
                    if (k != "Building") {
                        terms += k+"<br />";
                        $.each(v, function(key,val) {
                            var jsTax = "term:"+val.replace(/ /g, "");
                            terms += setLink(val, jsTax, "taxonomy")+"<br />";
                        });
                    }
                });
                this_.tax.html(terms).height(0);
                this_.tax.find('.info-window-link-taxonomy').on("click", function() {this_.Susmap.hashManager.updateMap({nodeSet:$(this).attr("action"), infoWin:"close"});});
                if (terms.length > 0) {
                    this_.taxHeader.find('.tax-header-title').on("click", function() {this_.toggleTax(this_)});
                } else {
                    this_.taxHeader.hide();
                }
                
                this_.content.html(this_.Susmap.nodeData[this_.nid].body);
                
                if (this_.url) {
                    this_.taxHeader.find('.info-url').show();
                    this_.taxHeader.find('.tax-header-url').show().attr("href", this_.url);
                }
            }
            
            if (this_.Susmap.nodeData[this_.nid].image) {
                var img = new Image();
                var imgDim = {w:img.width, h:img.height};
                img.src = "/sites/default/files/"+this_.Susmap.nodeData[this_.nid].image;
                this_.image.attr({src:img.src}).fadeIn();
                if (this_.nType=="Building")
                    this_.imageBuilding.attr({src:"/sites/default/files/"+this_.Susmap.nodeData[this_.nid].image}).show();
            }
            
            
            google.maps.event.addListener(this_.marker, 'visible_changed', function() {
                if (this_.div.is(':visible')) {
                    //return this_.Susmap.hashManager.updateMap({infoWin:"close"}, null);
                }
            });
            
            // attach infowindow link handles
            this_.div.find(".info-window-close").click(function(e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                this_.markerFade(this_.Susmap.curMarker);
                this_.Susmap.infoWindowStopProp = false;
                this_.Susmap.hashManager.updateMap({infoWin:"close"}, null);
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
    InfoWindow.prototype.toggleTax = function(self) {
        var this_ = this;
        (function($) {
            if (self.tax.is(':visible')) {
                self.tax.animate({height:"0px"}, 200, function() {
                    self.taxHeader.find('.sus-map-action-img').attr("src", self.Susmap.root+"css/images/plus.png");
                    $(this).hide()
                });
                self.taxHeader.find('.sus-map-floating-border').animate({top:"0px"}, 200);
            } else {
                self.tax.css("height", "auto");
                var h = self.tax.height();
                self.tax.height(0);
                self.taxHeader.find('.sus-map-action-img').attr("src", self.Susmap.root+"css/images/minus.png");
                self.tax.show().animate({height:h+"px"});
                
                h = self.taxHeader.height();
                self.taxHeader.find('.sus-map-floating-border').animate({top:h+3+"px"});
            }
        }(jQuery));
    }
    InfoWindow.prototype.focus = function() {
        var projection = this.getProjection();
        var point = projection.fromLatLngToDivPixel(this.latlng);
        var gPoint = new google.maps.Point(point.x+170, point.y+80);  
        var mapCenterLatLng = projection.fromDivPixelToLatLng(gPoint);
        this.map.panTo(mapCenterLatLng);
    }
    InfoWindow.prototype.onRemove = function() {
        var this_ = this;
        this_.markerFade(this_.Susmap.curMarker);
        this_.Susmap.infoWindowStopProp = false;
    }
    InfoWindow.prototype.clearDiv = function() {
        var this_ = this;
        (function($) {
            this_.div
                .find('.info-window-handle').off("click").parent()
            this_.title
                .html("");
            this_.subtitle
                .html("");
            this_.content
                .html(this_.loadIcon);
            this_.tax
                .html("")
                .hide();
            this_.taxHeader
                .show()
                .find('.tax-header-title').off('click').parent()
                .find('.sus-map-action-img').attr("src", this_.Susmap.root+"css/images/plus.png").parent()
                .find('.sus-map-floating-border').css({top:"0px"}).parent()
                .find('.info-url').hide();
            var emptyImg = {src:"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="};
            this_.image
                .attr(emptyImg)
                .hide();
            
            this_.imageBuilding
                .attr(emptyImg)
                .hide();
            var h = this_.content.find('.info-window-loader').parent().height();
            this_.content
                .find('.info-window-loader').css({top: h/2-16+"px"});
            this_.Susmap.infoWindowStopProp = false;
        }(jQuery));
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