(function(){
  var root=document.getElementById('uac-popup');
  if(!root) return;
  var KEY='cekat-uac-promo-2026-12';
  var card=root.querySelector('.uac-card');
  var closeBtn=root.querySelector('.uac-x');
  var planBtn=root.querySelector('.uac-btn');
  var words=[].slice.call(root.querySelectorAll('.uac-w'));
  var open=false, shown=false, timer=null, idx=0, lastFocus=null;

  function stored(){
    try{return sessionStorage.getItem(KEY)==='1'}catch(e){return false}
  }
  function mark(){
    try{sessionStorage.setItem(KEY,'1')}catch(e){}
  }
  function forced(){
    try{return /(?:^|[?&])promo=1(?:&|$)/.test(location.search)}catch(e){return false}
  }

  function focusables(){
    return [closeBtn,planBtn].filter(function(el){return el && root.contains(el)});
  }

  function startBadge(){
    if(timer||words.length<2) return;
    words.forEach(function(w,i){w.classList.toggle('is-on',i===0);w.classList.remove('is-out')});
    idx=0;
    timer=setInterval(function(){
      var cur=words[idx];
      idx=(idx+1)%words.length;
      cur.classList.remove('is-on');
      cur.classList.add('is-out');
      words[idx].classList.add('is-on');
      setTimeout(function(){cur.classList.remove('is-out')},700);
    },2600);
  }

  function show(){
    if(open) return;
    open=true;
    shown=true;
    if(!forced()) mark();
    lastFocus=document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('uac-lock');
    document.body.classList.add('uac-lock');
    startBadge();
    (closeBtn||card).focus();
  }

  function hide(){
    if(!open) return;
    open=false;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('uac-lock');
    document.body.classList.remove('uac-lock');
    mark();
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function pastSecond(){
    var trust=document.getElementById('trust');
    if(!trust) return window.scrollY>900;
    return trust.getBoundingClientRect().bottom<140;
  }

  function maybeShow(){
    if(shown||stored()) return;
    if(pastSecond()) show();
  }

  closeBtn&&closeBtn.addEventListener('click',hide);
  root.addEventListener('click',function(e){if(e.target===root) hide()});
  document.addEventListener('keydown',function(e){
    if(!open) return;
    if(e.key==='Escape'){e.preventDefault();hide();return}
    if(e.key==='Tab'){
      var f=focusables();
      if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus()}
    }
  });

  if(forced()){
    show();
    return;
  }
  if(stored()) return;

  window.addEventListener('scroll',maybeShow,{passive:true});
  maybeShow();

  var armed=false;
  function arm(){armed=true}
  setTimeout(arm,1500);
  document.addEventListener('mousemove',arm,{once:true,passive:true});
  document.addEventListener('mouseout',function(e){
    if(!armed||shown||stored()) return;
    if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    if(e.relatedTarget==null && e.clientY<=0) show();
  });
})();
