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

/* au11: hero flow guide: 3 steps highlight their nodes; auto-advance while the slide is shown, tabs jump */
(function(){
  document.querySelectorAll('[data-afg]').forEach(function(g){
    var slide=g.closest('.wv-s'), tabs=[].slice.call(g.querySelectorAll('.afg__tab')), caps=[].slice.call(g.querySelectorAll('.afg__cap span')),
        reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches, tm=[], STEP=2500;
    function set(k){g.setAttribute('data-s',k);
      tabs.forEach(function(t){t.classList.toggle('is-on',+t.getAttribute('data-k')===k)});
      caps.forEach(function(c){c.classList.toggle('is-on',+c.getAttribute('data-k')===k)});}
    function clear(){tm.forEach(clearTimeout);tm=[];}
    function play(){clear();set(1);if(reduce)return;tm.push(setTimeout(function(){set(2)},STEP),setTimeout(function(){set(3)},STEP*2));}
    tabs.forEach(function(t){t.addEventListener('click',function(){clear();set(+t.getAttribute('data-k'));});});
    if(!slide){play();return;}
    var on=slide.classList.contains('is-on');if(on)setTimeout(play,900);
    new MutationObserver(function(){var now=slide.classList.contains('is-on');if(now&&!on)play();if(!now&&on)clear();on=now;}).observe(slide,{attributes:true,attributeFilter:['class']});
  });
})();
