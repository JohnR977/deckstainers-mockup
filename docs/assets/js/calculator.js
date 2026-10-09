/* Estimate calculator. Every rate comes from site.config.json → pricing. */
(function () {
  var form = document.getElementById('calc');
  if (!form) return;
  var P = window.SITE.pricing;
  var out = function (k) { return document.querySelector('[data-out="' + k + '"]'); };
  var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var round = function (n, to) { return Math.round(n / to) * to; };
  var state = {};

  function num(name) { var el = form.elements[name]; return Math.max(0, parseFloat(el && el.value) || 0); }

  function calc() {
    var mode = form.elements.mode.value;
    form.querySelectorAll('[data-mode]').forEach(function (el) { el.hidden = el.dataset.mode !== mode; });
    var sqft = mode === 'lw' ? num('length') * num('width') : num('sqft');
    var rail = num('rail'), stairs = num('stairs');
    var cond = P.condition[form.elements.condition.value];
    var fin = P.finishes[form.elements.finish.value];
    var lines = [];
    var lo = 0, hi = 0;

    var dLo = sqft * fin.low * cond.mult, dHi = sqft * fin.high * cond.mult;
    lines.push(['Deck floor · ' + Math.round(sqft) + ' sq ft', dLo, dHi]);
    if (cond.mult !== 1) lines.push(['Includes prep for ' + cond.label.split(' — ')[0].toLowerCase() + ' wood', null, null]);
    lo += dLo; hi += dHi;

    if (rail) { var rL = rail * P.railingPerFt.low * cond.mult, rH = rail * P.railingPerFt.high * cond.mult; lines.push(['Railing · ' + rail + ' ft', rL, rH]); lo += rL; hi += rH; }
    if (stairs) { var sL = stairs * P.stairPerStep.low, sH = stairs * P.stairPerStep.high; lines.push(['Stairs · ' + stairs + ' steps', sL, sH]); lo += sL; hi += sH; }

    var addons = [];
    form.querySelectorAll('input[name=addon]:checked').forEach(function (cb) {
      var a = P.addOns.filter(function (x) { return x.id === cb.value; })[0];
      var qty = a.unit === 'sq ft' ? sqft : a.unit === 'board' ? num('boards') || 1 : 1;
      var cost = a.price * qty;
      addons.push(a.label);
      lines.push([a.label + (a.unit === 'board' ? ' × ' + qty : ''), cost, cost]);
      lo += cost; hi += cost;
    });

    var minHit = false;
    if (lo < P.minimumJob) { lo = P.minimumJob; minHit = true; }
    if (hi < P.minimumJob) hi = P.minimumJob;
    lo = round(lo, 10); hi = round(hi, 10);

    out('low').textContent = fmt(lo);
    out('high').textContent = fmt(hi);
    out('deposit').textContent = fmt(lo * P.depositPercent / 100) + '–' + fmt(hi * P.depositPercent / 100);
    out('lines').innerHTML = lines.map(function (l) {
      return '<div><dt>' + l[0] + '</dt><dd>' + (l[1] == null ? '' : (Math.round(l[1]) === Math.round(l[2]) ? fmt(l[1]) : fmt(l[1]) + '–' + fmt(l[2]))) + '</dd></div>';
    }).join('') + (minHit ? '<div><dt>Minimum job applies</dt><dd>' + fmt(P.minimumJob) + '</dd></div>' : '');

    state = {
      deck: { sqft: Math.round(sqft), size: mode === 'lw' ? num('length') + ' × ' + num('width') : Math.round(sqft) + ' sq ft', rail: rail, stairs: stairs,
        condition: form.elements.condition.value, finish: form.elements.finish.value, addons: addons },
      estimate: { low: lo, high: hi }
    };
  }

  form.addEventListener('input', calc);
  form.addEventListener('change', calc);
  calc();

  DS.extra.calculator = function (d) {
    d.deck = state.deck; d.estimate = state.estimate;
    d.notes = 'Calculator range ' + fmt(state.estimate.low) + '–' + fmt(state.estimate.high) + '.';
    return d;
  };
})();
