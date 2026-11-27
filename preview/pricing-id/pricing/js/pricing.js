(function(){var t=[].slice.call(document.querySelectorAll('.pt')),p=[].slice.call(document.querySelectorAll('.ppan'));
function go(k){t.forEach(function(b){var on=b.dataset.k===k;b.classList.toggle('is-on',on);b.setAttribute('aria-selected',on)});
p.forEach(function(x){var on=x.dataset.k===k;x.classList.toggle('is-on',on);x.hidden=!on});
document.querySelector('.prp').setAttribute('data-k',k);[].slice.call(document.querySelectorAll('.pcm-pan')).forEach(function(x){var on=x.dataset.k===k;x.classList.toggle('is-on',on);x.hidden=!on});var nm=document.querySelector('[data-pcm-name]'),tb=document.querySelector('.pt[data-k="'+k+'"] b');if(nm&&tb)nm.textContent=tb.textContent;document.querySelector('.ptabs').setAttribute('data-k',k)}
t.forEach(function(b,i){b.addEventListener('click',function(){go(b.dataset.k)});b.addEventListener('keydown',function(e){var n=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(n){var x=t[(i+n+t.length)%t.length];x.focus();go(x.dataset.k)}})});
var h=location.hash.replace('#','');if(['chat','crm','trackr'].indexOf(h)>-1)go(h);else go('chat')})();

/* Billing period: monthly / 3 months / 6 months / annual.
   3 months+ : 5/10/20% off the monthly price, and numeric AI Credits
   become Unlimited (Starter and Custom are unchanged). */
(function(){
  var root=document.querySelector('.pbill');if(!root)return;
  var opts=[].slice.call(root.querySelectorAll('.pbill__opt'));
  var plans=document.querySelector('.prp');
  var RATE={month:0,quarter:0.05,half:0.10,year:0.20};

  function parseMoney(s){
    s=String(s||'').replace(/\u00a0/g,' ').trim();
    if(/Rp/i.test(s)){
      var n=parseInt(s.replace(/[^\d]/g,''),10);
      return isNaN(n)?null:{cur:'idr',n:n};
    }
    if(/\$/.test(s)){
      var n=parseFloat(s.replace(/[^0-9.]/g,''));
      return isNaN(n)?null:{cur:'usd',n:n};
    }
    return null;
  }
  function formatMoney(cur,n){
    if(cur==='idr'){
      var r=Math.round(n/1000)*1000;
      return 'Rp&nbsp;'+String(r).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
    }
    return '$'+Math.round(n);
  }
  function isNumericPrice(s){return !!parseMoney(s)}
  function isStarterName(s){return /^\s*Starter\b/i.test(String(s||''))}
  function isCustomName(s){return /custom|kustom|맞춤|カスタム|定制/i.test(String(s||''))}
  function isFreeName(s){s=String(s||'').replace(/\s+/g,' ').trim();return /^(free|gratis)\b/i.test(s)||/無料/.test(s)||/무료/.test(s)||/免费/.test(s)}
  function isExcludedPlan(s){return isStarterName(s)||isCustomName(s)||isFreeName(s)}
  function isCreditText(s){
    s=String(s||'').replace(/\s+/g,' ').trim();
    if(/kustom|custom/i.test(s)) return false;
    return /(\d[\d.,]*)\s*AI Credits/i.test(s)
      || /AIクレジット\s*[\d.,]+/.test(s)
      || /AI 크레딧\s*[\d.,]+/.test(s)
      || /[\d.,]+\s*AI 额度/.test(s);
  }
  function unlimitedHTML(orig){
    if(/AIクレジット/.test(orig)) return '<strong>Unlimited</strong> AIクレジット';
    if(/AI 크레딧/.test(orig)) return '<strong>Unlimited</strong> AI 크레딧';
    if(/AI 额度/.test(orig)) return '<strong>Unlimited</strong> AI 额度';
    return '<strong>Unlimited</strong> AI Credits';
  }
  function unlimitedPillHTML(orig){
    var label='Unlimited AI Credits';
    if(/AIクレジット/.test(orig)) label='Unlimited AIクレジット';
    else if(/AI 크레딧/.test(orig)) label='Unlimited AI 크레딧';
    else if(/AI 额度/.test(orig)) label='Unlimited AI 额度';
    return '<span class="pp__unlim">∞ '+label+'</span>';
  }
  var isIdr=plans&&plans.classList.contains('prp--idr');

  /* Cache monthly prices on plan cards and the compare table. */
  [].slice.call(document.querySelectorAll('.pp__price')).forEach(function(el){
    if(el.classList.contains('pp__price--c')) return;
    var b=el.querySelector('b'); if(!b) return;
    var m=parseMoney(b.textContent); if(!m) return;
    el.setAttribute('data-cur',m.cur);
    el.setAttribute('data-base',String(m.n));
    el.setAttribute('data-base-html',b.innerHTML);
  });
  [].slice.call(document.querySelectorAll('.pcm-pr')).forEach(function(el){
    var b=el.querySelector('strong'); if(!b) return;
    var m=parseMoney(b.textContent); if(!m) return;
    el.setAttribute('data-cur',m.cur);
    el.setAttribute('data-base',String(m.n));
    el.setAttribute('data-base-html',b.innerHTML);
  });
  [].slice.call(document.querySelectorAll('.pp')).forEach(function(card){
    var name=card.querySelector('.pp__name');
    if(name && (isExcludedPlan(name.textContent))) return;
    [].slice.call(card.querySelectorAll('.pp__list li span, .pp__list li')).forEach(function(el){
      if(el.matches && el.matches('li') && el.querySelector('span')) return;
      if(!isCreditText(el.textContent)) return;
      if(!el.hasAttribute('data-credits-orig')){
        el.setAttribute('data-credits-orig',el.innerHTML);
        el.setAttribute('data-credits-orig-text',el.textContent);
      }
    });
  });
  [].slice.call(document.querySelectorAll('.pcm-tb')).forEach(function(tb){
    var heads=[].slice.call(tb.querySelectorAll('thead th'));
    var skip={};
    heads.forEach(function(h,i){
      var b=h.querySelector('b');
      var n=b?b.textContent:'';
      if(isExcludedPlan(n)) skip[i]=true;
    });
    [].slice.call(tb.querySelectorAll('tr')).forEach(function(tr){
      var cells=[].slice.call(tr.cells||tr.querySelectorAll('th,td'));
      if(!cells.length) return;
      var lab=(cells[0].textContent||'').replace(/\s+/g,' ').trim();
      if(!/^AI Credits$|^AIクレジット$|^AI 크레딧$|^AI 额度$/.test(lab)) return;
      cells.forEach(function(cell,i){
        if(i===0||skip[i]) return;
        if(!isCreditText(lab+' '+cell.textContent) && !/^\s*[\d.,]+\s*$/.test(cell.textContent)) return;
        if(/custom|kustom/i.test(cell.textContent)) return;
        cell.setAttribute('data-credits-orig',cell.innerHTML);
        cell.setAttribute('data-credits-orig-text',cell.textContent);
      });
    });
  });

  function renderPrice(el,rate){
    var cur=el.getAttribute('data-cur');
    var base=parseFloat(el.getAttribute('data-base'));
    if(!cur||isNaN(base)) return;
    var tag=el.classList.contains('pcm-pr')?'strong':'b';
    var b=el.querySelector(tag); if(!b) return;
    var was=el.querySelector('.pp__was, .pcm-was');
    if(rate>0){
      if(!was){
        was=document.createElement('s');
        was.className=el.classList.contains('pcm-pr')?'pcm-was':'pp__was';
        el.insertBefore(was,b);
      }
      was.innerHTML=el.getAttribute('data-base-html');
      b.innerHTML=formatMoney(cur,base*(1-rate));
    }else{
      if(was) was.remove();
      b.innerHTML=el.getAttribute('data-base-html');
    }
  }
  function renderCredits(on){
    [].slice.call(document.querySelectorAll('[data-credits-orig]')).forEach(function(el){
      var li=el.closest&&el.closest('.pp__list li');
      if(!isIdr&&li){
        if(on){el.innerHTML=unlimitedPillHTML(el.getAttribute('data-credits-orig-text')||'');li.classList.add('is-unlim');}
        else{el.innerHTML=el.getAttribute('data-credits-orig');li.classList.remove('is-unlim');}
        return;
      }
      if(on) el.innerHTML=unlimitedHTML(el.getAttribute('data-credits-orig-text')||'');
      else el.innerHTML=el.getAttribute('data-credits-orig');
    });
  }

  /* Under-price pill is Indonesian /harga only; global pages use the checklist pill. */
  if(isIdr){
    [].slice.call(document.querySelectorAll('.pp')).forEach(function(card){
      if(card.querySelector('.pp__unlim-slot')) return;
      var price=card.querySelector('.pp__price'); if(!price) return;
      var name=card.querySelector('.pp__name');
      var skip=name && (isExcludedPlan(name.textContent));
      var slot=document.createElement('div');
      slot.className='pp__unlim-slot'+(skip?' is-empty':'');
      slot.innerHTML='<span class="pp__unlim">∞ Unlimited AI Credits</span>';
      price.insertAdjacentElement('afterend', slot);
    });
  }

  function setBill(period){

    if(!RATE.hasOwnProperty(period)) period='month';
    var rate=RATE[period];
    opts.forEach(function(b){
      var on=b.dataset.bill===period;
      b.classList.toggle('is-on',on);
      b.setAttribute('aria-pressed',on?'true':'false');
    });
    if(plans){
      plans.classList.toggle('is-quarter',period!=='month');
      plans.setAttribute('data-bill',period);
    }
    [].slice.call(document.querySelectorAll('.pp__price[data-base], .pcm-pr[data-base]')).forEach(function(el){
      renderPrice(el,rate);
    });
    renderCredits(period!=='month');
  }

  opts.forEach(function(b){
    b.addEventListener('click',function(){setBill(b.dataset.bill||'month')});
  });
  setBill('month');
})();

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
