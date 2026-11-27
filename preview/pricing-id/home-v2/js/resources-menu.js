/* Mark the current page in the Resources dropdown, same as Industries .is-on. */
(function(){
  var p=(location.pathname.replace(/\/+$/,"")||"/");
  document.querySelectorAll("#mm-resources .res__a").forEach(function(a){
    var href=a.getAttribute("href"); if(!href || /^https?:/i.test(href) && href.indexOf(location.origin)!==0) return;
    try{
      var u=new URL(href, location.origin);
      if(u.origin!==location.origin) return;
      var path=(u.pathname.replace(/\/+$/,"")||"/");
      if(path===p) a.classList.add("is-on");
    }catch(e){}
  });
})();
