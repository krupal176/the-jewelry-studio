'use strict';

// Public integration contract: render(params), mount(root), unmount(). No live commerce calls.
const TJSeducation = (() => {
  let cleanup = () => {};
  const safeTopic = value => Object.keys(TJS_LESSONS).find(k=>k.toLowerCase()===String(value).toLowerCase()) || 'Cut';
  const sourceLink = (url,label) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
  const homeLink = '<a href="#/education">Education home</a>';
  const anatomyParts = {
    none:{label:'Whole diamond',note:'Turn the whole stone to see its facets and changing reflections.'},
    table:{label:'Table',note:'The large, flat facet at the very top of the diamond.'},
    crown:{label:'Crown',note:'The upper portion, extending from the girdle to the table.'},
    girdle:{label:'Girdle',note:'The narrow perimeter that separates the crown from the pavilion.'},
    pavilion:{label:'Pavilion',note:'The lower portion, extending from the girdle toward the bottom point or culet facet.'}
  };
  const directoryGroups = [
    {number:'01',title:'Know your diamond',note:'Go a little deeper, one detail at a time.',links:[['Cut: the full guide','#/education/cut','Proportions, light and the grade.'],['Color: the full guide','#/education/color','The scale, the setting and your eye.'],['Clarity: the full guide','#/education/clarity','What the details can tell you.'],['Carat: the full guide','#/education/carat','Weight, measurements and presence.'],['Natural vs. lab-grown','#/education/compare','Two origins, clearly explained.'],['Diamond shapes','#/education/shapes','Find an outline that feels like you.'],['Reports & verification','#/education/reports','Know what you are looking at.']]},
    {number:'02',title:'Find your forever',note:'A little guidance for a very personal choice.',links:[['Engagement ring styles','#/education/engagement','From solitaire to vintage-inspired.'],['Wedding bands','#/education/wedding','Styles, settings and pairing.'],['Precious metals','#/education/metals','Choose for color, care and everyday life.'],['Ring sizing','#/education/sizing','Make comfort part of the decision.']]},
    {number:'03',title:'Wear it well',note:'For the pieces that become part of your everyday.',links:[['The jewelry guide','#/education/jewelry','Earrings, necklaces and bracelets.'],['Care & keeping','#/education/care','Simple habits for beautiful jewelry.']]}
  ];
  function homePage(params=new URLSearchParams()) {
    return `<article class="edu-page edu-home" data-education-home>
      <header class="edu-home-intro"><p class="eyebrow">THE STUDIO / EDUCATION</p><h1>Know a little more.<br><em>Love it a little longer.</em></h1><p>Start with the diamond. Explore the 4 Cs below, then follow your curiosity.</p></header>
      ${interactiveStudio(params)}
      <div class="edu-library-intro"><p class="eyebrow">THE READING ROOM</p><h2>A little further into the details.</h2><p>Short guides for the question on your mind. No need to read everything at once.</p></div>
      <div class="edu-directory" aria-label="Education topics">${directoryGroups.map(group=>`<details class="edu-directory-section"><summary><span class="edu-directory-number">${group.number}</span><span class="edu-directory-heading"><strong>${group.title}</strong><small>${group.note}</small></span><span class="edu-directory-count">${group.links.length} guides</span></summary><ul>${group.links.map(([label,href,note])=>`<li><a href="${href}"><strong>${label}</strong><small>${note}</small></a></li>`).join('')}</ul></details>`).join('')}</div>
      <div class="edu-bottom-help"><p>A question about a particular piece?</p><a class="text-link" href="#/contact">Talk to the studio</a></div>
    </article>`;
  }
  function guidePage(slug) {
    const guide=Object.hasOwn(TJS_EDUCATION_GUIDES,slug)?TJS_EDUCATION_GUIDES[slug]:null;
    if(!guide)return `<article class="edu-page"><div class="edu-crumb">${homeLink}</div><h1>Let’s find the right guide.</h1><p>This topic isn’t in the library yet.</p><a class="button" href="#/education">Browse all education ↗</a></article>`;
    const topic=Object.keys(TJS_LESSONS).find(key=>key.toLowerCase()===slug);
    return `<article class="edu-page edu-guide" data-education-guide="${slug}"><nav class="edu-crumb" aria-label="Breadcrumb">${homeLink} <span aria-hidden="true">/</span> ${guide.title}</nav><header class="edu-guide-intro"><p class="eyebrow">${guide.kicker}</p><h1>${guide.title}</h1><p>${guide.intro}</p>${topic?`<a class="edu-article-studio-link" href="#/education?topic=${topic}">Explore ${topic.toLowerCase()} in 3D <span aria-hidden="true">↗</span></a>`:''}</header><div class="edu-guide-body"><aside><span class="eyebrow">IN THIS GUIDE</span><ol>${guide.sections.map((s,i)=>`<li><button type="button" data-guide-jump="${i}">${s.title}</button></li>`).join('')}</ol><a class="text-link" href="#/education">All education ↗</a></aside><div>${guide.sections.map((section,i)=>`<section class="edu-guide-section" id="guide-section-${i}" tabindex="-1"><span class="edu-section-number">${String(i+1).padStart(2,'0')}</span><h2>${section.title}</h2><p>${section.text}</p></section>`).join('')}</div></div><nav class="edu-related" aria-label="Continue exploring"><p class="eyebrow">YOUR NEXT STEP</p>${guide.related.map(({label,href})=>`<a href="${href}">${label} <span aria-hidden="true">↗</span></a>`).join('')}</nav><details class="edu-source-details"><summary>Sources & a little context</summary><p>Original TJS guidance, informed by the resources below. Education does not confirm product availability or replace an individual report or professional assessment.</p><ul>${guide.sources.map(({label,url})=>`<li>${sourceLink(url,label)}</li>`).join('')}</ul></details></article>`;
  }
  function fallback(topic) {
    if(topic==='Cut')return `<svg class="edu-fallback" viewBox="0 0 320 300" role="img" aria-label="Simplified side profile showing the diamond table, crown, girdle, and pavilion"><g id="edu-flat-gem" stroke="#5a1b2a" stroke-width="1.1"><path data-flat-part="crown" fill="#eef1f4" d="M60 115L105 75H215L260 115Z"/><path data-flat-part="pavilion" id="edu-flat-pavilion" fill="#e4e9ef" d="M60 120H260L160 230Z"/><path data-flat-part="girdle" fill="#c2cbd4" d="M60 115H260V120H60Z"/><path data-flat-part="table" fill="none" d="M105 75H215"/><path fill="none" d="M105 75L130 115M215 75L190 115"/><g id="edu-flat-markers"></g></g></svg>`;
    const points=Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return [160+105*Math.cos(a),145+105*Math.sin(a)];});
    const table=Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return [160+54*Math.cos(a),145+54*Math.sin(a)];});
    return `<svg class="edu-fallback" viewBox="0 0 320 300" role="img" aria-label="Simplified diamond diagram, not a product image"><g id="edu-flat-gem" stroke="#7e6971" stroke-width=".9"><polygon fill="var(--gem-tint,#fff)" points="${points.map(p=>p.join(',')).join(' ')}"/><polygon fill="#fff7" points="${table.map(p=>p.join(',')).join(' ')}"/>${table.map((p,i)=>`<path fill="none" d="M${p}L${points[i*2]}M${p}L${points[(i*2+1)%16]}L${table[(i+1)%8]}"/>`).join('')}<g id="edu-flat-markers" fill="#5a1b2a"></g></g></svg>`;
  }
  function inclusionDiagram(type) {
    const drawings={
      cloud:'<path fill="#a5abb54d" stroke="#8d939c" stroke-dasharray="1 4" d="M126 127C137 110 151 120 159 114C177 109 195 125 185 140C196 160 179 174 164 167C149 181 131 165 132 153C113 149 116 135 126 127Z"/><path fill="none" stroke="#969ca9" stroke-opacity=".65" stroke-width="1.4" d="M136 128l9 6m6-12l12 6m6-3l10 9m-50 6l9 6m7-5l12 5m5-12l10 8m-35 12l10 6m8-3l11 5m5-17l10 6"/>',
      feather:'<path fill="#d1d6e28c" stroke="#717e92" d="M132 176L147 145L165 127L188 112L172 140L155 158Z"/><path fill="none" stroke="#56647b" stroke-width="1.4" d="M133 174L185 115M148 154l-3-12m11 5l14-4m-7-6l-1-11m7 5l10-3M141 164l13-5"/>',
      cavity:'<path fill="#4b5263" stroke="#2f394c" stroke-width="1.6" d="M244 100L251 113L248 133L229 142L217 128L228 109Z"/><path fill="#9ca4b3" stroke="#626d81" d="M244 100L233 119L217 128L228 109Z"/><path fill="#cad0dd" stroke="#626d81" d="M217 128L233 119L229 142Z"/><path fill="none" stroke="#dce0e8" d="M233 119L248 133"/>',
      crystal:'<path fill="#7f829c" stroke="#3e455e" stroke-width="1.5" d="M150 119L175 123L186 143L168 161L143 150L139 130Z"/><path fill="#bdc1d1" d="M150 119L156 138L139 130Z"/><path fill="#50576b" d="M156 138L175 123L186 143L168 161Z"/><path fill="none" stroke="#d6dbe5" d="M150 119L156 138L168 161M143 150L156 138L186 143"/>',
      needle:'<path fill="#a9acba" stroke="#596075" stroke-width=".9" d="M130 171L188 115L135 169Z"/><path fill="none" stroke="#424e64" stroke-width="1.2" d="M131 170L187 116"/>',
      pinpoint:'<path fill="#4a4e62" stroke="#7f8797" stroke-width=".7" d="M158 139L161 141L160 145L156 144L155 141Z"/>'
    };
    return drawings[type]||drawings.feather;
  }
  function measure(value,decimals=2) {
    return value!==0&&(value<.01||value>=100000)?value.toExponential(3):value.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals===1?1:Math.max(decimals,4)});
  }
  function caratReference(weight) {
    const relative=Math.cbrt(weight),fit=Math.max(1,relative),diameter=6.5*relative;
    const stone=(center,size)=>{
      const points=Array.from({length:16},(_,i)=>`${center+size/2*Math.cos(i*Math.PI/8)},${58+size/2*Math.sin(i*Math.PI/8)}`).join(' ');
      const inner=Array.from({length:8},(_,i)=>`${center+size/4*Math.cos(i*Math.PI/4)},${58+size/4*Math.sin(i*Math.PI/4)}`).join(' ');
      return `<polygon points="${points}" fill="#f3f4f6" stroke="#8d8590"/><polygon points="${inner}" fill="white" stroke="#aaa3aa"/><path d="M${center-size/2} 108H${center+size/2}M${center-size/2} 103v10M${center+size/2} 103v10" fill="none" stroke="#5a1b2a"/>`;
    };
    return `<svg viewBox="0 0 340 148" role="img" aria-labelledby="edu-size-title edu-size-description"><title id="edu-size-title">Round diamond measurement comparison</title><desc id="edu-size-description">A 1 carat reference estimated at 6.5 millimeters compared with ${measure(weight)} carats estimated at ${measure(diameter,1)} millimeters. Both outlines and their rulers use the same relative scale. This is not life-size.</desc>${stone(85,80/fit)}${stone(255,80*(relative/fit))}<text x="85" y="17">1.00 ct reference</text><text x="255" y="17">${measure(weight)} ct selected</text><text x="85" y="130">6.5 mm</text><text x="255" y="130">≈ ${measure(diameter,1)} mm</text></svg><p>Same relative scale · Estimated round diameter · Not life-size</p>`;
  }
  function interactiveStudio(params) {
    const topic=safeTopic(params.get('topic')),lesson=TJS_LESSONS[topic];
    const optionControls=`<fieldset class="edu-options"><legend>${lesson.label}</legend>${topic==='Carat'?`<label class="edu-sr" for="edu-carat">Common carat weights</label><input id="edu-carat" type="range" min="0" max="${lesson.options.length-1}" step="1" value="${lesson.initial}"><div class="edu-range-ends"><span>0.50 ct</span><span>3.00 ct · preset range</span></div><div class="edu-custom-carat"><label for="edu-carat-custom">Or enter a weight</label><div><input id="edu-carat-custom" type="number" inputmode="decimal" step="any" value="${lesson.options[lesson.initial].value}" aria-describedby="edu-carat-hint edu-carat-error"><span>ct</span></div><small id="edu-carat-hint">Any positive weight. Press Enter or leave the field to compare.</small><p id="edu-carat-error" role="status" hidden></p></div>`:`<div class="edu-option-row">${lesson.options.map((option,i)=>`<button type="button" data-lesson-value="${i}" aria-pressed="${i===lesson.initial}">${topic==='Color'?`<i style="--swatch:${option.value}"></i>`:''}${option.label}</button>`).join('')}</div>`}</fieldset>`;
    const gradeReading='<div class="edu-reading" aria-live="polite" aria-atomic="true"><h3 id="edu-current-value"></h3><p id="edu-current-note"></p></div>';
    return `<section class="edu-home-studio" data-education-page data-topic="${topic}" aria-label="Interactive diamond education">
      <nav class="edu-chapters" aria-label="The 4 Cs">${Object.entries(TJS_LESSONS).map(([key,value])=>`<a href="#/education?topic=${key}" ${key===topic?'aria-current="page"':''}><span>${value.number}</span><strong>${key}</strong><small>${value.short}</small></a>`).join('')}</nav>
      <div class="edu-workbench">
        <figure class="edu-visual"><div class="edu-stage-meta"><span>THE INTERACTIVE STUDIO</span><span id="edu-render-mode">Illustration</span></div>
          <div class="edu-model-host" id="edu-model-host">${fallback(topic)}</div>
          ${topic==='Carat'?'<div class="edu-carat-reference" id="edu-carat-reference"></div>':''}
          <div class="edu-facet-tools">
            <label class="edu-checkbox"><input type="checkbox" id="edu-anatomy"><span>Emphasize all facet edges</span><small class="edu-facet-nudge" aria-hidden="true">Try me</small></label>
          </div>
          <div class="edu-stage-caption"><p id="edu-view-help">Explore the controls to see the idea. A 3D view loads when supported.</p><div class="edu-view-tools" hidden><button type="button" data-view="top" aria-pressed="false">Top</button><button type="button" data-view="side" aria-pressed="true">Side</button><button type="button" data-spin aria-pressed="false">Resume rotation</button></div></div>
          <figcaption>Illustrative model · Not an actual stone or grading tool<br><button type="button" class="edu-diagram-toggle" data-diagram>Use diagram view</button></figcaption>
        </figure>
        <div class="edu-controls"><p class="eyebrow">${lesson.number} / ${topic.toUpperCase()}</p><h2>${lesson.title}</h2><p class="edu-lede">${lesson.intro}</p>
          ${topic==='Clarity'?`<fieldset class="edu-options edu-inclusion-options"><legend>Explore inclusion types</legend><div class="edu-option-row">${Object.entries(TJS_INCLUSIONS).map(([key,item])=>`<button type="button" data-inclusion-type="${key}" aria-pressed="${key==='feather'}">${item.label}</button>`).join('')}</div></fieldset><div class="edu-inclusion-reading" aria-live="polite" aria-atomic="true"><h3 id="edu-inclusion-label"></h3><p id="edu-inclusion-note"></p></div><label class="edu-checkbox"><input type="checkbox" id="edu-markers" checked> Show inclusion example</label><p class="edu-inclusion-source">Definitions: ${sourceLink('https://4cs.gia.edu/en-us/blog/diamond-inclusions-defined/','GIA · Inclusion types')}</p>`:optionControls}
          ${topic==='Color'?`<div class="edu-color-reference" aria-label="Illustrative color reference"><div><span class="edu-color-swatch" style="--sample:#ffffff" aria-hidden="true"></span><span>D–F reference<small>Colorless illustration</small></span></div><span class="edu-color-versus" aria-hidden="true">/</span><div><span class="edu-color-swatch" id="edu-selected-swatch" style="--sample:#ffffff" aria-hidden="true"></span><span><strong id="edu-swatch-label">D–F</strong> selected<small id="edu-swatch-name">Colorless illustration</small></span></div></div><p class="edu-color-context">Compare warmth against white. These are teaching bands, not exact D-to-Z grade colors.</p>`:''}
          ${topic==='Clarity'?`<details class="edu-grade-reference"><summary>Clarity grades explained</summary><p>The grade reference is separate from the example above. Selecting FL or IF does not assign that grade to the illustrated diamond.</p>${optionControls}${gradeReading}</details>`:gradeReading}
          ${topic==='Carat'?'<p class="edu-carat-fitting">Extreme entries are fitted to the viewer; use the measurement comparison for relative size.</p>':''}
          ${topic==='Cut'?`<fieldset class="edu-anatomy-options"><legend>Meet the diamond</legend><div class="edu-part-buttons">${Object.entries(anatomyParts).map(([key,part])=>`<button type="button" data-anatomy-part="${key}" aria-pressed="${key==='none'}">${part.label}</button>`).join('')}</div><p id="edu-part-description" aria-live="polite">${anatomyParts.none.note}</p></fieldset>`:''}
          <a class="edu-learn-more" href="#/education/${topic.toLowerCase()}">The full ${topic.toLowerCase()} guide</a>
          <p class="edu-limit">${lesson.caveat}</p>
        </div>
      </div>
    </section>`;
  }
  function comparisonPage() {
    return `<article class="edu-page edu-comparison" data-comparison-page>
      <nav class="edu-crumb" aria-label="Breadcrumb">${homeLink} / Natural vs. lab-grown</nav>
      <section class="edu-compare-hero"><div><p class="eyebrow">NATURAL & LABORATORY-GROWN DIAMONDS</p><h1>Different origins.<br><em>Your kind of extraordinary.</em></h1><p>We love lab-grown diamonds for the possibilities they open up: diamond beauty, with more room in your budget for the design you want.</p><a class="button light" href="#/collection/diamonds">Discover lab-grown diamonds ↗</a></div><figure><img src="assets/setting.jpg" alt="A faceted diamond on wine-colored fabric"><figcaption>TJS campaign photograph · Not a side-by-side origin test</figcaption></figure></section>
      <section class="edu-compare-intro"><p class="eyebrow">THE SHORT ANSWER</p><h2>Lab-grown is diamond.<br><em>The difference begins with origin.</em></h2><p>Laboratory-grown diamonds have essentially the same chemical, physical, and optical properties as natural diamonds. They are not diamond look-alikes such as moissanite or cubic zirconia. Specialist testing can distinguish their origin.</p><p class="edu-inline-source">${sourceLink('https://www.gia.edu/gia-news-research/difference-between-natural-laboratory-grown-diamonds','GIA · Diamond origins')}</p></section>
      <section class="edu-priorities" aria-labelledby="priority-heading"><div><p class="eyebrow">MAKE IT PERSONAL</p><h2 id="priority-heading">What matters most to you?</h2><div class="edu-option-row" role="group" aria-label="Your diamond priority"><button data-priority="budget" aria-pressed="true">Room in my budget</button><button data-priority="beauty" aria-pressed="false">The beauty</button><button data-priority="origin" aria-pressed="false">The origin story</button></div></div><div class="edu-priority-answer" aria-live="polite"><h3 id="priority-title">More freedom to choose.</h3><p id="priority-copy">Lab-grown diamonds generally cost less than comparable natural diamonds. You can explore a larger stone, different specifications, or keep more of your budget for the setting. Compare current quotes—there is no fixed saving.</p></div></section>
      <section class="edu-compare-table"><p class="eyebrow">SIDE BY SIDE / WITHOUT THE GUESSWORK</p><h2>A clear comparison.</h2><div class="edu-table-scroll" tabindex="0" role="region" aria-label="Diamond origin comparison table"><table><thead><tr><th scope="col">What to consider</th><th scope="col">Laboratory-grown<span>The studio’s focus</span></th><th scope="col">Natural<span>A geological story</span></th></tr></thead><tbody>${TJS_COMPARISON.map(([label,lab,natural])=>`<tr><th scope="row">${label}</th><td>${lab}</td><td>${natural}</td></tr>`).join('')}</tbody></table></div><p class="edu-inline-source">Price context: ${sourceLink('https://www.igi.org/consumer-education/lab-grown-diamonds/','IGI · Laboratory-grown diamonds')}. Your final quote depends on the individual stone and seller.</p></section>
      <section class="edu-honest"><p class="eyebrow">A LITTLE HONESTY LOOKS GOOD</p><h2>A beautiful choice.<br>Not an automatic green claim.</h2><p>We won’t call a diamond “eco-friendly,” “carbon neutral,” or “conflict-free” simply because it is laboratory-grown. Specific claims need verifiable supplier evidence. Both origins deserve questions about production, energy, labor, and traceability.</p><p>Choose jewelry for what it means to you. TJS does not promise that either origin will retain its purchase price or increase in value.</p><p class="edu-inline-source">${sourceLink('https://www.ftc.gov/business-guidance/blog/2019/05/many-facets-advertising-diamonds-clarity','FTC · Clear diamond and environmental claims')}</p></section>
      <section class="edu-faq"><p class="eyebrow">THE QUESTIONS WORTH ASKING</p><h2>A few things, made clear.</h2>
        <details><summary>Will a lab-grown diamond sparkle?</summary><p>Yes. It has diamond’s optical properties. The individual stone’s cut, proportions, cleanliness, and lighting affect the sparkle you see—not simply whether it is natural or laboratory-grown.</p></details>
        <details><summary>Can I tell the origin just by looking?</summary><p>Appearance is not a reliable origin test. A qualified laboratory can use specialized equipment to identify natural or laboratory-grown origin. Check the individual report.</p></details>
        <details><summary>Does laboratory-grown mean flawless?</summary><p>No. Laboratory-grown diamonds can have inclusions and body color. Look at the individual stone and its laboratory documentation, just as you would for a natural diamond.</p></details>
        <details><summary>How are laboratory-grown diamonds made?</summary><p>HPHT uses high pressure and high temperature. CVD grows diamond from a carbon-containing gas onto a seed. Some stones receive post-growth treatment, so ask what the report discloses.</p>${sourceLink('https://www.gia.edu/hpht-and-cvd-diamond-growth-processes','GIA · Growth methods')}</details>
        <details><summary>Which one should I choose?</summary><p>Our view: lab-grown is a compelling choice when design flexibility and budget matter most. Natural diamonds may appeal when geological origin and natural rarity are central to your story. Neither choice makes your moment more or less meaningful.</p></details>
      </section>
      <section class="edu-next"><div><p class="eyebrow">YOUR STORY, SET IN LIGHT</p><h2>Find the one that feels like you.</h2><p>Explore the local lab-grown catalog, or get comfortable with the 4 Cs first.</p></div><div><a class="button" href="#/collection/diamonds">Explore lab-grown diamonds ↗</a><a class="text-link" href="#/education?topic=Cut">Explore the interactive 4 Cs ↗</a></div></section>
      <p class="edu-limit">This preview currently lists lab-grown diamonds only. Natural and fancy-color collections remain planned, not available stock. Education is not an appraisal, grading service, or guarantee of a particular stone’s appearance.</p>
    </article>`;
  }
  function mount(root) {
    cleanup();
    const abort=new AbortController(),signal=abort.signal;
    const page=root.querySelector('[data-education-page]'), comparison=root.querySelector('[data-comparison-page]');
    let viewer=null,disposed=false,observer=null,facetObserver=null,loading=false;
    cleanup=()=>{disposed=true;abort.abort();observer?.disconnect();facetObserver?.disconnect();viewer?.destroy();viewer=null;};
    const guide=root.querySelector('[data-education-guide]');
    if(guide){
      guide.addEventListener('click',event=>{
        const button=event.target.closest('[data-guide-jump]');if(!button)return;
        const section=guide.querySelector(`#guide-section-${button.dataset.guideJump}`);if(!section)return;
        section.focus({preventScroll:true});
        section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      },{signal});
      return;
    }
    if(comparison) {
      const answers={budget:['More freedom to choose.','Lab-grown diamonds generally cost less than comparable natural diamonds. You can explore a larger stone, different specifications, or keep more of your budget for the setting. Compare current quotes—there is no fixed saving.'],beauty:['Let the individual diamond win you over.','Both origins offer diamond beauty. Compare cut, color, clarity, and real viewing footage. Origin alone cannot tell you which stone will look better to you.'],origin:['A story that feels right to you.','Lab-grown speaks to modern diamond-growing technology; natural speaks to geological history. We champion the possibilities of lab-grown while respecting a personal preference for natural origin.']};
      comparison.addEventListener('click',event=>{const button=event.target.closest('[data-priority]');if(!button)return;const answer=answers[button.dataset.priority];comparison.querySelectorAll('[data-priority]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));comparison.querySelector('#priority-title').textContent=answer[0];comparison.querySelector('#priority-copy').textContent=answer[1];},{signal});
      return;
    }
    if(!page)return;
    const topic=page.dataset.topic,lesson=TJS_LESSONS[topic],host=page.querySelector('#edu-model-host');
    let value=lesson.initial,anatomyPart='none',inclusionType='feather',caratWeight=topic==='Carat'?lesson.options[lesson.initial].value:1;
    const read=selector=>page.querySelector(selector);
    function update() {
      const option=lesson.options[value];
      const weight=topic==='Carat'?caratWeight:1;
      read('#edu-current-value').textContent=topic==='Carat'?`${measure(weight)} ct`:option.label+(option.name?' · '+option.name:'');
      const grams=weight*.2;
      const mass=grams===0?(()=>{const [coefficient,exponent]=weight.toExponential(3).split('e');return `${(Number(coefficient)*2).toPrecision(4)}e${Number(exponent)-1}`;})():measure(grams);
      read('#edu-current-note').textContent=topic==='Carat'?`${mass} g · approximately ${measure(6.5*Math.cbrt(weight),1)} mm in this model. ${option.note}`:option.note;
      page.querySelectorAll('[data-lesson-value]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.lessonValue)===value)));
      read('#edu-carat')?.setAttribute('aria-valuetext',option.label);
      const markers=topic==='Clarity'&&read('#edu-markers').checked?1:0;
      const tint=topic==='Color'?option.value:'#ffffff';
      host.style.setProperty('--gem-tint',tint);
      host.classList.toggle('edges-emphasized',read('#edu-anatomy').checked&&anatomyPart==='none');
      if(topic==='Clarity'){
        const inclusion=TJS_INCLUSIONS[inclusionType];
        read('#edu-inclusion-label').textContent=inclusion.label;
        read('#edu-inclusion-note').textContent=inclusion.note;
        page.querySelectorAll('[data-inclusion-type]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.inclusionType===inclusionType)));
        read('.edu-fallback').setAttribute('aria-label',markers?`Enlarged ${inclusion.label.toLowerCase()} inclusion example in a simplified diamond. ${inclusion.note} Not a clarity grade or exact 10 times magnification.`:'Simplified diamond diagram with the inclusion example hidden.');
      }
      if(topic==='Carat')read('#edu-carat-reference').innerHTML=caratReference(weight);
      if(topic==='Color'){
        read('#edu-selected-swatch').style.setProperty('--sample',tint);
        read('#edu-swatch-label').textContent=option.label;
        read('#edu-swatch-name').textContent=option.name+' illustration';
      }
      const flat=read('#edu-flat-gem');flat.style.transform=`translate(160px,145px) scale(${Math.min(Math.cbrt(weight)*.78,1.12)}) translate(-160px,-145px)`;
      read('#edu-flat-markers').innerHTML=markers?inclusionDiagram(inclusionType):'';
      // Without WebGL, a side-profile diagram still demonstrates cut proportions.
      if(topic==='Cut'){setFlatFocus();read('#edu-flat-pavilion').setAttribute('d',`M60 120H260L160 ${120+100*Math.tan(option.value*Math.PI/180)}Z`);}
      viewer?.set({topic,pavilion:topic==='Cut'?option.value:40.8,tint,scale:Math.cbrt(weight)*(topic==='Carat'?.78:.88),markers,anatomy:!!read('#edu-anatomy')?.checked,inclusionType,caratWeight:weight});
    }
    function setFlatFocus() {
      const center={table:75,crown:96,girdle:117,pavilion:167}[anatomyPart]||145;
      read('#edu-flat-gem').style.transform=anatomyPart==='none'?'none':`translate(160px,145px) scale(1.4) translate(-160px,-${center}px)`;
    }
    function clearCaratError() {
      read('#edu-carat-custom').removeAttribute('aria-invalid');
      read('#edu-carat-error').textContent='';read('#edu-carat-error').hidden=true;
    }
    function commitCarat() {
      const field=read('#edu-carat-custom'),draft=field.value.trim(),weight=Number(draft);
      if(!draft||!Number.isFinite(weight)||weight<=0){
        field.setAttribute('aria-invalid','true');
        read('#edu-carat-error').textContent=`Enter a finite weight greater than zero. The comparison still shows ${measure(caratWeight)} ct.`;
        read('#edu-carat-error').hidden=false;return;
      }
      clearCaratError();caratWeight=weight;
      value=lesson.options.reduce((nearest,option,index)=>Math.abs(option.value-weight)<Math.abs(lesson.options[nearest].value-weight)?index:nearest,0);
      read('#edu-carat').value=String(value);update();
    }
    function selectPart(name) {
      if(topic!=='Cut'||!Object.hasOwn(anatomyParts,name))return;
      anatomyPart=name;
      page.querySelectorAll('[data-anatomy-part]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.anatomyPart===name)));
      read('#edu-part-description').textContent=anatomyParts[name].note;
      page.querySelectorAll('[data-flat-part]').forEach(part=>{
        if(part.dataset.flatPart===name){part.style.strokeWidth='4';part.style.stroke='#5a1b2a';}
        else{part.style.removeProperty('stroke-width');part.style.removeProperty('stroke');}
      });
      host.classList.toggle('edges-emphasized',read('#edu-anatomy').checked&&name==='none');
      setFlatFocus();
      viewer?.focus?.(name);
      if(name!=='none')page.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed','false'));
    }
    function stopFacetNudge() {
      facetObserver?.disconnect();
      read('.edu-facet-tools').classList.remove('is-inviting');
    }
    page.addEventListener('click',event=>{
      const option=event.target.closest('[data-lesson-value]');if(option){value=Number(option.dataset.lessonValue);update();}
      const inclusion=event.target.closest('[data-inclusion-type]');if(inclusion&&Object.hasOwn(TJS_INCLUSIONS,inclusion.dataset.inclusionType)){inclusionType=inclusion.dataset.inclusionType;update();}
      const part=event.target.closest('[data-anatomy-part]');if(part)selectPart(part.dataset.anatomyPart);
      const view=event.target.closest('[data-view]');if(view){selectPart('none');viewer?.view(view.dataset.view);page.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===view)));}
      const spin=event.target.closest('[data-spin]');if(spin)viewer?.motion(spin.getAttribute('aria-pressed')!=='true');
      const diagram=event.target.closest('[data-diagram]');if(diagram){if(viewer)fallbackMode(true);else loadViewer();}
    },{signal});
    page.addEventListener('input',event=>{if(event.target.id==='edu-carat'){value=Number(event.target.value);caratWeight=lesson.options[value].value;read('#edu-carat-custom').value=String(caratWeight);clearCaratError();update();}},{signal});
    page.addEventListener('change',event=>{if(event.target.id==='edu-anatomy'){if(event.target.checked)selectPart('none');stopFacetNudge();read('.edu-facet-tools').classList.add('is-used');}if(['edu-markers','edu-anatomy'].includes(event.target.id))update();if(event.target.id==='edu-carat-custom')commitCarat();},{signal});
    page.addEventListener('keydown',event=>{
      if(event.target.id==='edu-carat-custom'&&event.key==='Enter'){event.preventDefault();commitCarat();}
      if(event.target.tagName==='CANVAS'&&event.key==='Home'){
        selectPart('none');page.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view==='side')));
      }
    },{signal});
    function fallbackMode(manual=false) {
      viewer?.destroy();viewer=null;host.classList.remove('is-3d');read('.edu-view-tools').hidden=true;
      read('[data-diagram]').textContent='Try 3D view';
      read('#edu-render-mode').textContent='Diagram mode';read('#edu-view-help').textContent=manual?'A simplified diagram. Explore the controls to see what changes.':'3D is unavailable in this browser. The interactive diagram and full lesson still work.';
    }
    async function loadViewer() {
      observer?.disconnect();
      if(loading||viewer||disposed)return;
      if(location.protocol==='file:'){fallbackMode();return;}
      loading=true;
      try {
        const module=await import('./diamond-viewer.mjs');if(disposed)return;
        viewer=module.createDiamondViewer(host,spin=>{if(disposed)return;const button=read('[data-spin]');button.setAttribute('aria-pressed',String(spin));button.textContent=spin?'Pause rotation':'Resume rotation';},()=>fallbackMode());
        read('[data-diagram]').textContent='Use diagram view';
        host.classList.add('is-3d');read('.edu-view-tools').hidden=false;
        read('#edu-render-mode').textContent='Interactive 3D';read('#edu-view-help').textContent='Drag to turn. Use arrow keys when the diamond is focused.';update();if(topic==='Cut')selectPart(anatomyPart);
      } catch(error) {if(!disposed){fallbackMode();console.warn('TJS education: diagram fallback enabled.',error.message);}} finally {loading=false;}
    }
    update();
    // A single, small nudge when the control enters view; never a repeating prompt.
    const facetTools=read('.edu-facet-tools');
    facetTools.addEventListener('pointerenter',stopFacetNudge,{signal});
    facetTools.addEventListener('focusin',stopFacetNudge,{signal});
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      if('IntersectionObserver' in window){facetObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){facetTools.classList.add('is-inviting');facetObserver.disconnect();}},{threshold:.6});facetObserver.observe(facetTools);}
      else facetTools.classList.add('is-inviting');
    }
    if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting)loadViewer();},{rootMargin:'120px'});observer.observe(host);}else loadViewer();
  }
  return {render:(params=new URLSearchParams(),subpage='')=>subpage==='compare'?comparisonPage():subpage?guidePage(subpage):homePage(params),mount,unmount:()=>cleanup(),safeTopic};
})();
