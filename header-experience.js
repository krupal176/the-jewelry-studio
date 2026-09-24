'use strict';

(() => {
  const header=document.querySelector('.header');
  const bar=document.getElementById('studio-announcements');
  if(!header||!bar)return;
  const contact=document.getElementById('header-contact');
  const menu=contact.querySelector('.contact-menu');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const announcements=TJS_ANNOUNCEMENTS;
  const contactItems=[
    {label:'Support center',href:'#/contact'},
    {label:'FAQs & policies',href:'#/faq'},
    {label:'Book a virtual appointment',key:'virtualAppointmentUrl',type:'url'},
    {label:'Book an in-person appointment',key:'inPersonAppointmentUrl',type:'url'},
    {label:'Call',key:'phone',type:'phone'},
    {label:'Chat on WhatsApp',key:'whatsapp',type:'whatsapp'},
    {label:'Email us',key:'email',type:'email'},
    {label:'Studio location',key:'mapUrl',type:'url'}
  ];
  function contactHref(item){
    if(item.href)return item.href;
    const value=String(TJS_CONTACT[item.key]||'').trim();
    if(!value)return '';
    if(item.type==='phone'&&/^\+?[\d ()-]{7,20}$/.test(value))return 'tel:'+value.replace(/[ ()-]/g,'');
    if(item.type==='whatsapp'&&/^\+?[\d ()-]{7,20}$/.test(value))return 'https://wa.me/'+value.replace(/\D/g,'');
    if(item.type==='email'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return 'mailto:'+value;
    if(item.type==='url'){try{const url=new URL(value);if(url.protocol==='https:')return url.href;}catch{}}
    return '';
  }
  function contactLinks(){
    return contactItems.map((item,index)=>{
      const href=contactHref(item),classes=index===0?' class="contact-primary"':'';
      return href?'<a'+classes+' href="'+esc(href)+'"'+(href.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':'')+'>'+item.label+'</a>':
        '<button type="button" data-contact-pending="'+item.key+'">'+item.label+'</button>';
    }).join('');
  }
  menu.innerHTML=contactLinks()+(TJS_CONTACT.hours?'<small>'+esc(TJS_CONTACT.hours)+'</small>':'');
  const mobile=document.createElement('div');
  mobile.className='nav-direct mobile-contact-entry';
  mobile.innerHTML='<button type="button" class="mobile-contact-button" data-contact-directory>Contact us</button>';
  document.getElementById('navigation').append(mobile);

  contact.addEventListener('toggle',()=>{if(contact.open&&typeof closeMegaMenus==='function')closeMegaMenus();});
  document.getElementById('navigation').addEventListener('pointerenter',()=>{contact.open=false;});
  contact.addEventListener('focusout',event=>{if(!contact.contains(event.relatedTarget))contact.open=false;});
  document.addEventListener('click',event=>{
    if(!contact.contains(event.target))contact.open=false;
    if(event.target.closest('[data-contact-directory]')){
      openPanel('Contact the studio','<p>A little guidance, a new idea, or a question about your piece. Let’s start here.</p><div class="contact-panel-links">'+contactLinks()+'</div>');
    }
    const pending=event.target.closest('[data-contact-pending]');
    if(pending){
      contact.open=false;
      const item=contactItems.find(entry=>entry.key===pending.dataset.contactPending);
      openPanel(item?.label||'Contact the studio','<p>We’re adding the studio’s official contact and appointment details soon.</p><p>In the meantime, explore our answers to common questions or prepare your custom design inquiry.</p><div class="contact-panel-links"><a href="#/faq">Visit the support guide ↗</a><a href="#/custom">Start a custom inquiry ↗</a></div>');
    }
    if(event.target.closest('[data-announcement-offer]')){
      openPanel('A little more brilliance.','<p>Use your studio offer code for <strong>15% off</strong>.</p><div class="promo-code">TJS15</div><p class="muted">Local preview: checkout activation, eligible products, dates and offer terms will be confirmed before launch. This preview does not process discounts or payments.</p>','<a class="button" href="#/collection/engagement">Explore engagement rings ↗</a>');
    }
    if(event.target.closest('.contact-menu a'))contact.open=false;
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&contact.open){contact.open=false;contact.querySelector('summary').focus();}
  });

  const text=bar.querySelector('[data-announcement-text]');
  const action=bar.querySelector('[data-announcement-action]');
  const pause=bar.querySelector('[data-announcement-pause]');
  const message=bar.querySelector('.announcement-message');
  let index=0,timer,paused=motion.matches,hovered=false,focused=false;
  function renderMessage(){
    const item=announcements[index];
    text.textContent=item.text;
    action.innerHTML=item.href?'<a data-announcement-link href="'+esc(item.href)+'">'+esc(item.label)+'</a>':'<button type="button" data-announcement-link data-announcement-offer>'+esc(item.label)+'</button>';
    message.classList.remove('is-changing');
    requestAnimationFrame(()=>message.classList.add('is-changing'));
  }
  function schedule(){
    clearTimeout(timer);
    if(!paused&&!hovered&&!focused&&!document.hidden&&announcements.length>1){
      timer=setTimeout(()=>{index=(index+1)%announcements.length;renderMessage();schedule();},6500);
    }
  }
  function renderPause(){
    pause.setAttribute('aria-label',paused?'Play announcements':'Pause announcements');
    pause.setAttribute('aria-pressed',String(paused));
    pause.innerHTML=paused?'<svg viewBox="0 0 14 14" aria-hidden="true"><path d="m4 2 7 5-7 5Z"/></svg>':'<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2v10M10 2v10"/></svg>';
  }
  bar.addEventListener('click',event=>{
    const direction=event.target.closest('[data-announcement-step]');
    if(direction){index=(index+Number(direction.dataset.announcementStep)+announcements.length)%announcements.length;renderMessage();schedule();}
    if(event.target.closest('[data-announcement-pause]')){paused=!paused;renderPause();schedule();}
  });
  bar.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){hovered=true;schedule();}});
  bar.addEventListener('pointerleave',()=>{hovered=false;schedule();});
  bar.addEventListener('focusin',()=>{focused=true;schedule();});
  bar.addEventListener('focusout',event=>{focused=bar.contains(event.relatedTarget);schedule();});
  document.addEventListener('visibilitychange',schedule);
  motion.addEventListener('change',event=>{paused=event.matches;renderPause();schedule();});
  window.addEventListener('pagehide',()=>clearTimeout(timer));
  window.addEventListener('pageshow',schedule);
  renderMessage();renderPause();schedule();

  // Preserve contrast as the glass header moves over wine/image sections.
  let frame;
  function updateHeroClearance(){
    const hero=document.querySelector('#main > .hero');
    if(!hero)return;
    const panel=document.querySelector('.nav-item.expanded .mega-menu');
    const heroBounds=hero.getBoundingClientRect();
    const headerBounds=header.getBoundingClientRect();
    const needsClearance=Boolean(panel&&matchMedia('(min-width: 651px)').matches&&heroBounds.bottom>headerBounds.bottom&&heroBounds.top<innerHeight);
    hero.classList.toggle('has-menu-clearance',needsClearance);
    if(needsClearance){
      // Measure the actual menu, not a fixed offset: tablet and short windows differ.
      const clearance=Math.max(0,Math.ceil(headerBounds.bottom+panel.offsetHeight-heroBounds.top+28));
      hero.style.setProperty('--hero-menu-clearance',clearance+'px');
      hero.style.setProperty('--hero-copy-height',Math.ceil(hero.querySelector('.hero-copy').offsetHeight)+'px');
    }else{
      hero.style.removeProperty('--hero-menu-clearance');
      hero.style.removeProperty('--hero-copy-height');
    }
  }
  function updateHeader(){
    frame=0;
    header.classList.toggle('is-scrolled',window.scrollY>8);
    const sample=header.getBoundingClientRect().top+header.getBoundingClientRect().height/2;
    const dark=[...document.querySelectorAll('.hero,.home-ring-story,.home-custom,.site-footer')].some(section=>{
      const rect=section.getBoundingClientRect();return rect.top<=sample&&rect.bottom>sample;
    });
    header.classList.toggle('is-over-dark',dark);
    updateHeroClearance();
  }
  function queueHeader(){if(!frame)frame=requestAnimationFrame(updateHeader);}
  window.addEventListener('scroll',queueHeader,{passive:true});
  window.addEventListener('resize',queueHeader);
  window.addEventListener('hashchange',()=>{contact.open=false;queueHeader();});
  new MutationObserver(queueHeader).observe(document.getElementById('main'),{childList:true});
  new MutationObserver(queueHeader).observe(document.getElementById('navigation'),{subtree:true,attributes:true,attributeFilter:['class','hidden']});
  document.fonts?.ready.then(queueHeader);
  updateHeader();
})();
