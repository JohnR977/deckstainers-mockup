/* Lead storage shared by the public site and the Pro Partner Dashboard.
   MOCKUP ONLY: everything lives in this browser's localStorage. The real version
   posts to a database instead (see CRM_PLAN.md). */
(function () {
  var slug = (document.body && document.body.dataset.site) || (window.DASH_CONFIG && window.DASH_CONFIG.slug) || 'site';
  var KEY = 'ds:' + slug + ':leads';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }
  }
  function uid() { return 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  // Shrink a photo before storing it. Phones make 4–12 MB photos; localStorage holds ~5 MB total.
  function shrink(src, maxW, quality) {
    maxW = maxW || 900; quality = quality || 0.72;
    return new Promise(function (resolve, reject) {
      var go = function (url) {
        var img = new Image();
        img.onload = function () {
          var s = Math.min(1, maxW / img.naturalWidth);
          var c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = url;
      };
      if (typeof src === 'string') go(src);
      else { var fr = new FileReader(); fr.onload = function () { go(fr.result); }; fr.onerror = reject; fr.readAsDataURL(src); }
    });
  }

  function addLead(lead) {
    var list = read() || [];
    var now = new Date().toISOString();
    // Every new lead starts in the pipeline's "Lead" column, time-stamped (see dashboard.js EVENTS).
    var labels = { estimate: 'photo estimate form', calculator: 'price calculator', visualizer: 'color visualizer', contact: 'contact form' };
    var full = Object.assign({
      id: uid(), createdAt: now, stage: 'new', stageAt: now, photos: [], notes: '',
      history: [{ at: now, text: 'New lead from the website (' + (labels[lead.source] || lead.source || 'form') + ')', event: 'lead' }]
    }, lead);
    full.stage = 'new';
    list.unshift(full);
    if (write(list)) return { ok: true, lead: full };
    // Out of space: keep the lead, drop all but the first photo.
    full.photos = (full.photos || []).slice(0, 1);
    full.history.push({ at: now, text: 'Some photos were too big to keep in this demo browser.' });
    list[0] = full;
    return write(list) ? { ok: true, lead: full, trimmed: true } : { ok: false };
  }

  window.DS = { KEY: KEY, read: read, write: write, addLead: addLead, shrink: shrink, uid: uid, extra: {} };
})();
