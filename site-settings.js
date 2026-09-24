'use strict';

// Confirmed owner-approved messaging. Promotions must also be configured in
// Shopify before launch; this static preview does not activate checkout offers.
const TJS_ANNOUNCEMENTS = Object.freeze([
  {text:'A little more brilliance. 15% off with code TJS15.', label:'Details', action:'offer'},
  {text:'Made for your story. Discover custom design.', label:'Explore', href:'#/custom'},
  {text:'Here for every detail. Shipping & returns information.', label:'Learn more', href:'#/policy/shipping'}
]);

// Official contact details only. Leave unknown values empty; the header then
// opens a helpful availability notice instead of a guessed number or address.
const TJS_CONTACT = Object.freeze({
  phone:'', email:'', whatsapp:'', hours:'',
  virtualAppointmentUrl:'', inPersonAppointmentUrl:'', address:'', mapUrl:''
});

// A single agency-editable location for official social accounts.
// Paste the complete HTTPS profile URL between the quotes when an account exists.
// Empty values intentionally remain preview buttons, never guessed external links.
const TJS_SOCIAL_PROFILES = {
  Instagram: '',
  Facebook: '',
  TikTok: '',
  LinkedIn: '',
  Reddit: '',
  X: ''
};

(() => {
  const container=document.getElementById('footer-socials');
  if(!container)return;
  const allowed={Instagram:['instagram.com'],Facebook:['facebook.com'],TikTok:['tiktok.com'],LinkedIn:['linkedin.com'],Reddit:['reddit.com'],X:['x.com','twitter.com']};
  let pending=0;
  for(const [name,value] of Object.entries(TJS_SOCIAL_PROFILES)) {
    let url;
    try {const candidate=new URL(value);if(candidate.protocol==='https:'&&allowed[name].some(host=>candidate.hostname===host||candidate.hostname.endsWith('.'+host)))url=candidate.href;} catch {}
    const element=document.createElement(url?'a':'button');
    element.textContent=name;
    if(url){element.href=url;element.target='_blank';element.rel='noopener noreferrer';element.setAttribute('aria-label',`The Jewelry Studio on ${name} (opens in a new tab)`);}
    else {pending++;element.type='button';element.dataset.action='social';element.dataset.platform=name;element.title=`${name} profile coming soon`;element.setAttribute('aria-label',`${name} — profile coming soon`);}
    container.append(element);
  }
  document.getElementById('social-status').textContent=pending===6?'Our social profiles are coming soon.':pending?'More studio profiles coming soon.':'Follow the studio, wherever you feel at home.';
})();
