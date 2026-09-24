'use strict';
let selectedGroup = 'All';
let selectedTreatment = 'signatureFile';
const escapeShapeText = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderShapeLibrary() {
  const query = document.querySelector('#shape-search').value.trim().toLocaleLowerCase();
  const shapes = GURU_SHAPES.shapes.filter(shape =>
    (selectedGroup === 'All' || shape.group === selectedGroup) &&
    shape.supplierName.toLocaleLowerCase().includes(query));
  document.querySelector('#shape-count').textContent = `${shapes.length} of ${GURU_SHAPES.count} supplier options · No live inventory connected`;
  document.querySelector('#shape-grid').innerHTML = shapes.length ? shapes.map(shape => `<article class="shape">
    ${shape[selectedTreatment] && !shape.genericArtwork ? `<img src="${escapeShapeText(shape[selectedTreatment])}?v=${escapeShapeText(GURU_SHAPES.styleVersion || '1')}" alt="${escapeShapeText(shape.supplierName)} diamond outline" width="58" height="64">` : '<span class="missing" aria-hidden="true">—</span>'}
    <h2>${escapeShapeText(shape.supplierName)}</h2><p>${shape.genericArtwork || !shape.iconFile ? 'Artwork to confirm' : escapeShapeText(shape.group)}</p>
  </article>`).join('') : '<p class="empty">No matching shape. Try another name or group.</p>';
}
document.querySelector('#shape-search').addEventListener('input', renderShapeLibrary);
document.querySelectorAll('[data-treatment]').forEach(button => button.addEventListener('click', () => {
  selectedTreatment = button.dataset.treatment;
  document.querySelectorAll('[data-treatment]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  renderShapeLibrary();
}));
document.querySelectorAll('[data-group]').forEach(button => button.addEventListener('click', () => {
  selectedGroup = button.dataset.group;
  document.querySelectorAll('[data-group]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  renderShapeLibrary();
}));
renderShapeLibrary();
