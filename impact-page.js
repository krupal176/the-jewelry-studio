/* Original Drive Impact page, lightly adapted to the TJS app.
 * Draft figures retained by request; explicitly not actual outcomes.
 * This local display does not collect donations or connect to live reporting.
 */
const TJS_IMPACT_FIGURES = Object.freeze({
  incomePercent: 10, childrenSupported: 1300, opportunitiesFunded: 100000, organizations: 3
});
const TJSimpact = (() => {
  let cleanup = () => {};
  const metrics = [
    ['childrenSupported','Children supported',''],
    ['opportunitiesFunded','Education funding','USD'],
    ['organizations','Organizations supported',''],
    ['incomePercent','Giving allocation','%']
  ];
  const figure = key => typeof TJS_IMPACT_FIGURES[key] === 'number' && Number.isFinite(TJS_IMPACT_FIGURES[key]) && TJS_IMPACT_FIGURES[key] >= 0 ? TJS_IMPACT_FIGURES[key] : null;
  const format = (n,unit) => unit==='USD' ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n) : n.toLocaleString('en-US')+unit;
  const photo = (name,alt,ratio='wide',eager=false) => `<figure class="ip-photo ip-photo-${ratio}"><img src="assets/impact-original/${name}.jpg" alt="${alt}" loading="${eager?'eager':'lazy'}" decoding="async"></figure>`;
  function render() {
    return `<article class="impact-original" data-impact-page><div class="ip-draft-banner"><strong>Campaign concept · Draft figures.</strong> Numbers below are design placeholders, not verified donations or outcomes. Live reporting is not connected.</div>
    <section class="ip-hero"><div class="ip-wrap ip-hero-grid">
      <div class="ip-copy"><p class="ip-eyebrow">Our impact</p><h1>Every Piece<em>Carries a Purpose.</em></h1>
      <p class="ip-sub">Beautiful jewelry can create beautiful change.</p>
      <p class="ip-lede">At The Jewelry Studio, we believe that luxury should have meaning. We’re developing a giving program to support education, development and opportunities for children with disabilities and children growing up without parental care.</p>
      <p class="ip-pending">Campaign in development · South Africa is our proposed first focus.</p>
      <div class="ip-cta"><a class="ip-btn" href="#/collection/jewelry">Explore our jewelry</a><button class="ip-btn ip-btn-line" data-impact-jump="ip-commitment">See the commitment</button></div></div>
      <div>${photo('school-yard','School-yard scene from the original Impact concept','wide',true)}<p class="ip-photo-note">Reference photography from the original concept—not evidence of TJS beneficiaries or partner locations.</p></div>
    </div></section>

    <section class="ip-section"><div class="ip-wrap ip-split">
      <div class="ip-copy"><p class="ip-eyebrow">Our belief</p><h2>Opportunity Is the Thing That Compounds.</h2>
      <p class="ip-lede">A piece of jewelry marks a moment that already mattered. It does not have to do anything else. But the business behind it can help make room for someone else’s next chapter.</p>
      <p class="ip-lede">Education is at the heart of our proposed program: access to learning, developmental support and the opportunity to build a future. We’ll shape the details with organizations that understand the communities they serve.</p></div>
      ${photo('writing','Children writing at a shared desk in the original reference imagery')}
    </div></section>

    <section class="ip-section ip-wine" id="ip-commitment" tabindex="-1"><div class="ip-wrap">
      <div class="ip-heading ip-center"><p class="ip-eyebrow">The commitment</p><h2>A Share of Our Business.<br>A Bigger Purpose.</h2></div>
      <div class="ip-commit"><div class="ip-figure-mark"><svg viewBox="0 0 200 200" aria-hidden="true"><polygon points="100,14 158,52 178,116 100,186 22,116 42,52"/><polygon points="100,44 138,68 150,112 100,156 50,112 62,68"/><circle cx="100" cy="100" r="92"/><path d="M100 14 100 44M158 52 138 68M178 116 150 112M100 186 100 156M22 116 50 112M42 52 62 68"/></svg><span class="ip-value">${figure('incomePercent')===null?'—':format(figure('incomePercent'),'%')}</span></div>
      <p class="ip-label">Draft allocation · subject to approval</p><p class="ip-lede">Our intention is to direct a defined share from our business toward educational opportunities and developmental support.</p><p class="ip-pending">The percentage and whether it applies to sales or profit are awaiting approval. The displayed 10% is a draft proposal, not an active purchase-linked donation promise.</p></div>
    </div></section>

    <section class="ip-section"><div class="ip-wrap">
      <div class="ip-heading"><p class="ip-eyebrow">Where it could go</p><h2>Creating Opportunities Through Education</h2></div>
      <div class="ip-cards"><article><span class="ip-number">01</span><h3>Schooling costs, not school buildings</h3><p>Exploring practical support for fees, uniforms, books, transport and exam entry—the everyday resources that help a child take part in learning.</p></article><article><span class="ip-number">02</span><h3>Developmental support</h3><p>Considering assessment, therapy and learning aids for children with disabilities, guided by local partners and each program’s needs.</p></article><article><span class="ip-number">03</span><h3>The years after care ends</h3><p>Exploring vocational training and further education for young people moving beyond parental or institutional care.</p></article></div>
      <p class="ip-note">These are proposed priorities, not active programs. Named NGO partners, projects and allocations will be shared once confirmed. Any environmental initiative remains a separate future decision.</p>
    </div></section>

    <section class="ip-section ip-panel"><div class="ip-wrap">
      <div class="ip-heading"><p class="ip-eyebrow">The journey</p><h2>From Your Purchase to Their Possibility</h2><p class="ip-lede">How the program is intended to work once the campaign terms and partners are approved.</p></div>
      <ol class="ip-journey"><li><span>01</span><h3>You Choose a Piece</h3><p>A ring, a necklace, something made for your own story.</p></li><li><span>02</span><h3>Your Jewelry Takes Shape</h3><p>Your piece is prepared through the studio’s usual process.</p></li><li><span>03</span><h3>A Portion Is Allocated</h3><p>The approved share is recorded under clearly published campaign terms.</p></li><li><span>04</span><h3>Partners Receive Support</h3><p>Confirmed transfers reach approved organizations and agreed projects.</p></li><li><span>05</span><h3>Progress Is Shared</h3><p>Dated updates explain what was contributed and what partners report.</p></li></ol>
    </div></section>

    <section class="ip-section ip-wine" id="ip-numbers" tabindex="-1"><div class="ip-wrap">
      <div class="ip-heading"><p class="ip-eyebrow">By the numbers</p><h2>Our Impact, as It Grows.</h2><p class="ip-lede">Our future reporting space. These example figures are retained for design review, not reported results.</p></div>
      <div class="ip-numbers">${metrics.map(([key,label,unit])=>{const n=figure(key);return `<div class="ip-stat"><b ${n===null?'':`data-impact-count="${n}" data-unit="${unit}"`}>${n===null?'—':format(n,unit)}</b><span>${label}</span><small>Draft example · not verified</small></div>`}).join('')}</div>
      <p class="ip-note">Draft examples: 1,300 children, $100,000, 3 organizations and 10%. These are not verified TJS results. Replace them with dated, evidence-backed figures before publishing a campaign.</p>
    </div></section>

    <section class="ip-section"><div class="ip-wrap">
      <div class="ip-heading"><p class="ip-eyebrow">Real stories</p><h2>Behind Every Number Is a Story</h2></div>
      <div class="ip-story"><span class="ip-rule"></span><h3>The first stories are not written yet</h3><p>This is where we hope to share the difference our future program helps make—a new opportunity, a learning milestone, a next step.</p><p>When there is something real to report, we’ll share it with the appropriate consent and privacy protections. We won’t invent a story to fill the space.</p></div>
    </div></section>

    <section class="ip-section ip-panel"><div class="ip-wrap ip-split">
      <div class="ip-copy"><p class="ip-eyebrow">Jewelry and dreams</p><h2>Because Every Child Deserves the Opportunity to Dream.</h2><p class="ip-lede">Not a story of pity. A belief in what opportunity can make possible.</p></div>
      ${photo('classroom','Classroom scene from the original Impact reference')}
    </div></section>

    <section class="ip-section"><div class="ip-wrap ip-split">
      <div class="ip-copy"><p class="ip-eyebrow">Transparency</p><h2>Impact Should Be Measurable</h2><p class="ip-lede">As our initiatives develop, we plan to share where contributions go, the organizations we support and the outcomes those partners report.</p><p class="ip-transparency-note">Before launch, we’ll confirm the giving percentage and its calculation, partner organizations, transfer schedule and reporting method. Verified totals will include a reporting date and evidence.</p></div>
      ${photo('slates','Children working on slates in the original reference imagery','square')}
    </div></section>

    <section class="ip-section ip-panel"><div class="ip-wrap"><div class="ip-heading ip-center">
      <p class="ip-eyebrow">Your part in it</p><h2>Your Jewelry. Their Opportunity.</h2><p class="ip-lede">Luxury is personal. Impact can be shared. We want the pieces made for your story to help open possibilities for another.</p><a class="ip-btn" href="#/collection/jewelry">Explore the collection</a><p class="ip-note">This is our campaign intention, not a claim that today’s purchase funds a donation.</p>
    </div></div></section>

    <section class="ip-closing"><div class="ip-wrap"><div class="ip-copy"><p class="ip-eyebrow">Where this stands</p><h2>Committed to the idea.<em>Building it carefully.</em></h2><p class="ip-lede">The campaign is still taking shape. The giving terms, organizations and first verified figures are not finalized. We’ll publish the details when they’re ready, and let the evidence tell the story.</p><div class="ip-cta"><a class="ip-btn" href="#/collection/jewelry">Explore the collection</a><button class="ip-btn ip-btn-line" data-impact-jump="ip-numbers">View the counters</button></div></div></div></section>
    <div class="ip-foot-message"><div class="ip-wrap"><p>Jewelry With Purpose. Beauty With Impact.</p><p>A future giving program focused on education, development and opportunity.</p></div></div>
    </article>`;
  }
  function mount(container) {
    cleanup();
    const root=container?.querySelector('[data-impact-page]');
    if(!root)return;
    const abort=new AbortController(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let observer=null;
    const frames=new Set();
    root.addEventListener('click',event=>{
      const button=event.target.closest('[data-impact-jump]');
      if(!button)return;
      const target=root.querySelector('#'+button.dataset.impactJump);
      target?.focus({preventScroll:true});target?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
    },{signal:abort.signal});
    // A single gentle reveal, never hidden content or perpetual motion.
    if(!reduced.matches&&'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('ip-seen');observer.unobserve(entry.target);
        entry.target.querySelectorAll('[data-impact-count]').forEach(el=>{
          const value=Number(el.dataset.impactCount),unit=el.dataset.unit,final=format(value,unit);
          if(document.hidden){el.textContent=final;return;}
          let start=null;
          function tick(time){
            if(abort.signal.aborted)return;
            if(document.hidden||reduced.matches){el.textContent=final;return;}
            start??=time;const progress=Math.min(1,(time-start)/1000);
            el.textContent=format(Math.round(value*(1-Math.pow(1-progress,3))),unit);
            if(progress<1){const id=requestAnimationFrame(t=>{frames.delete(id);tick(t)});frames.add(id);}else el.textContent=final;
          }
          const id=requestAnimationFrame(t=>{frames.delete(id);tick(t)});frames.add(id);
        });
      }),{threshold:.1});
      root.querySelectorAll('.ip-heading,.ip-photo,.ip-numbers').forEach(el=>observer.observe(el));
    }
    cleanup=()=>{abort.abort();observer?.disconnect();frames.forEach(id=>cancelAnimationFrame(id));frames.clear();};
  }
  return {render,mount,unmount:()=>{cleanup();cleanup=()=>{};}};
})();
