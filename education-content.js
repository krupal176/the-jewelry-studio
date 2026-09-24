'use strict';

// Editorial content only. Keep source links and illustration limits with the lessons.
const TJS_LESSONS = {
  Cut: {
    number: '01', title: 'Let the light do the talking.', short: 'The art of light',
    intro: 'Shape is the outline. Cut is the arrangement, proportions, and finish of the facets that work with light.',
    label: 'Explore the proportions', initial: 1,
    options: [
      {label:'Shallower', value:36, note:'A shallower pavilion changes the stone’s profile and the paths light can take. This model shows geometry—not a predicted cut grade.'},
      {label:'Reference', value:40.8, note:'Our reference model balances a crown above the girdle with a pavilion below it. One angle alone never establishes cut quality.'},
      {label:'Deeper', value:45, note:'A deeper pavilion holds more of the stone below its outline. Appearance depends on the whole proportion set, not just depth.'}
    ],
    takeaway:'Look beyond a grade: view the actual stone in motion and in more than one lighting environment.',
    facts:[['Brightness','White light returning from the stone.'],['Fire','Flashes of spectral color.'],['Scintillation','Changing light and dark patterns as the stone, light, or viewer moves.']],
    source:'https://4cs.gia.edu/en-us/diamond-cut/', sourceName:'GIA · Understanding cut',
    caveat:'Simplified lighting simulation—not a cut assessment. No preset is an Excellent or Ideal grade.'
  },
  Color: {
    number:'02', title:'Discover your kind of warmth.', short:'The nuances of tone',
    intro:'The normal D–Z scale describes body color, from colorless to light color. Graders use controlled lighting and reference stones—not a phone screen.',
    label:'Explore the color bands', initial:0,
    options:[
      {label:'D–F', name:'Colorless', value:'#ffffff', note:'The colorless band. Your screen illustration is not a masterstone or a reliable way to distinguish neighboring grades.'},
      {label:'G–J', name:'Near colorless', value:'#fffbed', note:'Subtle warmth can be more or less noticeable depending on size, shape, lighting, setting, and the observer.'},
      {label:'K–M', name:'Faint', value:'#f7ebbf', note:'A warmer range. Compare the actual stone with the metal and setting you prefer.'},
      {label:'N–R', name:'Very light', value:'#eed797', note:'Body color becomes more prominent across this band. Personal taste still matters.'},
      {label:'S–Z', name:'Light', value:'#e4c577', note:'This is still the normal color range. Fancy-color grading is a separate system; it does not simply start at N.'}
    ],
    takeaway:'Choose a tone you love in real viewing conditions. A higher letter grade is not a substitute for your own preference.',
    facts:[['Color is contextual','Metal and lighting can change perceived appearance.'],['Fancy color is different','Hue, tone, and saturation are assessed separately.'],['Reports matter','Read the issuing laboratory’s terminology and report date.']],
    source:'https://4cs.gia.edu/en-us/diamond-color/', sourceName:'GIA · Understanding color',
    caveat:'Tints are deliberately illustrative, not calibrated grade colors. The model shows bands, not individual stones.'
  },
  Clarity: {
    number:'03', title:'There is beauty in the details.', short:'A closer look',
    intro:'Clarity describes inclusions and surface blemishes. Grading considers their size, number, position, nature, and relief at 10× magnification.',
    label:'Understand clarity categories', initial:3,
    options:[
      {label:'FL', name:'Flawless', value:'FL', note:'No inclusions or blemishes visible to a skilled grader at 10×.'},
      {label:'IF', name:'Internally flawless', value:'IF', note:'No inclusions visible at 10×; surface blemishes may be present.'},
      {label:'VVS', name:'Very, very slightly included', value:'VVS', note:'VVS1 and VVS2: minute inclusions that are difficult for a skilled grader to see at 10×.'},
      {label:'VS', name:'Very slightly included', value:'VS', note:'VS1 and VS2: minor inclusions seen with effort at 10×. “Eye-clean” is not guaranteed by a grade.'},
      {label:'SI', name:'Slightly included', value:'SI', note:'SI1 and SI2: noticeable inclusions at 10×. Examine the individual stone at ordinary viewing distance too.'},
      {label:'I', name:'Included', value:'I', note:'I1, I2, and I3: obvious inclusions at 10× that may affect transparency, brilliance, or durability.'}
    ],
    takeaway:'Ask to see the actual stone. A category cannot tell you everything about an inclusion’s visibility or its effect.',
    facts:[['Inside','An inclusion is an internal or surface-reaching characteristic.'],['Outside','A blemish is a surface characteristic.'],['Our model','Examples are enlarged illustrations, not a clarity plot or exact 10× view.']],
    source:'https://4cs.gia.edu/en-us/diamond-clarity/', sourceName:'GIA · Understanding clarity',
    caveat:'Enlarged teaching examples, not an exact 10× view. A selected type does not represent a clarity grade or occur in every laboratory-grown diamond.'
  },
  Carat: {
    number:'04', title:'Presence, beyond the number.', short:'Weight, not just size',
    intro:'One carat is 0.2 grams. Carat measures weight—not diameter. Shape and proportions influence how large a diamond looks from above.',
    label:'Explore carat weight', initial:2,
    options:[0.5,0.75,1,1.25,1.5,2,2.5,3].map(value=>({label:value.toFixed(2)+' ct',value,note:'The model scales a single set of proportions. Actual measurements vary: compare the length, width, and depth on each report.'})),
    takeaway:'Balance the look you love with comfort, setting, and budget. More weight does not automatically mean more beauty.',
    facts:[['1.00 ct','Exactly 0.20 grams.'],['Equal weight ≠ equal size','Two shapes can have different face-up dimensions.'],['Relative, not life-size','A screen cannot show millimeters accurately without calibration.']],
    source:'https://4cs.gia.edu/en-us/diamond-carat-weight/', sourceName:'GIA · Understanding carat',
    caveat:'Estimated diameter = 6.5 mm × cube root of carat weight, using one set of round proportions. Relative comparison, not life-size or a product measurement.'
  }
};

// Morphology examples remain independent of the clarity grade reference.
const TJS_INCLUSIONS = {
  cloud:{label:'Cloud',note:'A close grouping of tiny pinpoints that can look hazy together.'},
  feather:{label:'Feather',note:'A break within a diamond, often with a white, feather-like appearance.'},
  cavity:{label:'Cavity',note:'An angular surface opening, which can form when part of a feather breaks away or a surface-reaching crystal comes out.'},
  crystal:{label:'Crystal',note:'A mineral crystal enclosed within the diamond.'},
  needle:{label:'Needle',note:'A thin, elongated crystal that has a needle-like shape.'},
  pinpoint:{label:'Pinpoint',note:'A very small crystal that appears as a tiny dot under magnification.'}
};

const TJS_COMPARISON = [
  ['Origin','Grown in controlled conditions using HPHT or CVD.','Formed naturally within the Earth.'],
  ['Material','Diamond—not cubic zirconia or moissanite.','Diamond, with a natural geological origin.'],
  ['Appearance','Essentially the same optical properties. Judge each stone’s cut and appearance.','Essentially the same optical properties. Origin alone does not make a stone sparkle more.'],
  ['Budget','Generally lower priced than comparable natural diamonds; more flexibility within your budget.','Generally higher priced for comparable specifications; natural origin and rarity are part of the appeal.'],
  ['Identification','Specialized testing can identify laboratory-grown origin.','Specialized testing can confirm natural origin.'],
  ['Care','Hard, but not unbreakable. Protect the stone and setting from impact.','Hard, but not unbreakable. The same practical care matters.'],
  ['Environmental claims','Energy source, manufacturing, and traceability need specific evidence. “Lab-grown” alone proves no green claim.','Mining practices and supply chains need specific evidence. Origin alone proves no green claim.']
];
