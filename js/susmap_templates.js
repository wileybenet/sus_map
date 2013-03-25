
var templates = '';

templates += genTemp("building-nodes-template", '<div class="sus-map-building-childNode" title="{{name}}" style="background-image:url({{url}});" action="{{nid}}"></div>');



function addTemplatesToDOM() {
    jQuery('head').append(templates);
}
function genTemp(id, html) {
    return '<script id="sus-map-'+id+'" type="text/template">'+html+'</script>'
}

