
function initFilterNS() {
    Filter = function(root) {
        this.baseTemplate = '<div class="sus-map-filter-base-selector" id="{{id}}"><img class="sus-map-filter-base-img" src="{{path}}" alt="{{marker}}" /></div>';
        var HTMLString = this.HTML;
        this.HTML = "";
        this.ob = {};
        var that = this;
        (function($) {
            var grps = [null, true, true, true, true, true, true];
            that.markers = jQuery.parseJSON(Drupal.settings.sus_map.markerNames);
            that.markers.sort();
            that.HTML += "<div>";
            $.each(that.markers, function(k, v) {
                var tail = v.substring(v.length-9);
                if (tail == "-icon.png") {
                    if (grps[parseInt(v.substring(0,1))]) {
                        grps[parseInt(v.substring(0,1))] = false;
                        that.HTML += '<div class="c-b"></div></div><div class="sus-map-filter-group" id="sus-map-filter-group-'+v.substring(0,1)+'">';
                    }
                    var marker = v.substring(1, v.length-9);
                    var ob = {};
                    ob.marker = marker.removeDash().toTitleCase().deleteZeros();
                    ob.id = ob.marker.replace(/ /g, "");
                    ob.path = "/"+root+"js/markers/"+v;
                    that.HTML += Mustache.render(that.baseTemplate, ob);
                }
            });
            that.HTML += '<div class="c-b"></div></div><div id="sus-map-filter-base-title"></div>';
        }(jQuery));
    }
}

