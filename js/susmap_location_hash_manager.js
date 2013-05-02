
LocationHashManager = function(Susmap) {
    var this_ = this;
    
    this.priDelim = "@";
    this.secDelim = "+";
    
    (function($) {
        $(window).on('hashchange', function() {
            this_.updateMap(null, true);
        });
    }(jQuery));
    
    this.Susmap = Susmap;
    this.nodeSets = new Array();
    this.nodeIDs = new Array();
    this.infoWin = 0;
    
    this.curSet = "";
    
    this.node = 0;
    
    this.curNidArray = [];
    this.curInfoWin = null;
}
LocationHashManager.prototype.updateMap = function(sendData, gett, init) {
    var this_ = this;
    
    var hashDat = this.getHASH();
    this.nodeSets = hashDat.nodeSets;
    this.infoWin = hashDat.infoWin;
    
    if (init) {
        if (this.nodeSets.length > 0) {
            this.curSet = this.nodeSets[0].getType();
        }
    }
    
    if (gett) { // get data from w.l.hash
        if (this.nodeSets.length > 0 || this.curNidArray.length > 0) {
            this.ifSetTypeChange(this.nodeSets);
            this.updateNids = this.HASHtoJSON(this.nodeSets);
            this.curSet = this.getCurNodeCollectionType(this.nodeSets.concat(this.curNidArray));
            this.Susmap.filter.update(this.nodeSets, this.updateNids.vis, this.curSet);
            var markers = this.setMarkerVis(this.updateNids.vals, this.updateNids.vis);
            this.fitMapToNewNodes(markers, (this.infoWin != "clear" && this.infoWin), this.updateNids.vis);
        }
        if (this.infoWin) {
            var node = this.Susmap.nodeData[this.infoWin];
            this.Susmap.openInfoWindow(node.infoWin, node.marker, true);
            this.curInfoWin = node;
        } else if (this.curInfoWin) {
            this.curInfoWin.infoWin.div.remove();
            this_.Susmap.infoWindowStopProp = false;
        } else {
            this_.Susmap.infoWindowStopProp = false;
        }
    } else { // send data to w.l.hash
        var sets;
        var infoWin;
        if (sendData.nodeSet == "clear") {
            infoWin = sets = "";
        } else {
            var gen = this.genHASH(sendData);
            //console.log(this.HASHtoJSON(gen.nodeSets));
            sets = (gen.nodeSets) ? gen.nodeSets.join(this.secDelim) : "";
            infoWin = (gen.infoWin) ? this.priDelim+gen.infoWin : "";
        }
        window.location.hash = sets+infoWin;        
    }
}
LocationHashManager.prototype.getCurNodeCollectionType = function(sets) {
    var this_ = this;
    
    var curSet;
    if (sets.length > 0) {
        curSet = sets[0].split(":")[0];
    } else {
        curSet = "";
    }
    
    return curSet;
}
LocationHashManager.prototype.getHASH = function() {
    var this_ = this;
    this.nidArray = [];
    
    var hash = window.location.hash.replace(/#/g, "");
    hash = hash.split(this_.priDelim);
    
    var infoWin = hash[1];
    this.infoWin = infoWin;
    
    var nodeSets = hash[0];
    if (nodeSets) {
        nodeSets = nodeSets.split(this_.secDelim);
    }
    return {"nodeSets": nodeSets, "infoWin": infoWin};
}
LocationHashManager.prototype.genHASH = function(data) {
    var this_ = this;
    
    var gen = {nodeSets:this_.nodeSets, infoWin:this_.infoWin};
    
    if (data.nodeSet) {
        (function($) {       
            
            var nextSet = data.nodeSet.getType();
            if (nextSet != this_.curSet && this_.curSet != "") {
                gen.nodeSets = [];
            }
            
            var index = $.inArray(data.nodeSet, gen.nodeSets)
            if (index > -1) {
                if (!data.repeat) {
                    this_.nodeSets.splice(index, 1);
                }
            } else {
                if (gen.nodeSets) {
                    gen.nodeSets.push(data.nodeSet);
                } else {
                    gen.nodeSets = [data.nodeSet];
                }
           }
        }(jQuery));
    }
    if (data.infoWin) {
        if (data.infoWin == "close") {
            gen.infoWin = null;
        } else {
            gen.infoWin = data.infoWin;
        }
    }
    return gen;
}
LocationHashManager.prototype.ifSetTypeChange = function(data, clear) {
    var this_ = this;
    
    if (data.length > 0) {
        var nextSet = data[0].getType();

        if (nextSet != this.curSet && this.curSet != "") {
            jQuery.each(this_.curNidArray, function(k,v) {
                this_.Susmap.nodeData[v].marker.setVisible(false);
            });
            this.curNidArray = [];
        }
    }
}
LocationHashManager.prototype.HASHtoJSON = function(nodeSets) {
    var this_ = this;
    
    var nidArray = [];
    var ob = {};
    (function($) {
        var sets = [this_.Susmap.nidsByNtype, this_.Susmap.nidsByTaxTerm];
        if (nodeSets) {
            $.each(sets, function(kk,vv) {
                $.each(nodeSets, function(k,v) {
                    $.each(vv, function(key, val) {
                        if (key == v) {
                            nidArray = nidArray.concat(val);
                        }
                    });
                });
            });
        }
        var arr = [];
        if (this_.curNidArray.length > nidArray.length) {                       // hide nodes
            arr = $.grep(this_.curNidArray, function(el){return $.inArray(el, nidArray) == -1});
            ob = {vals:arr, vis: false};
            
        } else {                                                                // show nodes
            arr = $.grep(nidArray, function(el){return $.inArray(el, this_.curNidArray) == -1});
            ob = {vals:arr, vis: true};
        }
    }(jQuery));
    
    this_.curNidArray = nidArray;
    return ob;
}
LocationHashManager.prototype.setMarkerVis = function(nidArray, vis) {
    var this_ = this;
    var nodes = this.Susmap.nodeData;
    var markers = [];
    (function($) {
        $.each(nidArray, function(k, v) {
            markers.push(nodes[v]);
            nodes[v].marker.setVisible(vis);
        });
    }(jQuery));
    return markers;
}
LocationHashManager.prototype.fitMapToNewNodes = function(markers, infoWin, load) {
    var this_ = this;
    var map = this.Susmap.map;
    if (load) {
        if (!infoWin) {
            if (markers.length > 0) {
                var latlng;
                if (markers.length == 1) {
                    var lat = markers[0].location.lat;
                    var lng = markers[0].location.lng;
                    latlng = new google.maps.LatLng(lat, lng);
                } else {
                    var bounds = new google.maps.LatLngBounds();
                    for (var index in markers) {
                        if (markers[index].location) {
                            var lat = markers[index].location.lat;
                            var lng = markers[index].location.lng;
                            latlng = new google.maps.LatLng(lat, lng);
                            bounds.extend(latlng);
                        }
                    }
                    latlng = bounds.getCenter();
                }
                map.setZoom(16);
                map.panTo(latlng);
            }
        }
    }
}