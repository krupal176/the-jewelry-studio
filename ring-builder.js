'use strict';

// Local selection state uses the existing tjs-builder-v2 record. No orders or
// compatibility claims are created; source ring prices are not setting quotes.
const RING_SIZES = Array.from({length:17}, (_,i) => String(4+i/2));
function ringBuildSelection() {
  const ring = getProduct(builder.ring), diamond = getProduct(builder.diamond);
  const setting = ring?.category === 'engagement' ? ring : null;
  return {setting, diamond:diamond?.category === 'diamonds' ? diamond : null,
    metal:setting?.metal.includes(builder.metal) ? builder.metal : setting?.defaultMetal || setting?.metal[0] || 'To be confirmed',
    size:RING_SIZES.includes(builder.size) ? builder.size : ''};
}

function ringBuilderSteps(active) {
 const s=ringBuildSelection(), order=builder.entry==='setting'||(!builder.entry&&active==='setting')?['setting','diamond','complete']:['diamond','setting','complete'];
 const steps={setting:['Setting',s.setting,'#/collection/engagement?build=1','ring'],diamond:['Diamond',s.diamond,'#/collection/diamonds?build=1','diamond'],complete:['Your ring',null,'#/your-ring','']};
 const ready=!!(s.setting&&s.diamond);
 return '<nav class="ring-journey rb-journey" aria-label="Your ring journey"><ol>'+order.map((key,i)=>{
   const [name,p,url,stateKey]=steps[key],current=key===active;
   const status=p?'Selected':key==='complete'?(ready?'Ready':'To come'):current?'Choose now':'Next';
   const summary=p?p.title:key==='complete'?(ready?'Choose your size & review':'Complete your pairing'):'Find the one you love';
   const compact=p?(key==='diamond'?[diamondSpecs(p).carat?diamondSpecs(p).carat.toFixed(2)+' ct':'',p.shape].filter(Boolean).join(' · '):p.sku||p.title):key==='complete'?(ready?'Pairing ready':'Your final pairing'):'Make your selection';
   return `<li class="${current?'current':''} ${p?'complete':''}" data-journey-step="${key}">
     <a class="journey-step-main" href="${url}" ${current?'aria-current="step"':''} aria-label="${esc(name+': '+status+'. '+summary)}">
       <span class="journey-number" aria-hidden="true">${p?'<svg viewBox="0 0 20 20"><path d="m5 10 3.4 3.4L15 6.6"/></svg>':i+1}</span>
       <span class="journey-step-body"><span class="journey-title-row"><strong>${name}</strong><span class="journey-state">${status}</span></span>
       <small class="journey-summary-full" title="${esc(summary)}">${esc(summary)}</small><small class="journey-summary-compact" title="${esc(summary)}">${esc(compact)}</small></span>
     </a>
     <div class="journey-step-actions">${p?`<a href="#/product/${p.id}" aria-label="View selected ${name.toLowerCase()}">View</a><button type="button" data-rb-clear="${stateKey}" aria-label="Remove selected ${name.toLowerCase()}">Remove</button>`:`<span class="journey-next">${key==='complete'?(ready?'Review your ring':'Made for you'):'Choose your '+name.toLowerCase()} <span aria-hidden="true">↗</span></span>`}</div>
   </li>`;
 }).join('')+'</ol></nav>';
}
function ringBuilderListingContext(category,params=new URLSearchParams()) {
 return category==='engagement'?ringBuilderSteps('setting'):'';
}

function ringSettingPage(product) {
  const s=ringBuildSelection(),preferred=builder.metalPreferences?.[product.id];
  const metal=productMetal(product,preferred||(s.setting?.id===product.id?s.metal:''));
  return ringBuilderSteps('setting')+'<section class="rb-page rb-setting ring-product-page" data-ring-setting="'+product.id+'">'+
    '<nav class="diamond-detail-crumb" aria-label="Breadcrumb"><a href="#/collection/engagement?build=1">Engagement rings</a><span>/</span><span>'+esc(product.sku)+'</span></nav>'+
    '<div class="rb-layout"><div class="rb-gallery">'+ringAngleGallery(product,metal)+'</div>'+
    '<div class="rb-copy"><p class="eyebrow">THE JEWELRY STUDIO · '+esc(product.sku)+'</p><h1>'+esc(product.title)+'</h1>'+
    '<div class="ring-metal-picker"><p>Metal: <strong data-selected-metal>'+esc(metal)+'</strong></p><div class="rb-metal-options" role="group" aria-label="Metal options">'+product.metal.map(m=>'<button type="button" data-rb-metal="'+esc(m)+'" aria-label="'+esc(m)+'" title="'+esc(m)+'" aria-pressed="'+(m===metal)+'"><span class="rb-metal-dot" data-metal-tone="'+esc(m)+'" aria-hidden="true"></span><span class="sr-only">'+esc(m)+'</span></button>').join('')+'</div></div>'+
    '<p class="rb-price">'+currency(product.price)+' <small>USD · center diamond additional</small></p>'+demoNote(product)+
    '<p class="ring-design-intro">'+esc(product.description?product.description.split('. ')[0]+'.':'Begin with the design you love.')+'</p>'+
    (s.diamond?'<aside class="rb-selected-diamond"><img src="'+localMarkup(s.diamond.image)+'" alt="'+esc(s.diamond.title)+'"><div><small>Your selected diamond</small><h2>'+esc(s.diamond.title)+'</h2><strong>'+currency(s.diamond.price)+'</strong><a href="#/collection/diamonds?build=1">Change diamond ↗</a></div></aside>':'')+
    '<button class="button full" type="button" data-rb-select="'+product.id+'">'+(s.diamond?(s.diamond.origin==='natural'?'Add to Selected Diamond':'Add to Lab Diamond'):'Choose the Setting')+' <span aria-hidden="true">↗</span></button>'+
    '<div class="diamond-detail-secondary rb-setting-secondary"><button class="text-link" type="button" data-favorite="'+product.id+'" aria-label="'+(favorites.includes(product.id)?'Unsave':'Save')+' '+esc(product.title)+'" aria-pressed="'+favorites.includes(product.id)+'">'+icon('heart')+'<span class="diamond-favorite-save">Save to favorites</span><span class="diamond-favorite-saved">Saved to favorites</span></button><a class="text-link" href="#/cart">View cart ↗</a></div>'+
    '<div class="ring-service-links"><a href="#/education/metals">◇ Know your metals</a><a href="#/education/sizing">○ Find your ring size</a><a href="#/policy/returns">↶ Returns & exchanges</a><a href="#/custom">✧ Ask about a custom design</a></div>'+
    itemDetails(product)+financeNote()+'<p class="rb-disclosure">A ring design + your chosen diamond. We do not sell settings separately. Metal options and fit require confirmation before production.</p>'+
    '</div></div></section>';
}

function chooseRingSetting(id,metal) {
  const p=getProduct(id);if(p?.category!=='engagement')return;
  if(!builder.entry)builder.entry=ringBuildSelection().diamond?'diamond':'setting';
  if(builder.ring!==p.id)delete builder.engraving;builder.ring=p.id;builder.metal=productMetal(p,metal)||'To be confirmed';
  builder.metalPreferences={...(builder.metalPreferences||{}),[p.id]:builder.metal};
  save();location.hash=ringBuildSelection().diamond?'/your-ring':'/collection/diamonds?build=1';
}

function chooseRingDiamond(id) {
  const p=getProduct(id);if(p?.category!=='diamonds')return;
  if(!builder.entry)builder.entry=ringBuildSelection().setting?'setting':'diamond';
  builder.diamond=id;save();location.hash=ringBuildSelection().setting?'/your-ring':'/collection/engagement?build=1';
}

function completedRingPage() {
  const s=ringBuildSelection();
  if(!s.setting||!s.diamond)return `${ringBuilderSteps('complete')}<section class="rb-page rb-incomplete"><p class="eyebrow">YOUR RING</p><h1>Two choices. One story.</h1><p>${s.setting?'Your setting is saved. Choose a diamond to complete your pairing.':s.diamond?'Your diamond is saved. Choose a setting to complete your pairing.':'Begin with a setting or a diamond. Your choices will stay with you as you browse.'}</p><div class="rb-incomplete-actions"><a class="button" href="${s.setting?'#/collection/diamonds?build=1':'#/collection/engagement?build=1'}">${s.setting?'Choose a diamond':'Choose a setting'} ↗</a>${!s.setting&&!s.diamond?'<a class="button outline" href="#/collection/diamonds?build=1">Start with a diamond ↗</a>':''}</div></section>`;
  const total=ringPrice(s.setting,s.diamond,normalizedEngraving(builder.engraving)), fit=ringFit(s.setting,s.diamond);
  return `${ringBuilderSteps('complete')}<section class="rb-page" data-completed-ring><p class="eyebrow">YOUR RING / MADE PERSONAL</p><h1>Your story, brought together.</h1><div class="rb-layout rb-complete-layout">
    <div><div class="rb-pairing-image"><img class="rb-ring-photo" src="${localMarkup(productPhoto(s.setting,s.metal))}" alt="${esc(s.setting.title)} source ring design"><div class="rb-diamond-inset"><img src="${localMarkup(s.diamond.image)}" alt="${esc(s.diamond.title)}"><span>Your diamond</span></div></div><p class="rb-caption">Concept pairing · Separate source photographs, not a rendering of the selected diamond mounted in this ring.</p></div>
    <div class="rb-copy"><h2>${esc(s.setting.title)}</h2><p class="rb-small-label">${esc(s.metal)}</p><a class="text-link" href="#/product/${s.setting.id}">Edit setting &amp; metal ↗</a><hr><p class="eyebrow">YOUR DIAMOND</p><h2>${esc(s.diamond.title)}</h2><dl class="rb-specs">${diamondCommerceSpecs(s.diamond).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><a class="text-link" href="#/collection/diamonds?build=1">Change diamond ↗</a>
    <label class="rb-size-label" for="rb-ring-size">US ring size <span>Required</span></label><select id="rb-ring-size" aria-describedby="rb-size-help"><option value="">Select your ring size</option>${RING_SIZES.map(size=>`<option value="${size}" ${s.size===size?'selected':''}>${size}</option>`).join('')}</select><p id="rb-size-help" class="rb-caption">Size is saved as a preference; the studio must confirm availability.</p>
    <dl class="rb-prices"><div><dt>${s.setting.priceBasis==='setting-component'?'Ring component':'Complete-ring reference'}</dt><dd>${currency(s.setting.price)}</dd></div><div><dt>Selected diamond</dt><dd>${currency(s.diamond.price)}</dd></div>${normalizedEngraving(builder.engraving)?`<div><dt>Engraving · ${esc(normalizedEngraving(builder.engraving).text)}</dt><dd>${s.setting.engravingFee===null?"To be quoted":currency(s.setting.engravingFee)}</dd></div>`:""}<div class="rb-total"><dt>Combined total</dt><dd>${total===null?'Quote required':currency(total)}</dd></div></dl>
    ${demoNote(s.setting.isDemo?s.setting:s.diamond)}<p class="rb-disclosure">${total===null?"A verified ring-component price is needed for this pairing. We do not add another diamond to a complete-ring price.":"Component prices shown in USD, excluding shipping and tax."} Final fit and availability require studio confirmation.</p>
    ${fit?`<p class="studio-error" role="alert">${esc(fit)} Choose a different diamond or design.</p>`:""}<button type="button" class="button full" data-rb-add ${s.size&&!fit?'':'disabled'}>${builder.editKey?'Update Cart':'Add to Cart'} <span aria-hidden="true">↗</span></button><p class="rb-size-status" id="rb-size-status" role="status">${s.size?'':'Select a ring size to continue.'}</p>
    </div></div></section>`;
}

function addCompletedRing() {
  const s=ringBuildSelection();if(!s.setting||!s.diamond||!s.size||ringFit(s.setting,s.diamond))return;
  const item=normalizeRingCartItem({kind:'ring',id:s.setting.id,diamondId:s.diamond.id,metal:s.metal,size:s.size,engraving:builder.engraving,qty:1});
  if(!item)return;
  const conflict=cart.find(row=>row.kind==='ring'&&row.diamondId===s.diamond.id&&cartLineKey(row)!==builder.editKey);
  if(conflict){
    if(!builder.editKey&&cartLineKey(conflict)===cartLineKey(item)){
      toast('This ring selection is already in your cart.');location.hash='/cart';return;
    }
    const message='This diamond is already used in another saved ring. Choose a different diamond or edit that ring from your cart.';
    toast(message);const status=document.getElementById('rb-size-status');if(status)status.textContent=message;
    return;
  }
  // A loose diamond and a ring using that same stone cannot be ordered twice.
  cart=cart.filter(row=>cartLineKey(row)!==builder.editKey && !(row.kind!=='ring'&&row.id===s.diamond.id));
  cart.push(item);delete builder.editKey;save();location.hash='/cart';
}

function editCompletedRing(index) {
  const item=normalizeRingCartItem(cart[index]);if(!item)return;
  Object.assign(builder,{ring:item.id,diamond:item.diamondId,metal:item.metal,size:item.size,engraving:item.engraving,editKey:cartLineKey(item)});
  builder.metalPreferences={...(builder.metalPreferences||{}),[item.id]:item.metal};
  save();location.hash='/your-ring';
}

document.addEventListener('click',event=>{
  const control=event.target.closest('button,a');if(!control)return;
  if(control.matches('a')&&control.closest('[data-ring-listing] .product-card')){
    const id=control.hash.split('/')[2], product=getProduct(id);
    const metal=control.closest('[data-product-card]')?.dataset.cardSelectedMetal;
    if(product?.category==='engagement'&&product.metal.includes(metal)){
      builder.metalPreferences={...(builder.metalPreferences||{}),[id]:metal};save();
    }
  }
  if(control.matches('a')&&(control.closest('#navigation')||control.matches('.home-build-path')||control.closest('.ring-story-actions'))){
    const href=control.getAttribute('href');
    if(href==='#/collection/engagement?build=1'||href==='#/collection/diamonds?build=1'){
      builder.entry=href.includes('/engagement')?'setting':'diamond';delete builder.editKey;save();
    }
  }
  if(control.hasAttribute('data-rb-metal')){
    const root=control.closest('[data-ring-setting]'),product=getProduct(root?.dataset.ringSetting),metal=control.dataset.rbMetal;
    if(!product?.metal.includes(metal))return;
    builder.metalPreferences={...(builder.metalPreferences||{}),[product.id]:metal};
    if(builder.ring===product.id)builder.metal=metal;
    root.querySelectorAll('[data-rb-metal]').forEach(button=>button.setAttribute('aria-pressed',String(button===control)));
    root.querySelector('[data-selected-metal]').textContent=metal;
    root.querySelector('[data-angle-gallery]').outerHTML=ringAngleGallery(product,metal);save();
  }
  if(control.hasAttribute('data-rb-select'))chooseRingSetting(control.dataset.rbSelect,control.closest('[data-ring-setting]').querySelector('[data-rb-metal][aria-pressed="true"]')?.dataset.rbMetal);
  if(control.hasAttribute('data-rb-add'))addCompletedRing();
  if(control.hasAttribute('data-edit-ring'))editCompletedRing(Number(control.dataset.editRing));
});

document.addEventListener('change',event=>{
  if(event.target.id!=='rb-ring-size')return;
  builder.size=RING_SIZES.includes(event.target.value)?event.target.value:'';save();
  document.querySelector('[data-rb-add]').disabled=!builder.size||!!ringFit(ringBuildSelection().setting,ringBuildSelection().diamond);
  document.getElementById('rb-size-status').textContent=builder.size?'':'Select a ring size to continue.';
});
