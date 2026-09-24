'use strict';

// Preview only: no discount issuance, authentication, contact collection or remote requests.
const WELCOME_OFFER = Object.freeze({percent:10, delayMs:10000, dismissDays:7, storageKey:'tjs-welcome-offer-dismissed-v1'});
function welcomeRecentlyDismissed(now=Date.now()) {
  try {const value=Number(localStorage.getItem(WELCOME_OFFER.storageKey));return value>0 && now-value<WELCOME_OFFER.dismissDays*86400000;} catch {return false;}
}
function welcomeOfferMarkup() {
  return localMarkup(`<button class="welcome-close" data-welcome-close aria-label="Close welcome offer" autofocus>×</button><div class="welcome-layout"><div class="welcome-image"><img src="${CAMPAIGN.setting}" alt="A diamond resting on wine-colored fabric"><span class="welcome-image-caption" aria-hidden="true">THE JEWELRY STUDIO</span></div><div class="welcome-copy"><p class="eyebrow">WELCOME TO THE STUDIO</p><h2 id="welcome-title" class="welcome-headline"><span class="welcome-value">10%</span> <em>off</em></h2><p id="welcome-description" class="welcome-intro">A little extra, just for you.</p><button class="button full" data-welcome-signin>Sign in &amp; save <span aria-hidden="true">↗</span></button><button class="welcome-decline" data-welcome-close>Maybe later</button><p class="welcome-preview">Local preview · Sign-in and offer aren’t active.</p></div></div>`);
}

const welcomeDialog=document.createElement('dialog');
welcomeDialog.id='welcome-offer';
welcomeDialog.className='welcome-dialog';
welcomeDialog.setAttribute('aria-labelledby','welcome-title');
welcomeDialog.setAttribute('aria-describedby','welcome-description');
document.body.append(welcomeDialog);
let welcomeOpenedThisSession=false;
function openWelcomeOffer(manual=false) {
  if(welcomeDialog.open || document.querySelector('#panel[open]'))return false;
  if(!manual && (welcomeOpenedThisSession || welcomeRecentlyDismissed() || document.hidden || document.activeElement?.matches('input,textarea,select')))return false;
  welcomeDialog.innerHTML=welcomeOfferMarkup();
  welcomeDialog.showModal();
  welcomeOpenedThisSession=true;
  return true;
}
welcomeDialog.addEventListener('close',()=>{
  try{localStorage.setItem(WELCOME_OFFER.storageKey,String(Date.now()));}catch{}
});
welcomeDialog.addEventListener('click',event=>{
  if(event.target.closest('[data-welcome-close]'))welcomeDialog.close();
  if(event.target.closest('[data-welcome-signin]')){
    const content=welcomeDialog.querySelector('.welcome-copy');
    content.innerHTML=`<p class="eyebrow">LOCAL PREVIEW</p><h2 id="welcome-title" class="welcome-pending-title" tabindex="-1">Sign-in is<br>coming soon.</h2><p id="welcome-description" class="welcome-pending-copy">This preview doesn’t sign you in or apply a discount.</p><button class="button full" data-welcome-close>Back to exploring <span aria-hidden="true">↗</span></button>`;
    content.querySelector('h2').focus();
  }
  if(event.target===welcomeDialog){const r=welcomeDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)welcomeDialog.close();}
});
document.addEventListener('click',event=>{if(event.target.closest('[data-action="welcome-offer"]'))openWelcomeOffer(true);});
// One restrained first-visit invitation; never steal focus from another dialog or a form.
setTimeout(()=>openWelcomeOffer(),WELCOME_OFFER.delayMs);
