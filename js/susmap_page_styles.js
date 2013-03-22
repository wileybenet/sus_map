
PageStyles = function() {
    var this_ = this;

    this.renderLoadingScreen();

    this.setMapResize();

    this.renderSusmapOverlays();

    this.renderMap();
}

PageStyles.prototype.renderLoadingScreen = function() {
    var this_ = this;
    (function($) {
        // Loading overlay screen
        $('body').append('<div class="screen-overlay"><img id=sus-map-splash /></div>');
        $('.screen-overlay').append('<div id="sus-map-load-box"><div id="sus-map-load-bar"></div></div>');
        var root = Drupal.settings.sus_map.root;
        $('#sus-map-splash').attr("src", root+"css/images/ess_logo_splash.jpg");
        $('#sus-map-loader').attr("src", root+"css/images/load-icon.gif");

        $('#sus-map-load-bar').animate({width:"45%"},1);
    }(jQuery));
}

PageStyles.prototype.renderMap = function() {
    var this_ = this;
    (function($) {
        $('#map-container').css({
            position: "fixed",
            top: "0px",
            left: "0px",
            width: $(window).width()+"px",
            height: $(window).height()+"px"
        });
        var left = 106;
        $('#sus-map').css({
            margin: "0 0 0 "+left+"px",
            width: $(window).width()-left+"px",
            height: $(window).height()+"px"
        });
    }(jQuery));

}

PageStyles.prototype.renderSusmapOverlays = function() {
    var this_ = this;
    (function($) {
        var root = Drupal.settings.sus_map.root;
        $('body').append('<a href="http://green.washington.edu" title="The Office of Environmental Stewardship and Sustainability" id="sus-map-logo-text"></a>');
        $('body').append('<div id="sus-map-col"><div id="sus-map-filter-box"><div id="sus-map-filter-deselect" class="sus-map-filter-base-de" title="Select All Items"><img id="deselect-x-img" src="/'+Drupal.settings.sus_map.root+"css/images/"+'x2.png" /></div></div></div>');
        $('#sus-map-col').append('<a href="http://green.washington.edu" title="The Office of Environmental Stewardship and Sustainability" id="sus-map-logo"></a>');

        $('body').append('<div id="sus-map-info-window"></div>');
            $('#sus-map-info-window').append('<img class="info-window-icon-frame" />');
            $('#sus-map-info-window').append('<img class="info-window-image-building" />');
            $('#sus-map-info-window').append('<div class="info-window-image-building-occlude"></div>');
            $('#sus-map-info-window').append('<img class="info-window-close" />');
            $('#sus-map-info-window').append('<div class="info-window-subtitle"></div>');
            $('#sus-map-info-window').append('<div class="info-window-title"></div>');
            $('#sus-map-info-window').append('<div class="info-window-lcol"></div>');
                $('.info-window-lcol').append('<div class="info-window-tax"></div>');
                $('.info-window-lcol').append('<div class="info-window-content"></div>');
            $('#sus-map-info-window').append('<div class="info-window-rcol"></div>');
                $('.info-window-rcol').append('<img class="info-window-image" />');
            $('#sus-map-info-window').append('<div style="clear:both"></div>');
                $('.info-window-icon-frame').attr("src", root+"css/images/icon_frame.png");
                $('.info-window-close').attr("src", root+"css/images/x.png");
    }(jQuery));
}

PageStyles.prototype.setMapResize = function() {
    var this_ = this;
    (function($) {
        $(window).resize(function() {
            this_.renderMap();
            var h = $(window).height();
            $('#map-container').css("height", h-1+"px");
        });
    }(jQuery));
}
