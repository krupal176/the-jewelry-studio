/* Real approved inventory only. The previous storefront snapshot is archived outside the website. */
'use strict';
const SOURCE_CDN='https://cdn.shopify.com/s/files/1/0638/7836/5339/files/';
const STORE_CDN='https://www.thejewelrystudio.us/cdn/shop/files/';
const SHAPES=['Round','Oval','Radiant','Emerald','Cushion','Pear','Princess','Marquise','Asscher','Heart'];
const CATALOG=TJSInventory.products();
const CAMPAIGN={engagement:STORE_CDN+'engagement-rings.png?v=1789366848&width=1600',earrings:STORE_CDN+'earrings.png?v=1789366902&width=1600',bracelets:STORE_CDN+'bracelets.png?v=1789366875&width=1600',necklaces:STORE_CDN+'necklaces.png?v=1789366924&width=1600',wedding:STORE_CDN+'Eternity-bands.png?v=1789366948&width=1600',custom:STORE_CDN+'engagement-rings-main.png?v=1789376381&width=1800',editorial:STORE_CDN+'earrings-main.png?v=1789375557&width=1600',diamond:STORE_CDN+'cc552e25d26884ffbb71f51f10f2424b003a9052.jpg?v=1789803262&width=900',setting:STORE_CDN+'13a00fc69f2512ad4f356ae18ac00454929c01e2.jpg?v=1789803316&width=900',video:'https://cdn.shopify.com/videos/c/o/v/d884753f5a5445d48a355d3ac062a623.mp4'};
