
var templates = '';

templates += genTemp("building-nodes", '<div class="sus-map-building-childNode" action="{{nid}}" id="{{jsName}}"><img class="sus-map-building-child-img info-window-link info-window-handle" title="{{name}}" src="{{url}}" />{{name}}</div>');
templates += genTemp("info-window-link", '<span class="info-window-link-{{cls}} info-window-link info-window-handle" action="{{url}}">{{str}}</span>');
templates += genTemp("filter-tax-bar", '<div class="filter-tax-bar" id={{id}} style="top:{{top}}"><image src={{img}} class="filter-tax-bar-x" title="Remove Term" />{{title}}</div>');
templates += genTemp("filter-search-result", '<div class="filter-search-result" id={{id}}>{{name}}</div>');

function addTemplatesToDOM() {
    jQuery('head').append(templates);
}
function genTemp(id, html) {
    return '<script id="sus-map-'+id+'-template" type="text/template">'+html+'</script>'
}

