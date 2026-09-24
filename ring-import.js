/* Adapter for the supplied Rings.csv. Names and supplier IDs are never deduplicated. */
'use strict';
const TJSRingImport=(()=>{
  function convert(rows,existing=[]){
    const byStock=new Map(existing.filter(p=>p.sourceStockId).map(p=>[p.sourceStockId,p]));
    let next=Math.max(0,...existing.map(p=>/^ER-(\d+)$/.exec(p.sku)?.[1]||0))+1;
    return rows.map(row=>{
      if(!row.stock_id||!row.full_name)throw new Error('Each ring needs stock_id and full_name.');
      const original=byStock.get(row.stock_id),sku=original?.sku||`ER-${next++}`;
      const title=String(row.full_name),notes=String(row.description||''),lower=title.toLowerCase();
      const images=Object.entries(row).filter(([key])=>/^image\d*$/.test(key)).sort(([a],[b])=>Number(a.replace('image',''))-Number(b.replace('image',''))).map(([,value])=>TJSInventory.safeUrl(value)).filter(Boolean);
      const styles=[];
      if(/solitaire/.test(lower))styles.push('solitaire');
      if(/halo/.test(lower))styles.push('halo');
      if(/pav[eé]/.test(lower)||(/pavé-set|pavé row|pavé continues|shoulders are pavé/.test(notes)&&!/no pavé/.test(notes)))styles.push('pave');
      if(/trio|three-stone/.test(lower))styles.push('three-stone');
      if(/cluster/.test(lower))styles.push('cluster');
      if(/cathedral/.test(notes)&&!/minimal cathedral/.test(notes))styles.push('cathedral');
      if(/graduated/.test(lower))styles.push('side-stone');
      const category=/eternity/.test(lower)?'wedding':/satin edge band/.test(lower)?'mens-rings':'engagement';
      if(category==='wedding')styles.push('eternity');
      if(category==='mens-rings')styles.push('classic');
      const shapeMatch=notes.match(/\b(cushion|pear|marquise|oval|round|emerald|radiant|princess|asscher|heart)[- ](?:shaped|cut|brilliant|blue|brilliant-cut|center)/i);
      const shape=shapeMatch?shapeMatch[1][0].toUpperCase()+shapeMatch[1].slice(1).toLowerCase():'';
      return {...original,id:original?.id||'ring-'+String(row.stock_id).toLowerCase(),sku,title,category,styles,shape,
        sourceStockId:row.stock_id,source:'Rings.csv · supplied catalog',sourceDescription:notes,
        description:notes,metalDescription:notes.split('. ')[0],metal:original?.metal||[],
        price:original?.price??null,pricingStatus:original?.price?'priced':'on-request',
        priceBasis:original?.priceBasis||(category==='engagement'?'quote-required':'item'),
        image:images[0]||'',images,status:'draft',compatibleShapes:original?.compatibleShapes||[],
        engravingAllowed:original?.engravingAllowed||false};
    });
  }
  return {convert};
})();
