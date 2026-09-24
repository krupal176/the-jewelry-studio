'use strict';

// Approved collection structure. Empty styles have honest preparation pages.
const MENU_CONTENT = [
  {
    key: 'diamonds', label: 'Diamonds', href: '#/collection/diamonds',
    groups: [
      { title: 'Classic shapes', shapes: true, links: SHAPES.map(shape => [shape, `#/collection/diamonds?shape=${shape}`]) },
      { title: 'Antique diamonds', antique: true, links: ANTIQUE_SHAPES.map(shape => [shape.name, '#/antique-shapes?shape='+encodeURIComponent(shape.name)]) },
      { title: 'Explore Diamonds', types: true, links: [['Lab-grown diamonds', '#/collection/diamonds', '', 'lab'], ['Natural diamonds', '#/diamond-type/natural', 'Planned', 'natural'], ['Fancy-color diamonds', '#/diamond-type/fancy-color', 'Planned', 'color']] },
      { title: 'A little knowledge', links: [['The 4 Cs', '#/education?topic=Cut'], ['Understanding color', '#/education?topic=Color'], ['Understanding clarity', '#/education?topic=Clarity'], ['Natural vs. lab-grown', '#/education/compare']] }
    ],
    showPromo: false, image: CAMPAIGN.diamond, caption: 'A shape for your story.', cta: 'Explore all diamonds', promoHref: '#/collection/diamonds'
  },
  {
    key: 'engagement', label: 'Engagement', href: '#/collection/engagement',
    groups: [
      { title: 'Shop By Style', styleIcons: true, links: [['All engagement rings', '#/collection/engagement', '', 'all'], ...COLLECTION_STYLES.engagement.map(style => [style.label, `#/collection/engagement?style=${style.id}`, '', style.id])] },
      { title: 'Create Your Own Ring', links: [['Start with a diamond', '#/collection/diamonds?build=1'], ['Start with a Setting', '#/collection/engagement?build=1'], ['Custom design inquiry', '#/custom']], metalShortcuts: TJSInventory.metals.filter(metal => ringListingMetals('engagement').includes(metal)).map(metal => [metal, '#/collection/engagement?metal='+encodeURIComponent(metal)]) },
      { title: 'Learn', links: [['Engagement ring guide', '#/education/engagement'], ['Ring sizing', '#/education/sizing'], ['Metal guide', '#/education/metals']] }
    ],
    image: CAMPAIGN.engagement, caption: 'A yes, unlike any other.', cta: 'Discover engagement', promoHref: '#/collection/engagement'
  },
  {
    key: 'wedding', label: 'Wedding', href: '#/collection/wedding',
    groups: [
      { title: 'Shop by style', weddingIcons: true, weddingStyles: true, links: [['All wedding bands', '#/collection/wedding', '', 'all'], ...COLLECTION_STYLES.wedding.map(style => [style.label, `#/collection/wedding?style=${style.id}`, '', style.id])] },
      { title: 'Men’s rings', weddingIcons: true, links: [['All men’s rings', '#/collection/mens-rings', '', 'mens-all'], ...COLLECTION_STYLES['mens-rings'].map(style => [style.label, `#/collection/mens-rings?style=${style.id}`, '', style.id])], metalShortcuts: TJSInventory.metals.filter(metal => ringListingMetals('wedding').includes(metal)).map(metal => [metal, '#/collection/wedding?metal='+encodeURIComponent(metal)]), metalTitle: 'Wedding band metals' },
      { title: 'Thoughtfully yours', weddingIcons: true, links: [['Design a custom band', '#/custom', '', 'custom'], ['Your saved favorites', '#/favorites', '', 'favorites']], secondaryTitle: 'Learn & care', secondaryLinks: [['Wedding band guide', '#/education/wedding', '', 'guide'], ['Metal guide', '#/education/metals', '', 'metals'], ['Jewelry care', '#/care', '', 'care'], ['FAQs & policies', '#/faq', '', 'help']] }
    ],
    image: 'assets/w2.jpg', caption: 'Always, in every way.', supportingText: 'A circle of meaning. A little light for every day together.', cta: 'Explore wedding bands', promoHref: '#/collection/wedding'
  },
  {
    key: 'jewelry', label: 'Jewelry', href: '#/collection/jewelry',
    groups: [
      { title: 'Shop by category', jewelryIcons: true, links: [['All fine jewelry', '#/collection/jewelry', '', 'all'], ['Earrings', '#/collection/earrings', '', 'earrings'], ['Necklaces', '#/collection/necklaces', '', 'necklaces'], ['Bracelets', '#/collection/bracelets', '', 'bracelets']], secondaryTitle: 'A personal touch', secondaryLinks: [['Design something unique', '#/custom', '', 'custom'], ['Your saved favorites', '#/favorites', '', 'favorites']] },
      { title: 'Earrings', jewelryIcons: true, links: COLLECTION_STYLES.earrings.map(style => [style.label, `#/collection/earrings?style=${style.id}`, '', 'earrings-'+style.id]), secondaryTitle: 'Bracelets', secondaryLinks: COLLECTION_STYLES.bracelets.map(style => [style.label, `#/collection/bracelets?style=${style.id}`, '', 'bracelets-'+style.id]) },
      { title: 'Necklaces', jewelryIcons: true, necklaceStyles: true, links: COLLECTION_STYLES.necklaces.map(style => [style.label, `#/collection/necklaces?style=${style.id}`, '', 'necklaces-'+style.id]) },
      { title: 'Learn & care', jewelryIcons: true, links: [['Fine jewelry guide', '#/education/jewelry', '', 'guide'], ['Metal guide', '#/education/metals', '', 'metals'], ['Jewelry care', '#/care', '', 'care'], ['FAQs & policies', '#/faq', '', 'help']], secondaryTitle: 'Discover your style', description: '', secondaryLinks: [['The 4 Cs', '#/education?topic=Cut', '', 'diamond'], ['Custom design process', '#/custom', '', 'custom']] }
    ],
    showPromo: false, image: CAMPAIGN.earrings, caption: 'Make it your signature.', cta: 'Explore fine jewelry', promoHref: '#/collection/jewelry'
  }
];

function diamondTypeIcon(type) {
  const paths = {lab:'<path d="M8 3h8M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8"/>',natural:'<path d="m3 15 6-9 4 5 3-6 5 10-9 6-9-6Z M3 15h18M9 6l3 15 4-16"/>',color:'<path d="m12 2 8 8-8 12L4 10l8-8Z M4 10h16M12 2l-4 8 4 12 4-12-4-8Z"/>'};
  return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[type]||'')+'</svg>';
}

// Original top-view silhouettes, with side profiles for raised settings.
// Shared proportions keep the small icons optically balanced in the directory.
function engagementStyleIcon(style) {
  const band = '<path d="M17 12H5a2 2 0 0 0 0 4h12m14-4h12a2 2 0 0 1 0 4H31"/>';
  const stone = '<path d="m21 7 6 0 4 4v6l-4 4h-6l-4-4v-6Zm0 0 1 4h4l1-4m4 4-5 0 2 3 3 3m-4 4-1-4h-4l-1 4m-4-4 5 0-2-3-3-3m5 0-2 3 2 3m4-6 2 3-2 3"/>';
  const sideStone = '<path d="m11 10 4 4-4 4-4-4Zm26 0 4 4-4 4-4-4Z"/>';
  const profile = '<path d="m18 4-3 4 9 8 9-8-3-4Zm-3 4h18m-15-4 3 4 3 8 3-8 3-4M13 24a11 8 0 0 1 22 0m-19 0a8 5 0 0 1 16 0"/>';
  const drawings = {
    all: band + stone + '<path d="M9 7h4m-2-2v4m24 12h4m-2-2v4"/>',
    solitaire: band + stone,
    pave: band + stone + '<path d="m5 14 2-2 2 2-2 2Zm5 0 2-2 2 2-2 2Zm24 0 2-2 2 2-2 2Zm5 0 2-2 2 2-2 2Z"/>',
    halo: '<path d="M13 12H5a2 2 0 0 0 0 4h8m22-4h8a2 2 0 0 1 0 4h-8"/>' + stone + '<path d="m20 4 8 0 6 6v8l-6 6h-8l-6-6v-8Z" stroke-dasharray="1.2 1.5"/>',
    'hidden-halo': profile + '<path d="M17 13h14v3H17Z"/><path d="M20 14.5h.1m4 0h.1m4 0h.1" stroke-width="1.4"/>',
    'three-stone': '<path d="M7 12H4v4h3m34-4h3v4h-3"/>' + stone + sideStone,
    cluster: band + '<path d="m24 4 4 4-4 4-4-4Zm-7 5 4 4-4 4-4-4Zm14 0 4 4-4 4-4-4Zm-7 2 4 4-4 4-4-4Zm-5 6 4 4-4 4-4-4Zm10 0 4 4-4 4-4-4Z"/>',
    cathedral: profile + '<path d="M10 24Q13 14 17 11l3 7m18 6Q35 14 31 11l-3 7"/>',
    signature: '<path d="M17 10C10 10 9 17 3 17v-4c6 0 7 7 14 7m14-10c7 0 8 7 14 7v-4c-6 0-7 7-14 7"/>' + stone,
    vintage: '<path d="M13 12H4v4h9m22-4h9v4h-9M17 11c-9-6-11 6 0 6m14-6c9-6 11 6 0 6"/>' + stone + '<circle cx="11" cy="14" r="1.3"/><circle cx="37" cy="14" r="1.3"/>'
  };
  return `<svg class="engagement-style-icon" viewBox="0 0 48 28" width="40" height="28" aria-hidden="true" focusable="false">${drawings[style] || drawings.solitaire}</svg>`;
}

function engagementMetalIcon(metal) {
  return `<svg class="engagement-metal-icon" data-metal-tone="${esc(metal)}" viewBox="0 0 32 28" width="26" height="24" aria-hidden="true" focusable="false"><path class="metal-band" d="M5 11v5a11 7 0 0 0 22 0v-5"/><ellipse class="metal-face" cx="16" cy="11" rx="11" ry="7"/><ellipse class="metal-opening" cx="16" cy="11" rx="7.5" ry="4"/><path class="metal-glint" d="M7 17c2 5 11 6 15 3"/></svg>`;
}

// Original decorative line art, used only by the Wedding directory.
function weddingMenuIcon(type) {
  const band = '<ellipse cx="20" cy="21" rx="13" ry="10"/><ellipse cx="20" cy="21" rx="9" ry="6"/>';
  const gems = '<path d="m8 18 3-3 3 3-3 3Zm9-5 3-3 3 3-3 3Zm9 5 3-3 3 3-3 3Z"/>';
  const paths = {
    all: '<ellipse cx="15" cy="22" rx="9" ry="10"/><ellipse cx="25" cy="18" rx="9" ry="10"/>',
    eternity: band + gems + '<path d="m10 26 3-3 3 3-3 3Zm7 3 3-3 3 3-3 3Zm7-3 3-3 3 3-3 3Z"/>',
    'half-eternity': band + gems,
    pave: band + '<path d="M10 17h.1M14 14h.1M20 13h.1M26 14h.1M30 17h.1M10 25h.1M14 28h.1M20 29h.1M26 28h.1M30 25h.1" stroke-width="2.4"/>',
    channel: band + '<path d="M10 16q10-9 20 0M12 14l2 4m4-6 .5 3m4-3-.5 3m6-1-2 4"/>',
    stackable: '<ellipse cx="20" cy="14" rx="12" ry="6"/><path d="M8 14v5c0 3 5 6 12 6s12-3 12-6v-5M8 22v4c0 3 5 6 12 6s12-3 12-6v-4M8 20c0 3 5 6 12 6s12-3 12-6"/>',
    signature: '<path d="M7 20q5-13 13-3 8-10 13 3-3 14-13 6-10 8-13-6Zm2-1q5-7 11 2 6-9 11-2M10 24q5 7 10-1 5 8 10 1"/>',
    'mens-all': '<ellipse cx="20" cy="17" rx="13" ry="8"/><path d="M7 17v7c0 4 6 8 13 8s13-4 13-8v-7"/><ellipse cx="20" cy="17" rx="9" ry="4"/>',
    classic: band,
    bezel: '<path d="M11 17a12 12 0 1 0 18 0M14 20a8 8 0 1 0 12 0M14 9h12v11H14Zm3 3h6v5h-6Z"/>',
    'bezel-edge': '<ellipse cx="20" cy="18" rx="13" ry="8"/><ellipse cx="20" cy="18" rx="10" ry="5"/><path d="M7 18v6c0 5 6 9 13 9s13-4 13-9v-6M8 23c3 9 21 9 24 0"/>',
    custom: '<path d="m9 27 1-6L25 6l5 5-15 15-6 1Zm13-18 5 5M10 21l5 5M7 33h25M28 24h7m-3.5-3.5v7"/>',
    favorites: '<path d="M20 32 7 19C-1 9 13 2 20 12 27 2 41 9 33 19Z"/>',
    guide: '<path d="M20 11c-4-3-9-4-15-2v22c6-2 11-1 15 2 4-3 9-4 15-2V9c-6-2-11-1-15 2Zm0 0v22M10 15l5 1m-5 5 5 1m10-6 5-1m-5 7 5-1"/>',
    metals: '<path d="m6 23 5-13h18l5 13-5 7H11Zm0 0h28M11 10l4 13-4 7m18-20-4 13 4 7M15 23h10"/>',
    care: '<path d="M5 23h7l5 4h8c4 0 4 5 0 5H14L5 28m8-5 8-4h10c4 0 4 4 1 5l-4 2M25 5v10m-5-5h10M12 8v6m-3-3h6"/>',
    help: '<path d="M7 8h26v20H18l-8 5v-5H7Z M17 15a3 3 0 1 1 5 2c-2 1-2 2-2 3"/><circle cx="20" cy="24" r=".7"/>'
  };
  return `<svg class="wedding-menu-icon" viewBox="0 0 40 40" width="30" height="30" aria-hidden="true" focusable="false">${paths[type] || band}</svg>`;
}

// Original, optically matched jewelry silhouettes. These are navigation artwork,
// not photographs of stock or an indication that a category is available yet.
function jewelryMenuIcon(type) {
  const gem = '<path d="m16 13 4-3 4 3v6l-4 3-4-3Zm0 0 4 3 4-3m-4 3v6"/>';
  const chain = '<path d="M7 7c0 14 5 23 13 23S33 21 33 7M10 7c0 12 4 20 10 20S30 19 30 7"/>';
  const pendant = '<path d="M8 7c0 12 4 17 12 17S32 19 32 7M20 24v3"/>';
  const bangle = '<ellipse cx="20" cy="21" rx="14" ry="9"/><ellipse cx="20" cy="21" rx="10" ry="5"/>';
  const paths = {
    all: '<path d="M6 10c1 11 5 18 14 18s13-7 14-18M20 28v3m-4 0 4-4 4 4-4 4Z"/>',
    earrings: '<path d="M12 8v5m16-5v5M7 17c0-7 10-7 10 0v9c0 7-10 7-10 0Zm16 0c0-7 10-7 10 0v9c0 7-10 7-10 0Z"/>',
    necklaces: chain + '<path d="m17 30 3-3 3 3-3 4Z"/>',
    bracelets: bangle + '<path d="m17 12 3-3 3 3-3 3Z"/>',
    'earrings-studs': '<path d="m7 16 5-4 5 4v7l-5 4-5-4Zm16 0 5-4 5 4v7l-5 4-5-4Zm-16 0 5 4 5-4m-5 4v7m11-11 5 4 5-4m-5 4v7"/>',
    'earrings-hoops-huggies': '<ellipse cx="12" cy="21" rx="7" ry="11"/><path d="M12 10a5 11 0 0 1 0 22"/><ellipse cx="28" cy="21" rx="7" ry="11"/><path d="M28 10a5 11 0 0 1 0 22"/>',
    'earrings-signature': '<path d="m10 8 3 3-3 3-3-3Zm20 0 3 3-3 3-3-3ZM10 14v5m20-5v5M10 19c-10 10-3 17 0 17s10-7 0-17Zm20 0c-10 10-3 17 0 17s10-7 0-17Z"/>',
    'bracelets-tennis': bangle + '<path d="m8 18 2-2 2 2-2 2Zm5-4 2-2 2 2-2 2Zm7-1 2-2 2 2-2 2Zm7 3 2-2 2 2-2 2Zm4 6 2-2 2 2-2 2Zm-6 6 2-2 2 2-2 2Zm-9 1 2-2 2 2-2 2Zm-7-4 2-2 2 2-2 2Z"/>',
    'bracelets-flex-bangles': '<ellipse cx="20" cy="16" rx="14" ry="7"/><path d="M6 16v9c0 4 6 7 14 7s14-3 14-7v-9M6 21c2 10 26 10 28 0"/>',
    'bracelets-station-link': '<ellipse cx="20" cy="21" rx="14" ry="10"/><path d="m17 11 3-3 3 3-3 3Zm14 10 3-3 3 3-3 3Zm-14 10 3-3 3 3-3 3ZM3 21l3-3 3 3-3 3Z"/>',
    'bracelets-cuban-link': '<path d="M10 17c-9-1-10 10-2 11 5 1 8-6 3-9m4-5c-9-1-10 10-2 11 5 1 8-6 3-9m4-5c-9-1-10 10-2 11 5 1 8-6 3-9m4-5c-9-1-10 10-2 11 5 1 8-6 3-9m4-5c-9-1-10 10-2 11 5 1 8-6 3-9"/>',
    'necklaces-solitaire': pendant + '<path d="m16 29 4-3 4 3-4 5Z"/>',
    'necklaces-tennis': chain + '<path d="M7 10h3m-2 5h3m-1 5h3m0 4 3-1m1 6 1-3m5 3-1-3m5-2-3-1m5-3h3m-1-5h3m-3-5h3"/>',
    'necklaces-cross': pendant + '<path d="M18 26h4v4h4v3h-4v5h-4v-5h-4v-3h4Z"/>',
    'necklaces-bezel': pendant + '<circle cx="20" cy="31" r="5"/><circle cx="20" cy="31" r="3"/>',
    'necklaces-halo': pendant + '<circle cx="20" cy="31" r="6" stroke-dasharray="1 1.7"/><path d="m17 29 3-2 3 2v4l-3 2-3-2Z"/>',
    'necklaces-signature': pendant + '<path d="M20 29c-7-7-11 5-4 5 6 0 10-9 13-5 4 6-5 9-9 0Z"/>',
    'necklaces-seasonal': pendant + '<path d="m20 26 2 4 5 1-4 3 1 4-4-2-4 2 1-4-4-3 5-1Z"/>',
    'necklaces-letter': pendant + '<path d="m16 36 4-9 4 9m-6-4h4"/>',
    diamond: gem + '<path d="M9 9v5m-2.5-2.5h5M30 24v6m-3-3h6"/>'
  };
  if (!paths[type]) return weddingMenuIcon(type).replace('wedding-menu-icon', 'jewelry-menu-icon');
  return `<svg class="jewelry-menu-icon" viewBox="0 0 40 40" width="30" height="30" aria-hidden="true" focusable="false">${paths[type]}</svg>`;
}

function menuLinks(group, links=group.links) {
  return links.map(([label, href, note, type]) => `<a href="${href}">${group.shapes ? `<img src="${diamondShapeIcon(label)}" alt="" width="44" height="44">` : ''}${group.antique ? `<img src="${diamondShapeIcon(label)}" alt="" width="32" height="32">` : ''}${group.types ? diamondTypeIcon(type) : ''}${group.styleIcons ? engagementStyleIcon(type) : ''}${group.weddingIcons ? weddingMenuIcon(type) : ''}${group.jewelryIcons ? jewelryMenuIcon(type) : ''}<span>${label}</span>${note ? `<small class="menu-link-note">${note}</small>` : ''}</a>`).join('');
}

const navigation = document.querySelector('#navigation');
navigation.innerHTML = MENU_CONTENT.map(menu => `
  <div class="nav-item" data-menu="${menu.key}">
    <div class="nav-trigger">
      <a href="${menu.href}" data-nav-section="${menu.key}">${menu.label}</a>
      <button class="menu-toggle" aria-label="Open ${menu.label} menu" aria-expanded="false" aria-controls="mega-${menu.key}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button>
    </div>
    <div class="mega-menu" id="mega-${menu.key}" aria-label="${menu.label} navigation" hidden>
      <div class="mega-inner">
        ${menu.groups.map(group => `<section class="mega-group ${group.shapes ? 'mega-shapes' : ''} ${group.antique ? 'mega-antique' : ''} ${group.pending ? 'mega-pending' : ''} ${group.types ? 'mega-types' : ''}${group.styleIcons ? ' mega-ring-styles' : ''}${group.weddingIcons ? ' mega-wedding-links' : ''}${group.weddingStyles ? ' mega-wedding-styles' : ''}${group.jewelryIcons ? ' mega-jewelry-links' : ''}${group.necklaceStyles ? ' mega-necklace-styles' : ''}"><h2>${group.title}</h2>${group.description ? `<p class="menu-description">${group.description}</p>` : ''}<div class="mega-links">${menuLinks(group)}</div>${group.secondaryLinks ? `<div class="mega-secondary"><h3>${group.secondaryTitle}</h3><div class="mega-links">${menuLinks(group,group.secondaryLinks)}</div></div>` : ''}${group.metalShortcuts ? `<div class="engagement-metal-shortcuts"><h3>${group.metalTitle || 'Shop by metal'}</h3><div class="mega-links">${group.metalShortcuts.map(([label, href]) => `<a href="${href}">${engagementMetalIcon(label)}<span>${label}</span></a>`).join('')}</div></div>` : ''}</section>`).join('')}
        ${menu.showPromo === false ? '' : `<a class="mega-promo" href="${menu.promoHref}"><img src="${localMarkup(menu.image)}" alt="${menu.label} inspiration from The Jewelry Studio"><span class="mega-caption">${menu.caption}</span>${menu.supportingText ? `<span class="mega-supporting-text">${menu.supportingText}</span>` : ''}<span class="mega-cta">${menu.cta} <span aria-hidden="true">↗</span></span></a>`}
      </div>
      <div class="mega-bottom"><a href="${menu.href}">Explore all ${menu.label.toLowerCase()} <span aria-hidden="true">↗</span></a><span>Your story. Set in light.</span></div>
    </div>
  </div>`).join('') + `
  <div class="nav-direct"><a href="#/custom" data-nav-section="custom">Custom</a></div>
  <div class="nav-direct"><a href="#/impact" data-nav-section="impact">Impact</a></div>`;

function syncMobileNavigation() {
  const trigger = document.querySelector('.mobile-menu');
  if (!trigger) return;
  const expanded = navigation.classList.contains('open');
  trigger.setAttribute('aria-expanded', String(expanded));
  trigger.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
}
// The shared router also closes navigation, so derive the label from its state.
if (typeof MutationObserver !== 'undefined') {
  new MutationObserver(syncMobileNavigation).observe(navigation, {attributes:true, attributeFilter:['class']});
}
syncMobileNavigation();

let menuLeaveTimer, menuOpenScrollY=0;
function closeMegaMenus(restoreFocus = false) {
  clearTimeout(menuLeaveTimer);
  const current = navigation.querySelector('.nav-item.expanded');
  navigation.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('expanded');
    item.querySelector('.mega-menu').hidden = true;
    const button = item.querySelector('.menu-toggle');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', `Open ${item.querySelector('[data-nav-section]').textContent} menu`);
  });
  if (restoreFocus && current) current.querySelector('.menu-toggle').focus();
}
function openMegaMenu(item) {
  closeMegaMenus();
  menuOpenScrollY=window.scrollY;
  const headerHeight=document.querySelector('.header').getBoundingClientRect().height;
  navigation.style.setProperty('--menu-header',headerHeight+'px');
  item.classList.add('expanded');
  item.querySelector('.mega-menu').hidden = false;
  item.querySelector('.menu-toggle').setAttribute('aria-expanded', 'true');
  item.querySelector('.menu-toggle').setAttribute('aria-label', `Close ${item.querySelector('[data-nav-section]').textContent} menu`);
}
navigation.querySelectorAll('.nav-item').forEach(item => {
  const trigger = item.querySelector('.nav-trigger');
  const button = item.querySelector('.menu-toggle');
  trigger.querySelector('a').addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch' && matchMedia('(min-width: 651px)').matches) openMegaMenu(item);
  });
  item.addEventListener('pointerenter', () => clearTimeout(menuLeaveTimer));
  item.addEventListener('pointerleave', () => {
    if (matchMedia('(min-width: 651px)').matches) menuLeaveTimer = setTimeout(() => closeMegaMenus(), 180);
  });
  button.addEventListener('click', () => {
    clearTimeout(menuLeaveTimer);
    item.classList.contains('expanded') ? closeMegaMenus() : openMegaMenu(item);
  });
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMegaMenu(item);
      item.querySelector('.mega-menu a').focus();
    }
  });
  item.addEventListener('focusout', event => {
    if (matchMedia('(min-width: 651px)').matches && item.classList.contains('expanded') && !item.contains(event.relatedTarget)) closeMegaMenus();
  });
});
navigation.querySelectorAll('.nav-direct').forEach(item => item.addEventListener('pointerenter', () => closeMegaMenus()));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const mobileOpen = navigation.classList.contains('open');
  closeMegaMenus(!mobileOpen);
  if (mobileOpen) {
    event.preventDefault();
    navigation.classList.remove('open');
    syncMobileNavigation();
    document.querySelector('.mobile-menu')?.focus();
  }
});
document.addEventListener('click', event => {
  if (!navigation.contains(event.target)) closeMegaMenus();
  if (event.target.closest?.('.mobile-menu')) syncMobileNavigation();
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) {
    closeMegaMenus();
    navigation.classList.remove('open');
    syncMobileNavigation();
  }
});
window.addEventListener('hashchange', () => { closeMegaMenus(); syncMobileNavigation(); updateNavigationState(); });
// A directory should not obscure new content after the shopper scrolls away.
window.addEventListener('scroll',()=>{
  if(matchMedia('(min-width: 651px)').matches&&Math.abs(window.scrollY-menuOpenScrollY)>24&&navigation.querySelector('.nav-item.expanded'))closeMegaMenus();
},{passive:true});
matchMedia('(min-width: 651px)').addEventListener('change', () => {
  closeMegaMenus();
  navigation.classList.remove('open');
  syncMobileNavigation();
});
function updateNavigationState() {
  const path = location.hash.split('?')[0];
  navigation.querySelectorAll('[data-nav-section]').forEach(link => {
    const section = link.dataset.navSection;
    const active = path === link.hash || (section === 'diamonds' && (path === '#/antique-shapes' || path.startsWith('#/diamond-type/'))) || (section === 'wedding' && path === '#/collection/mens-rings') || (section === 'jewelry' && /^#\/collection\/(earrings|necklaces|bracelets)$/.test(path));
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  });
}
updateNavigationState();

// Scroll transparency and contrast are managed by header-experience.js.
