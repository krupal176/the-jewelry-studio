'use strict';

// Completed rings retain both components and optional engraving; never double-count a center stone.
function normalizeRingCartItem(item) {
  if (!item || typeof item !== 'object' || item.kind !== 'ring') return null;
  const setting = getProduct(item.id), diamond = getProduct(item.diamondId);
  if (setting?.category !== 'engagement' || diamond?.category !== 'diamonds') return null;
  if (!Array.isArray(setting.metal) || !(setting.metal.includes(item.metal)||(!setting.metal.length&&item.metal==='To be confirmed'))) return null;
  if (typeof item.size !== 'string' || !RING_SIZES.includes(item.size)) return null;
  if (!Number.isInteger(item.qty) || item.qty < 1) return null;
  const engraving=setting.engravingAllowed?normalizedEngraving(item.engraving):null;
  return {...(engraving?{engraving}:{}),kind:'ring', id:setting.id, diamondId:diamond.id, metal:item.metal,
    size:item.size, option:`${item.metal} · US size ${item.size}`, qty:1};
}

function cartLinePrice(item) {
  if (!item) return 0;
  const product = getProduct(item.id);
  if (!product) return 0;
  if (item.kind === 'ring') {
    const normalized = normalizeRingCartItem(item);
    return normalized ? ringPrice(product,getProduct(normalized.diamondId),normalized.engraving) : null;
  }
  return Number.isFinite(product.price)?product.price:null;
}

function cartLineKey(item) {
  return item.kind === 'ring'
    ? JSON.stringify(['ring', item.id, item.diamondId, item.metal, item.size])
    : JSON.stringify(['product', item.id, item.option]);
}

function ringCartItems() {
  return cart.flatMap((item, index) => {
    if (item.kind === 'ring') {
      const normalized = normalizeRingCartItem(item);
      return normalized ? [{...normalized, index, product:getProduct(normalized.id)}] : [];
    }
    const product = getProduct(item.id);
    return product ? [{...item, index, product}] : [];
  });
}

function ringCartSpecs(product) {
  return `<dl class="diamond-cart-specs">${diamondCommerceSpecs(product).map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
}

function ringSelectionLine(item, checkout = false) {
  const product = item.product;
  const title = esc(product.title), href = `#/product/${encodeURIComponent(product.id)}`;
  const prefix = checkout ? 'checkout' : 'cart-page';
  const labelId = `${prefix}-item-${item.index}`;
  const remove = checkout ? '' : `<button type="button" class="diamond-cart-remove" id="cart-page-remove-${item.index}" data-cart-page-remove="${item.index}" aria-label="Remove ${title} from your cart">Remove</button>`;
  if (item.kind !== 'ring') {
    const specs = product.category === 'diamonds' ? ringCartSpecs(product) : `<p class="diamond-cart-option">${esc(item.option)}</p>`;
    const selectedMetal = (product.metal || []).find(metal => String(item.option || '').startsWith(metal));
    return `<article class="diamond-cart-item" aria-labelledby="${labelId}">
      <a class="diamond-cart-photo" href="${href}" aria-label="View ${title}"><img src="${esc(productPhoto(product, selectedMetal))}" alt="${title}" loading="lazy" width="240" height="260"></a>
      <div class="diamond-cart-item-copy"><p class="diamond-cart-kind">${product.category === 'diamonds' ? (product.origin==='natural'?'Natural diamond':'Lab-grown diamond') : 'The Jewelry Studio'}</p>
        <h2 id="${labelId}"><a href="${href}">${title}</a></h2><p class="studio-sku">SKU: ${esc(product.sku)}</p>${specs}
        <div class="diamond-cart-item-bottom"><div class="diamond-cart-line-total"><span>Total</span><strong>${currency(cartLinePrice(item))}</strong></div></div>${remove}
      </div>
    </article>`;
  }
  const diamond = getProduct(item.diamondId), diamondTitle = esc(diamond.title);
  return `<article class="diamond-cart-item rb-cart-ring" aria-labelledby="${labelId}">
    <figure class="rb-cart-pair">
      <a class="diamond-cart-photo rb-cart-setting-photo" href="${href}" aria-label="View ring design ${title}"><img src="${esc(productPhoto(product,item.metal))}" alt="${title}, selected metal source ring photograph" width="240" height="260" loading="lazy"></a>
      <div class="rb-cart-diamond-pair"><span aria-hidden="true">＋</span><a href="#/product/${encodeURIComponent(diamond.id)}" aria-label="View selected diamond ${diamondTitle}"><img src="${esc(diamond.image)}" alt="${diamondTitle}, separate selected diamond" width="72" height="72" loading="lazy"></a><span>Selected<br>diamond</span></div>
      <figcaption>Concept pairing · separate catalog photos. Mounted result is illustrative, not a rendered pairing.</figcaption>
    </figure>
    <div class="diamond-cart-item-copy">
      <p class="diamond-cart-kind">Your ring selection</p><h2 id="${labelId}"><a href="${href}">${title}</a></h2><p class="studio-sku">SKU: ${esc(product.sku)}</p>
      <dl class="rb-cart-preferences"><div><dt>Metal preference</dt><dd>${esc(item.metal)}</dd></div><div><dt>US ring size</dt><dd>${esc(item.size)}</dd></div></dl>
      <div class="rb-cart-diamond-copy"><p class="diamond-cart-kind">Your selected diamond</p><h3><a href="#/product/${encodeURIComponent(diamond.id)}">${diamondTitle}</a></h3><p class="studio-sku">SKU: ${esc(diamond.sku)}</p>${ringCartSpecs(diamond)}</div>
      <dl class="rb-cart-prices"><div><dt>${product.priceBasis==='setting-component'?'Ring component':'Complete-ring reference'}</dt><dd>${currency(product.price)}</dd></div><div><dt>Selected diamond</dt><dd>${currency(diamond.price)}</dd></div>${item.engraving?`<div><dt>Engraving</dt><dd>${product.engravingFee===null?'To be quoted':currency(product.engravingFee)}</dd></div>`:''}<div class="rb-cart-combined"><dt>Combined subtotal</dt><dd>${cartLinePrice(item)===null?'Quote required':currency(cartLinePrice(item))}</dd></div></dl>
      ${cartLinePrice(item)===null?'<p class="rb-cart-price-note">A verified component quote is needed. No diamond is added twice to a complete-ring price.</p>':''}
      ${item.engraving?`<p class="studio-engraving-saved">“${esc(item.engraving.text)}” · ${esc(item.engraving.font)}</p>`:''}
      ${!checkout&&product.engravingAllowed?`<button class="button outline studio-engrave-button" type="button" data-engraving="${item.index}">${item.engraving?'Edit':'＋ Add'} engraving</button>`:''}
      ${checkout ? '' : `<div class="rb-cart-actions"><button type="button" class="text-link" id="cart-page-edit-${item.index}" data-edit-ring="${item.index}" aria-label="Edit ring selection ${title}">Edit ring <span aria-hidden="true">↗</span></button>${remove}</div>`}
    </div>
  </article>`;
}

function ringCartSummary(items, checkout = false) {
 const needsQuote=items.some(item=>cartLinePrice(item)===null),total=items.reduce((sum,item)=>sum+(cartLinePrice(item)??0),0);
 return `<aside class="diamond-cart-summary rb-cart-summary"><h2>Order summary</h2><p class="rb-cart-summary-count">${items.length} ${items.length===1?'selection':'selections'}</p>
 <dl class="diamond-cart-totals"><div><dt>${needsQuote?'Priced items only':'Subtotal'}</dt><dd>${currency(total)}</dd></div><div class="diamond-cart-estimate"><dt>Total</dt><dd>${needsQuote?'Quote required':currency(total)}</dd></div></dl><p class="diamond-cart-excludes">USD · Shipping and taxes calculated after integration.</p>${items.some(item=>item.product.isDemo||getProduct(item.diamondId)?.isDemo)?'<p class="studio-demo-note">Demo selections and sample prices. Not a live offer.</p>':''}
 ${needsQuote?'<p class="studio-error">One or more selections require a studio quote. The priced-items amount is not your final total.</p>':''}
 ${checkout?'':`<form id="promo-preview-form" class="studio-promo"><label for="promo-code">Promo code</label><div><input id="promo-code" name="code" maxlength="30" placeholder="Enter your code" required><button type="submit" aria-label="Check promo code">→</button></div><p id="promo-status" role="status"></p></form>`}
 ${financeNote()}
 ${checkout?'<button class="button full" data-action="export-bag">Download selection summary ↓</button><a class="rb-cart-back" href="#/cart">Back to cart</a>':'<a class="button full" href="#/checkout">Checkout ↗</a>'}
 <p class="diamond-cart-note">Local preview. No order or payment is submitted. Shopify checkout and active promotions are not connected.</p></aside>`;
}

function ringCartEmpty(checkout = false) {
  return `<div class="diamond-cart-empty"><span class="diamond-cart-empty-mark" aria-hidden="true">◇</span><h2>${checkout ? 'Your selection starts here.' : 'Your cart is waiting for its first spark.'}</h2><p>${checkout ? 'Add a diamond or complete your ring selection before reviewing it here.' : 'Find your diamond, choose a design, and bring your ring together.'}</p><a class="button" href="#/collection/diamonds">Explore diamonds <span aria-hidden="true">↗</span></a>${checkout ? '<a class="rb-cart-back" href="#/cart">Back to cart</a>' : ''}</div>`;
}

function ringCartPage() {
  const items = ringCartItems();
  return localMarkup(`<section class="diamond-cart-page rb-cart" data-cart-page aria-labelledby="diamond-cart-title">
    <div class="diamond-cart-heading"><div><p class="eyebrow">Your selection</p><h1 id="diamond-cart-title" tabindex="-1">Your cart</h1><p>${items.length ? `${items.length} ${items.length === 1 ? 'selection' : 'selections'}, chosen by you.` : 'A little room for brilliance.'}</p></div><a class="diamond-cart-continue" href="#/collection/diamonds"><span aria-hidden="true">←</span> Continue shopping</a></div>
    ${items.length ? `<div class="diamond-cart-layout"><div class="diamond-cart-items">${items.map(item => ringSelectionLine(item)).join('')}</div>${ringCartSummary(items)}</div>` : ringCartEmpty()}
  </section>`);
}

function ringCheckoutPage() {
  const items = ringCartItems();
  return localMarkup(`<section class="diamond-cart-page rb-cart rb-checkout" data-checkout-page aria-labelledby="ring-checkout-title">
    <nav class="rb-checkout-crumb" aria-label="Breadcrumb"><a href="#/cart">Your cart</a><span aria-hidden="true">/</span><span aria-current="page">Checkout review</span></nav>
    <div class="diamond-cart-heading"><div><p class="eyebrow">LOCAL PREVIEW / REVIEW ONLY</p><h1 id="ring-checkout-title" tabindex="-1">Review your selection.</h1><p>A final look at the pieces you have chosen.</p></div><a class="diamond-cart-continue" href="#/cart"><span aria-hidden="true">←</span> Back to cart</a></div>
    <div class="rb-checkout-notice"><span aria-hidden="true">◇</span><p><strong>Checkout is disconnected in this local preview.</strong> No personal details or payment are collected, and no order is placed. You can download your selections to keep for a future studio conversation.</p></div>
    ${items.length ? `<div class="diamond-cart-layout"><div class="diamond-cart-items">${items.map(item => ringSelectionLine(item, true)).join('')}</div>${ringCartSummary(items, true)}</div>` : ringCartEmpty(true)}
  </section>`);
}
