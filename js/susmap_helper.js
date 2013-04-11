String.prototype.removeDash = function() {
    return this.replace(/-/g, " ").replace(/_/g, " ");
}
String.prototype.toTitleCase = function() {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
String.prototype.deleteZeros = function() {
    return this.replace(/0 /g, "").replace(/8/g, ".");
}
String.prototype.parseNum = function(real) {
    return (real)?parseFloat(this):parseInt(this);
}
String.prototype.getType = function() {
    return this.split(":")[0];
}
String.prototype.srcToNtype = function() {
    var str = this.split("/");
    str = str[str.length-1]
    str = str.substr(1, str.length-10);
    str = str.removeDash().toTitleCase().deleteZeros().replace(/ /g, "");
    return str;
}
//          sites/all/modules/sus_map/js/markers/2environmental-office-icon.png
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};
function setLink(str, url, cls) {
    var ob = {str:str, url:url, cls:cls};
    var temp = jQuery('#sus-map-info-window-link-template').html();
    return Mustache.render(temp, ob);
}
function iconCompare(a,b) {
    if (a.url < b.url)
        return -1;
    if (a.url > b.url)
        return 1;
    return 0;
}