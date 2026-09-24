'use strict';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);
const getProduct=id=>CATALOG.find(p=>p.id===id);
const titleCase=s=>s.charAt(0).toUpperCase()+s.slice(1);
function localMarkup(html){return html.replace(/https:\/\/(?:cdn\.shopify\.com|www\.thejewelrystudio\.us)[^"\s<>]+/g,url=>{try{const u=new URL(url);return typeof LOCAL_ASSETS!=='undefined'&&LOCAL_ASSETS[u.origin+u.pathname]||url}catch{return url}})}
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${({search:'<circle cx="10.5" cy="10.5" r="6.8"/><path d="m16 16 5 5"/>',heart:'<path d="M20.7 4.7a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.2-1.2a5.3 5.3 0 0 0-7.5 7.5L12 21l8.7-8.8a5.3 5.3 0 0 0 0-7.5Z"/>',bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',diamond:'<path d="M3 8 7 3h10l4 5-9 13L3 8Z"/><path d="M3 8h18M7 3l5 18 5-18M7 8l5-5 5 5"/>',spark:'<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z"/>',hand:'<path d="m2 15 6 6h8l6-7-2-2-5 4h-5l-3-3-3 1M9 12l3 2 5-5-5-6-5 6 2 3Z"/>'})[name]||''}</svg>`;
function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
// One of each selection; jewelry metal/size preferences remain separate.
function normalizeCart(items){
 const rows=Array.isArray(items)?items:[], seen=new Set(), diamonds=new Set();
 const ringDiamonds=new Set(rows.map(normalizeRingCartItem).filter(Boolean).map(item=>item.diamondId));
 return rows.flatMap(item=>{
  if(item?.kind==='ring'){
   const ring=normalizeRingCartItem(item);if(!ring)return [];
   const key=cartLineKey(ring);
   if(seen.has(key)||diamonds.has(ring.diamondId))return [];
   seen.add(key);diamonds.add(ring.diamondId);return [ring];
  }
  const product=item&&getProduct(item.id);
  if(!product||product.category==='engagement'||!Number.isInteger(item.qty)||item.qty<=0||typeof item.option!=='string')return [];
  const option=product.category==='diamonds'?'Loose diamond':item.option;
  const key=cartLineKey({id:item.id,option});
  if(seen.has(key)||(product.category==='diamonds'&&(diamonds.has(item.id)||ringDiamonds.has(item.id))))return [];
  seen.add(key);if(product.category==='diamonds')diamonds.add(item.id);
  return [{id:item.id,option,qty:1}];
 });
}
let cart=normalizeCart(readStore('tjs-cart-v2',[]));
try{localStorage.setItem('tjs-cart-v2',JSON.stringify(cart))}catch{}
let favorites=readStore('tjs-favorites-v2',[]);if(!Array.isArray(favorites))favorites=[];favorites=[...new Set(favorites.filter(id=>getProduct(id)))];
let builder=readStore('tjs-builder-v2',{});if(!builder||typeof builder!=='object'||Array.isArray(builder))builder={};
let activeMetal='White gold',toastTimer;
function save(){cart=normalizeCart(cart);try{localStorage.setItem('tjs-cart-v2',JSON.stringify(cart));localStorage.setItem('tjs-favorites-v2',JSON.stringify(favorites));localStorage.setItem('tjs-builder-v2',JSON.stringify(builder))}catch{toast('Browser storage unavailable. Changes last for this session only.')}header();refreshDiamondCartPage()}
function header(){const count=cart.reduce((n,x)=>n+x.qty,0);$('#header-actions').innerHTML=`<button class="icon" data-action="search" aria-label="Search products">${icon('search')}</button><button class="icon account-action" data-action="account" aria-label="Your account">${icon('user')}</button><a class="icon" href="#/favorites" aria-label="Saved favorites${favorites.length?`, ${favorites.length} saved ${favorites.length===1?'item':'items'}`:''}">${icon('heart')}${favorites.length?`<span class="count-badge" aria-hidden="true">${favorites.length}</span>`:''}</a><button class="icon" data-action="cart" aria-label="Shopping bag${count?`, ${count} ${count===1?'item':'items'}`:''}">${icon('bag')}${count?`<span class="count-badge" aria-hidden="true">${count}</span>`:''}</button>`}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function productCard(p){
 const preferred=new URLSearchParams(location.hash.split('?')[1]||'').get('metal')||builder.metalPreferences?.[p.id];
 const metal=productMetal(p,preferred),images=productPhotos(p,metal);
 return localMarkup('<article class="product-card" data-product-card="'+p.id+'" data-card-selected-metal="'+esc(metal)+'"><button class="wish '+(favorites.includes(p.id)?'saved':'')+'" data-favorite="'+p.id+'" aria-label="'+(favorites.includes(p.id)?'Unsave':'Save')+' '+esc(p.title)+'" aria-pressed="'+favorites.includes(p.id)+'">'+icon('heart')+'</button><a class="product-image" href="#/product/'+p.id+'"><img src="'+esc(productThumb(images[0]))+'" alt="'+esc(p.title)+'" loading="lazy">'+(images[1]?'<img class="product-image-alternate" src="'+esc(productThumb(images[1]))+'" alt="" loading="lazy" aria-hidden="true">':'')+'</a><div class="product-info"><small>'+esc(p.sku)+(p.isDemo?' · DEMO':'')+'</small><a href="#/product/'+p.id+'"><h3>'+esc(p.title)+'</h3></a>'+(p.metal.length?'<div class="studio-card-metals" role="group" aria-label="Metal for '+esc(p.title)+'">'+p.metal.map(m=>'<button type="button" data-card-metal="'+esc(m)+'" data-metal-tone="'+esc(m)+'" aria-label="'+esc(m)+' for '+esc(p.title)+'" aria-pressed="'+(m===metal)+'" title="'+esc(m)+'"></button>').join('')+'</div><p class="card-metal-label">'+esc(metal)+(p.width?' · '+p.width+' mm':'')+'</p>':'')+'<span class="price">'+currency(p.price)+'</span>'+(p.category==='engagement'?'<small class="card-price-basis">Center diamond additional</small>':'')+'</div></article>');
}

function productGrid(products){products=products.filter(Boolean);return `<div class="product-grid">${products.length?products.map(productCard).join(''):empty('A new possibility awaits.','The catalog is being prepared. Only approved, available pieces will appear here.','Explore all jewelry','#/collection/jewelry')}</div>`}
function empty(title,copy,cta='Explore the collection',href='#/collection/jewelry'){return `<div class="empty"><h2>${title}</h2><p>${copy}</p><a class="button outline" href="${href}">${cta}</a></div>`}
function shapeLinks(selected=''){return `<div class="shape-browser"><div class="classic-shapes"><p class="eyebrow">CLASSIC SHAPES</p><div class="shape-list">${SHAPES.map(s=>`<a class="shape-link ${selected===s?'selected':''}" href="#/collection/diamonds?shape=${s}" aria-label="Shop ${s} diamonds" ${selected===s?'aria-current="true"':''}><img src="${diamondShapeIcon(s)}" alt="" loading="lazy"><span>${s}</span></a>`).join('')}</div></div><aside class="antique-preview"><p class="eyebrow">A DIFFERENT CHARACTER</p><h3>Antique-inspired shapes.</h3><p>Eight distinctive silhouettes, from Portuguese to Old Miner.</p><a class="text-link" href="#/antique-shapes">Explore antique shapes <span aria-hidden="true">↗</span></a><small>Explore the studio selection</small></aside></div>`}
// Homepage photographs only. Shared menu/education icons and stock classifications stay unchanged.
const HOME_SHAPE_PHOTOS = [
  ['Round','round'], ['Oval','oval'], ['Radiant','radiant'], ['Emerald','emerald'],
  ['Cushion','cushion'], ['Elongated Cushion','elongated-cushion'], ['Pear','pear'],
  ['Princess','princess'], ['Marquise','marquise'], ['Asscher','asscher'], ['Heart','heart']
];
function homeShapeRibbon(){
  const group=duplicate=>`<div class="home-shape-set" ${duplicate?'aria-hidden="true"':''}>${HOME_SHAPE_PHOTOS.map(([shape,file])=>`<a class="home-shape" href="#/collection/diamonds?shape=${encodeURIComponent(shape)}" ${duplicate?'tabindex="-1"':`aria-label="Shop ${shape} diamonds"`}><img src="assets/home-shapes/${file==='heart'?'heart.avif':`earth-reference/${file}.jpg`}" alt="" width="800" height="800" decoding="async"><span>${shape}</span></a>`).join('')}</div>`;
  return `<section class="home-shapes" data-shape-ribbon aria-labelledby="home-shape-title">
    <div class="home-shape-heading"><h2 id="home-shape-title">Shop diamonds by shape</h2><button class="shape-motion-toggle" type="button" aria-pressed="false" aria-label="Pause shape motion" title="Pause shape motion" hidden><span aria-hidden="true">Ⅱ</span></button></div>
    <div class="home-shape-window"><div class="home-shape-belt">${group(false)}${group(true)}</div></div>
    <div class="home-shape-foot"><a class="text-link" href="#/collection/diamonds">Explore all diamonds <span aria-hidden="true">↗</span></a></div>
  </section>`;
}
function homeRingStory(){return `<section class="home-ring-story" data-ring-story aria-labelledby="ring-story-title">
  <div class="ring-story-sticky">
    <div class="ring-story-background" aria-hidden="true"><div class="ring-light-halo"></div><div class="ring-light-arc"></div>
      <div class="ring-freedom-scene"><svg class="ring-freedom-ribbons" viewBox="0 0 1400 700" fill="none" preserveAspectRatio="xMidYMid slice"><path d="M370 590C690 660 720 70 1060 180S1360 390 1500 160L1500 213C1320 460 1230 294 1030 244S700 714 350 643Z"/><path d="M360 680C720 765 775 246 1050 313S1340 550 1500 332L1500 380C1320 600 1230 436 1015 377S750 825 340 731Z"/><path d="M330 775C760 870 805 424 1030 449S1330 668 1500 491L1500 535C1330 732 1210 558 1000 510S780 928 310 827Z"/></svg></div>
      <div class="ring-story-art"><div class="ring-art-frame">
      <img class="ring-art-setting" src="assets/home-ring/round-solitaire-exploded.png" width="1024" height="1536" alt="" loading="lazy" decoding="async">
      <img class="ring-art-diamond" src="assets/home-ring/round-brilliant-facets-v2.png" width="1024" height="1536" alt="" loading="lazy" decoding="async">
      <img class="ring-art-prong" src="assets/home-ring/round-solitaire-exploded.png" width="1024" height="1536" alt="" loading="lazy" decoding="async">
      <span class="ring-art-glint"></span><span class="ring-art-glint ring-art-glint-secondary"></span>
    </div></div></div>
    <div class="ring-story-copy"><p class="eyebrow">YOUR LOVE. YOUR WAY.</p><h2 id="ring-story-title">Make it<br><em>yours.</em></h2>
      <p class="ring-story-intro">A little freedom.<br>A forever kind of love.</p>
      <div class="ring-story-actions"><a class="button light" href="#/collection/diamonds?build=1">Start with a diamond <span aria-hidden="true">↗</span></a><a class="text-link" href="#/collection/engagement?build=1">Start with a setting <span aria-hidden="true">↗</span></a></div>
    </div>
    <button class="ring-motion-toggle" type="button" data-ring-finish aria-pressed="false" aria-label="Show finished ring without animation" title="Show finished ring without animation" hidden><span aria-hidden="true">Ⅱ</span></button>
  </div>
</section>`}
function home(){return `<section class="hero reveal"><img class="hero-fallback" src="${CAMPAIGN.custom}" alt="The Jewelry Studio engagement ring campaign"><video muted loop playsinline autoplay preload="metadata" poster="${CAMPAIGN.custom}" aria-hidden="true"><source src="${CAMPAIGN.video}" type="video/mp4"></video><button class="video-toggle" data-action="video" aria-label="Pause background video">Pause motion Ⅱ</button><div class="hero-copy"><h1>Your story,<em>set in light.</em></h1><div class="hero-actions"><a class="button light" href="#/collection/engagement">Shop engagement rings</a><a class="text-link" href="#/collection/jewelry">Explore jewelry <span>↗</span></a></div></div></section>
<div class="home-experience">
${homeShapeRibbon()}${homeRingStory()}
<section class="home-categories" aria-labelledby="home-categories-title"><div class="home-simple-heading"><h2 id="home-categories-title">Shop by category</h2><div class="home-rail-controls" aria-label="Category navigation"><button type="button" data-category-prev aria-label="Previous categories" aria-controls="home-category-rail" disabled>←</button><button type="button" data-category-next aria-label="Next categories" aria-controls="home-category-rail">→</button></div></div><div class="home-category-rail" id="home-category-rail">${[['engagement','Engagement rings'],['wedding','Wedding bands'],['earrings','Earrings'],['necklaces','Necklaces'],['bracelets','Bracelets']].map(([id,name],i)=>`<a class="home-category" data-category-reveal style="--category-order:${i}" href="#/collection/${id}"><div class="home-category-photo ${id==='wedding'?'home-category-product':''}"><img src="${id==='engagement'?CAMPAIGN.diamond:id==='wedding'?'assets/w1.jpg':CAMPAIGN[id]}" alt="${name} from The Jewelry Studio" loading="lazy" decoding="async"></div><h3>${name}</h3></a>`).join('')}</div></section>
<section class="section home-edit" data-home-reveal><div class="section-head"><h2>The favorites</h2><a class="text-link" href="#/collection/jewelry">Shop all <span aria-hidden="true">↗</span></a></div><div class="tab-row" role="group" aria-label="Featured collection">${['engagement','earrings','bracelets','wedding'].map((x,i)=>`<button data-feature="${x}" class="${i===0?'active':''}" aria-pressed="${i===0}">${titleCase(x)}</button>`).join('')}</div><div id="featured-products">${productGrid(CATALOG.filter(p=>p.category==='engagement').slice(0,4))}</div></section>
<section class="home-custom" aria-labelledby="home-custom-title" data-home-reveal><img src="${CAMPAIGN.custom}" alt="The Jewelry Studio rings, worn together" loading="lazy"><div class="home-custom-copy"><h2 id="home-custom-title">Made for<br><em>you.</em></h2><a class="button light" href="#/custom">Explore custom design <span aria-hidden="true">↗</span></a></div></section>
<section class="section journal" data-home-reveal><img src="${CAMPAIGN.editorial}" alt="Diamond earrings from The Jewelry Studio" loading="lazy"><div><h2>Know your<br><em>diamond.</em></h2><p>The 4 Cs, made simple.</p><a class="button outline" href="#/education?topic=Cut">Explore the guide <span aria-hidden="true">↗</span></a></div></section></div>`}
const CATEGORY_NAMES={diamonds:'Find your kind of brilliance.',engagement:'A yes, unlike any other.',wedding:'Always, in every way.',jewelry:'The extraordinary everyday.',earrings:'A beautiful conversation.',bracelets:'A little light, on repeat.',necklaces:'Close to your heart.','mens-rings':'A signature, all your own.'};
const COLLECTION_LABELS={engagement:'Engagement rings',wedding:'Wedding bands',jewelry:'Fine jewelry',earrings:'Earrings',necklaces:'Necklaces',bracelets:'Bracelets','mens-rings':'Men’s rings'};
// Approved style labels. Actual membership comes from validated product styles.
const COLLECTION_STYLES={
  engagement:[
    {id:'solitaire',label:'Solitaire',products:[]},
    {id:'pave',label:'Pavé',products:[]},
    {id:'halo',label:'Halo',products:[]},
    {id:'hidden-halo',label:'Hidden halo',products:[]},
    {id:'three-stone',label:'Three stone',products:[]},
    {id:'cluster',label:'Cluster',products:[]},
    {id:'cathedral',label:'Cathedral',products:[]},
    {id:'signature',label:'Signature',products:[]},
    {id:'vintage',label:'Vintage-inspired',products:[]}
  ],
  wedding:[
    {id:'eternity',label:'Eternity',products:[]},
    {id:'half-eternity',label:'Half eternity',products:[]},
    {id:'pave',label:'Pavé',products:[]},
    {id:'channel',label:'Channel',products:[]},
    {id:'stackable',label:'Stackable',products:[]},
    {id:'signature',label:'Signature',products:[]}
  ],
  earrings:[
    {id:'studs',label:'Studs',products:[]},
    {id:'hoops-huggies',label:'Hoops & huggies',products:[]},
    {id:'signature',label:'Signature',products:[]}
  ],
  necklaces:[
    {id:'solitaire',label:'Solitaire',products:[]},
    {id:'tennis',label:'Tennis',products:[]},
    {id:'cross',label:'Cross',products:[]},
    {id:'bezel',label:'Bezel',products:[]},
    {id:'halo',label:'Halo',products:[]},
    {id:'signature',label:'Signature',products:[]},
    {id:'seasonal',label:'Seasonal',products:[]},
    {id:'letter',label:'Letter',products:[]}
  ],
  bracelets:[
    {id:'tennis',label:'Tennis',products:[]},
    {id:'flex-bangles',label:'Flex bangles',products:[]},
    {id:'station-link',label:'Station & link',products:[]},
    {id:'cuban-link',label:'Cuban link',products:[]}
  ],
  'mens-rings':[
    {id:'classic',label:'Classic',products:[]},
    {id:'bezel',label:'Bezel',products:[]},
    // Keep the requested wording until the studio confirms bezel vs. beveled edge.
    {id:'bezel-edge',label:'Bezel edge',products:[]}
  ]
};
const COLLECTION_GUIDES={engagement:['Engagement ring guide','engagement'],wedding:['Wedding band guide','wedding'],jewelry:['Fine jewelry guide','jewelry'],earrings:['Fine jewelry guide','jewelry'],necklaces:['Fine jewelry guide','jewelry'],bracelets:['Fine jewelry guide','jewelry'],'mens-rings':['Ring sizing guide','sizing']};
// Page-slider additions stay separate so approved navbar menus do not change.
const COLLECTION_SLIDER_STYLES={engagement:[
  {id:'side-stone',label:'Side Stone',products:[]},
  {id:'bridal-sets',label:'Bridal Sets',products:[]}
]};
function collectionStyle(category,style){return [...(COLLECTION_STYLES[category]||[]),...(COLLECTION_SLIDER_STYLES[category]||[])].find(item=>item.id===style)}
function collectionProducts(category,params){
  let products=CATALOG.filter(p=>category==='jewelry'?p.category!=='diamonds':p.category===category);
  const style=params.get('style'),selected=collectionStyle(category,style);
  // Unknown style parameters must never silently expose the entire collection.
  if(style)products=selected?products.filter(p=>(p.styles||[]).includes(style)):[];
  if(params.get('shape'))products=products.filter(p=>p.shape===params.get('shape')||(p.category==='engagement'&&p.compatibleShapes?.includes(params.get('shape'))));
  if(params.get('price')&&params.get('price')!=='all')products=products.filter(p=>p.price!==null&&p.price<=Number(params.get('price')));
  if(params.get('q'))products=products.filter(p=>p.title.toLowerCase().includes(params.get('q').toLowerCase()));
  if(params.get('sort')==='low')products.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
  if(params.get('sort')==='high')products.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));
  if(params.get('sort')==='name')products.sort((a,b)=>a.title.localeCompare(b.title));
  return products;
}
function collectionStyleHref(category,params,style=''){
  const next=new URLSearchParams(params);
  next.delete('q');
  style?next.set('style',style):next.delete('style');
  return `#/collection/${category}${next.size?'?'+next.toString():''}`;
}
// Original illustrative category artwork; these SVGs do not depict a specific product.
function categoryRingArt(category, style) {
  const key = String(style).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const prefix = `ring-${String(category).replace(/[^a-z0-9]/gi, '')}-${key}`;
  const wedding = /wedding/i.test(category);
  const metal = `url(#${prefix}-metal)`, edge = `url(#${prefix}-edge)`, gem = `url(#${prefix}-gem)`;
  const diamond = (x, y, r = 11) => `<g transform="translate(${x} ${y})"><circle r="${r + 1.7}" fill="${edge}"/><circle r="${r}" fill="${gem}" stroke="#fdfefe" stroke-width=".8"/><path d="M0 ${-r}L${r * .71} ${-r * .71}L${r} 0L${r * .71} ${r * .71}L0 ${r}L${-r * .71} ${r * .71}L${-r} 0L${-r * .71} ${-r * .71}Z M0 ${-r}L${r * .38} ${-r * .38}L${r} 0L${r * .38} ${r * .38}L0 ${r}L${-r * .38} ${r * .38}L${-r} 0L${-r * .38} ${-r * .38}Z M${-r * .38} ${-r * .38}H${r * .38}V${r * .38}H${-r * .38}Z" fill="none" stroke="#7c929b" stroke-opacity=".55" stroke-width=".55"/><path d="M${-r * .71} ${-r * .71}L${r * .38} ${-r * .38}L${r * .71} ${r * .71}L${-r * .38} ${r * .38}Z" fill="#fff" opacity=".58"/></g>`;
  const band = (offset = 0, width = 7) => `<g transform="translate(${offset} 0)"><ellipse cx="140" cy="115" rx="47" ry="61" fill="none" stroke="#807b72" stroke-width="${width + 1}"/><ellipse cx="140" cy="114" rx="47" ry="61" fill="none" stroke="${metal}" stroke-width="${width}"/><path d="M100 82C78 128 105 179 142 177C172 176 192 146 187 114" fill="none" stroke="#fffdf8" stroke-opacity=".88" stroke-width="1.2"/><path d="M105 84C88 123 107 168 139 170" fill="none" stroke="#716b62" stroke-opacity=".45" stroke-width="1"/></g>`;
  const shoulderStones = (small = 3.1) => [-1, 1].map(side => Array.from({length: 7}, (_, i) => diamond(140 + side * (19 + i * 3.85), 59 + i * 5.45, small - i * .13)).join('')).join('');
  const halo = (cx, cy, radius, count, stone) => Array.from({length: count}, (_, i) => diamond(cx + Math.cos(i * Math.PI * 2 / count) * radius, cy + Math.sin(i * Math.PI * 2 / count) * radius, stone)).join('');
  const setting = `<path d="M128 58L132 73H148L152 58M132 73L126 87M148 73L154 87" fill="none" stroke="${edge}" stroke-width="3"/><path d="M132 69H148" stroke="#fffdf8" stroke-width="1"/>`;
  const claws = `<g fill="${edge}" stroke="#fff" stroke-width=".4"><ellipse cx="130" cy="48" rx="1.7" ry="2.7" transform="rotate(-35 130 48)"/><ellipse cx="150" cy="48" rx="1.7" ry="2.7" transform="rotate(35 150 48)"/><ellipse cx="130" cy="68" rx="1.7" ry="2.7" transform="rotate(35 130 68)"/><ellipse cx="150" cy="68" rx="1.7" ry="2.7" transform="rotate(-35 150 68)"/></g>`;
  let jewelry = '';
  if (wedding) {
    const broad = key === 'mens-rings', stacked = key === 'stackable';
    jewelry = band(stacked ? -8 : 0, broad ? 14 : key === 'channel' ? 10 : 7);
    if (stacked) jewelry += `<g transform="translate(12 -5)">${band(0, 5.5)}${shoulderStones(2.4)}</g>`;
    if (['half-eternity', 'pave', 'channel', 'signature'].includes(key)) {
      const count = key === 'half-eternity' ? 13 : 19;
      jewelry += Array.from({length: count}, (_, i) => { const a = Math.PI + .21 + i * (Math.PI - .42) / (count - 1); return diamond(140 + Math.cos(a) * 47, 114 + Math.sin(a) * 61, key === 'channel' ? 3.5 : 3); }).join('');
    }
    if (key === 'channel') jewelry += `<path d="M93 113A47 61 0 0 1 187 113M100 113A40 54 0 0 1 180 113" fill="none" stroke="#fffdf8" stroke-width="1.6"/>`;
    if (key === 'signature') jewelry += `<path d="M97 98C116 42 166 42 183 98" fill="none" stroke="${edge}" stroke-width="3"/>${[114, 140, 166].map((x, i) => diamond(x, i === 1 ? 48 : 61, 5.6)).join('')}`;
    if (broad) jewelry += `<path d="M92 105C95 66 117 51 140 51C164 51 185 73 188 105" fill="none" stroke="#b3b0a8" stroke-width="6"/><path d="M92 103C97 63 123 44 151 52" fill="none" stroke="#f9f6ee" stroke-width="1.2"/>`;
  } else {
    jewelry = band();
    if (key === 'bridal-sets') jewelry = `<g transform="translate(10 6)">${band(0, 5)}${shoulderStones(2.4)}</g>` + jewelry;
    if (['pave', 'hidden-halo', 'signature', 'bridal-sets'].includes(key)) jewelry += shoulderStones();
    if (key === 'cathedral') jewelry += `<path d="M99 106C105 81 117 77 128 58M181 106C175 81 163 77 152 58" fill="none" stroke="${edge}" stroke-width="4"/><path d="M100 104C108 80 118 79 129 60M180 104C172 80 162 79 151 60" fill="none" stroke="#fffdf8" stroke-width="1.3"/>`;
    if (key === 'vintage') jewelry += `<g fill="none" stroke="${edge}" stroke-width="2"><path d="M104 94Q96 66 124 62Q120 86 104 94ZM176 94Q184 66 156 62Q160 86 176 94Z"/><path d="M105 89Q118 64 124 64M175 89Q162 64 156 64" stroke-width="1"/></g>${diamond(113, 76, 5)}${diamond(167, 76, 5)}`;
    jewelry += setting;
    if (key === 'hidden-halo') jewelry += `<path d="M124 70Q140 82 156 70" fill="none" stroke="${edge}" stroke-width="4"/>${Array.from({length: 7}, (_, i) => diamond(125 + i * 5, 71 + Math.sin(i / 6 * Math.PI) * 5, 1.8)).join('')}`;
    if (key === 'side-stone') jewelry += `${diamond(119, 67, 8)}${diamond(161, 67, 8)}`;
    if (key === 'halo') jewelry += halo(140, 57, 20, 16, 3.6);
    if (key === 'vintage') jewelry += halo(140, 57, 18.5, 12, 2.9);
    if (key === 'signature') jewelry += `<path d="M99 107Q120 91 128 57M181 107Q160 91 152 57" fill="none" stroke="${edge}" stroke-width="3"/>`;
    if (key === 'cluster') jewelry += halo(140, 57, 12.5, 6, 7) + diamond(140, 57, 8);
    else jewelry += diamond(140, 57, key === 'halo' ? 13.3 : 12.5) + claws;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 200" aria-hidden="true" focusable="false"><defs><linearGradient id="${prefix}-metal" x1="0" y1="0" x2="1" y2=".25"><stop stop-color="#817d74"/><stop offset=".15" stop-color="#e6e1d7"/><stop offset=".31" stop-color="#fffef9"/><stop offset=".45" stop-color="#aaa69c"/><stop offset=".61" stop-color="#eeeae1"/><stop offset=".79" stop-color="#fffefb"/><stop offset="1" stop-color="#858279"/></linearGradient><linearGradient id="${prefix}-edge" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fffdf5"/><stop offset=".38" stop-color="#b1aea4"/><stop offset=".6" stop-color="#eeebe3"/><stop offset="1" stop-color="#76756e"/></linearGradient><radialGradient id="${prefix}-gem" cx=".35" cy=".25" r=".8"><stop stop-color="#fff"/><stop offset=".45" stop-color="#eff5f6"/><stop offset=".72" stop-color="#bbcbd1"/><stop offset="1" stop-color="#fdfefe"/></radialGradient><radialGradient id="${prefix}-shadow"><stop stop-color="#5f3b35" stop-opacity=".16"/><stop offset="1" stop-color="#5f3b35" stop-opacity="0"/></radialGradient></defs><ellipse cx="142" cy="183" rx="63" ry="8" fill="url(#${prefix}-shadow)"/><g transform="translate(5 -1) rotate(-24 140 112)">${jewelry}</g></svg>`;
}
function collectionCategorySlider(category,params){
  const selected=params.get('style')||'';
  const styles=[{id:'',label:`All ${COLLECTION_LABELS[category].toLowerCase()}`},...COLLECTION_STYLES[category],...(COLLECTION_SLIDER_STYLES[category]||[])];
  if(category==='wedding')styles.push({id:'mens-rings',label:'Men’s Rings',href:'#/collection/mens-rings'});
  const trackId=`${category}-category-track`;
  const arrow=direction=>`<button class="collection-category-arrow ${direction}" type="button" data-category-direction="${direction}" aria-label="${direction==='previous'?'Previous':'Next'} ${COLLECTION_LABELS[category].toLowerCase()} categories" aria-controls="${trackId}" ${direction==='previous'?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction==='previous'?'m14 6-6 6 6 6':'m10 6 6 6-6 6'}"/></svg></button>`;
  return `<nav class="collection-category-slider" data-category-slider aria-label="${COLLECTION_LABELS[category]} styles">${arrow('previous')}<div class="collection-category-track" id="${trackId}" tabindex="0" aria-label="Scroll ${COLLECTION_LABELS[category].toLowerCase()} categories">${styles.map(style=>{
    const product=CATALOG.find(p=>p.category===(style.id==='mens-rings'?'mens-rings':category)&&(!style.id||style.id==='mens-rings'||p.styles.includes(style.id))),href=style.href||collectionStyleHref(category,params,style.id);
return `<a class="collection-category-card" href="${esc(href)}" aria-label="${esc(style.label)}" ${!style.href&&selected===style.id?'aria-current="page"':''}><span class="collection-category-visual">${product?`<img src="${localMarkup(productThumb(product.image))}" alt="" width="280" height="200" style="--category-photo-scale:1" loading="lazy" draggable="false">`:categoryRingArt(category,style.id)}${product?'':'<small class="collection-category-illustration">Style illustration</small>'}</span><span class="collection-category-name">${esc(style.label)}</span></a>`;
  }).join('')}</div>${arrow('next')}</nav>`;
}
let collectionSliderCleanup=()=>{};
function mountCollectionCategorySlider(){
  collectionSliderCleanup();
  collectionSliderCleanup=()=>{};
  const root=document.querySelector('#main [data-category-slider]');if(!root)return;
  const track=root.querySelector('.collection-category-track'),previous=root.querySelector('[data-category-direction="previous"]'),next=root.querySelector('[data-category-direction="next"]');
  const motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
  const update=()=>{previous.disabled=track.scrollLeft<=2;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;};
  const showCard=(card,behavior)=>{const box=card.getBoundingClientRect(),frame=track.getBoundingClientRect();if(box.left<frame.left||box.right>frame.right)track.scrollTo({left:track.scrollLeft+box.left-frame.left-2,behavior});};
  const move=event=>{const button=event.target.closest('[data-category-direction]');if(!button||button.disabled)return;const first=track.querySelector('.collection-category-card'),gap=parseFloat(getComputedStyle(track).columnGap)||0,step=first.getBoundingClientRect().width+gap;track.scrollBy({left:(button===previous?-1:1)*step*Math.max(1,Math.floor((track.clientWidth+gap)/step)),behavior:motion()});};
  const focus=event=>{const card=event.target.closest('.collection-category-card');if(card)showCard(card,motion());};
  root.addEventListener('click',move);track.addEventListener('scroll',update,{passive:true});track.addEventListener('focusin',focus);
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(update):null;observer?.observe(track);
  window.addEventListener('resize',update);
  const current=track.querySelector('[aria-current="page"]');if(current)showCard(current,'instant');update();
  collectionSliderCleanup=()=>{root.removeEventListener('click',move);track.removeEventListener('scroll',update);track.removeEventListener('focusin',focus);window.removeEventListener('resize',update);observer?.disconnect();};
}
function collectionStyleBar(category,params){
  if(category==='engagement'||category==='wedding')return collectionCategorySlider(category,params);
  const styles=COLLECTION_STYLES[category];if(!styles)return '';
  const selected=params.get('style')||'';
  return `<nav class="collection-styles" aria-label="${COLLECTION_LABELS[category]} styles"><a href="${esc(collectionStyleHref(category,params))}" ${!selected?'aria-current="page"':''}>All ${COLLECTION_LABELS[category].toLowerCase()}</a>${styles.map(style=>`<a href="${esc(collectionStyleHref(category,params,style.id))}" ${selected===style.id?'aria-current="page"':''}>${style.label}</a>`).join('')}</nav>`;
}
function collection(category,params){
  if(category==='diamonds')return diamondFinder(params);
  if(category==='engagement'||category==='wedding')return ringListingPage(category,params);
  if(!Object.hasOwn(CATEGORY_NAMES,category))return notFound();
  const shape=params.get('shape')||'',sort=params.get('sort')||'featured',price=params.get('price')||'all',q=params.get('q')||'',style=params.get('style')||'';
  const selected=collectionStyle(category,style),products=collectionProducts(category,params),guide=COLLECTION_GUIDES[category];
  const unprepared=Boolean(selected&&!CATALOG.some(p=>p.category===category&&p.styles?.includes(style)))||!CATALOG.some(p=>p.category===category);
  const invalidStyle=Boolean(style&&!selected);
  const fallback=`#/collection/${category}${params.has('build')?'?build=1':''}`;
  const contents=products.length?productGrid(products):unprepared
    ?`<div class="collection-preparing"><p class="eyebrow">THE NEXT CHAPTER</p><h2>${selected?esc(selected.label)+'.':'Men’s rings.'} Worth the wait.</h2><p>This collection is being prepared. There are no confirmed ${selected?esc(selected.label.toLowerCase())+' ':''}${COLLECTION_LABELS[category].toLowerCase()} in this preview yet.</p><a class="button outline" href="${category==='mens-rings'?'#/collection/wedding':fallback}">${category==='mens-rings'?'Explore all wedding bands':'Explore all '+COLLECTION_LABELS[category].toLowerCase()} ↗</a><a class="text-link" href="#/custom">Prepare a custom-design brief ↗</a></div>`
    :empty(invalidStyle?'Let’s find your collection.':'A different combination. A new possibility.',invalidStyle?'This style link is not recognized. Explore the collection to choose one.':'No pieces match these filters. Try another shape or price range.',`Explore all ${COLLECTION_LABELS[category].toLowerCase()}`,fallback);
  return `<div class="page-heading reveal"><p class="eyebrow">${COLLECTION_LABELS[category]}</p><h1>${CATEGORY_NAMES[category]}</h1><p>Distinctive pieces for the everyday rituals and once-in-a-lifetime moments.</p></div><section class="collection-body">
    ${params.has('build')?'<p class="notice">Design board mode: open a piece and save it as inspiration. Ring prices include the listed ring; this is not a setting-only compatibility or price calculator.</p>':''}
    ${category==='jewelry'||['earrings','necklaces','bracelets'].includes(category)?`<nav class="collection-departments" aria-label="Fine jewelry collections">${['jewelry','earrings','necklaces','bracelets'].map(c=>`<a ${c===category?'aria-current="page"':''} href="#/collection/${c}">${c==='jewelry'?'All fine jewelry':COLLECTION_LABELS[c]}</a>`).join('')}</nav>`:''}
    ${collectionStyleBar(category,params)}
    <form id="filters" class="filters" data-category="${category}"><label>Shape<select name="shape"><option value="">All shapes</option>${SHAPES.map(s=>`<option ${shape===s?'selected':''}>${s}</option>`).join('')}</select></label><label>Price range<select name="price">${[['all','All prices'],['1000','Under $1,000'],['3000','Up to $3,000'],['6000','Up to $6,000'],['15000','Up to $15,000']].map(([v,t])=>`<option value="${v}" ${price===v?'selected':''}>${t}</option>`).join('')}</select></label><label class="sort">Sort by<select name="sort">${[['featured','Studio selection'],['low','Price: low to high'],['high','Price: high to low'],['name','Name: A–Z']].map(([v,t])=>`<option value="${v}" ${sort===v?'selected':''}>${t}</option>`).join('')}</select></label><a class="text-link" href="${fallback}">Reset filters</a></form>
    <div class="collection-result-row"><p class="result-count" aria-live="polite">${products.length} ${products.length===1?'piece':'pieces'}${selected?` · ${esc(selected.label)}`:''}${shape?` · ${esc(shape)}`:''}${q?` · Search: ${esc(q)}`:''}</p><a class="text-link collection-guide" href="#/education/${guide[1]}">${guide[0]} ↗</a></div>
    ${contents}<p class="snapshot-note">Approved local inventory · USD · Variant pricing and availability require Shopify verification before purchase.</p></section>`;
}
// Keep generic jewelry collections as steady as the ring and diamond finders.
let collectionFilterRestore = null;
function applyCollectionFilters(form, focusElement) {
  const params = new URLSearchParams(new FormData(form));
  const previous = new URLSearchParams(location.hash.split('?')[1] || '');
  for (const key of ['q', 'build', 'style']) if (previous.has(key)) params.set(key, previous.get(key));
  if (params.get('shape') === '') params.delete('shape');
  if (params.get('price') === 'all') params.delete('price');
  if (params.get('sort') === 'featured') params.delete('sort');
  const hash = '#/collection/' + form.dataset.category + (params.size ? '?' + params.toString() : '');
  if (hash === location.hash) return;
  collectionFilterRestore = {hash, y: window.scrollY, name: focusElement?.name};
  location.hash = hash;
}
function restoreCollectionFilterPosition() {
  const restore = collectionFilterRestore;
  collectionFilterRestore = null;
  if (!restore || restore.hash !== location.hash) return;
  if (['shape', 'price', 'sort'].includes(restore.name)) {
    document.querySelector('#filters [name="' + restore.name + '"]')?.focus({preventScroll: true});
  }
  window.scrollTo({top: restore.y, behavior: 'instant'});
}
function detail(id){const p=getProduct(id);if(!p)return notFound();if(p.category==='diamonds')return diamondDetailPage(p);if(p.category==='engagement')return ringSettingPage(p);return studioJewelryDetail(p);}
function openPanel(title,body,foot=''){const panel=$('#panel');$('#panel-content').innerHTML=`<div class="panel-head"><h2 id="panel-title">${title}</h2><button data-action="close" aria-label="Close panel">×</button></div><div class="panel-body">${localMarkup(body)}</div>${foot?`<div class="panel-foot">${foot}</div>`:''}`;if(!panel.open)panel.showModal()}
function closePanel(){$('#panel').close()}
function bag(){closePanel();location.hash='/cart'}
function addToBag(id){if(getProduct(id)?.category==='engagement'){chooseRingSetting(id,activeMetal);return;}const p=getProduct(id);if(!p)return;if(p.category==='diamonds'){addDiamondToCart(id);return;}const option=[activeMetal,$('#ring-size')?`US size: ${$('#ring-size').value}`:''].filter(Boolean).join(' · ')||'Loose diamond';const existing=cart.find(x=>x.id===id&&x.option===option);if(!existing)cart.push({id,option,qty:1});save();bag();if(existing)toast('This selection is already in your cart.')}
function checkout(){closePanel();location.hash='/checkout'}
function search(){openPanel('Find your next favorite.',`<form id="search-form" class="search-form"><input id="search-input" name="query" type="search" placeholder="Try “radiant” or “earrings”" aria-label="Search the catalog" autocomplete="off"><button aria-label="Search">↗</button></form><div id="search-results"><p class="eyebrow">POPULAR DIRECTIONS</p><div class="chips">${['Radiant','Oval','Earrings','Bracelets'].map(s=>`<button class="chip" data-search="${s}">${s}</button>`).join('')}</div><small>Searches the local ${CATALOG.length}-piece curated catalog.</small></div>`);$('#search-input').focus()}
function searchResults(q){const normalized=q.trim().toLowerCase();const results=normalized?CATALOG.filter(p=>(p.title+' '+p.category+' '+p.sku).toLowerCase().includes(normalized)):[];$('#search-results').innerHTML=normalized?`<p class="result-count">${results.length} matching pieces</p>${results.slice(0,12).map(p=>`<a class="search-item" href="#/product/${p.id}"><img src="${localMarkup(p.image)}" alt=""><div><h3>${esc(p.title)}</h3><span class="price">${p.price===null?'':'From '}${currency(p.price)}</span></div></a>`).join('')||'<p>No matches. Try a different shape or collection.</p>'}`:'<p>Search by product name, shape, or collection.</p>'}
function custom(){return studioCustomPage()}
const POLICY={returns:['Returns & exchanges','Return eligibility, without surprises.','Proposed for manager review: offer a defined return window for eligible standard items, with approval before shipping. The return window, shipping payer, exclusions, inspection criteria, and refund timing are still undecided.',['Request: customer provides the order number, item, and reason through the approved support channel.','Review: the studio checks eligibility and provides written instructions or explains the decision.','Return: the customer ships using the approved insured method. Package contents and tracking are recorded.','Inspect: verify the item, condition, diamond identity, certificates, and accessories before deciding the refund.','Resolve: communicate the result and approved refund or remedy. Do not charge an undisclosed fee.']],shipping:['Shipping & delivery','A considered journey, from our studio to you.','Pending approval: supported destinations, dispatch times, carriers, insurance, signature requirements, charges, and lost-package handling. No free-shipping or international-shipping promise is active.',['Separate production time from transit time on each product.','Confirm the delivery address before dispatch.','Send tracking through the chosen order system.','Explain the process for delay, damage, and loss without assigning liability automatically.']],warranty:['Warranty & service','Care that continues beyond the occasion.','Warranty coverage, duration, exclusions, inspection requirements, resizing rules, shipping charges, and service turnaround are not approved yet.',['Customer describes the issue and supplies photographs.','The studio assesses whether an inspection is needed.','Provide a written diagnosis and quote if the work is chargeable.','Obtain approval before paid work; document the final inspection and shipment.']],insurance:['Jewelry insurance','Protect the meaning, as well as the piece.','Insurance partner and coverage are not established. Do not display an insurer logo, coverage guarantee, or enrollment button until an agreement and approved disclosures are available.',['Distinguish shipping insurance, product warranty, and customer jewelry insurance.','Disclose any referral relationship and who provides the policy.','Confirm covered events, exclusions, deductibles, and claims process with the insurer.']],payments:['Payment options','Clear choices, before you commit.','Afterpay is the planned buy-now-pay-later option. It is not enabled in this preview. Merchant approval, supported markets and customer eligibility must be confirmed before displaying an active offer. Deposits and cancellation terms also require approval.',['Use Shopify’s secure checkout once configured and tested.','Display only methods actually enabled for the customer’s market.','Keep payment credentials out of custom forms and messages.']],custom:['Custom order policy','Made for you. Agreed with you.','Custom-order deposits, cancellation stages, modification fees, customer-stone handling, and remedies must be approved in a written agreement. No blanket nonrefundability is finalized.',['Before work: record specifications, stone condition, ownership, quote, timeline, and who carries shipping risk.','Design approval: obtain a recorded approval of the design and commercial terms.','Production: explain in advance which costs become committed and how changes are handled.','Customer stones: document identification, photographs, inspection findings, and agreed liability. The customer’s stone does not become the studio’s property.','Completion: verify the piece against the agreed specification and explain applicable service and defect remedies.']],privacy:['Privacy','Respect begins with your information.','Draft structure only. The final notice must match actual data collection, Shopify apps, analytics, CRM, marketing tools, vendors, retention, and applicable privacy obligations.',['Explain what is collected and why.','Identify sharing, storage, retention, security practices, and available customer rights.','Provide verified contact details and an appropriate request process.','This prototype stores bag, favorites, and design-board selections in this browser. Custom-form details are not sent or stored by the application; brief downloads stay on the device. Remote media and fonts contact their providers.']],terms:['Terms of service','The details behind every experience.','Legal review required before publication. Business identity, jurisdiction, order acceptance, pricing errors, dispute handling, and statutory rights must reflect the actual operating business.',['Identify the seller and customer support channels.','Distinguish estimates from confirmed orders and avoid misleading availability claims.','Explain cancellation, fulfillment, remedies, and limitations with appropriate legal review.','Nothing in this draft is an approved final-sale policy or waiver of mandatory consumer rights.']]};
function policy(kind){const p=POLICY[kind];if(!p)return notFound();return `<article class="document reveal"><a class="policy-back-link" href="#/faq"><span aria-hidden="true">←</span> FAQs &amp; policies</a><p class="eyebrow">CLIENT CARE / DRAFT FOR REVIEW</p><h1>${p[0]}</h1><h2>${p[1]}</h2><p class="notice">Not yet an active customer policy. ${p[2]}</p><h2>Proposed process</h2><ol>${p[3].map(s=>`<li>${s}</li>`).join('')}</ol><h2>Before this page goes live</h2><p>The manager must approve commercial terms and operations, and appropriate legal review must confirm the final wording. The product page, checkout, footer, FAQ, and support scripts should all match.</p><a class="button outline" href="#/review">See the decision checklist ↗</a></article>`}
function care(){return `<article class="document reveal"><p class="eyebrow">THE STUDIO CARE GUIDE</p><h1>A little care.<br>A lifetime of meaning.</h1><p>Different stones, treatments, metals, and settings need different care. Ask a qualified jeweler to confirm what is suitable for your specific piece.</p><h2>Wear thoughtfully.</h2><p>Remove jewelry before strenuous activity, swimming, and household cleaning. Avoid contact with harsh chemicals, and apply cosmetics before putting on your jewelry.</p><h2>Store separately.</h2><p>Use a soft-lined compartment or individual pouch to reduce scratches and tangling. Close necklace clasps before storage.</p><h2>Clean with care.</h2><p>A soft, lint-free cloth is a gentle starting point. Confirm whether water, cleaning solutions, steam, or ultrasonic equipment are suitable before using them, particularly with fragile, treated, or glued stones.</p><h2>Check the setting.</h2><p>If a stone moves or a clasp feels unreliable, stop wearing the piece and arrange inspection. Do not attempt to tighten prongs yourself.</p><h2>Need professional attention?</h2><p>Our service scope and charges are being finalized. Request an assessment before mailing jewelry; never send an item without written shipping instructions.</p><a class="button outline" href="#/policy/warranty">Warranty & service details ↗</a></article>`}
function review(){return `<article class="document"><p class="eyebrow">PRIVATE PREVIEW / MANAGER HANDOFF</p><h1>A new chapter<br>for the studio.</h1><p>This is a local storefront redesign, not a published Shopify theme. Your live website has not been changed.</p><h2>What you can try</h2><table class="review-table"><tr><th>Experience</th><th>Preview behavior</th></tr>${[['Homepage','Original layout, your video and photography, Newsreader, wine and ivory palette.'],['Catalog',`${CATALOG.length} local preview products. Prices and options need final approval; filters and sorting work locally.`],['Shopping','Product pages, saved favorites, one per selection, removal, and browser-persistent bag.'],['Search','Search the local catalog by title, category, or shape.'],['Custom','Design board and validated downloadable brief. Nothing is sent to a CRM.'],['Education','Interactive 3D 4 Cs lessons with diagram fallback, and a sourced natural vs. lab-grown comparison. Illustrative, not a grading instrument.'],['Policies','Navigable drafts, explicitly pending business and legal approval.'],['Impact','Original Impact layout with explicitly labeled draft counters, not verified donations.']].map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table><h2>Decisions still needed</h2><ul><li>Return window, eligible items, return shipping payer, and refund timing.</li><li>Custom deposits, cancellation stages, customer-stone terms, and written approvals.</li><li>Warranty, resizing, insurance partner, payment methods, and shipping regions.</li><li>Official contact details and X profile. International shipping remains undecided.</li><li>Impact page and verified evidence behind any numerical or environmental claims.</li></ul><h2>Inventory status</h2><p>The ring CSV is imported: 25 supplied rings and 10 demonstration diamonds support this preview. Confirm product specifications, prices and stock before launch. Guru inventory and Shopify orders still require secure server connections.</p><h2>Production handoff</h2><p>Before launch: integrate this design into an unpublished Shopify theme; bind real collections, variants, inventory, accounts, and checkout; confirm product specifications and reports; connect the approved CRM; test taxes, shipping, discounts, emails, privacy choices, accessibility, mobile performance, and payment scenarios.</p><p class="notice">Your source-store images and video have local copies. Google Fonts needs network access; system fonts are available as a fallback. Local bag and favorites are only stored on this browser. This prototype makes no payment, creates no live account, sends no customer message, and promises no zero-error launch.</p><button class="button outline" data-action="print">Print / save this review as PDF</button></article>`}
function impact(){return TJSimpact.render()}
function contact(){return `<article class="document"><p class="eyebrow">CONTACT THE STUDIO</p><h1>Let’s start a conversation.</h1><p>Whether you are exploring a personal design or need guidance about a piece, the conversation should be simple.</p><div class="notice">The studio’s approved customer support email, phone, hours, address, and CRM destination must be confirmed before launch. This preview does not invent contact information or send messages.</div><a class="button" href="#/custom">Prepare a custom inquiry ↗</a><h2>Already have a question?</h2><p><a href="#/care">Jewelry care</a> · <a href="#/policy/returns">Return process draft</a> · <a href="#/policy/warranty">Service planning</a></p></article>`}
function antiqueShapes(params=new URLSearchParams()){
  const selected=ANTIQUE_SHAPES.find(shape=>shape.name===params.get('shape'));
  return `<section class="antique-collection"><header class="antique-heading"><p class="eyebrow">THE ANTIQUE & DISTINCTIVE EDIT</p><h1>A different<br><em>kind of light.</em></h1><p>Eight silhouettes. Each with a character all its own.</p></header>
  <div class="antique-shape-grid" aria-label="Antique and distinctive diamond shapes">${ANTIQUE_SHAPES.map(shape=>`<a class="antique-shape-card" href="#/antique-shapes?shape=${encodeURIComponent(shape.name)}" ${selected===shape?'aria-current="true"':''}><img src="${diamondShapeIcon(shape.name)}" alt="" width="160" height="160"><h2>${shape.name}</h2><span>Discover the cut <span aria-hidden="true">↗</span></span></a>`).join('')}</div>
  ${selected?`<section class="antique-detail" aria-labelledby="antique-selected-title"><img src="${diamondShapeIcon(selected.name)}" alt="${selected.name} facet illustration" width="200" height="200"><div><p class="eyebrow">YOUR SELECTED SHAPE</p><h2 id="antique-selected-title">${selected.name}</h2><p>${selected.note}</p><a class="button" href="#/collection/diamonds?shape=${encodeURIComponent(selected.name)}">View matching diamonds <span aria-hidden="true">↗</span></a><small>Live inventory is not connected. Available matches will appear once supplied.</small></div></section>`:''}
  <div class="antique-footer"><p>Antique-inspired describes a cutting style, not necessarily a stone’s age. This edit also includes contemporary specialty cuts.</p><a class="text-link" href="#/collection/diamonds">Explore classic diamonds <span aria-hidden="true">↗</span></a></div></section>`;
}
function notFound(){return empty('This page is still taking shape.','Let’s get you back to the studio.','Return home','#/')}
function route(event){const educationFocus=!!document.activeElement?.closest('.edu-chapters');const educationY=document.querySelector('[data-education-page]')&&location.hash.startsWith('#/education?')?window.scrollY:0;TJSeducation.unmount();TJSimpact.unmount();closePanel();const raw=location.hash.startsWith('#/')?location.hash.slice(2):'',parts=raw.split('?'),path=parts[0].split('/'),params=new URLSearchParams(parts[1]||'');let html;if(!path[0])html=home();else if(path[0]==='collection')html=collection(path[1],params);else if(path[0]==='product')html=detail(path[1]);else if(path[0]==='cart')html=diamondCartPage();else if(path[0]==='your-ring')html=completedRingPage();else if(path[0]==='checkout')html=ringCheckoutPage();else if(path[0]==='favorites')html=`<div class="page-heading"><p class="eyebrow">YOUR PRIVATE EDIT</p><h1>Keep what you love.</h1><p>Saved on this browser, ready when you are.</p></div><section class="section">${favorites.length?productGrid(favorites.map(getProduct)):empty('Something will catch your eye.','Tap a heart on a piece to save it here.')}</section>`;else if(path[0]==='antique-shapes')html=antiqueShapes(params);else if(path[0]==='custom')html=custom();else if(path[0]==='faq')html=studioFaqPage();else if(path[0]==='journal')html=studioJournalPage();else if(path[0]==='builder')html=params.get('step')==='setting'?ringListingPage('engagement',new URLSearchParams('build=1')):completedRingPage();else if(path[0]==='diamond-type')html=diamondTypePage(path[1]);else if(path[0]==='education')html=TJSeducation.render(params,path[1]);else if(path[0]==='care')html=care();else if(path[0]==='policy')html=policy(path[1]);else if(path[0]==='impact')html=impact();else if(path[0]==='review')html=review();else if(path[0]==='contact')html=contact();else html=notFound();$('#main').innerHTML=localMarkup(html);$('#navigation').classList.remove('open');$('.mobile-menu').setAttribute('aria-expanded','false');$$('.nav a').forEach(a=>a.classList.toggle('active',a.hash===location.hash.split('?')[0]));document.title=($('#main h1')?.textContent||'Your story, set in light')+' | The Jewelry Studio';if(event?.type==='hashchange'&&event.oldURL?.split('#')[1]?.split('?')[0]!==location.hash.slice(1).split('?')[0])$('#main').focus({preventScroll:true});window.scrollTo({top:educationY,behavior:'instant'});restoreFinderPosition();restoreCollectionFilterPosition();mountCollectionCategorySlider();mountRingListing();if(path[0]==='impact')TJSimpact.mount($('#main'));if(path[0]==='education'){TJSeducation.mount($('#main'));if(educationFocus)document.querySelector('.edu-chapters [aria-current]')?.focus({preventScroll:true});}const video=$('.hero video');if(video){if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.pause();$('.video-toggle').hidden=true}else video.play().catch(()=>{$('.video-toggle').textContent='Play motion ▷';$('.video-toggle').setAttribute('aria-label','Play background video')})}}
function download(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function briefText(){const items=ringCartItems(),needsQuote=items.some(item=>cartLinePrice(item)===null);return 'THE JEWELRY STUDIO — LOCAL SELECTION\nNot an order. Final pricing, stock and fit need confirmation.\n\n'+items.map(item=>{const p=item.product;return p.title+'\nSKU: '+p.sku+'\n'+item.option+'\n'+(item.kind==='ring'?'Diamond: '+getProduct(item.diamondId).title+'\nDiamond SKU: '+getProduct(item.diamondId).sku+'\nRing reference: '+currency(p.price)+'\nDiamond: '+currency(getProduct(item.diamondId).price)+'\n':'')+(item.engraving?'Engraving: '+item.engraving.text+' / '+item.engraving.font+'\n':'')+'Total: '+(cartLinePrice(item)===null?'Quote required':currency(cartLinePrice(item)))+'\n';}).join('\n')+'\nTotal: '+(needsQuote?'Quote required':currency(items.reduce((n,item)=>n+cartLinePrice(item),0)))+'\nShipping and tax excluded.';}
document.addEventListener('click',event=>{const el=event.target.closest('button,a');if(!el)return;
 if(el.hasAttribute('data-favorite')){const id=el.dataset.favorite;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save();$$(`[data-favorite="${id}"]`).forEach(b=>{b.classList.toggle('saved',favorites.includes(id));b.setAttribute('aria-pressed',favorites.includes(id));b.setAttribute('aria-label',`${favorites.includes(id)?'Unsave':'Save'} ${getProduct(id).title}`)});if(location.hash==='#/favorites')route();toast(favorites.includes(id)?'Saved to your favorites.':'Removed from favorites.');return}
 if(el.hasAttribute('data-diamond-filter')&&el.hash!==location.hash){rememberFinderPosition(el.id);}
 if(el.dataset.chooseDiamond){const p=getProduct(el.dataset.chooseDiamond);if(p?.category!=='diamonds')return;if(!el.closest('[data-diamond-detail]')){location.hash='/product/'+p.id;return;}chooseRingDiamond(p.id);return}
 if(el.dataset.chooseSetting){const p=getProduct(el.dataset.chooseSetting);if(p?.category!=='engagement')return;chooseRingSetting(p.id,builder.metal);return}
 if(el.dataset.action==='diamond-filters'){const expanded=el.getAttribute('aria-expanded')!=='true';el.setAttribute('aria-expanded',expanded);$('#diamond-filter-panel').classList.toggle('is-open',expanded);return}
 if(el.dataset.add){addToBag(el.dataset.add);return}
 if(el.dataset.metal){activeMetal=el.dataset.metal;$$('[data-metal]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',b===el)});return}
 if(el.dataset.feature){$$('[data-feature]').forEach(b=>{b.classList.toggle('active',b===el);b.setAttribute('aria-pressed',b===el)});$('#featured-products').innerHTML=productGrid(CATALOG.filter(p=>p.category===el.dataset.feature).slice(0,4));return}
 if(el.dataset.build){const p=getProduct(el.dataset.build);builder[p.category==='diamonds'?'diamond':'ring']=p.id;save();location.hash=p.category==='diamonds'?'/builder?step=setting':'/builder';return}
 if(el.dataset.clearBuild){delete builder[el.dataset.clearBuild];save();route();return}
 if(el.dataset.search){$('#search-input').value=el.dataset.search;searchResults(el.dataset.search);return}
 if(el.hasAttribute('data-remove')){cart.splice(Number(el.dataset.remove),1);save();bag();return}
 if(el.tagName==='A'&&el.hash.startsWith('#/'))closePanel();
 switch(el.dataset.action){case'menu':$('#navigation').classList.toggle('open');el.setAttribute('aria-expanded',$('#navigation').classList.contains('open'));break;case'close':closePanel();break;case'search':search();break;case'cart':bag();break;case'checkout':checkout();break;case'account':openPanel('Your studio account','<h3>A personal space, coming next.</h3><p>Orders, saved details, and account access will use Shopify customer accounts when this design is integrated.</p><p class="notice">This local preview does not authenticate customers. Please do not enter a password here.</p>','<a class="button full" href="#/favorites">Explore your local favorites ↗</a>');break;case'social':toast(`${el.dataset.platform||'X'} profile is awaiting the studio’s confirmed link.`);break;case'video':{const v=$('.hero video');if(v.paused){v.play().then(()=>{el.textContent='Pause motion Ⅱ';el.setAttribute('aria-label','Pause background video')}).catch(()=>toast('Video is unavailable. The still image remains visible.'))}else{v.pause();el.textContent='Play motion ▷';el.setAttribute('aria-label','Play background video')}break}case'export-bag':download('TJS-preview-selection.txt',briefText());toast('Selection summary downloaded. No order was placed.');break;case'export-board':download('TJS-design-board.txt','TJS — DESIGN INSPIRATION, NOT AN ORDER\n\n'+['diamond','ring'].map(k=>{const p=getProduct(builder[k]);return `${titleCase(k)}: ${p?p.title:'Not selected'}${p?'\nSource: https://www.thejewelrystudio.us/products/'+p.handle:''}`}).join('\n\n')+'\n\nRing is design inspiration only, not a setting-only price. Fit and final quote must be confirmed.');break;case'print':window.print();break}
});
document.addEventListener('input',event=>{if(event.target.id==='search-input')searchResults(event.target.value);});
document.addEventListener('change',event=>{if(event.target.form?.id==='diamond-filters'){if(event.target.tagName==='SELECT')applyDiamondFilters(event.target.form,event.target.id);return}if(event.target.closest('#filters'))applyCollectionFilters($('#filters'),event.target);});
document.addEventListener('submit',event=>{if(event.target.id==='diamond-filters'){event.preventDefault();applyDiamondFilters(event.target,event.submitter?.id||'diamond-apply-preferences');return}if(event.target.id==='search-form'){event.preventDefault();searchResults($('#search-input').value)}if(event.target.id==='custom-form'){event.preventDefault();const data=Object.fromEntries(new FormData(event.target));data.designBoard={diamond:getProduct(builder.diamond)?.title||'None',ringInspiration:getProduct(builder.ring)?.title||'None'};data.status='LOCAL PREVIEW BRIEF — NOT SUBMITTED; NO CRM CONNECTION';download('TJS-custom-design-brief.json',JSON.stringify(data,null,2),'application/json');$('#custom-status').innerHTML='<p class="notice">Your brief was downloaded to this device. It has not been sent to the studio. You can share it with your manager when ready.</p>'}});
$('#panel').addEventListener('click',event=>{if(event.target===$('#panel')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closePanel()}});
$('.skip').addEventListener('click',event=>{event.preventDefault();$('#main').focus();$('#main').scrollIntoView()});
window.addEventListener('hashchange',route);header();route();
