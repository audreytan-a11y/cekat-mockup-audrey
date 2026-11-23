(function(){var t=[].slice.call(document.querySelectorAll('.pt')),p=[].slice.call(document.querySelectorAll('.ppan'));
function go(k){t.forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('is-on',on);b.setAttribute('aria-selected',on)});
p.forEach(function(x){var on=x.dataset.k===k;x.classList.toggle('is-on',on);x.hidden=!on});
document.querySelector('.prp').setAttribute('data-k',k);document.querySelector('.ptabs').setAttribute('data-k',k)}
t.forEach(function(b,i){b.addEventListener('click',function(){go(b.dataset.k)});b.addEventListener('keydown',function(e){var n=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(n){var x=t[(i+n+t.length)%t.length];x.focus();go(x.dataset.k)}})});
var h=location.hash.replace('#','');if(['chat','crm','trackr'].indexOf(h)>-1)go(h);else go('chat')})();
