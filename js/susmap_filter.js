

Filter = function(Susmap) {
    var this_ = this;
    
    this.container = jQuery('#sus-map-filter-container');
    this.iconTitle = jQuery('#filter-hover-title');
    this.iconTitleContent = this.iconTitle.find('span');
    this.Susmap = Susmap;
    this.data = this.Susmap.filterData;
    this.HTML = "";
    this.baseTemplate = '<div class="filter-category-container">'+
                            '<div class="filter-text-container">'+
                                '<div class="filter-checkbox {{catCheckbox}}"></div>'+
                                '<span class="filter-text-span">{{catTitle}}</span>'+
                                '<div class="c-b"></div>'+
                            '</div>'+
                            '<div class="filter-icon-container">'+
//                                '<div class="filter-icon-padding"></div>'+
                                '{{& iconHTML}}'+
                                '<div class="c-b"></div>'+
                            '</div>'+
                        '</div>';
                    
    this.iconTemplate = '<div class="filter-icon-box" name="{{name}}" id="{{jsName}}" style="left:{{left}}">'+
                            '<img class="filter-icon-img" src="{{url}}" />'+
                        '</div>';
    
    (function($) {
        $.each(this_.data, function(k, v) {
            v.iconHTML = "";
            $.each(v.nodeTypes, function(kk, vv) {
                vv.left = kk*27+5+'px';
                v.iconHTML += Mustache.render(this_.iconTemplate, vv);
            });
            this_.HTML += Mustache.render(this_.baseTemplate, v);
        });
        this_.HTML += '<div class="sus-map-link filter-top-level-term-link" id="term:CampusSustainabilityFund(CSF)">Campus Sustainability Fund (CSF)</div>';
        this_.HTML += '<input class="filter-search-box" type="text" id="sus-map-search" placeholder="Search" />';
        this_.HTML += '<div class="filter-search-result-box"></div>';
    }(jQuery));
}
Filter.prototype.addToDOM = function() {
    var this_ = this;
    this.container.append(this_.HTML);
    this.container.find('.filter-icon-box').on("mouseenter mouseleave", function(e) {
        if (e.type == "mouseenter") {
            this_.iconTitleContent.html(jQuery(this).attr("name"));
            var offset = jQuery(this).find('img').offset();
            var width = this_.iconTitle.show().width();
            this_.iconTitle.hide().css({left:offset.left-width+"px", top:offset.top+"px"}).fadeIn(250);
        } else {
            this_.iconTitleContent.html("");
            this_.iconTitle.stop(true,true).hide();
        }
    });
    this.container.find('.filter-top-level-term-link').on("click", function() {
        var nSet = jQuery(this).attr("id");
        this_.Susmap.hashManager.updateMap({nodeSet:nSet});
    });
    
    this.container.find('.filter-search-box').on("keyup", function() {
        var titles = this_.Susmap.searchable.titles;
        var obs = this_.Susmap.searchable.nidsByTitle;
        var item = jQuery(this).val();
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
            var floatedRet = [];
            var trimmedRet = ret;
            jQuery.each(ret, function(k,v) {
                if (v.toLowerCase().charAt(0) != item.toLowerCase().charAt(0)) {
                    floatedRet.push(v);
                    trimmedRet[k] = "";
                } else {
                    floatedRet = trimmedRet.concat(floatedRet);
                    return false;
                }
            });
            ret = floatedRet.clean("");
            if (ret.length > 7)
                ret = ret.slice(0,6);
            jQuery.each(ret, function(k,v) {
                var ob = {name:v, id:"searched:"+v.replace(/ /g, "")};
                var temp = jQuery('#sus-map-filter-search-result-template').html();
                html += Mustache.render(temp, ob);
            });
            this_.container.find('.filter-search-result-box').html(html).show();
        } else {
            this_.container.find('.filter-search-result-box').html("").hide();
        }
    });
    
    (function($) {
        $('.filter-icon-container:last').css({border:"0px"});
        $(document).delegate(".filter-icon-box", "click", function() {
            var nSet = $(this).attr("id");
            this_.Susmap.hashManager.updateMap({nodeSet:nSet});
        });
        $('#filter-title').on("click", function() {
            this_.Susmap.hashManager.updateMap({nodeSet:"clear"});
        });
    }(jQuery));
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
Filter.prototype.update = function(nodeSet, up, curSet, sets) {
    var this_ = this;
    (function($) {
        $('.filter-icon-box').each(function() {
            if ($.inArray($(this).attr("id"), nodeSet) < 0) {
                $(this).find("img").stop(true).animate({opacity:"1", "margin-top":"5px"}, 100);
            } else {
                $(this).find("img").stop(true).animate({opacity:"1", "margin-top":"0px"}, 200);
            }
        });
        if (up) {
            this_.iconTitle.animate({top:"-=5px"}, 200);
        } else {
            this_.iconTitle.animate({top:"+=5px"}, 100);
        }
        
        if (curSet == "term") {
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
            $('#sus-map-filter-container').animate({right:"-220px"});
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
                        $('#filter-title').fadeIn();
                    });
                }
            });
        } else {
            $('.filter-tax-bar').remove();
            $('#filter-title').hide();
            $('#sus-map-filter-container').animate({right:"-8px"});
        }
        
    }(jQuery));
}