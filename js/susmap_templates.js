
var templates = '';

templates += genTemp("building-nodes-template", '<img class="sus-map-building-childNode" title="{{name}}" src="{{url}}" action="{{nid}}" />');



function addTemplatesToDOM() {
    jQuery('head').append(templates);
}
function genTemp(id, html) {
    return '<script id="sus-map-'+id+'" type="text/template">'+html+'</script>'
}

