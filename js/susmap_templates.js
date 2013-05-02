
var templates = '';

templates += genTemp("building-nodes", '<div class="sus-map-building-childNode" title="View this Feature" action="{{nid}}" id="{{jsName}}"><img class="sus-map-building-child-img info-window-link info-window-handle" title="{{name}}" src="{{url}}" />{{name}}</div>');
templates += genTemp("info-window-link", '<span class="info-window-link-{{cls}} info-window-link info-window-handle" action="{{url}}">{{str}}</span>');
templates += genTemp("filter-tax-bar", '<div class="filter-tax-bar" id={{id}} style="top:{{top}}"><image src={{img}} class="filter-tax-bar-x" title="Remove Term" />{{title}}</div>');
templates += genTemp("filter-search-result", '<a href="#jmno" class="filter-search-result" id="{{id}}" action="{{nType}}"><img class="filter-search-result-img" src="{{src}}" /><div class="filter-search-result-content">{{name}}</div><div class="c-b"></div></a>');
templates += genTemp("into-window-building-link", '<div class="sus-map-node-building-link info-window-handle" title="View Building" action="{{nid}}"><img class="sus-map-node-builing-img" src="{{img}}" />{{name}}</div>');

function addTemplatesToDOM() {
    jQuery('head').append(templates);
}
function genTemp(id, html) {
    return '<script id="sus-map-'+id+'-template" type="text/template">'+html+'</script>'
}

