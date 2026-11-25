(function(){var t=[].slice.call(document.querySelectorAll('.pt')),p=[].slice.call(document.querySelectorAll('.ppan'));
function go(k){t.forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('is-on',on);b.setAttribute('aria-selected',on)});
p.forEach(function(x){var on=x.dataset.k===k;x.classList.toggle('is-on',on);x.hidden=!on});
document.querySelector('.prp').setAttribute('data-k',k);[].slice.call(document.querySelectorAll('.pcm-pan')).forEach(function(x){var on=x.dataset.k===k;x.classList.toggle('is-on',on);x.hidden=!on});var nm=document.querySelector('[data-pcm-name]'),tb=document.querySelector('.pt[data-k="'+k+'"] b');if(nm&&tb)nm.textContent=tb.textContent;document.querySelector('.ptabs').setAttribute('data-k',k)}
t.forEach(function(b,i){b.addEventListener('click',function(){go(b.dataset.k)});b.addEventListener('keydown',function(e){var n=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(n){var x=t[(i+n+t.length)%t.length];x.focus();go(x.dataset.k)}})});
var h=location.hash.replace('#','');if(['chat','crm','trackr'].indexOf(h)>-1)go(h);else go('chat')})();

/* compare plans: highlighted column follows the cursor (tap on touch); Business is the resting default.
   pr13: the header row floats (fixed clone) under the sticky nav while its table is on screen, synced with horizontal scroll */
(function(){var nav=document.querySelector('.nav');var items=[];
[].slice.call(document.querySelectorAll('.pcm-tb')).forEach(function(tb){
var sc=tb.closest('.pcm-scroll'),pan=tb.closest('.pcm-pan');
var heads=[].slice.call(tb.querySelectorAll('thead th'));var def=-1;
heads.forEach(function(h,i){if(h.classList.contains('is-hi'))def=i});
var cur=def,pinned=-1;
/* floating header clone */
var fl=document.createElement('div');fl.className='pcm-float';fl.setAttribute('aria-hidden','true');
var ft=document.createElement('table');ft.className='pcm-tb pcm-tb--float';ft.appendChild(tb.tHead.cloneNode(true));fl.appendChild(ft);document.body.appendChild(fl);
var fcells=[].slice.call(ft.rows[0].cells);
function rowsAll(){return [].slice.call(tb.rows).concat([ft.rows[0]])}
function set(i){if(i===cur)return;cur=i;rowsAll().forEach(function(r){[].slice.call(r.cells).forEach(function(c,j){c.classList.toggle('is-hi',j===i&&j>0)})})}
function idx(e,root){var c=e.target.closest&&e.target.closest('td,th');if(!c||!root.contains(c))return -1;return c.cellIndex}
function out(e){var t=e.relatedTarget;if(t&&(tb.contains(t)||fl.contains(t)))return;set(pinned>0?pinned:def)}
[tb,ft].forEach(function(root){
root.addEventListener('mouseover',function(e){var i=idx(e,root);if(i>0)set(i)});
root.addEventListener('click',function(e){var i=idx(e,root);if(i>0){pinned=i;set(i)}});});
tb.addEventListener('mouseleave',out);fl.addEventListener('mouseleave',out);
function sizes(){ft.style.width=tb.offsetWidth+'px';heads.forEach(function(h,j){fcells[j].style.width=h.getBoundingClientRect().width+'px'})}
function place(){
 var navH=nav?nav.getBoundingClientRect().bottom:0;if(navH<0)navH=0;
 var r=sc.getBoundingClientRect(),hh=tb.tHead.getBoundingClientRect().height;
 var on=!pan.hidden&&r.height>0&&r.top<navH&&r.bottom>navH+hh+8;
 fl.classList.toggle('is-on',on);if(!on)return;
 fl.style.top=navH+'px';fl.style.left=(r.left+sc.clientLeft)+'px';fl.style.width=sc.clientWidth+'px';
 var x=sc.scrollLeft;ft.style.transform='translateX('+(-x)+'px)';
 var f0=fcells[0];f0.style.transform=(getComputedStyle(heads[0]).position==='sticky')?'translateX('+x+'px)':'';
}
items.push({sizes:sizes,place:place});sc.addEventListener('scroll',place,{passive:true});
});
var raf=0;function tick(){raf=0;items.forEach(function(it){it.place()})}
function req(){if(!raf)raf=requestAnimationFrame(tick)}
function resize(){items.forEach(function(it){it.sizes()});req()}
window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',resize);
[].slice.call(document.querySelectorAll('.pt')).forEach(function(b){b.addEventListener('click',function(){setTimeout(resize,0)})});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(resize);window.addEventListener('load',resize);resize();
})();
