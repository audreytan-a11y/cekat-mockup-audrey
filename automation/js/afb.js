/* au10: flow-builder illustration: fit-to-width scaling, entrance, light line animation */
(function(){
  var els=document.querySelectorAll('[data-afb]');if(!els.length)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fit(el){var inn=el.firstElementChild,cw=el.clientWidth;if(!cw)return;
    var sm=cw<440;el.classList.toggle('afb--sm',sm);var W=sm?430:520;
    var s=Math.min(1,cw/W);el.style.setProperty('--afb-s',s);el.classList.add('is-fit');
    el.style.height=Math.ceil(inn.offsetHeight*s)+'px';}
  els.forEach(function(el){
    fit(el);
    if('ResizeObserver' in window)new ResizeObserver(function(){fit(el)}).observe(el);else addEventListener('resize',function(){fit(el)});
    if(reduce||!('IntersectionObserver' in window)){el.classList.add('is-in');return;}
    el.classList.add('is-anim');
    new IntersectionObserver(function(en){en.forEach(function(e){
      if(e.isIntersecting){el.classList.add('is-in');setTimeout(function(){el.classList.add('is-run')},1500);}
      else el.classList.remove('is-run');});},{threshold:.2}).observe(el);
  });
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){els.forEach(fit)});
})();
