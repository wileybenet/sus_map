String.prototype.removeDash = function() {
    return this.replace(/-/g, " ").replace(/_/g, " ");
}
String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
String.prototype.deleteZeros = function() {
    return this.replace(/0 /g, "");
}
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};
function setLink(str, url) {
    var ob = {str:str, url:url};
    var temp = '<span class="sus-map-link" action="{{url}}">{{str}}</span>';
    return Mustache.render(temp, ob);
}