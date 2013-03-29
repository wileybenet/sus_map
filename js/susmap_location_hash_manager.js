
LocationHashManager = function(Susmap) {
    var this_ = this;
    this_.mainDelim = "@";
    
    this.Susmap = Susmap;
    this.nodeSet = [];
    this.node = 0;
    this.init();
}
LocationHashManager.prototype.init = function() {
    var this_ = this;
    var hash = window.location.hash.replace(/#/g, "");
    hash = hash.split(this_.mainDelim);
    var nodeSet = hash[0];
    if (hash[1]) var node = hash[1];

    if (nodeSet != "") {
        this.nodeSet = nodeSet.split("+");
    }
    if (node != "") {
        this.node = (node)?parseInt(node):null;
    }
}

LocationHashManager.prototype.loadInit = function() {
    var this_ = this;
    if (this.nodeSet) {
        for (var i = 0;i < this_.nodeSet.length; i++) {
            (function($) {
                $('#'+this_.nodeSet[i]).addClass('sus-map-filter-base-selector-selected');
                $('#sus-map-filter-deselect').addClass('sus-map-filter-base-de-selected');
                $('#sus-map-filter-deselect').attr("title", "Deselect All Items");
                $('#deselect-x-img').show();
                this_.Susmap.setMarkerVisibility(this_.nodeSet[i], true);
            }(jQuery));
        }
    }
    if (this.node) {
        (function($) {
            $.each(this_.Susmap.markerSet, function(k,v) {
                if (v.nid == this_.node) {
                    var infoWindow = new InfoWindow(this_.Susmap, v);
                    this_.Susmap.openInfoWindow(infoWindow, v);
                }
            });
        }(jQuery));
    }
}

LocationHashManager.prototype.hashSelectNode = function(nid) {
    var this_ = this;
    this.node = nid;
    this.updateArray();
}

LocationHashManager.prototype.hashSelectSet = function(nodeGroup, doNotRemove) {
    var this_ = this;
    if (nodeGroup) {
        (function($) {
            var index = $.inArray(nodeGroup, this_.nodeSet);
            if (index >= 0) {
                if (!doNotRemove) {
                    this_.nodeSet.splice(index, 1);
                }
            } else {
                if (this_.nodeSet.length > 0) {
                    this_.nodeSet.push(nodeGroup);
                } else {
                    this_.nodeSet[0] = nodeGroup;
                }
            }
        }(jQuery));  
    } else {
        this.nodeSet = [];
    }
    this.Susmap.resetMarkerZs();
    this.updateArray();
}

LocationHashManager.prototype.updateArray = function() {
    var this_ = this;

    var nodeSet = "";
    if (this.nodeSet) {
        (function($) {
            $.each(this_.nodeSet, function(k,v) {
                nodeSet += v+"+";
            });
            nodeSet = nodeSet.substr(0,nodeSet.length-1);
        }(jQuery));
    }
    var array = nodeSet+((this.node)?(this_.mainDelim+this.node):"");
    window.location.hash = array;
}