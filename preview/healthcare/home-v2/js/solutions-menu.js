(function () {
  var root = document.getElementById('mm-solutions');
  if (!root) return;
  var items = root.querySelectorAll('.sol__a[data-id]');
  var photo = root.querySelector('.sol__photo');
  var heading = root.querySelector('.sol__side-h');
  var copy = root.querySelector('.sol__side-p');
  var link = root.querySelector('.sol__side-a');
  function show(el) {
    items.forEach(function (item) { item.classList.toggle('is-on', item === el); });
    if (heading) heading.textContent = el.getAttribute('data-head') || '';
    if (copy) copy.textContent = el.getAttribute('data-desc') || '';
    if (photo) photo.src = el.getAttribute('data-photo') || '';
    if (link) {
      link.href = el.getAttribute('href') || '#';
      var name = el.getAttribute('data-name') || 'industry';
      var lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
      var label = 'See ' + name + ' solutions ';
      if (lang.indexOf('id') === 0) label = 'Lihat solusi ' + name + ' ';
      else if (lang.indexOf('ko') === 0) label = name + ' 솔루션 보기 ';
      else if (lang.indexOf('ja') === 0) label = name + 'のソリューションを見る ';
      else if (lang.indexOf('zh') === 0) label = '查看' + name + '方案 ';
      link.textContent = label;
      var arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      link.appendChild(arrow);
    }
  }
  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () { show(item); });
    item.addEventListener('focus', function () { show(item); });
  });
})();
