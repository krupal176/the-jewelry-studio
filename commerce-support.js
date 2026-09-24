'use strict';

// Shared presentation and quote rules. No payment or supplier credentials belong here.
const ENGRAVING_FONTS = ['Classic serif', 'Modern sans', 'Script'];
const currency = value => value===null||value===undefined||!Number.isFinite(Number(value))?'Price on request':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
const productThumb=url=>/^assets\/rings\/er-\d+-\d+\.webp$/.test(url)?url.replace('assets/rings/','assets/rings/thumbs/'):url;
function productMetal(product,preferred='') {
  return product.metal.includes(preferred)?preferred:product.metal.includes(product.defaultMetal)?product.defaultMetal:product.metal[0]||'';
}
function productPhotos(product,metal='') {
  const chosen=productMetal(product,metal), images=product.metalImages?.[chosen];
  return images?.length?images:product.images?.length?product.images:[product.image];
}
function productPhoto(product,metal='') {return productPhotos(product,metal)[0]||product.image;}
function demoNote(product) {return product.isDemo?'<p class="studio-demo-note">Demo pricing & options · local preview only</p>':'';}
function ringAngleGallery(product,metal='') {
  const selected=productMetal(product,metal),images=productPhotos(product,selected);
  return '<div class="ring-angle-gallery" data-angle-gallery><div class="ring-angle-grid">'+images.map((src,i)=>'<figure><button type="button" data-ring-photo="'+esc(src)+'" aria-label="Enlarge angle '+(i+1)+' of '+esc(product.title)+'"><img src="'+esc(src)+'" alt="'+esc(product.title)+' · '+esc(selected)+' · angle '+(i+1)+'" width="700" height="700" '+(i>1?'loading="lazy"':'')+'><span aria-hidden="true">＋</span></button></figure>').join('')+'</div><p class="rb-caption">'+(selected==='Platinum'?'Platinum preview uses the supplied white-metal photographs. ':'')+'Original product photos. The pictured center stone is illustrative; final fit is confirmed by the studio.</p></div>';
}
function normalizedEngraving(value) {
  if(!value || typeof value.text !== 'string') return null;
  const text=[...value.text.trim()].slice(0,30).join('');
  return text ? {text,font:ENGRAVING_FONTS.includes(value.font)?value.font:ENGRAVING_FONTS[0]} : null;
}
function ringPrice(setting, diamond, engraving=null) {
  if(!setting || !diamond || setting.priceBasis!=='setting-component'||!Number.isFinite(setting.price)||!Number.isFinite(diamond.price)) return null;
  if(engraving && (!setting.engravingAllowed || setting.engravingFee===null)) return null;
  return setting.price+diamond.price+(engraving?setting.engravingFee:0);
}
function ringFit(setting,diamond) {
  if(!setting||!diamond)return '';
  if(setting.compatibleShapes?.length&&!setting.compatibleShapes.includes(diamond.shape))return 'This diamond shape is not supported by this ring design.';
  if(setting.minCarat!==null&&diamond.carat<setting.minCarat)return 'This diamond is smaller than the stated fitting range.';
  if(setting.maxCarat!==null&&diamond.carat>setting.maxCarat)return 'This diamond exceeds the stated fitting range.';
  return '';
}
function productGallery(product) {
  const images=product.images?.length?product.images:[product.image];
  return `<div class="studio-gallery"><button class="diamond-detail-image" type="button" data-diamond-zoom aria-label="Enlarge product image" aria-pressed="false"><img src="${esc(images[0])}" alt="${esc(product.title)}" width="700" height="700"><span class="diamond-zoom-label">View closer ＋</span></button>${images.length>1?`<div class="studio-thumbnails" role="group" aria-label="Product images">${images.map((url,i)=>`<button type="button" data-gallery-src="${esc(url)}" aria-label="View image ${i+1}" aria-pressed="${i===0}"><img src="${esc(productThumb(url))}" alt="" loading="lazy"></button>`).join('')}</div>`:''}${product.video?`<a class="text-link" href="${esc(product.video)}" target="_blank" rel="noopener">View supplied video ↗</a>`:''}<p class="rb-caption">Product photography. Metal and mounted diamond may differ from your selection.</p></div>`;
}
function itemDetails(product){return `<button type="button" class="studio-item-trigger" data-item-details="${esc(product.id)}">About this item <span aria-hidden="true">↗</span></button>`;}

function itemDetailsContent(product){
  const field=(label,value)=>`<div><dt>${esc(label)}</dt><dd>${esc(value===null||value===undefined||value===''?'To be confirmed':value)}</dd></div>`;
  const isDiamond=product.category==='diamonds';
  return `<div class="studio-item-sheet"><p class="eyebrow">${esc(product.sku)}</p><h3>${esc(product.title)}</h3><p>${esc(product.description)}</p>${product.sourceStockId?'<p class="form-note">Supplied design notes. Metal purity, stone grades, measurements and availability require studio confirmation. Demo prices/options are not verified offers.</p>':''}<h3>Item details</h3><dl>${field('SKU',product.sku)}${product.sourceStockId?field('Supplier reference',product.sourceStockId):''}${isDiamond?field('Origin',product.origin==='natural'?'Natural':'Lab-grown')+field('Report number',product.reportNumber):field(product.isDemo?'Demo metal options':'Available metals',product.metal.join(' / '))+field('Band width',product.width===null?'':product.width+' mm')+field('Setting type',product.settingType)}</dl><h3>${isDiamond?'Diamond information':'Stone details'}</h3><dl>${isDiamond?['cut','certification','polish','symmetry','fluorescence','depth','table','ratio'].map(k=>field(k[0].toUpperCase()+k.slice(1),product[k])).join(''):field('Pictured center shape',product.shape)+field('Side-stone count',product.sideStoneCount)+field('Side-stone weight',product.sideStoneCarat===null?'':product.sideStoneCarat+' ct')+field('Side-stone color',product.sideStoneColor)+field('Side-stone clarity',product.sideStoneClarity)+field('Compatible center shapes',product.compatibleShapes.join(', '))+field('Center-stone range',product.minCarat!==null&&product.maxCarat!==null?`${product.minCarat}–${product.maxCarat} ct`:'')}</dl>${product.category==='engagement'?'<p>Ring designs are offered with a center diamond, never as standalone settings. Fit must be checked before production.</p>':''}</div>`;
}
function studioJewelryDetail(product){
  activeMetal=productMetal(product,builder.metalPreferences?.[product.id])||'To be confirmed';
  const saved=favorites.includes(product.id);
  return `<section class="rb-page ring-product-page" data-jewelry-product="${product.id}"><nav class="diamond-detail-crumb" aria-label="Breadcrumb"><a href="#/collection/${product.category}">${esc(COLLECTION_LABELS[product.category]||'Jewelry')}</a><span>/</span><span>${esc(product.sku)}</span></nav><div class="rb-layout"><div>${ringAngleGallery(product,activeMetal)}</div><div class="rb-copy"><p class="eyebrow">THE JEWELRY STUDIO · ${esc(product.sku)}</p><h1>${esc(product.title)}</h1><p class="rb-price">${currency(product.price)}</p>${demoNote(product)}<p>${esc(product.description.split('. ')[0])}.</p>${product.metal.length?`<label class="option-label">Metal preference</label><div class="metal-options">${product.metal.map((m,i)=>`<button data-metal="${esc(m)}" class="${m===activeMetal?'active':''}" aria-pressed="${m===activeMetal}">${esc(m)}</button>`).join('')}</div>`:'<p class="rb-disclosure">Metal options and final specifications are being confirmed.</p>'}${['wedding','mens-rings'].includes(product.category)?`<label class="option-label" for="ring-size">US ring size preference</label><select id="ring-size"><option value="Not selected">Choose later</option>${RING_SIZES.map(s=>`<option>${s}</option>`).join('')}</select>`: ''}<div class="buy-row"><button class="button full" data-add="${product.id}">${product.price===null?'Save to cart for a quote':'Add to Cart'} ↗</button><button type="button" class="icon${saved?' saved':''}" data-favorite="${product.id}" aria-label="${saved?'Unsave':'Save'} ${esc(product.title)}" aria-pressed="${saved}">${icon('heart')}</button></div>${itemDetails(product)}<p class="rb-disclosure">Local selection only. No order or payment is placed.</p>${financeNote()}</div></div></section>`;
}
function financeNote() { return '<p class="studio-finance"><strong>Afterpay</strong> · Planned payment option, not enabled yet. Availability and eligibility will be confirmed at checkout after integration. <a href="#/policy/payments">Payment information ↗</a></p>'; }
function openEngraving(index) {
  const item=cart[index],product=getProduct(item?.id);
  if(!item || item.kind!=='ring'||!product?.engravingAllowed)return;
  const current=normalizedEngraving(item.engraving);
  openPanel('Engraving details',`<form id="engraving-form" data-cart-index="${index}"><p>A personal detail, just for you.</p><label for="engraving-font">Lettering style</label><select id="engraving-font" name="font">${ENGRAVING_FONTS.map(font=>`<option ${font===current?.font?'selected':''}>${font}</option>`).join('')}</select><label for="engraving-text">Your message</label><input id="engraving-text" name="text" maxlength="30" value="${esc(current?.text||'')}" placeholder="Always, with you" autocomplete="off"><p class="form-note">Up to 30 characters in this preview. Final lettering, fit and availability need studio approval.</p><div id="engraving-preview" class="engraving-preview" data-font="${esc(current?.font||ENGRAVING_FONTS[0])}">${esc(current?.text||'Your words, forever.')}</div><p>${product.engravingFee===null?'Engraving price to be confirmed.':`Engraving: ${currency(product.engravingFee)}`}</p><button type="submit" class="button full">Save engraving</button>${current?'<button type="button" class="text-link" data-engraving-clear>Remove engraving</button>':''}</form>`);
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-metal')&&button.closest('[data-jewelry-product]')){
    const root=button.closest('[data-jewelry-product]'),p=getProduct(root.dataset.jewelryProduct),metal=button.dataset.metal;
    if(p?.metal.includes(metal)){builder.metalPreferences={...(builder.metalPreferences||{}),[p.id]:metal};root.querySelector('[data-angle-gallery]').outerHTML=ringAngleGallery(p,metal);save();}
  }
  if(button.hasAttribute('data-card-metal')){
    const card=button.closest('[data-product-card]'),p=getProduct(card?.dataset.productCard),metal=button.dataset.cardMetal;
    if(!p?.metal.includes(metal))return;
    builder.metalPreferences={...(builder.metalPreferences||{}),[p.id]:metal};save();
    const photos=productPhotos(p,metal);card.dataset.cardSelectedMetal=metal;
    delete card.querySelector('.product-image').dataset.alternateReady;
    card.querySelector('.product-image img').src=productThumb(photos[0]);
    const alternate=card.querySelector('.product-image-alternate');if(alternate)alternate.src=productThumb(photos[1]||photos[0]);
    card.querySelectorAll('[data-card-metal]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    card.querySelector('.card-metal-label').textContent=metal+(p.width?' · '+p.width+' mm':'');
  }
  if(button.hasAttribute('data-ring-photo'))openPanel('A closer look','<img class="studio-photo-lightbox" src="'+esc(button.dataset.ringPhoto)+'" alt="Enlarged ring photograph">');
  if(button.hasAttribute('data-item-details')){const product=getProduct(button.dataset.itemDetails);if(product)openPanel('About this item',itemDetailsContent(product));}
  if(button.hasAttribute('data-gallery-src')){
    const root=button.closest('.studio-gallery');root.querySelector('.diamond-detail-image img').src=button.dataset.gallerySrc;
    root.querySelectorAll('[data-gallery-src]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }
  if(button.hasAttribute('data-engraving'))openEngraving(Number(button.dataset.engraving));
  if(button.hasAttribute('data-engraving-clear')){
    const index=Number(button.closest('form').dataset.cartIndex);if(cart[index]){delete cart[index].engraving;save();closePanel();}
  }
  if(button.hasAttribute('data-rb-clear')){
    const key=button.dataset.rbClear;if(!['ring','diamond'].includes(key))return;
    delete builder[key];delete builder.editKey;delete builder.engraving;save();route();
  }
  if(button.hasAttribute('data-custom-jump'))document.getElementById('custom-brief')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
document.addEventListener('input',event=>{
  const form=event.target.closest('#engraving-form');if(!form)return;
  const preview=document.getElementById('engraving-preview');preview.textContent=form.elements.text.value||'Your words, forever.';preview.dataset.font=form.elements.font.value;
});
document.addEventListener('submit',event=>{
  if(event.target.id==='engraving-form'){
    event.preventDefault();const form=event.target,index=Number(form.dataset.cartIndex);if(!cart[index])return;
    cart[index].engraving=normalizedEngraving({text:form.elements.text.value,font:form.elements.font.value});save();closePanel();toast('Engraving saved with your ring selection.');
  }
  if(event.target.id==='promo-preview-form'){
    event.preventDefault();document.getElementById('promo-status').textContent='No active promotions are connected yet. Codes will be validated by Shopify at checkout.';
  }
});
// Only reveal a second angle after it has loaded. The first photograph remains
// visible on slow connections; changing metals resets readiness before loading.
document.addEventListener('load',event=>{
  const image=event.target;
  if(image.matches?.('.product-image-alternate'))image.closest('.product-image').dataset.alternateReady='true';
},true);
document.addEventListener('error',event=>{
  const image=event.target;
  if(image.matches?.('.product-image-alternate'))delete image.closest('.product-image').dataset.alternateReady;
},true);
