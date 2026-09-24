/* Shared, validated local inventory boundary. No API keys or private orders here.
   Production must replace this adapter with authenticated server-side services. */
const TJSInventory = (() => {
  'use strict';
  const key='tjs-inventory-v1', promoKey='tjs-promo-drafts-v1';
  const categories=['engagement','wedding','diamonds','earrings','necklaces','bracelets','mens-rings'];
  const metals=['White gold','Yellow gold','Rose gold','Platinum'];
  const safeText=(value,max=500)=>String(value??'').trim().slice(0,max);
  const safeUrl=value=>{
    const s=safeText(value,1600);
    if(/^assets\/[a-zA-Z0-9_./%-]+$/.test(s)){try{const decoded=decodeURIComponent(s);if(!decoded.includes('..')&&!decoded.includes('\\')&&!decoded.includes('\u0000'))return s;}catch{}}
    try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}
  };
  const list=value=>Array.isArray(value)?value:String(value||'').split('|').map(s=>s.trim()).filter(Boolean);
  function validate(raw){
    const errors=[],p={};
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return {errors:['Expected a product record.']};
    for(const [field,max] of [['id',80],['sku',100],['title',180],['category',30],['shape',40],['description',2500],['cut',50],['certification',50],['reportNumber',100],['polish',40],['symmetry',40],['fluorescence',50],['settingType',80],['sideStoneColor',40],['sideStoneClarity',40],['sourceStockId',100],['metalDescription',250],['sourceDescription',3000]])p[field]=safeText(raw[field],max);
    if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(p.id))errors.push('ID must use letters, numbers, dashes or underscores.');
    if(!p.sku)errors.push('SKU is required.');
    if(!p.title)errors.push('Product name is required.');
    if(!categories.includes(p.category))errors.push('Unknown category.');
    p.pricingStatus=raw.pricingStatus==='on-request'?'on-request':'priced';
    p.price=raw.price===''||raw.price==null?null:Number(raw.price);
    if(p.price!==null&&(!Number.isFinite(p.price)||p.price<=0))errors.push('Price must be a positive USD amount, or blank for price on request.');
    if(p.price===null&&p.pricingStatus!=='on-request')errors.push('A verified positive USD price is required.');
    if(p.price!==null)p.pricingStatus='priced';
    p.image=safeUrl(raw.image);if(!p.image)errors.push('Provide an HTTPS image URL or a local assets/ image.');
    p.images=[...new Set([p.image,...list(raw.images).map(safeUrl).filter(Boolean)])].filter(Boolean).slice(0,20);
    p.metal=list(raw.metal).filter(m=>metals.includes(m));if(p.category!=='diamonds'&&!p.metal.length&&p.pricingStatus!=='on-request')errors.push('Provide at least one supported metal.');
    p.styles=list(raw.styles).filter(s=>/^[a-z0-9-]+$/.test(s)).slice(0,12);
    p.origin=raw.origin==='natural'?'natural':'lab-grown';
    if(p.category==='diamonds'&&!['natural','lab-grown'].includes(raw.origin))errors.push('Diamond origin must explicitly be natural or lab-grown.');
    p.color=safeText(raw.color,20);p.clarity=safeText(raw.clarity,20);
    for(const field of ['carat','depth','table','ratio','width','sideStoneCarat','sideStoneCount','minCarat','maxCarat','engravingFee']){
      const value=raw[field];p[field]=value===''||value==null?null:Number(value);
      if(p[field]!==null&&(!Number.isFinite(p[field])||p[field]<0))errors.push(field+' must be a non-negative number.');
    }
    if(p.sideStoneCount!==null&&!Number.isInteger(p.sideStoneCount))errors.push('Side-stone count must be a whole number.');
    if(p.category==='diamonds'&&(!p.carat||!p.shape||!p.color||!p.clarity))errors.push('Diamonds require carat, shape, color and clarity.');
    p.priceBasis=p.category==='diamonds'?'loose-diamond':p.category==='engagement'?(raw.priceBasis==='setting-component'?'setting-component':raw.priceBasis==='quote-required'?'quote-required':'complete-ring'):'item';
    p.reportUrl=safeUrl(raw.reportUrl);p.video=safeUrl(raw.video);
    p.compatibleShapes=list(raw.compatibleShapes).map(s=>safeText(s,40));
    if(p.minCarat!==null&&p.maxCarat!==null&&p.minCarat>p.maxCarat)errors.push('Minimum fitting carat exceeds maximum.');
    p.quickShip=raw.quickShip===true||raw.quickShip==='true';
    p.engravingAllowed=raw.engravingAllowed===true||raw.engravingAllowed==='true';
    p.status=raw.status==='active'?'active':'draft';
    p.isDemo=raw.isDemo===true||raw.isDemo==='true';
    p.demoRevision=Number.isInteger(raw.demoRevision)?raw.demoRevision:0;
    p.defaultMetal=p.metal.includes(raw.defaultMetal)?raw.defaultMetal:p.metal[0]||'';
    p.metalImages={};
    for(const metal of p.metal){const urls=list(raw.metalImages?.[metal]).map(safeUrl).filter(Boolean).slice(0,12);if(urls.length)p.metalImages[metal]=[...new Set(urls)];}
    p.handle=p.id;p.source=safeText(raw.source||'TJS import',100);
    return {product:p,errors};
  }
  function rawRecords(){
    const merged=new Map((Array.isArray(window.TJS_INVENTORY_SEED)?window.TJS_INVENTORY_SEED:[]).map(p=>[p.id,p]));
    try{const local=JSON.parse(localStorage.getItem(key));if(Array.isArray(local))local.forEach(p=>{
      if(!p||typeof p.id!=='string')return;
      const seed=merged.get(p.id);
      // Upgrade earlier unpriced browser records once; preserve names and manual edits.
      if(seed?.demoRevision>Number(p.demoRevision||0)){
        p={...seed,...p,isDemo:true,demoRevision:seed.demoRevision,price:p.price??seed.price,pricingStatus:'priced',
          priceBasis:p.priceBasis==='quote-required'?seed.priceBasis:p.priceBasis||seed.priceBasis,
          metal:p.metal?.length?p.metal:seed.metal,metalImages:p.metalImages&&Object.keys(p.metalImages).length?p.metalImages:seed.metalImages,
          defaultMetal:p.defaultMetal||seed.defaultMetal,image:seed.image,
          engravingAllowed:seed.engravingAllowed,engravingFee:p.engravingFee??seed.engravingFee};
      }
      merged.set(p.id,p);
    });}catch{}return [...merged.values()];
  }
  function records(){const seen=new Set();return rawRecords().flatMap(raw=>{const result=validate(raw);if(result.errors.length||seen.has(result.product.id))return [];seen.add(result.product.id);return [result.product];});}
  function save(rows){const seen=new Set(),skus=new Set();const validated=rows.map(raw=>{const r=validate(raw);if(r.errors.length)throw new Error(r.errors.join(' '));if(seen.has(r.product.id))throw new Error('Duplicate product ID: '+r.product.id);if(skus.has(r.product.sku.toUpperCase()))throw new Error('Duplicate SKU: '+r.product.sku);seen.add(r.product.id);skus.add(r.product.sku.toUpperCase());return r.product;});localStorage.setItem(key,JSON.stringify(validated));return validated;}
  function parseCSV(text){
    const rows=[];let row=[],field='',quoted=false;
    text=String(text).replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){const c=text[i];
      if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else if(quoted)quoted=false;else if(!field)quoted=true;else throw new Error('Unexpected quote in CSV.');}
      else if(c===','&&!quoted){row.push(field);field='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field='';}
      else field+=c;
    }
    if(quoted)throw new Error('An unclosed quote was found in the CSV.');
    if(field||row.length){row.push(field);rows.push(row);}
    if(!rows.length)return [];
    const headers=rows.shift().map(s=>s.trim()),named=headers.filter(Boolean);
    if(new Set(named).size!==named.length||named.some(h=>['__proto__','constructor','prototype'].includes(h)))throw new Error('Invalid or repeated CSV columns.');
    return rows.map((values,index)=>{if(values.length!==headers.length)throw new Error('Column count mismatch at row '+(index+2));if(headers.some((h,i)=>!h&&values[i].trim()))throw new Error('An unnamed column contains data at row '+(index+2));return Object.fromEntries(headers.flatMap((h,i)=>h?[[h,values[i]]]:[]));});
  }
  function promos(){try{const data=JSON.parse(localStorage.getItem(promoKey));return Array.isArray(data)?data.filter(p=>p&&typeof p.code==='string'&&/^[A-Z0-9_-]{3,30}$/.test(p.code)&&['percent','fixed'].includes(p.type)&&Number.isFinite(p.value)&&p.value>0&&(p.type!=='percent'||p.value<=100)).map(p=>({...p,status:'draft'})):[];}catch{return [];}}
  function savePromo(raw){
    const code=safeText(raw.code,30).toUpperCase(),value=Number(raw.value);
    if(!/^[A-Z0-9_-]{3,30}$/.test(code)||!Number.isFinite(value)||value<=0||(raw.type==='percent'&&value>100))throw new Error('Use a valid code and discount amount.');
    const item={code,type:raw.type==='percent'?'percent':'fixed',value,status:'draft',createdAt:new Date().toISOString()};
    localStorage.setItem(promoKey,JSON.stringify([...promos().filter(p=>p.code!==code),item]));return item;
  }
  // Preserve earlier browser selections before retiring the old catalog. No broad reset.
  try{const archive='tjs-before-catalog-clear-20260923';if(!localStorage.getItem(archive))localStorage.setItem(archive,JSON.stringify({cart:localStorage.getItem('tjs-cart-v2'),favorites:localStorage.getItem('tjs-favorites-v2'),builder:localStorage.getItem('tjs-builder-v2')}));}catch{}
  return {validate,parseCSV,records,save,promos,savePromo,safeUrl,products:()=>records().filter(p=>p.status==='active'),categories,metals};
})();
