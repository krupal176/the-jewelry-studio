'use strict';

// Source-title metadata only. Live supplier grades, reports and inventory are not connected.
function diamondSpecs(product) {
  const weight = product.title.match(/(\d+(?:\.\d+)?)\s*Carat/i);
  const grade = product.title.match(/\b([D-Z])[-\s]+(VVS[12]|VS[12]|SI[12]|IF|FL)\b/i);
  return {carat: Number.isFinite(product.carat)?product.carat:weight?Number(weight[1]):null, color: product.color||grade?.[1]||'', clarity:product.clarity||grade?.[2]||''};
}

function diamondFilterState(params) {
  const values={}, invalidKeys=new Set();
  for(const key of ['caratMin','caratMax','priceMin','price','depthMin','depthMax','tableMin','tableMax','ratioMin','ratioMax']){
    const raw=params.get(key), empty=raw===null||raw.trim()===''||(key==='price'&&raw==='all');
    const value=empty?null:Number(raw);
    values[key]=value;
    if(!empty&&(!Number.isFinite(value)||value<0||(key.startsWith('carat')&&value>100)))invalidKeys.add(key);
  }
  let error=invalidKeys.size?'Enter valid, non-negative prices and carat weights between 0 and 100.':'';
  if(!error&&((values.caratMin!==null&&values.caratMax!==null&&values.caratMin>values.caratMax)||(values.priceMin!==null&&values.price!==null&&values.priceMin>values.price)))error='Minimum must not exceed maximum.';
  for(const key of ['depth','table','ratio'])if(!error&&values[key+'Min']!==null&&values[key+'Max']!==null&&values[key+'Min']>values[key+'Max'])error='Minimum must not exceed maximum.';
  return {values,invalidKeys,error};
}

function diamondSelection(params) {
  const state=diamondFilterState(params);if(state.error)return [];
  const {caratMin:min,caratMax:max,priceMin,price:budget}=state.values;
  const products = CATALOG.filter(p => {
    if (p.category !== 'diamonds') return false;
    const spec = diamondSpecs(p);
    return (!params.get('shape') || p.shape === params.get('shape')) &&
      (!params.get('q') || p.title.toLowerCase().includes(params.get('q').toLowerCase())) &&
      (min === null || spec.carat!==null&&spec.carat >= min) && (max === null || spec.carat!==null&&spec.carat <= max) &&
      (priceMin === null || p.price >= priceMin) && (budget === null || p.price <= budget) &&
      (!params.get('color') || spec.color === params.get('color')) &&
      (!params.get('clarity') || spec.clarity === params.get('clarity')) &&
      (p.origin===(params.get('origin')||'lab-grown')) &&
      ['cut','certification','polish','symmetry','fluorescence'].every(key=>!params.get(key)||p[key]===params.get(key)) &&
      (!params.has('imageOnly')||!!p.image) && (!params.has('quickShip')||p.quickShip) &&
      ['depth','table','ratio'].every(key=>{const min=state.values[key+'Min'],max=state.values[key+'Max'];return (min===null||p[key]!==null&&p[key]>=min)&&(max===null||p[key]!==null&&p[key]<=max);});
  });
  const comparators = {low:(a,b)=>a.price-b.price, high:(a,b)=>b.price-a.price,
    'carat-low':(a,b)=>diamondSpecs(a).carat-diamondSpecs(b).carat,
    'carat-high':(a,b)=>diamondSpecs(b).carat-diamondSpecs(a).carat,
    name:(a,b)=>a.title.localeCompare(b.title)};
  if (comparators[params.get('sort')]) products.sort(comparators[params.get('sort')]);
  return products;
}

function finderLink(params, key, value) {
  const next = new URLSearchParams(params);
  value ? next.set(key, value) : next.delete(key);
  return '#/collection/diamonds' + (next.size ? '?' + next.toString() : '');
}

function ringJourney(step = 1) { return ringBuilderSteps(['diamond','setting','complete'][step-1] || 'diamond'); }

function diamondCard(p) {
  const spec = diamondSpecs(p), saved = favorites.includes(p.id);
  return `<article class="product-card diamond-card" data-diamond-id="${p.id}"><button class="wish ${saved?'saved':''}" data-favorite="${p.id}" aria-label="${saved?'Unsave':'Save'} ${esc(p.title)}" aria-pressed="${saved}">${icon('heart')}</button><a class="product-image" href="#/product/${p.id}"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"><span class="card-badge">${p.isDemo?'DEMO · ':''}${p.origin==='natural'?'NATURAL':'LAB-GROWN'}</span></a><div class="diamond-card-copy"><a href="#/product/${p.id}" aria-label="${esc(p.title)}"><h2>${spec.carat===null?"—":spec.carat.toFixed(2)} ct ${esc(p.shape)}</h2></a><dl><div><dt>Color</dt><dd>${esc(spec.color)}</dd></div><div><dt>Clarity</dt><dd>${esc(spec.clarity)}</dd></div><div><dt>Shape</dt><dd>${esc(p.shape)}</dd></div></dl><div class="diamond-price"><span>${currency(p.price)}</span><small>USD</small></div><button class="button full" data-choose-diamond="${p.id}" aria-label="Choose ${spec.carat===null?"—":spec.carat.toFixed(2)} carat ${esc(p.shape)} diamond">Choose diamond <span aria-hidden="true">↗</span></button><a class="diamond-details" href="#/product/${p.id}">View diamond details</a></div></article>`;
}

// Number fields are the canonical form values. Unset fields mean “Any”.
// Sliders update those fields without submitting or rebuilding the page mid-drag.
function diamondRangeFilters(params) {
  const value = key => {
    const raw = params.get(key);
    return raw !== null && raw !== '' && raw !== 'all' && Number.isFinite(Number(raw)) ? raw : '';
  };
  const diamonds = CATALOG.filter(p => p.category === 'diamonds');
  const configurations = [
    {id:'carat', label:'Carat weight', keys:['caratMin','caratMax'], step:0.01, increment:5, ceiling:100,
      base:Math.min(100, Math.max(15, Math.ceil(Math.max(0, ...diamonds.map(p => diamondSpecs(p).carat || 0)) / 5) * 5))},
    {id:'price', label:'Price · USD', keys:['priceMin','price'], step:1, increment:1000,
      base:Math.max(10000, Math.ceil(Math.max(0, ...diamonds.map(p => p.price)) / 1000) * 1000)}
  ];
  return configurations.map(config => {
    const values = config.keys.map(value);
    const limit = Math.min(config.ceiling || Infinity, Math.max(config.base, Math.ceil(Math.max(0, ...values.map(Number)) / config.increment) * config.increment));
    const positions = [values[0] === '' ? 0 : Number(values[0]), values[1] === '' ? limit : Number(values[1])].map(n => Math.max(0, Math.min(limit, n)));
    const crossed = positions[0] > positions[1];
    return `<fieldset class="finder-range-field" data-range-kind="${config.id}" data-range-base="${config.base}" data-range-increment="${config.increment}" ${config.ceiling ? `data-range-ceiling="${config.ceiling}"` : ''}><legend>${config.label}</legend><div class="finder-range" style="--range-start:${positions[0] / limit * 100}%;--range-end:${Math.max(...positions) / limit * 100}%"><span class="finder-range-track" aria-hidden="true"><span></span></span>${config.keys.map((key,i) => `<input id="diamond-${key}-slider" type="range" min="0" max="${limit}" step="${config.step}" value="${positions[i]}" data-range-key="${key}" aria-label="${i ? 'Maximum' : 'Minimum'} ${config.id === 'carat' ? 'carat weight' : 'price'}" aria-controls="diamond-${key}" aria-valuetext="${values[i] === '' ? (i ? 'Any maximum' : 'Any minimum') : config.id === 'carat' ? Number(values[i]).toFixed(2)+' carats' : esc(money(Number(values[i])))}" ${i ? `aria-valuemin="${crossed ? 0 : positions[0]}"` : `aria-valuemax="${crossed ? limit : positions[1]}" style="z-index:${positions[0] > limit / 2 ? 3 : 2}"`}>`).join('')}</div><div class="finder-range-values">${config.keys.map((key,i) => `<label for="diamond-${key}">${i ? 'Maximum' : 'Minimum'}<span class="finder-range-input">${config.id === 'price' ? '<span class="range-unit" aria-hidden="true">$</span>' : ''}<input id="diamond-${key}" name="${key}" type="number" min="0" ${config.ceiling ? `max="${config.ceiling}"` : ''} step="${config.step}" inputmode="${config.id === 'carat' ? 'decimal' : 'numeric'}" placeholder="Any" value="${esc(values[i])}" data-range-value="${key}" aria-label="${i ? 'Maximum' : 'Minimum'} ${config.id === 'carat' ? 'carat weight' : 'price'} value" aria-describedby="${config.id}-range-error">${config.id === 'carat' ? '<span class="range-unit range-unit-end" aria-hidden="true">ct</span>' : ''}</span></label>`).join('<span class="range-separator" aria-hidden="true">–</span>')}</div><p class="finder-range-error" id="${config.id}-range-error" ${crossed ? '' : 'hidden'}>${crossed ? 'Minimum must not exceed maximum.' : ''}</p></fieldset>`;
  }).join('');
}

function syncDiamondRange(field) {
  const numbers = [...field.querySelectorAll('[data-range-value]')];
  const sliders = [...field.querySelectorAll('[data-range-key]')];
  numbers.forEach(input => input.setCustomValidity(''));
  const invalid = numbers.find(input => !input.validity.valid);
  const crossed = !invalid && numbers.every(input => input.value !== '') && Number(numbers[0].value) > Number(numbers[1].value);
  if (crossed) numbers[0].setCustomValidity('Minimum must not exceed maximum.');
  const error = field.querySelector('.finder-range-error');
  error.textContent = crossed ? 'Minimum must not exceed maximum.' : invalid ? invalid.validationMessage : '';
  error.hidden = !error.textContent;
  numbers.forEach(input => input.setAttribute('aria-invalid', String(!input.validity.valid)));
  // Leave partially typed/invalid numbers intact; never move the route while typing.
  if (invalid) return;
  const ceiling = Number(field.dataset.rangeCeiling) || Infinity;
  const limit = Math.min(ceiling, Math.max(Number(field.dataset.rangeBase), Number(sliders[0].max), Math.ceil(Math.max(...numbers.map(input => Number(input.value))) / Number(field.dataset.rangeIncrement)) * Number(field.dataset.rangeIncrement)));
  const positions = numbers.map((input,i) => input.value === '' ? (i ? limit : 0) : Number(input.value));
  sliders.forEach((slider,i) => {
    slider.max = String(limit);
    slider.value = String(positions[i]);
    slider.setAttribute(i ? 'aria-valuemin' : 'aria-valuemax', String(crossed ? (i ? 0 : limit) : positions[1-i]));
    slider.setAttribute('aria-valuetext', numbers[i].value === '' ? (i ? 'Any maximum' : 'Any minimum') : field.dataset.rangeKind === 'carat' ? `${positions[i].toFixed(2)} carats` : money(positions[i]));
  });
  sliders[0].style.zIndex = positions[0] > limit / 2 ? '3' : '2';
  const track = field.querySelector('.finder-range');
  track.style.setProperty('--range-start', `${positions[0] / limit * 100}%`);
  track.style.setProperty('--range-end', `${Math.max(...positions) / limit * 100}%`);
}

function updateDiamondRange(input) {
  const field = input.closest('.finder-range-field');
  if (input.hasAttribute('data-range-key')) {
    const sliders = [...field.querySelectorAll('[data-range-key]')];
    const index = sliders.indexOf(input), peer = Number(sliders[1-index].value);
    const number = index ? Math.max(Number(input.value), peer) : Math.min(Number(input.value), peer);
    const numberInput = field.querySelector(`[data-range-value="${input.dataset.rangeKey}"]`);
    const unset = index ? number === Number(input.max) : number === Number(input.min);
    numberInput.value = unset ? '' : String(number);
  }
  syncDiamondRange(field);
}

if (typeof document !== 'undefined') document.addEventListener('input', event => {
  if (event.target.matches('#diamond-filters input[data-range-key], #diamond-filters input[data-range-value]')) updateDiamondRange(event.target);
});

function finderShapeLink(name,params) {
  const selected=params.get('shape')===name;
  const id='finder-shape-'+name.replace(/\s+/g,'-');
  return `<a id="${id}" data-diamond-filter class="shape-link ${selected?'selected':''}" href="${finderLink(params,'shape',selected?'':name)}" aria-label="${selected?'Clear':'Shop'} ${esc(name)} diamonds" ${selected?'aria-current="true"':''}><img src="${diamondShapeIcon(name)}" alt="" width="52" height="52"><span>${esc(name)}</span></a>`;
}

function diamondFinder(params = new URLSearchParams()) {
  const products = diamondSelection(params), shape = params.get('shape') || '', state=diamondFilterState(params);
  const select = (key, label, values) => `<label for="diamond-${key}">${label}<select id="diamond-${key}" name="${key}"><option value="">All ${label.toLowerCase()}</option>${values.map(value=>`<option value="${esc(value)}" ${params.get(key)===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label>`;
  const active = [...params].filter(([key,value])=>['shape','caratMin','caratMax','priceMin','price','color','clarity','q','origin','cut','certification','polish','symmetry','fluorescence','depthMin','depthMax','tableMin','tableMax','ratioMin','ratioMax','imageOnly','quickShip'].includes(key)&&value&&value!=='all');
  const labels = {shape:'Shape',caratMin:'Min. carat',caratMax:'Max. carat',priceMin:'Min. price',price:'Max. price',color:'Color',clarity:'Clarity',q:'Search',origin:'Origin',cut:'Cut',certification:'Certification',polish:'Polish',symmetry:'Symmetry',fluorescence:'Fluorescence',depthMin:'Min depth',depthMax:'Max depth',tableMin:'Min table',tableMax:'Max table',ratioMin:'Min L/W',ratioMax:'Max L/W',imageOnly:'With image',quickShip:'Quick shipping'};
  return `${ringJourney(1)}<section class="finder-heading"><div><p class="eyebrow">THE DIAMOND STUDIO</p><h1>${params.get('origin')==='natural'?'Natural':'Lab-grown'} diamonds.</h1><p>Find your shape. Follow your light.<br>A considered selection for a story only you can tell.</p></div><a class="text-link" href="#/education">A little guidance on the 4 Cs <span aria-hidden="true">↗</span></a></section>
  ${ringBuilderListingContext('diamonds',params)}
  <section class="finder-shapes" aria-label="Choose a diamond shape"><div class="shape-browser"><section class="classic-shapes" aria-labelledby="finder-classic-heading"><h2 class="eyebrow" id="finder-classic-heading">Classic shapes</h2><div class="shape-list">${SHAPES.map(s=>finderShapeLink(s,params)).join('')}</div></section><section class="finder-antique" aria-labelledby="finder-antique-heading"><h2 class="eyebrow" id="finder-antique-heading">Antique &amp; distinctive shapes</h2><div class="shape-list">${ANTIQUE_SHAPES.map(s=>finderShapeLink(s.name,params)).join('')}</div></section></div></section>
  <section class="finder-layout" aria-label="Diamond catalog"><button class="button outline finder-mobile-toggle" data-action="diamond-filters" aria-controls="diamond-filter-panel" aria-expanded="false">Refine your search${active.length?' · '+active.length:''}</button>
  <aside class="finder-sidebar" id="diamond-filter-panel" aria-label="Refine diamonds"><div class="filter-heading"><h2>Your preferences</h2><a data-diamond-filter href="#/collection/diamonds${params.has('build')?'?build=1':''}">Reset</a></div><form id="diamond-filters"><label>Origin</label><div class="finder-origin-options">${[['lab-grown','Lab-grown'],['natural','Natural']].map(([value,label])=>`<a data-diamond-filter href="${finderLink(params,'origin',value)}" aria-current="${(params.get('origin')||'lab-grown')===value}">${label}</a>`).join('')}</div><input type="hidden" name="origin" value="${params.get('origin')==='natural'?'natural':'lab-grown'}">${diamondRangeFilters(params)}
<label class="finder-check"><input type="checkbox" name="imageOnly" value="1" ${params.has('imageOnly')?'checked':''}>With image only</label><label class="finder-check"><input type="checkbox" name="quickShip" value="1" ${params.has('quickShip')?'checked':''}>Supplier-marked quick shipping</label>
<details class="finder-grade" ${params.has('color')?'open':''}><summary>Color</summary>${select('color','Color',Array.from({length:23},(_,i)=>String.fromCharCode(68+i)))}</details>
<details class="finder-grade" ${params.has('clarity')?'open':''}><summary>Clarity</summary>${select('clarity','Clarity',['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'])}</details>
<details class="finder-advanced" ${['cut','certification','polish','symmetry','fluorescence','depthMin','depthMax','tableMin','tableMax','ratioMin','ratioMax'].some(key=>params.has(key))?'open':''}><summary>Advanced filters</summary>
${[['cut','Cut',['Ideal','Excellent','Very Good','Good','Fair','Poor']],['certification','Certification',['GIA','IGI','GCAL']],['polish','Polish',['Excellent','Very Good','Good','Fair','Poor']],['symmetry','Symmetry',['Excellent','Very Good','Good','Fair','Poor']],['fluorescence','Fluorescence',['None','Faint','Medium','Strong','Very Strong']]].map(([key,label,values])=>`<details class="finder-grade" ${params.has(key)?'open':''}><summary>${label}</summary>${select(key,label,[...new Set([...values,...CATALOG.filter(p=>p.category==='diamonds').map(p=>p[key]).filter(Boolean)])])}</details>`).join('')}
${[['depth','Depth %'],['table','Table %'],['ratio','Length / width']].map(([key,label])=>`<details class="finder-grade" ${params.has(key+'Min')||params.has(key+'Max')?'open':''}><summary>${label}</summary><div class="finder-numeric-pair">${['Min','Max'].map(bound=>`<label>${bound}<input type="number" min="0" step=".01" name="${key+bound}" value="${esc(params.get(key+bound)||'')}" aria-label="${label} ${bound.toLowerCase()}" placeholder="Any"></label>`).join('')}</div></details>`).join('')}</details>
<button id="diamond-apply-preferences" class="button outline full" type="submit">Apply preferences</button></form><p class="filter-help">Not sure where to begin?<br><a href="#/education">Explore the diamond guide ↗</a></p><a class="text-link" href="#/custom">Create a personal brief ↗</a></aside>
  <div class="finder-results"><div class="finder-toolbar"><p class="result-count" role="status" aria-live="polite"><strong>${products.length}</strong> ${products.length===1?'piece':'pieces'}${shape?' · '+esc(shape):''}<small>Local preview inventory</small></p><label for="diamond-sort">Sort by<select id="diamond-sort" name="sort" form="diamond-filters">${[['featured','Studio selection'],['low','Price: low to high'],['high','Price: high to low'],['carat-low','Carat: low to high'],['carat-high','Carat: high to low']].map(([value,label])=>`<option value="${value}" ${(params.get('sort')||'featured')===value?'selected':''}>${label}</option>`).join('')}</select></label></div>${active.length?`<div class="finder-chips">${active.map(([key,value])=>`<a data-diamond-filter href="${finderLink(params,key,'')}" aria-label="Remove ${labels[key]} filter">${labels[key]}: ${esc(state.invalidKeys.has(key)?'Invalid value':(key==='price'||key==='priceMin')?money(Number(value)):value)} <span aria-hidden="true">×</span></a>`).join('')}</div>`:''}${state.error?`<p class="finder-range-error" role="alert">${esc(state.error)}</p>`:''}<div class="diamond-grid">${products.length?products.map(diamondCard).join(''):empty(state.error?'Check your preferences.':'A different possibility.',state.error?esc(state.error):(CATALOG.some(p=>p.category==='diamonds')?'No diamonds match this combination. Try widening your preferences.':'The diamond catalog is awaiting a verified supplier connection. No sample stones are listed.'),'Reset diamond filters','#/collection/diamonds'+(params.has('build')?'?build=1':''))}</div><p class="snapshot-note">Sample diamonds and prices are for testing only. Guru’s live inventory is not connected; certification and stock are not verified.</p></div></section>`;
}

function diamondTypePage(type) {
  const label = {'natural':'Natural diamonds','fancy-color':'Fancy-color diamonds'}[type];
  if (!label) return notFound();
  return `<article class="document reveal"><p class="eyebrow">EXPLORE DIAMONDS / PLANNED COLLECTION</p><h1>${label}.</h1><p>A new perspective, when the time is right.</p><div class="notice">This collection is planned, not available for purchase in the preview. Assortment, supplier availability, verified reports, prices and launch timing still need approval.</div>${type==='fancy-color'?'<p>Fancy color describes a diamond’s color, not its origin. Any future collection will clearly identify whether each stone is natural or lab-grown and disclose applicable treatments.</p>':''}<a class="button" href="#/collection/diamonds">Explore lab-grown diamonds ↗</a><p style="margin-top:24px"><a href="#/custom">Prepare a custom inquiry</a></p><p class="snapshot-note">Private review: Heath’s approval and a verified inventory connection are still required. No stock or delivery promise is implied.</p></article>`;
}


let finderReturnFocus = null;
function rememberFinderPosition(id = '') {
  finderReturnFocus = {id, y:window.scrollY, expanded:document.querySelector('.finder-mobile-toggle')?.getAttribute('aria-expanded')==='true'};
}
function restoreFinderPosition() {
  if (!finderReturnFocus) return;
  const state = finderReturnFocus; finderReturnFocus = null;
  if (!location.hash.startsWith('#/collection/diamonds')) return;
  if (state.expanded) { document.querySelector('.finder-sidebar')?.classList.add('is-open'); document.querySelector('.finder-mobile-toggle')?.setAttribute('aria-expanded','true'); }
  document.getElementById(state.id)?.focus({preventScroll:true});
  window.scrollTo({top:state.y,behavior:'instant'});
}
function applyDiamondFilters(form, focusId='diamond-apply-preferences') {
  form.querySelectorAll('.finder-range-field').forEach(syncDiamondRange);
  if (!form.reportValidity()) return;
  const previous = new URLSearchParams(location.hash.split('?')[1]||''), params = new URLSearchParams(new FormData(form));
  for (const key of ['shape','build','q']) if(previous.has(key)) params.set(key,previous.get(key));
  for (const [key,value] of [...params]) if(!value || value==='featured') params.delete(key);
  rememberFinderPosition(focusId);
  const hash = '#/collection/diamonds' + (params.size?'?'+params.toString():'');
  // Reapplying the same values does not trigger hashchange; complete the
  // focus/scroll restoration here instead of leaving a pending route state.
  if(location.hash===hash) restoreFinderPosition(); else location.hash=hash;
}
