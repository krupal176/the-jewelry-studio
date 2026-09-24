'use strict';

// Ring listing filters use the catalog's complete-ring starting prices.
// They neither infer inventory nor calculate metal-specific or setting-only prices.
function ringListingMetals(category) {
  const found=[...new Set(CATALOG.filter(product => product.category === category).flatMap(product => product.metal || []))];return found.length?found:TJSInventory.metals;
}

function ringListingPriceCeiling(category) {
  const prices = CATALOG.filter(product => product.category === category).map(product => product.price).filter(Number.isFinite);
  return Math.max(10000, Math.ceil(Math.max(0, ...prices) / 100) * 100);
}

function ringListingFilterState(category, params) {
  const ceiling = ringListingPriceCeiling(category);
  const minRaw = params.get('priceMin') || '';
  const maxRaw = params.get('price') === 'all' ? '' : params.get('price') || '';
  const min = minRaw.trim() === '' ? 0 : Number(minRaw);
  const max = maxRaw.trim() === '' ? ceiling : Number(maxRaw);
  const metal = params.get('metal') || '';
  const invalidMin = !Number.isFinite(min) || min < 0;
  const invalidMax = !Number.isFinite(max) || max < 0;
  let error = '';
  if (invalidMin || invalidMax) error = 'Enter a valid, non-negative price for both ends of the range.';
  else if (min > max) error = 'Minimum price must be less than or equal to maximum price.';
  else if (metal && !ringListingMetals(category).includes(metal)) error = 'This metal is not listed in this collection. Choose one of the metals below.';
  return { min, max, minRaw, maxRaw, metal, ceiling, error, invalidMin, invalidMax,
    sliderMax: Math.max(ceiling, Number.isFinite(min) && min >= 0 ? Math.ceil(min / 100) * 100 : 0, Number.isFinite(max) && max >= 0 ? Math.ceil(max / 100) * 100 : 0) };
}

function ringListingProducts(category, params) {
  const state = ringListingFilterState(category, params);
  if (state.error) return [];
  // Reuse explicit style memberships, shape/search matching, and existing sorts.
  return collectionProducts(category, params).filter(product =>
    (product.price===null?!state.minRaw&&!state.maxRaw:product.price >= state.min && product.price <= state.max) &&
    (!state.metal || product.metal.includes(state.metal))
  );
}

function ringListingPage(category, params) {
  const state = ringListingFilterState(category, params);
  const products = ringListingProducts(category, params);
  const style = params.get('style') || '';
  const selected = collectionStyle(category, style);
  const shape = params.get('shape') || '';
  const sort = params.get('sort') || 'featured';
  const query = params.get('q') || '';
  const guide = COLLECTION_GUIDES[category];
  const fallbackParams = new URLSearchParams();
  if (params.has('build')) fallbackParams.set('build', params.get('build'));
  const fallback = `#/collection/${category}${fallbackParams.size ? '?' + fallbackParams.toString() : ''}`;
  const unprepared = Boolean(selected && !CATALOG.some(p=>p.category===category&&p.styles?.includes(style)));
  const contents = products.length ? productGrid(products) : unprepared
    ? `<div class="collection-preparing"><p class="eyebrow">THE NEXT CHAPTER</p><h2>${esc(selected.label)}. Worth the wait.</h2><p>This collection is being prepared. There are no confirmed ${esc(selected.label.toLowerCase())} ${COLLECTION_LABELS[category].toLowerCase()} in this preview yet.</p><a class="button outline" href="${esc(fallback)}">Explore all ${COLLECTION_LABELS[category].toLowerCase()} ↗</a><a class="text-link" href="#/custom">Prepare a custom-design brief ↗</a></div>`
    : empty(style && !selected ? 'Let’s find your collection.' : state.error ? 'Check your filters.' : 'A different combination. A new possibility.',
      style && !selected ? 'This style link is not recognized. Explore the collection to choose one.' : state.error ? esc(state.error) : 'No rings match this combination. Try a different style, metal or price range.',
      `Explore all ${COLLECTION_LABELS[category].toLowerCase()}`, esc(fallback));
  const metalClass = metal => ({ 'White gold': 'white', 'Yellow gold': 'yellow', 'Rose gold': 'rose', Platinum: 'platinum' }[metal] || 'other');
  const metalButton = (metal, label) => `<button type="button" class="ring-listing-metal ${state.metal === metal ? 'is-selected' : ''}" data-ring-metal="${esc(metal)}" aria-pressed="${state.metal === metal}"><span class="ring-listing-metal-disc ring-listing-metal-${metal ? metalClass(metal) : 'all'}" aria-hidden="true">${metal ? '' : 'All'}</span><span>${esc(label)}</span></button>`;
  const minDisplay = state.invalidMin ? state.minRaw : state.min;
  const maxDisplay = state.invalidMax ? state.maxRaw : state.max;
  const sliderMin = Number.isFinite(state.min) ? Math.max(0, Math.min(state.sliderMax, state.min)) : 0;
  const sliderMax = Number.isFinite(state.max) ? Math.max(0, Math.min(state.sliderMax, state.max)) : state.ceiling;
  const context = typeof ringBuilderListingContext === 'function' ? ringBuilderListingContext(category, params) :
    params.has('build') ? '<p class="notice">Design board mode: open a piece and save it as inspiration. Ring prices include the listed ring; this is not a setting-only compatibility or price calculator.</p>' : '';
  return `<div class="page-heading ring-collection-heading"><p class="eyebrow">${COLLECTION_LABELS[category]}</p><h1>${CATEGORY_NAMES[category]}</h1><p>Distinctive pieces for the everyday rituals and once-in-a-lifetime moments.</p></div><section class="collection-body ring-listing" data-ring-listing data-category="${category}">
    ${context}
    ${collectionCategorySlider(category, params)}
    <form class="ring-listing-filters" data-ring-filters data-category="${category}" novalidate>
      <fieldset class="ring-listing-metals"><legend>Metal</legend><input type="hidden" name="metal" value="${esc(state.metal)}"><div class="ring-listing-metal-options">${metalButton('', 'All metals')}${ringListingMetals(category).map(metal => metalButton(metal, metal)).join('')}</div></fieldset>
      <fieldset class="ring-listing-prices"><legend>Price range <span>USD</span></legend><div class="ring-listing-range" data-ring-range>
        <div class="ring-listing-range-track" aria-hidden="true"><span data-ring-range-fill></span></div>
        <input type="range" data-ring-range-min aria-label="Minimum price" min="0" max="${state.sliderMax}" step="1" value="${sliderMin}">
        <input type="range" data-ring-range-max aria-label="Maximum price" min="0" max="${state.sliderMax}" step="1" value="${sliderMax}">
      </div><div class="ring-listing-price-inputs"><label for="ring-price-min">Minimum<span><i aria-hidden="true">$</i><input id="ring-price-min" name="priceMin" type="number" inputmode="decimal" min="0" step="any" value="${esc(minDisplay)}" aria-describedby="ring-filter-error"></span></label><span aria-hidden="true">—</span><label for="ring-price-max">Maximum<span><i aria-hidden="true">$</i><input id="ring-price-max" name="price" type="number" inputmode="decimal" min="0" step="any" value="${esc(maxDisplay)}" aria-describedby="ring-filter-error"></span></label></div></fieldset>
      <div class="ring-listing-summary"><p class="ring-listing-count" aria-live="polite">${products.length} ${products.length === 1 ? 'piece' : 'pieces'}${selected ? ` · ${esc(selected.label)}` : ''}${query ? ` · Search: ${esc(query)}` : ''}</p><div class="ring-listing-selects"><label>Shape<select name="shape" aria-label="Filter by shape"><option value="">All shapes</option>${SHAPES.map(item => `<option value="${item}" ${shape === item ? 'selected' : ''}>${item}</option>`).join('')}${shape && !SHAPES.includes(shape) ? `<option value="${esc(shape)}" selected>${esc(shape)}</option>` : ''}</select></label><label>Sort by<select name="sort">${[['featured', 'Studio selection'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['name', 'Name: A–Z']].map(([value, label]) => `<option value="${value}" ${sort === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div><button type="button" class="ring-listing-reset" data-ring-reset>Reset filters</button></div>
      <p class="ring-listing-error" id="ring-filter-error" role="alert" ${state.error ? '' : 'hidden'}>${esc(state.error)}</p>
    </form>
    ${contents}
    <div class="ring-listing-foot"><p class="snapshot-note">Local demo catalog · Sample USD prices and metal options. Center diamond additional. Nothing here is a live offer.</p><a class="text-link collection-guide" href="#/education/${guide[1]}">${guide[0]} ↗</a></div>
  </section>`;
}

let ringListingRestore = null;

function mountRingListing() {
  const root = document.querySelector('[data-ring-listing]');
  if (!root) { ringListingRestore = null; return; }
  const form = root.querySelector('[data-ring-filters]');
  if (form.dataset.mounted) return;
  form.dataset.mounted = 'true';
  const category = form.dataset.category;
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const minInput = form.elements.priceMin;
  const maxInput = form.elements.price;
  const minRange = form.querySelector('[data-ring-range-min]');
  const maxRange = form.querySelector('[data-ring-range-max]');
  const rangeFill = form.querySelector('[data-ring-range-fill]');
  const error = form.querySelector('.ring-listing-error');

  const draftState = () => {
    const draft = new URLSearchParams();
    draft.set('priceMin', minInput.value);
    draft.set('price', maxInput.value);
    draft.set('metal', form.elements.metal.value);
    const state = ringListingFilterState(category, draft);
    if (minInput.validity.badInput || maxInput.validity.badInput) state.error = 'Enter a valid, non-negative price for both ends of the range.';
    return state;
  };
  const showError = state => {
    error.textContent = state.error;
    error.hidden = !state.error;
    const rangeError = state.invalidMin || state.invalidMax || state.min > state.max || minInput.validity.badInput || maxInput.validity.badInput;
    minInput.setAttribute('aria-invalid', String(Boolean(rangeError)));
    maxInput.setAttribute('aria-invalid', String(Boolean(rangeError)));
  };
  const paintRange = () => {
    const min = Number(minRange.value), max = Number(maxRange.value), limit = Number(maxRange.max);
    rangeFill.style.left = `${min / limit * 100}%`;
    rangeFill.style.right = `${100 - max / limit * 100}%`;
    minRange.setAttribute('aria-valuetext', money(min));
    maxRange.setAttribute('aria-valuetext', money(max));
    minRange.setAttribute('aria-valuemax', String(max));
    maxRange.setAttribute('aria-valuemin', String(min));
    minRange.style.zIndex = min >= limit ? '3' : '2';
    maxRange.style.zIndex = min >= limit ? '2' : '3';
  };
  const syncRanges = state => {
    if (state.error) return;
    minRange.max = maxRange.max = String(state.sliderMax);
    minRange.value = String(state.min);
    maxRange.value = String(state.max);
    paintRange();
  };
  const go = (next, focusElement) => {
    const hash = `#/collection/${category}${next.size ? '?' + next.toString() : ''}`;
    if (hash === location.hash) return;
    ringListingRestore = { hash, y: window.scrollY, focus: focusElement?.id ? '#' + focusElement.id :
      focusElement?.hasAttribute('data-ring-metal') ? `[data-ring-metal="${focusElement.dataset.ringMetal}"]` :
      focusElement?.hasAttribute('data-ring-range-min') ? '[data-ring-range-min]' :
      focusElement?.hasAttribute('data-ring-range-max') ? '[data-ring-range-max]' :
      focusElement?.name ? `[name="${focusElement.name}"]` : '[data-ring-reset]' };
    location.hash = hash;
  };
  const apply = focusElement => {
    const state = draftState();
    showError(state);
    if (state.error) return false;
    syncRanges(state);
    const next = new URLSearchParams(params);
    state.min === 0 ? next.delete('priceMin') : next.set('priceMin', String(state.min));
    state.max === state.ceiling ? next.delete('price') : next.set('price', String(state.max));
    state.metal ? next.set('metal', state.metal) : next.delete('metal');
    form.elements.shape.value ? next.set('shape', form.elements.shape.value) : next.delete('shape');
    form.elements.sort.value === 'featured' ? next.delete('sort') : next.set('sort', form.elements.sort.value);
    go(next, focusElement);
    return true;
  };
  // The common category helper intentionally clears search on other collections;
  // ring listings retain the shopper's search across style changes.
  root.querySelectorAll('.collection-category-card').forEach(link => {
    if (!params.has('q')) return;
    const [path, search = ''] = link.hash.split('?');
    if (path !== `#/collection/${category}`) return;
    const next = new URLSearchParams(search);
    next.set('q', params.get('q'));
    link.hash = path + '?' + next.toString();
  });
  form.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-ring-metal')) {
      form.elements.metal.value = button.dataset.ringMetal;
      form.querySelectorAll('[data-ring-metal]').forEach(item => {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      apply(button);
    }
    if (button.hasAttribute('data-ring-reset')) {
      const next = new URLSearchParams(params);
      ['metal', 'priceMin', 'price', 'shape', 'sort'].forEach(key => next.delete(key));
      const hash = `#/collection/${category}${next.size ? '?' + next.toString() : ''}`;
      if (hash === location.hash) {
        minInput.value = '0'; maxInput.value = String(ringListingPriceCeiling(category));
        form.elements.metal.value = ''; form.elements.shape.value = ''; form.elements.sort.value = 'featured';
        form.querySelectorAll('[data-ring-metal]').forEach(item => { const selected = item.dataset.ringMetal === ''; item.classList.toggle('is-selected', selected); item.setAttribute('aria-pressed', String(selected)); });
        const state = draftState(); showError(state); syncRanges(state);
      } else go(next, button);
    }
  });
  form.addEventListener('input', event => {
    const target = event.target;
    if (target === minRange || target === maxRange) {
      if (target === minRange) minRange.value = String(Math.min(Number(minRange.value), Number(maxRange.value)));
      else maxRange.value = String(Math.max(Number(maxRange.value), Number(minRange.value)));
      minInput.value = minRange.value;
      maxInput.value = maxRange.value;
      paintRange(); showError(draftState());
    } else if (target === minInput || target === maxInput) {
      const state = draftState(); showError(state); syncRanges(state);
    }
  });
  form.addEventListener('change', event => {
    if (event.target.matches('input[type="number"], input[type="range"], select')) apply(event.target);
  });
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && (event.target === minInput || event.target === maxInput)) {
      event.preventDefault(); apply(event.target);
    }
  });
  form.addEventListener('submit', event => { event.preventDefault(); apply(document.activeElement); });
  paintRange();
  showError(ringListingFilterState(category, params));
  if (ringListingRestore?.hash === location.hash) {
    const restore = ringListingRestore;
    ringListingRestore = null;
    root.querySelector(restore.focus)?.focus({ preventScroll: true });
    window.scrollTo({ top: restore.y, behavior: 'instant' });
  }
}
