//if(!google.maps.Polygon.getPosition) {
//    google.maps.Polygon.prototype.getPosition = function() {
//        var bounds = new google.maps.LatLngBounds();
//        var path = this.getPath();
//        path.forEach(function(el, i) {
//            bounds.extend(el);
//        });
//        return bounds.getCenter();
//    }
//}

///** UW InfoWindow **/
//function UWInfoWindow() {
//  var this_ = this
//  this.div = $('#google-info-window')
//  this.imageAnchor = {x: -378, y: -360}; 
//  $('body').on( 'click touchend', '#closeWindow', function() {
//    this_.div.remove() 
//    return false;
//  }).on('click', '#feedback', function() {
//    this_.div.removeClass('shareWindow').toggleClass('feedbackWindow') 
//    $(this).siblings().not('#infowindow_print').removeClass()
//    $(this).toggleClass('close'+this.id)
//    return false;
//  }).on('click', '#share', function() {
//    this_.div.removeClass('feedbackWindow').toggleClass('shareWindow') 
//    $(this).siblings().not('#infowindow_print').removeClass()
//    $(this).toggleClass('close'+this.id)
//    return false;
//  })
//}
//UWInfoWindow.prototype = new google.maps.OverlayView();
//UWInfoWindow.prototype.embedCode_ = function() {
//  return '<iframe width="450" height="375" src="http://uw.edu/maps/embed/?place=' + this.wpid + '" frameborder="0"></iframe>';
//}
//
//UWInfoWindow.prototype.open = function(map, point, id) {
//    this.map = map
//    this.wpid = id
//    this.setMap(map);
//    this.latlng = ( point.hasOwnProperty('x') ) ? this.getProjection().fromDivPixelToLatLng(point) : point;
//}
//UWInfoWindow.prototype.draw= function() {
//  var pane = this.div
//    , overlayProjection = this.getProjection()
//    , infowindowPosition = overlayProjection.fromLatLngToDivPixel(this.latlng);
//    pane.css({
//      left: infowindowPosition.x + this.imageAnchor.x,
//      top : infowindowPosition.y + this.imageAnchor.y 
//    })
//}
//UWInfoWindow.prototype.onAdd = function() {
//
//    this.disableEvents()
//    this.div.hide()
//    var this_ = this
//
//    var data = {
//      json:'campusmap.get_infowindow',
//      id: this.wpid
//    }
//    $.getJSON('', data, function(json) {
//      var post = json.posts;
//
//      this_.wpcode = post.code
//      this_.div.find('h2').html(post.title)
//      this_.div.find('#share-url').val('http://uw.edu/maps/?'+post.code)
//      this_.div.find('#scrollText').html(post.content)
//      this_.div.find('#infowindow_print').attr('href', 'http://uw.edu/maps/print/?place='+this_.wpid)
//      this_.div.find('#embedcode ').text(this_.embedCode_())
//      this_.div.find('#window-comment').val(this_.wpid)
//      if ( post.image )
//        this_.div.find('#infoImage').attr('src', post.image)
//    })
//    var panes = this.getPanes();
//    panes.floatPane.appendChild(this.div.fadeIn().get(0)); 
//    this.focus();
//}
//
//UWInfoWindow.prototype.focus = function() {
//    var projection = this.getProjection();
//    var point = projection.fromLatLngToDivPixel(this.latlng);
//    var gPoint = new google.maps.Point(point.x, point.y-190);  
//    var mapCenterLatLng = projection.fromDivPixelToLatLng(gPoint);
//    this.map.panTo(mapCenterLatLng);
//};
//
//UWInfoWindow.prototype.onRemove = function() {
//    var img = this.div.find('#infoImage')
//      this.div.removeClass()
//    this.div.find('h2').html('')
//    this.div.find('#share-url').val('')
//    this.div.find('#scrollText').html('')
//    this.div.find('#share, #feedback').removeClass()
//    img.attr('src', img.data('src'))
//}
//UWInfoWindow.prototype.disableEvents = function() {
//  // We want to cancel all the events so they do not go to the map
//  var events = ['mousedown', 'mouseover', 'mouseout', 'mouseup',
//      'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchend', 'touchmove',
//      'dblclick', 'contextmenu'];
//
//  var div = this.div.get(0);
//  this.listeners = [];
//  for (var i = 0, event; event = events[i]; i++) {
//    this.listeners.push(
//      google.maps.event.addDomListener(div, event, function(e) {
//        e.cancelBubble = true;
//        if (e.stopPropagation) {
//          e.stopPropagation();
//        }
//      })
//    );
//  }
//};
//
//
///** Circles Overlay **/
//function Circles( options ) {
//    this.setValues( options );
//    this.markerLayer = $('<div class="overlay"/>').css('zIndex',1000);
//}
//Circles.prototype = new google.maps.OverlayView;
//Circles.prototype.divs = [];
//Circles.prototype.buildingCache = [];
//
//Circles.prototype.onAdd = function() {
//    var $pane = $(this.getPanes().overlayMouseTarget);
//    $pane.append( this.markerLayer );
//};
//Circles.prototype.onRemove = function() {
//    this.markerLayer.remove();
//};
//Circles.prototype.draw = function() {
//    var projection = this.getProjection(),
//        fragment   = document.createDocumentFragment(),
//        buildings  = this.buildings,
//        i          = buildings.length;
//
//    this.markerLayer.empty();
//
//    if ( this.getMap().getZoom() < 14 ) 
//        return;
//
//
//    while(i--) {
//        var building = buildings[i];
//        var radius = building.rad;
//
//        if(this.divs[i] == undefined) {
//
//            var ne = new google.maps.LatLng ( building.lat, building.lng );
//
//            var center = projection.fromLatLngToDivPixel( ne );
//            var relocateUp = new google.maps.Point(center.x - radius, center.y - radius);
//            var relocateLeft = new google.maps.Point((center.x - radius) + 2 * radius, center.y- radius);
//
//            var newposUp = projection.fromDivPixelToLatLng( relocateUp );
//            var newposLeft = projection.fromDivPixelToLatLng( relocateLeft );
//
//            var bounds = [newposUp, newposLeft];
//
//            this.buildingCache[building.code] = [building.id, building.title, building.code || null, ne] ;
//
//        } else {
//            var bounds = this.divs[i];
//        }
//
//        var topleft = projection.fromLatLngToDivPixel( bounds[0] );
//        var topright = projection.fromLatLngToDivPixel( bounds[1] );
//
//        var width = topright.x - topleft.x;
//
//        var div = $('<div class="map-point" />').attr({
//            id: building.code,
//            title: building.title
//        }).css({
//          left: topleft.x,
//          top : topleft.y,
//          width : width,
//          height: width,
//          position: 'absolute',
//          cursor: 'pointer'
//        }).data('id', building.id)
//
//        fragment.appendChild(div.get(0)); 
//        this.divs[i] = bounds;
//    }
//    this.markerLayer.append(fragment);
//
//    // appending the document fragment lowers the iPhone
//    // url bar, so we need to hide it again here
//    setTimeout(function(){
//      window.scrollTo(0, 1);
//      $('#map_canvas').height($(window).height()+60)
//    }, 0);
//
//    if (typeof initial_location === "string") {
//        
//      var init_building = $('#'+initial_location);
//      if ( init_building.is('*') ) {
//        init_building.trigger('initial.building')
//      } else {
//        // initial parking lots 
//        $.getJSON('', { json:'campusmap.get_initial_location', code:initial_location }, function(data) {
//          if ( data.status !== 'ok')
//            return;
//          
//          $('#parking').data('initial',data.posts.id)
//            .prop('checked',true)
//            .trigger('change')
//        });
//      }
//    }
//
//          
//};



function initializeUWMap(susmap) {
  (function ($) {
  // make the map tall enough for hiding the iphone url bar
  $('#map_canvas').height($(window).height()+60);
//  $('body').on('click', 'li.disabled > a', function() {
//    return false; 
//  });

  var wwidth = $(window).width()
    , wheight = $(window).height()+60

  var fountain = new google.maps.LatLng(47.653851681095, -122.30780562698);
//  var map = new google.maps.Map(document.getElementById("map_canvas"), {
//                zoom: 17,
//                center: fountain,
//                minZoom:1,
//                maxZoom:19,
//                mapTypeControl : false,
//                mapTypeControlOptions: {
//                  mapTypeIds: ['campusmap']
//                }
//      
//  });
  var map = susmap.map;
  map.mapTypes.set('campusmap', new CampusMap());
  map.setMapTypeId('campusmap');
  
  //map.overlayMapTypes.insertAt(0, new CampusMap())

  var marker = new google.maps.Marker({
        icon: window.location.pathname + 'wp-content/themes/campusmap/css/images/icons/marker_plus.png',
        map:map
  });

  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer({
                                suppressMarkers: true,
                                polylineOptions: { strokeColor: 'orchid', strokeWeight: 6 }
                          });
//var panoramioService = new google.maps.panoramio.PanoramioLayer();
//Uncaught TypeError: Cannot read property 'PanoramioLayer' of undefined
//var InfoWindow = new UWInfoWindow();

//  /** Search Box **/
//  $( "#searchfield" ).autocomplete({
//    source: function( request, response ) {
//      var data =  {
//        json: "campusmap.get_search_results",
//        custom_fields:'latitude,longitude,code',
//        include:'id,title,title_plain,type,custom_fields',
//        search: request.term
//      }
//      $.getJSON('', data, function( data ) {
//          var div = $('<div/>')
//          if ( ! data.count ) {
//            return response([{id:'not-found',label:'No results found'}]);
//          }
//          response( $.map( data.posts, function( item ) {
//            return {
//              id    : item.id,
//              type  : item.type,
//              label : div.html(item.title_plain).text(),
//              value : div.html(item.title_plain).text(),
//              lat   : item.type === 'post' ? item.custom_fields.latitude[0] : null,
//              lng   : item.type === 'post' ? item.custom_fields.longitude[0] : null
//            }
//          }));
//        })
//    },
//    minLength: 2,
//    focus: function( event, ui ) {
//      if ( ui.item.id == 'not-found')
//        return false;
//    },
//    select: function( event, ui ) {
//      if ( ui.item.id == 'not-found') 
//        return false;
//        
//      if ( ui.item.type === 'post' ) {
//        var latlng = new google.maps.LatLng(ui.item.lat, ui.item.lng)
//        marker.set('position', latlng)
//        map.set('center', latlng )
//      } else {
//        var $parking = $('#parking')
//          , lots     = $parking.data('lots')
//        if ( ! lots ) {
//          $parking.data('initial', ui.item.id).prop('checked',true).trigger('change')
//        } else {
//          $.each(lots, function(i,lot){
//            if ( lot.wpid == ui.item.id ) {
//              google.maps.event.trigger(lot,'click') 
//              return false;
//            }
//          });
//        }
//      }
//    },
//    open: function() {
//      $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
//    },
//    close: function() {
//      $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
//    }
//  });
//
//  /** Draggable Navigator 
//   *  Also gets updated in the 'resize' event 
//   **/
//  //$("#navigator, #google-info-window").disableSelection();
//  $('#navigator')
//    .css('position', 'absolute') //fixes responsive when starting at < 767
//    .data('positions', { 
//      left:wwidth - $('#navigator').width(),
//      center:wwidth-210,
//      right:wwidth-15 
//    })
//    .data('position', 'center')
//    .draggable({
//      axis: "x",
//      containment: [wwidth-700,0,wwidth-15,wheight],
//      stop: function(event,ui) {
//        var $nav      = $('#navigator')
//          , positions = $nav.data('positions')
//          , current   = $.inArray(ui.originalPosition.left, positions)
//          , closest   = null
//          , position
//
//        // get the closest position to the point where the dragging stopped
//        $.each(positions, function(i,val){
//          if (closest == null || Math.abs(val - ui.position.left) < Math.abs(closest - ui.position.left)) {
//            closest = val;
//            position = i;
//          }
//        });
//      
//        $nav.data('position', position)
//          .animate({left:positions[position]}, 700)
//      }
//  });
//
//  /** Select box **/
//  $('#buildingList').chosen().change(function(e,selected) {
//    $('#'+selected.selected.toLowerCase()).trigger('click');
//  })
//  
//
//  /** Checkbox **/
//  $('.markers, .shuttles').change(function(){
//    var $this = $(this),
//        kind  = $this.data('kind')
//        data = {
//           json: 'campusmap.get_locations',
//           kind: kind
//        }
//
//   if ( !$.isEmptyObject($this.data('markers') ) ) {
//      var markers = $this.data('markers')
//      $.each(markers, function(i,marker) {
//        marker.setMap(  $this.is(':checked') ? map : null )
//      })
//   } else {
//     $.getJSON('', data, function(data) {
//       if (data.posts == null) {
//          $this.data('markers', []) 
//          return;
//       }
//       var i       = data.posts.length,
//           url     = window.location.pathname + 'wp-content/themes/campusmap/css/images/icons/',
//           markers = []
//       while(i--) {
//          var building = data.posts[i]
//          var marker = new google.maps.Marker({
//              title: building.title,
//              position: new google.maps.LatLng(building.lat, building.lng),
//              map: map,
//              icon: url + $this.attr('id') + '.png',
//              shadow: new google.maps.MarkerImage(url+'shadow.png',
//                  new google.maps.Size(45, 33),
//                  new google.maps.Point(0,0),
//                  new google.maps.Point(12, 34))
//          });
//          marker.set('wpid', building.id )
//          new google.maps.event.addListener(marker, 'click', function() {
//            InfoWindow.open(map, this.getPosition(), this.get('wpid')) 
//          })
//          markers.push(marker)
//        }
//        $this.data('markers', markers) 
//     })  
//
//   }
//
//  })
//
//  $('#photos').change(function() {
//    panoramioService.setMap((this.checked) ? map : null);
//  })
//
//  $('#parking').change(function() {
//    var $this = $(this)
//    
//   if ( !$.isEmptyObject($this.data('lots') ) ) {
//
//      var lots = $this.data('lots')
//      $.each(lots, function(i,lot) {
//        lot.setMap(  $this.is(':checked') ? map : null )
//      })
//
//   } else {
//
//    $.getJSON('', {json:'campusmap.get_parking_lots'}, function(data) {
//      var bounds   = new google.maps.LatLngBounds()
//        , i        = data.posts.length
//        , lots     = []
//        , settings = {
//                        strokeColor: "#FF0000",
//                        strokeOpacity: 0.8,
//                        strokeWeight: 0,
//                        fillColor: "#FF0000",
//                        fillOpacity: 0.35
//                    }
//
//      while(i--){
//
//        var lot   = data.posts[i]
//          , path  = []
//          , vertices = lot.poly.split('|')
//          , len   =  vertices.length
//          , poly
//
//        for (var z = 0; z < vertices.length; z++) {
//            var vertex = vertices[z].split(',');
//            path.push(new google.maps.LatLng(vertex[0], vertex[1]));
//        };
//
//        settings.path = path
//
//        poly = new google.maps.Polygon(settings)
//        poly.set('wpid', lot.id)
//
//        lots.push(poly)
//
//        poly.set('map', map)
//
//        new google.maps.event.addListener(poly,"click", function() {
//          InfoWindow.open(map, this.getPosition(), this.get('wpid')) 
//        });
//      
//      }
//
//      // initial parking lot
//      if ( $('#parking').data('initial') != undefined ) {
//
//        var $parking = $('#parking')
//          , parkid   = $parking.data('initial')
//        $.each(lots, function(i,lot){
//          if ( lot.wpid == parkid ) {
//            google.maps.event.trigger(lot,'click') //lot.trigger('click') 
//            return false;
//          }
//        });
//      
//      }
//        
//      $this.data('lots', lots)
//    
//    }) 
//   }
//  })
//
//  /** Click buildings **/
//  var hoverpng = $('<img src="/maps/wp-content/themes/campusmap/img/circle.png" />').css({width:'100%', height:'100%'})
//  $('body').on('click.map touchend.map initial.building', '.map-point', function(e) {
//
//    if ( ! $('body').data('idle') && e.type != 'initial' )
//      return false;
//
//    if (wwidth < 979) {
//      // mobile
//      var toggle = ! $('#map_canvas').hasClass('expanded')
//        , width  = toggle ? -.9*wwidth : 0
//        , wpid  = $(this).data('id')
//    
//      $('ul.top-searches').empty()
//
//      if ( Modernizr.csstransforms3d ) {
//        $('#map_canvas').css({
//          '-webkit-transition': 'all 0.4s ease', 
//          '-webkit-transform': 'translate3d('+width+'px, 0px, 0px)',
//          '-moz-transition': 'all 0.4s ease', 
//          '-moz-transform': 'translate3d('+width+'px, 0px, 0px)'
//        }).toggleClass('expanded')
//      } else  {
//        $('#map_canvas').animate({
//          'left': width
//        }, 400 ).toggleClass('expanded')
//      }
//
//
//      var data = {
//        json:'campusmap.get_infowindow',
//        id: wpid
//      }
//      $.getJSON('', data, function(json) {
//        var post = json.posts;
//        $('#mobile-building-info').show()
//          .find('h1').empty().html(post.title).end()
//          .find('img').attr('src',post.image).end()
//          .find('p').empty().html(post.content).end()
//          .find('#directions').data('location', new google.maps.LatLng(post.lat, post.lng)).end()
//          .find('#mobile-turn-by-turn').empty()
//
//        InfoWindow.set('wpid', wpid)
//        InfoWindow.set('wpcode', post.code)
//      })
//      return false;
//    }
//      
//    var $this = $(this)
//      , wpid  = $this.data('id')
//      , width = $this.width()/2
//      , x     = $this.position().left + width
//      , y     = $this.position().top  + width
//      , point = new google.maps.Point(x,y)
//
//    InfoWindow.open(map, point, wpid)
//
//    return false;
//  }).on('mouseenter', '.map-point', function() {
//    $(this).append(hoverpng)
//  
//  }).on('mouseleave', '.map-point', function() {
//    hoverpng.remove()
//  })
//
//  /** Place Buildings */
//  $.getJSON('', {json:'campusmap.get_locations', kind:''}, function(data) {
//    new Circles( { map: map, buildings:data.posts } );
//  });
//
//
//  /** Shuttle toggle / Directions toggle **/
//  $.fn.navigationSwitcher = function() {
//      var this_ = this;
//      this_.bind('click.navigationSwitcher', function(e) {
//          var node = (this.id == 'switcher') ? 'div' : 'form';
//          $('#results').hide();
//          if(!$(e.target).hasClass('active'))
//              $(this).children().toggleClass('active').end().siblings(node).not('#extended-menu').toggle();
//          return false;
//      });
//      return this_;
//  }
//  $('#switcher, #switcher2').navigationSwitcher();
//
//  /** Desktop Directions **/
//  $( "#current, #destination" ).autocomplete({
//    source: function( request, response ) {
//      var data =  {
//        json: "campusmap.get_search_results",
//        post_type: 'post',
//        custom_fields:'latitude,longitude,code',
//        include:'id,title,title_plain,custom_fields',
//        search: request.term
//      }
//      $.getJSON('', data, function( data ) {
//          response( $.map( data.posts, function( item ) {
//            return {
//              label : item.title_plain,
//              value : item.title_plain,
//              lat   : item.custom_fields.latitude[0],
//              lng   : item.custom_fields.longitude[0]
//            }
//          }));
//        })
//    },
//    minLength: 2,
//    select: function( event, ui ) {
//      $(this).data('latlng', new google.maps.LatLng(ui.item.lat, ui.item.lng));
//    }
//  });
//
//  /** More Resources **/
//  $('#more-resources').click(function() {
//
//    var $nav      = $('#navigator')
//      , positions = $nav.data('positions')
//      , pos       = $nav.data('position')
//      , newpos    = pos === 'center' ? 'left' : 'center'
//      , easing    = pos === 'center' ? 'easeOutExpo' : 'easeOutElastic'
//      , classname = pos === 'center' ? 'less-resources' : 'more-resources'
//      
//
//    $nav.css('left', $nav.position().left)
//
//    $(this).removeClass().addClass(classname)
//
//    $nav
//      .data('position', newpos )
//      .stop()
//      .animate({ left: positions[newpos]}, { 
//        duration:1200,
//        easing:easing
//      });
//  })
//
//  /** Map It button **/
//  $('#takeMeThere').click(function() {
//      var start = $('#current').data('latlng') || $('#current').val()
//        , end   = $('#destination').data('latlng') || $('#destination').val()
//        , mode  = $('#directionLinks .directionsActive').attr('id').toUpperCase();
//
//      var request = {
//          origin      : start,
//          destination : end,
//          travelMode  : mode
//      };
//
//      directionsService.route(request, function(response, status) {
//        if (status == google.maps.DirectionsStatus.OK) {
//          directionsDisplay.setDirections(response);
//          directionsDisplay.setMap(map);
//          var href = window.location.pathname + 'print/?origin='+start+'&destination='+end+'&travelMode='+mode.toUpperCase();
//          var html = '<p><small>' + response.routes[0].legs[0].distance.text + 
//                     '- about ' + response.routes[0].legs[0].duration.text + '</small></p>' + 
//                     '<a id="turnbyturn" target="_blank"href="'+href+'">Turn by Turn</a>' + 
//                     '<div class="direction-warning alert alert-warning">' + response.routes[0].warnings[0] + '</div>';
//          
//          $('#googleDirections').html(html)
//          $('#googleDirections, #directionsPanel').toggle()
//          
//        }
//      });
//  })
//
//  $('#commonDirections').on('click', 'a', function() {
//      var $this = $(this)
//        , mode  = $('#directionLinks .directionsActive').attr('id').toUpperCase();
//
//      var request = {
//          origin      : $(this).data('current'),
//          destination : $(this).data('destination'),
//          travelMode  : mode
//      };
//      $('#current').val($(this).data('current'))
//      $('#destination').val($(this).data('destination'))
//      directionsService.route(request, function(response, status) {
//        if (status == google.maps.DirectionsStatus.OK) {
//          directionsDisplay.setDirections(response);
//          directionsDisplay.setMap(map);
//        }
//      });
//      return false;
//  })
//
//  $('#directionLinks').on('click', 'a', function() {
//      $(this).siblings().removeClass().end().addClass('directionsActive');
//      $('#takeMeThere').trigger('click');
//      return false;
//  })
//
//  $('#directionsReset').click(function() {
//    directionsDisplay.set('map', null)
//    $('#current').val('')
//    $('#destination').val('')
//    map.set('center', fountain)
//    map.set('zoom', 17)
//    $('#googleDirections, #directionsPanel').toggle()
//  })
//
//  /** Main Feedback **/
//  $('#submit').attr('disabled', true)
//    .addClass('btn disabled')
//  $('#mainFeedback').bind('click', function() {
//      $('#mainComment').toggle();
//      $('#mainFeedback').toggleClass('closeFeedback')
//        .children().toggle();
//      return false;
//  });
//
//  $('body').live('keyup', '#email', function(e) {
//    if ( $(e.target).val().length > 3 ) 
//      $('#submit').attr('disabled', false).removeClass()
//    else 
//      $('#submit').attr('disabled', true).addClass('btn disabled')
//  })
//
//  $('#mainComment').submit(function() {
//    var $this = $(this)
//      , url   = $this.attr('action')
//      , data  = $this.serialize()
//    
//
//    $.post( url, data, function(res) {
//      var message = res.indexOf('success') != -1  ? 
//                      'Thanks for your comment. We appreciate your response.' :
//                    res.indexOf('duplicate') != -1 ?
//                      'This comment has already been submitted. Thank you for your feedback.' :
//                      'There was an error processing your form. Please try again or inform us directly at uweb@uw.edu.';
//        $('#main-response').html(message)
//            .removeClass('alert-info alert-error').addClass('alert-info')
//        $this.children().toggle()
//    }).error(function(res){
//        $('#main-response').html('There was an error processing your form. Please try again or inform us directly at uweb@uw.edu.')
//            .removeClass('alert-info alert-error').addClass('alert-error')
//        $this.children().toggle()
//    })
//
//    return false;
//  })
//
//  /** Main Printer **/
//  $('#main-printer').click(function() {
//    var $this = $(this)
//      
//    var categories = $('#noteworthy').find(':checked').map(function() {return this.id }).get().join(',')
//    if ( categories.length ){
//      $this.attr('href', window.location.pathname + 'print/?category='+categories)
//      return true;
//    }
//    var directions = $('#theDirections').find('input[type=text]').map(function(){
//      return $(this).data('latlng') || this.value;
//    }).get()
//    if ( directions.length ){
//      var mode = $('#directionLinks .directionsActive').attr('id');
//      $this.attr('href', window.location.pathname + 'print/?origin='+directions[0]+'&destination='+directions[1]+'&travelMode='+mode.toUpperCase())
//      return true;
//    }
//  })
//
  /** Map Events **/

  var allowedBounds       = new google.maps.LatLngBounds(
                                new google.maps.LatLng(47.647523,-122.325039), 
                                new google.maps.LatLng(47.664983,-122.290106));

  new google.maps.event.addListener(map,"center_changed",function(){
      map.setMapTypeId( !allowedBounds.contains(map.getCenter()) || map.getZoom() < 16 ? google.maps.MapTypeId.ROADMAP : 'campusmap');
  });

  new google.maps.event.addListener(map,"zoom_changed",function(){
      map.setMapTypeId( !allowedBounds.contains(map.getCenter()) || map.getZoom() < 16 ? google.maps.MapTypeId.ROADMAP : 'campusmap');
  });

//
//  /** Mobile Map **/
//  $('#map_canvas').append('<a id="mobile-map-menu" title="Toggle" href="#mobile"><span></span><span></span><span></span></a>')
//
//
//  $('body').on('click.map touchstart.map', '#mobile-map-menu', function() {
//
//    var toggle = ! $('#map_canvas').hasClass('expanded')
//      , width  = toggle ? -.9*wwidth : 0
//
//      if ( Modernizr.csstransforms3d ) {
//        $('#map_canvas').css({
//          '-webkit-transition': 'all 0.4s ease', 
//          '-webkit-transform': 'translate3d('+width+'px, 0px, 0px)',
//          '-moz-transition': 'all 0.4s ease', 
//          '-moz-transform': 'translate3d('+width+'px, 0px, 0px)'
//        }).toggleClass('expanded')
//      } else  {
//        $('#map_canvas').animate({
//          'left': width
//        }, 400 ).toggleClass('expanded')
//      }
//    return false; 
//  })
//
//
//  $( "#mobile-searchfield" ).autocomplete({
//    source: function( request, response ) {
//      var data =  {
//        json: "campusmap.get_mobile_search_results",
//        search: request.term
//      }
//      $.getJSON('', data, function( data ) {
//        if (data.posts == null) return;
//          response( $.map( data.posts, function( item ) {
//            return {
//              label : item.title_plain,
//              value : item.title_plain,
//              title : item.title,
//              image : item.image,
//              content : item.content,
//              lat   : item.lat,
//              lng   : item.lng,
//              code  : item.code
//            }
//          }));
//        })
//    },
//    minLength: 2,
//    select: function( event, ui ) {
//      var latlng = new google.maps.LatLng(ui.item.lat, ui.item.lng)
//      marker.set('position', latlng)
//      map.set('center', latlng )
//
//      $('ul.top-searches').hide()
//      $('#mobile-building-info').show()
//        .find('h1').empty().html(ui.item.title).end()
//        .find('img').empty().html(ui.item.image).end()
//        .find('p').empty().html(ui.item.content)
//        .find('#directions').data('location', new google.maps.LatLng(ui.item.lat, ui.item.lng)).end()
//        .find('#mobile-turn-by-turn').empty()
//      $(this).blur()
//    },
//    open: function() {
//      $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
//    },
//    close: function() {
//      $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
//    }
//  }).focus(function() {
//    window.scrollTo(0,0) 
//  }).closest('form').submit(function() {
//    return false
//  })
//
//  /* 
//   * Mobile map directions to here
//   */
//  if ( ! Modernizr.geolocation ) {
//    $('#directions').hide()
//  } else {
//    $('body').on('click', '#directions', function(e) {
//      navigator.geolocation.getCurrentPosition(function(position) {
//        var request = {
//            origin      : new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
//            destination : $(e.target).data('location'),
//            travelMode  : 'WALKING'
//        };
//        directionsService.route(request, function(response, status) {
//          if (status == google.maps.DirectionsStatus.OK) {
//            directionsDisplay.setDirections(response);
//            directionsDisplay.setMap(map);
//            directionsDisplay.setPanel($('#mobile-turn-by-turn').get(0))
//          }
//        });
//      });
//    })
//  }
//
//  new google.maps.event.addListener(map, 'dragstart', function() {
//    $('body').data('idle', false)
//  })
//  new google.maps.event.addListener(map, 'idle', function() {
//    $('body').data('idle', true)
//  })
//  
//  /* Popular Searches */
//  $('body').on('click touchstart', 'ul.top-searches li', function() {
//    var code = $(this).data('code') 
//      , building = $('#'+code)
//
//    if (building.is('*')) {
//      var id = building.data('id')
//      $.getJSON('', {json:'get_post',post_id:id, custom_fields:'latitude,longitude', include:'custom_fields'}, function(data) {
//        var latlng = new google.maps.LatLng(data.post.custom_fields.latitude[0],data.post.custom_fields.longitude[0])
//        marker.set('position', latlng)
//        map.set('center', latlng)
//        building.trigger('click')
//      }) 
//    
//    }
//
//  })
//
//  $(window).resize(function() {
//    wwidth = $(window).width()
//    wheight = $(window).height()+60
//    var $nav = $('#navigator')
//      , $map = $('#map_canvas')
//
//    if ( $map.hasClass('expanded') && wwidth > 979) {
//      $('#mobile-map-menu').trigger('click')
//      $('#mobile-building-info').hide()
//    }
//
//    $map.height(wheight)
//
//    $nav
//      .data('positions', { 
//        left:wwidth - $nav.width(),
//        center:wwidth-210,
//        right:wwidth-15 
//      })
//      .draggable( "option", "containment", [wwidth-700,0,wwidth-15,wheight] )
//
//    var current_pos = $nav.data('position')
//      , positions  = $nav.data('positions')
//
//      $nav.css('left', positions[current_pos]);
//  }).bind('orientationchange', function(e) {
//    $('#map_canvas').height( $(this).height() )
//
//    if (isNaN(InfoWindow.get('wpid')))
//      return false;
//
//    $('#closeWindow').trigger('touchend')
//    var code = InfoWindow.get('wpcode')
//    $('#'+code).trigger('touchend')
//  })
//
//  /* override/add to the default mobile menu funtionality */
//  $('#searchicon-wrapper').unbind().bind('click touchstart', function() {
//      $('#mobile-map-menu').trigger('click')
//      return false;
//  })
//
//  //$('#listicon-wrapper').bind('click touchstart', function() {
//  //  $('#map-wrapper').css('position', 'relative' )
//  //})
//
//  $('#thin-strip').bind('transitionend webkitTransitionEnd mozTransitionEnd oTransitionEnd', function() {
//    if ( !$(this).height() )
//      $('#map-wrapper').removeAttr('style')
//  })
//
//  if ($.cookie('campusmap') == null)  {
//    $.cookie('campusmap',true);
//    if ( wwidth < 767 ) {
//        $('#map_canvas').after('<div id="mobile-flash"></div>');
//        $('body').on('touchstart.flash click', '#mobile-flash', function() {
//          $(this).fadeOut()
//      })
//    }
//  }
//
//      var $alrt = $('#uwalert-alert-message')
//      if ( wwidth < 768 && $alrt.length != 0) {
//        var alert_close = $('<a/>').attr({
//              href:'#close-alert',
//              title: 'Close Alert'
//            })
//        .css('padding','10px 10px').html('X').addClass('close')
//        .click(function() {
//          $alrt.slideUp()
//          return false;
//        })
//
//        $('#uwalert-alert-message').prepend(alert_close)
//    }
//
  }(jQuery));
}
