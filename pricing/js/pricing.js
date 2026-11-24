(function(){var t=[].slice.call(document.querySelectorAll('.pt')),p=[].slice.call(document.querySelectorAll('.ppan'));
function go(k){t.forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('is-on',on);b.setAttribute('aria-selected',on)});
p.forEach(function(x){var on=x.dataset.k===k;x.classList.toggle('is-on',on);x.hidden=!on});
document.querySelector('.prp').setAttribute('data-k',k);[].slice.call(document.querySelectorAll('.pcm-pan')).forEach(function(x){var on=x.dataset.k===k;x.classList.toggle('is-on',on);x.hidden=!on});var nm=document.querySelector('[data-pcm-name]'),tb=document.querySelector('.pt[data-k="'+k+'"] b');if(nm&&tb)nm.textContent=tb.textContent;document.querySelector('.ptabs').setAttribute('data-k',k)}
t.forEach(function(b,i){b.addEventListener('click',function(){go(b.dataset.k)});b.addEventListener('keydown',function(e){var n=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(n){var x=t[(i+n+t.length)%t.length];x.focus();go(x.dataset.k)}})});
var h=location.hash.replace('#','');if(['chat','crm','trackr'].indexOf(h)>-1)go(h);else go('chat')})();

/* compare plans: highlighted column follows the cursor (tap on touch); Business is the resting default */
(function(){[].slice.call(document.querySelectorAll('.pcm-tb')).forEach(function(tb){
var heads=[].slice.call(tb.querySelectorAll('thead th'));var def=-1;
heads.forEach(function(h,i){if(h.classList.contains('is-hi'))def=i});
var cur=def,pinned=-1;
function set(i){if(i===cur)return;cur=i;[].slice.call(tb.rows).forEach(function(r){[].slice.call(r.cells).forEach(function(c,j){c.classList.toggle('is-hi',j===i&&j>0)})})}
function idx(e){var c=e.target.closest&&e.target.closest('td,th');if(!c||!tb.contains(c))return -1;return c.cellIndex}
tb.addEventListener('mouseover',function(e){var i=idx(e);if(i>0)set(i)});
tb.addEventListener('mouseleave',function(){set(pinned>0?pinned:def)});
tb.addEventListener('click',function(e){var i=idx(e);if(i>0){pinned=i;set(i)}});
})})();
