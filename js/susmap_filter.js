

Filter = function(Susmap) {
    var this_ = this;
    
    this.container = jQuery('#sus-map-filter-container');
    this.iconTitle = jQuery('#filter-hover-title');
    this.iconTitleContent = this.iconTitle.find('span');
    this.Susmap = Susmap;
    this.hidden = false;
    this.termsVisible = false;
    this.searchHover = false;
    this.data = this.Susmap.filterData;
    this.HTML = "";
    
    this.expanded = false;
    
    this.taxItems = this.loadTaxJSON();
    
    this.baseTemplate = '<div class="filter-category-container">'+
                            '<div class="filter-text-container">'+
                                '<span class="filter-text-span">{{catTitle}}</span>'+
                                '<div class="c-b"></div>'+
                            '</div>'+
                            '<div class="filter-icon-container">'+
                                '{{& iconHTML}}'+
                                '<div class="c-b"></div>'+
                            '</div>'+
                        '</div>';
                    
    this.iconTemplate = '<div class="filter-icon-box" name="{{name}}" id="{{jsName}}" style="left:{{left}}">'+
                            '<div class="filter-icon-img-fillet">'+
                                '<img class="filter-icon-img" src="{{url}}" />'+
                            '</div>'+
                            '<div class="sus-map-rarr" style="border-color:{{arrColor}};"></div>'+
                            '<div class="filter-icon-expanded-name">{{name}}</div>'+
                        '</div>';
    this.taxTemplate = '<div class="filter-tax-box" name="{{name}}" id="{{jsName}}" style="left:{{left}}">'+
                            '<img class="filter-icon-img" src="{{url}}" />'+
                       '</div>';
    
    (function($) {
        $.each(this_.data, function(k, v) {
            v.iconHTML = "";
            $.each(v.nodeTypes, function(kk, vv) {
                vv.left = kk*27+5+'px';
                vv.arrColor = v.arrColor;
                v.iconHTML += Mustache.render(this_.iconTemplate, vv);
            });
            this_.HTML += Mustache.render(this_.baseTemplate, v);
        });
        
        var taxItems = "";
        $.each(this_.taxItems, function(k,v) {
            taxItems += Mustache.render(this_.taxTemplate, v);
        });
        var taxOb = {iconHTML:taxItems, catTitle:"Campus Projects"};
        var taxSet = Mustache.render(this_.baseTemplate, taxOb);
        
        this_.HTML += '<div id="filter-tax-preset-container">'+taxSet+'</div>';
        
        
        this_.HTML += '<div class="filter-search-wrapper">'+
                        '<input class="filter-search-box" type="text" id="sus-map-search" placeholder="Search" />'+
                        '<div class="filter-search-result-box"></div>'+
                      '</div>';
    }(jQuery));
}
Filter.prototype.addToDOM = function() {
    var this_ = this;
    this.container.append(this_.HTML);
    
    this.container.find('.filter-icon-box').each(function() {
        jQuery(this).data('left', jQuery(this).css("left"));
    });
    
    this.container.find('.filter-icon-box, .filter-tax-box').on("mouseenter mouseleave", function(e) {
        if (!this_.expanded || jQuery(this).hasClass('filter-tax-box')) {
            if (e.type == "mouseenter") {
                this_.iconTitleContent.html(jQuery(this).attr("name"));
                var offset = jQuery(this).find('.filter-icon-img').offset();
                var width = this_.iconTitle.show().width();
                this_.iconTitle.hide().css({left:offset.left-width+"px", top:offset.top+"px"}).fadeIn(250);
            } else {
                this_.iconTitleContent.html("");
                this_.iconTitle.stop(true,true).hide();
            }
        } else {
            if (e.type == "mouseenter") {
                jQuery(this).find('.filter-icon-expanded-name').css({color:"#000"});
            } else {
                jQuery(this).find('.filter-icon-expanded-name').css({color:"#555"});
            }
        }
    });
    this.container.find('.filter-top-level-term-link, .filter-tax-box').on("click", function() {
        var nSet = jQuery(this).attr("id");
        this_.Susmap.hashManager.updateMap({nodeSet:nSet});
    });
    jQuery(document).on("mousedown", function() {
        if (!this_.searchHover) {
            this_.closeSearch();
            jQuery('.filter-search-box').blur();
        }
    });
    jQuery(document).delegate('.filter-search-box, .filter-search-result-box', "mouseenter mouseleave", function(e) {
        if (e.type == "mouseenter") {
            this_.searchHover = true;
        } else {
            this_.searchHover = false;
        }
    });

    jQuery(document).delegate('.filter-search-result', 'click', function(e) {
        e.preventDefault();
        var infoWin = jQuery(this).attr("id");
        var nType = jQuery(this).attr("action");
        if (infoWin) {
            this_.Susmap.hashManager.updateMap({infoWin:infoWin});
            this_.closeSearch(true);
        }
        if (nType) {
            this_.Susmap.hashManager.updateMap({nodeSet:nType, repeat:true});
            this_.closeSearch(true);
        }
    });
    jQuery(document).delegate('.filter-search-result', 'keydown', function(e) {
        if (e.keyCode == 40) {
            jQuery(this).next().focus();
        } else if (e.keyCode == 38) {
            jQuery(this).prev().focus();
        } else if (e.keyCode == 13) {
            jQuery(this).click();
            e.preventDefault();
        }
    });
    this.container.find('.filter-search-box').on("keyup focus", function(e) {

        if (e.keyCode == 40) { // down arrow
            var $el = jQuery('.filter-search-result').first();
            $el.focus();
            return true;
        } else if (e.keyCode == 38) { // up arrow
            
        }
        
        var titles = this_.Susmap.searchable.titles;
        var obs = this_.Susmap.searchable.nidsByTitle;
        var item = jQuery(this).val();
        if (item) {
            var ret = [];
            if (item != "") {
                jQuery.each(titles, function(k,v) {
                    if (v.toLowerCase().indexOf(item.toLowerCase()) > -1)
                        ret.push(v);
                });
            }
            if (ret.length > 0) {
                var html = "";
                ret.sort();
                jQuery.each(ret, function(k,v) {
                    if (v.toLowerCase().charAt(0) != item.toLowerCase().charAt(0)) {
                        ret.push(v);
                        ret[k] = "";
                    } else {
                        return false;
                    }
                });
                ret.clean("");
                jQuery.each(ret, function(k,v) {
                    var root = this_.Susmap.root+"js/markers/";
                    var nType = this_.Susmap.searchable.nTypesByTitle[v];
                    var nids = this_.Susmap.searchable.nidsByTitle[v];
                    var nid = (nids.length == 1) ? nids[0] : null;
                    var ob = {
                        name:v.split("_")[0].substr(0,v.length-2),
                        id:nid,
                        nType:(nType!="type:Building")?nType:null,
                        src:root+this_.Susmap.searchable.urlBynType[nType]
                    };
                    var temp = jQuery('#sus-map-filter-search-result-template').html();
                    html += Mustache.render(temp, ob);
                });
                var cont = this_.container.find('.filter-search-result-box');
                cont.show();
                var ph = cont.height();
                cont.css({height:"auto"});
                var h = cont.html(html).height();
                if (h > 350) {
                    h = 350;
                    cont.css({"overflow-y":"scroll"});
                } else {
                    cont.css({"overflow-y":"auto"});
                }
                cont.height(ph);
                cont.stop(true).animate({height:h+"px"}, 250);
                this_.container.find('.filter-category-container').fadeTo("fast", .2);
            } else {
                this_.closeSearch();
            }
        } else {
            this_.closeSearch();
        }
    });
    
    (function($) {
        $('.filter-icon-container:last').css({border:"0px"});
        $(this_.container.find('.filter-icon-container')[5]).css({border:"0px"});
        
        $(document).delegate(".filter-icon-box", "click", function() {
            var nSet = $(this).attr("id");
            this_.Susmap.hashManager.updateMap({nodeSet:nSet});
        });
        $('#filter-title').on("click", function() {
            this_.Susmap.hashManager.updateMap({nodeSet:"clear"});
        });
    }(jQuery));
}
Filter.prototype.closeSearch = function(clear) {
    var this_ = this;
    this_.container.find('.filter-search-result-box').html("").height(0).hide();
    this_.container.find('.filter-category-container').fadeTo("fast", 1);
    if (clear) {
        this_.container.find('.filter-search-box').val("");
    }
}
Filter.prototype.loadIcons = function() {
    var this_ = this;
    (function($) {
        var icons = $('.filter-icon-box');
        $.each(icons, function(k,v) {
            var left = $(this).css("left");
            var index = $(this).parent().parent().index() - 1;
            $(this).css({"margin-top":"+=36px"}).show().delay(left.parseNum()*5+index*50).animate({"margin-top":"-=36px"});
        });
    }(jQuery));
}
Filter.prototype.toggleFilter = function(open, terms) {
    var this_ = this;
    
    if (open) {
        this_.termsVisible = false;
        this_.container.stop(true).animate({right:"-8px"});
    } else {
        if (terms)
            this_.termsVisible = true;
        this_.container.stop(true).animate({right:"-220px"});
    }
}
Filter.prototype.update = function(nodeSet, up, curSet, sets) {
    var this_ = this;
    (function($) {
        $('.filter-icon-box').each(function() {
            // not visible nodes
            if ($.inArray($(this).attr("id"), nodeSet) < 0) {
                if (this_.expanded) {
                    $(this).find("img").stop(true, true).css({opacity:"1"});
                    
                    $(this).find('.sus-map-rarr').stop(true).animate({left:"13px"}, 200, function() { $(this).find('.sus-map-rarr').hide(); });
                    $(this).find('.filter-icon-img-fillet').stop(true, true).css({"margin-top":"1px"});
                    $(this).stop(true).animate({left:"20px"}, 200);
                    $(this).find('.filter-icon-expanded-name').stop(true).animate({"margin-left":"5px"}, 200);
                } else {
                    $(this).find("img").stop(true).animate({opacity:".75"}, 100);
                    $(this).find(".filter-icon-img-fillet").stop(true).animate({"margin-top":"5px"}, 100, function() {
                        $(this).css({overflow:"hidden"})
                    });
                    $(this).find("img").css({
                        "filter": "grayscale(60%)",
                        "-moz-filter": "grayscale(60%)",
                        "-webkit-filter": "grayscale(60%)",
                        "-ms-filter": "grayscale(60%)"
                    });
                }
            // visible nodes
            } else {
                if (this_.expanded) {
                    $(this).find("img").stop(true, true).css({opacity:"1"});
                    $(this).find('.filter-icon-img-fillet').stop(true, true).css({"margin-top":"1px"});
                    $(this).find('.sus-map-rarr').stop(true).animate({left:"20px"}, 200).show();
                    $(this).stop(true).animate({left:"5px"}, 200);
                    $(this).find('.filter-icon-expanded-name').stop(true).animate({"margin-left":"20px"}, 200);
                } else {
                    $(this).find("img").stop(true).animate({opacity:"1"}, 200);
                    $(this).find(".filter-icon-img-fillet").stop(true).css({overflow:"visible"}).animate({"margin-top":"0px"}, 200);
                    $(this).find("img").css({
                        "filter": "grayscale(0%)",
                        "-moz-filter": "grayscale(0%)",
                        "-webkit-filter": "grayscale(0%)",
                        "-ms-filter": "grayscale(0%)"
                    });
                }
            }
        });
        if (up) {
            this_.iconTitle.animate({top:"-=5px"}, 200);
        } else {
            this_.iconTitle.animate({top:"+=5px"}, 100);
        }
        
        if (curSet == "term") {
            this_.closeSearch();
            var oldTerms = 0;
            $('.filter-tax-bar').each(function(k) {
                var id = $(this).attr("id");
                var index = nodeSet.indexOf(id);
                if (index > -1) {
                    nodeSet.splice(index, 1);
                    oldTerms++;
                } else {
                    $(this).remove();
                }
            });
            var html = "";
            $.each(nodeSet, function(k,v) {
                var ob = {
                    title:this_.Susmap.taxTermsByJSName[v], 
                    id:v,
                    img: this_.Susmap.root+"/css/images/x2.png",
                    top:(k+oldTerms)*40+120+"px"};
                var temp = $('#sus-map-filter-tax-bar-template').html();
                html += Mustache.render(temp, ob);
            });
            $('body').append(html);
            $('.filter-tax-bar').each(function(k) {
                if (!$(this).is(":visible")) {
                    $(this).show();
                    var w = $(this).width();
                    $(this).css({right:"-"+w+"px"});
                    $(this).animate({right:"0px", top:k*40+120+"px"}, function() {
                        $('#filter-title').fadeIn();
                    });
                    
                    var nSet = $(this).attr("id");
                    $(this).find('img').on("click", function() {this_.Susmap.hashManager.updateMap({nodeSet:nSet});});
                } else {
                    $(this).animate({top:k*40+120+"px"}, function() {
                        $('#filter-title').show();
                    });
                }
            });
            this_.toggleFilter(false, true);
        } else {
            $('.filter-tax-bar').remove();
            $('#filter-title').hide();
            if (!this_.hidden)
                this_.toggleFilter(true);
        }
        
    }(jQuery));
}



Filter.prototype.expand = function() {
    var this_ = this;
    
    //if (!this_.expanded) {
        (function($) {
            $('.filter-text-container').hide();
            $('.filter-text-container:last').show();

            this_.iconTitle.hide();

            $('.filter-icon-container').css({height:"auto", "padding-bottom":"2px", "margin-top":"0px"});
            $('.filter-icon-container:last').height("35px");
            
            var extraH = Math.floor(($(window).height()-65)/27) - 25;
            var tm = 0;
            var bm = 0;
            if (extraH > 0) {
                if (extraH%2 == 0) {
                    tm = extraH/2;
                    bm = extraH/2
                } else {
                    tm = (extraH+1)/2;
                    bm = (extraH-1)/2;
                }
            }
            $('.filter-icon-box').css({position:"relative", left:"12px", width:"auto", height:"25px", margin:tm+"px 0 "+bm+"px 0"});         //Math.floor(($(window).height()-65)/27)+

            $('.filter-search-wrapper').css("box-shadow", "-1px -2px 5px rgba(0,0,0,.2)");

            $('.filter-icon-img-fillet').css({"float":"left"});

            // filter select updates
            $('.filter-icon-box').find("img").css({
                        opacity:"1",
                        "filter": "grayscale(0%)",
                        "-moz-filter": "grayscale(0%)",
                        "-webkit-filter": "grayscale(0%)",
                        "-ms-filter": "grayscale(0%)"
                    });
            $('.filter-icon-img-fillet').css({"margin-top":"0px"});

            $('.filter-icon-expanded-name').show();

            $('.filter-search-wrapper').css({top:"-30px"});

            $('#sus-map-filter-container').css({top:"30px", "margin-top":"auto", background:"rgba(255,255,255,.8)"});               //url("+this_.Susmap.root+"css/images/leaf_high_flip.jpg) 47px top no-repeat
            
            $('#filter-tax-preset-container').css({bottom:"-63px", "box-shadow":"-1px 2px 3px rgba(0,0,0,.2)"});

            this_.expanded = true;
            
            this_.update();
            //this_.Susmap.hashManager.updateMap(null, true);

        }(jQuery));
    //}
}


Filter.prototype.deflate = function() {
    var this_ = this;
    if (this_.expanded) {
        (function($) {
            $('.filter-text-container').show();
            $('.filter-icon-container').css({height:"35px", "padding-bottom":"auto", "margin-top":"3px"});
            $('.filter-icon-box').css({position:"absolute", width:"30px", height:"30px"}).each(function() {
                $(this).css('left', $(this).data('left'));
            });
            
            $('.filter-icon-img-fillet').css({"float":"none"});
            
            $('.filter-search-wrapper').css("box-shadow", "2px 3px 10px rgba(0,0,0,.4)");
            
            $('.filter-icon-expanded-name').hide();
            
            $('.filter-search-wrapper').css({top:"-40px"});

            $('#sus-map-filter-container').css({top:"42%", "margin-top":"-175px", background:"rgba(255,255,255,.9)"});
            
            $('#filter-tax-preset-container').css({bottom:"-71px", "box-shadow":"2px 3px 10px rgba(0,0,0,.4)"});
            
            this_.expanded = false;
            
            this_.Susmap.hashManager.updateMap(null, true);
            
            // filter update
            $('.sus-map-rarr').hide();
            
        }(jQuery))
    }
}




Filter.prototype.loadTaxJSON = function() {
    return [
            {
                name:"Campus Sustainability Fund (CSF)",
                jsName:"term:CampusSustainabilityFund(CSF)",
                left:"5px",
                url:this.Susmap.root+"js/markers/tax/csf.png"
            },{
                name:"UW Climate Action Plan (CAP)",
                jsName:"term:UWClimateActionPlan(CAP)",
                left:"47px",
                url:this.Susmap.root+"js/markers/tax/cap.png"
            }
        ];
}