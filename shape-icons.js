'use strict';
// Supplier artwork is preserved in assets/guru-shapes; public codes are not an API contract.
const CLASSIC_SHAPE_CODES = Object.freeze({Round:'BR',Oval:'OV',Radiant:'RA',Emerald:'EC',Cushion:'CU',Pear:'PS',Princess:'PR',Marquise:'MQ',Asscher:'AS',Heart:'HS'});
// Owner-selected display names. Dutch Marquise intentionally uses Guru's Hexagon
// artwork; Rose Cut uses Rose Round. Do not treat these aliases as API mappings.
const ANTIQUE_SHAPES = Object.freeze([
  {name:'Portuguese',code:'POR',supplierName:'Portuguese',note:'A round outline with an intricate, layered facet pattern.'},
  {name:'Euro Cut',code:'EU',supplierName:'Euro Cut',note:'A round silhouette with broad, geometric facets.'},
  {name:'Rose Cut',code:'RS',supplierName:'Rose Round',note:'A round outline with a petal-like arrangement of triangular facets.'},
  {name:'Dutch Marquise',code:'HEX',supplierName:'Hexagon',note:'A six-sided silhouette with clean edges and a distinctive geometric character.'},
  {name:'Old Miner',code:'OM',supplierName:'Old Miner',note:'A softly squared outline with broad, expressive facets.'},
  {name:'Moval',code:'MOVAL',supplierName:'Moval',note:'An elongated silhouette that brings oval softness and marquise-like length together.'},
  {name:'Criss Cut',code:'CRI',supplierName:'Criss Cut',note:'An elongated outline with a crossing, architectural facet pattern.'},
  {name:'Coffin',code:'COF',supplierName:'Coffin',note:'A tapered silhouette with angular shoulders and a bold geometric outline.'}
]);
function diamondShapeIcon(shape) {
  const code = CLASSIC_SHAPE_CODES[shape] || ANTIQUE_SHAPES.find(item=>item.name===shape)?.code;
  return code ? `assets/guru-shapes/signature/${code.toLowerCase()}.svg?v=balanced-4` : '';
}
