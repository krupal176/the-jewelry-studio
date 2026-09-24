'use strict';

// Diamond-only product presentation and a cart page backed by the existing
// local cart. Missing supplier fields remain explicit; no grades are inferred.
function diamondCommerceSpecs(product) {
  const specs = diamondSpecs(product);
  return [['Carat', specs.carat === null ? 'Not provided' : `${specs.carat.toFixed(2)} ct`],
    ['Shape', product.shape || 'Not provided'], ['Color', specs.color || 'Not provided'],
    ['Clarity', specs.clarity || 'Not provided'], ['Cut', product.cut || 'Not provided'],
    ['Certification', product.certification || 'Report not provided']];
}

function diamondDetailPage(product) {
  const specs = diamondCommerceSpecs(product), saved = favorites.includes(product.id);
  return `${ringBuilderSteps('diamond')}<section class="diamond-detail-page" data-diamond-detail>
    <nav class="diamond-detail-crumb" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/collection/diamonds">Diamonds</a><span aria-hidden="true">/</span><span>${esc(product.shape)} diamond</span></nav>
    <div class="diamond-detail-layout">
      <div class="diamond-detail-gallery" aria-label="Diamond gallery">
        ${productGallery(product)}
      </div>
      <div class="diamond-detail-copy">
        <p class="eyebrow">THE DIAMOND STUDIO / ${product.origin==='natural'?'NATURAL':'LAB-GROWN'}</p>
        <h1>${esc(product.title)}</h1>${demoNote(product)}
        <div class="diamond-detail-price">${currency(product.price)} <span>USD</span></div>
        <p class="diamond-detail-description">A ${esc(specs[0][1])} ${esc(product.shape.toLowerCase())} ${product.origin==='natural'?'natural':'lab-grown'} diamond with ${esc(specs[2][1])} color and ${esc(specs[3][1])} clarity. Make it the starting point for your ring, or save the loose diamond to your cart.</p>
        <dl class="diamond-detail-specs">${specs.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>
        ${ringBuildSelection().setting?`<aside class="rb-selected-diamond"><img src="${localMarkup(productPhoto(ringBuildSelection().setting,ringBuildSelection().metal))}" alt=""><div><small>Your selected setting · ${esc(ringBuildSelection().metal)}</small><h2>${esc(ringBuildSelection().setting.title)}</h2><a href="#/collection/engagement?build=1">Change setting ↗</a></div></aside>`:''}
        ${itemDetails(product)}${product.reportUrl?`<a class="text-link" href="${esc(product.reportUrl)}" target="_blank" rel="noopener">View ${esc(product.certification||"grading")} report ↗</a>`:""}<div class="diamond-detail-actions"><button class="button full" type="button" data-choose-diamond="${product.id}">Choose the Diamond <span aria-hidden="true">↗</span></button><button class="button outline full" type="button" data-diamond-add="${product.id}">Add to Cart <span aria-hidden="true">＋</span></button></div>
        <p class="diamond-detail-action-note">${ringBuildSelection().setting?'Your setting is saved. Continue to review your ring.':'Choose the Diamond continues to setting selection.'}</p>
        <div class="diamond-detail-secondary"><button class="text-link" type="button" data-favorite="${product.id}" aria-label="${saved?'Unsave':'Save'} ${esc(product.title)}" aria-pressed="${saved}">${icon('heart')}<span class="diamond-favorite-save">Save to favorites</span><span class="diamond-favorite-saved">Saved to favorites</span></button><a class="text-link" href="#/cart">View cart <span aria-hidden="true">↗</span></a></div>
        <p class="diamond-detail-preview-note">Local preview · Supplier availability and final pricing must be rechecked before ordering.</p>
      </div>
    </div>
    ${financeNote()}<div class="diamond-detail-reading"><details><summary>Delivery &amp; returns</summary><p>Terms and delivery estimates will be published after approval.</p><a href="#/policy/returns">Return policy status ↗</a></details><details><summary>Understand your diamond</summary><p>Explore cut, color, clarity and carat before you choose.</p><a href="#/education">Explore the 4 Cs ↗</a></details></div>
  </section>`;
}

function addDiamondToCart(id) {
  const product = getProduct(id);
  if (!product || product.category !== 'diamonds') return;
  const existing = cart.find(item => item.id === id || (item.kind==='ring'&&item.diamondId===id));
  if (!existing) cart.push({id, option:'Loose diamond', qty:1});
  save();
  if (existing) toast(existing.kind==='ring'?'This diamond is already part of your ring selection.':'This diamond is already in your cart.');
  location.hash = '/cart';
}

// Also keeps the full-page cart current when the existing bag drawer is edited.
function refreshDiamondCartPage() {
  const path = location.hash.split('?')[0], checkout = path === '#/checkout';
  if(path !== '#/cart' && !checkout)return;
  const page = document.querySelector(checkout ? '[data-checkout-page]' : '[data-cart-page]');
  if (!page) return;
  const active = page.contains(document.activeElement) ? document.activeElement.id : '';
  const y = window.scrollY;
  page.outerHTML = localMarkup(checkout ? ringCheckoutPage() : diamondCartPage());
  if (active) document.getElementById(active)?.focus({preventScroll:true});
  window.scrollTo({top:y, behavior:'instant'});
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-diamond-zoom')) {
    const enlarged = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(enlarged));
    const subject = button.closest('[data-ring-setting]') ? 'ring' : 'diamond';
    button.setAttribute('aria-label', `${enlarged ? 'Restore' : 'Enlarge'} ${subject} image`);
    button.querySelector('.diamond-zoom-label').innerHTML = enlarged ? 'View full image <span aria-hidden="true">−</span>' : 'View closer <span aria-hidden="true">＋</span>';
  }
  if (button.dataset.diamondAdd) addDiamondToCart(button.dataset.diamondAdd);
  if (!button.closest('[data-cart-page]')) return;
  if (button.hasAttribute('data-cart-page-remove')) {
    const index = Number(button.dataset.cartPageRemove);
    if (!Number.isInteger(index) || !cart[index]) return;
    cart.splice(index,1);save();toast('Removed from your cart.');
    document.querySelector('[data-cart-page] h1')?.focus({preventScroll:true});
  }
});

function diamondCartPage() { return ringCartPage(); }
