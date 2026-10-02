// Native details and anchors still work without this small keyboard enhancement.
const jump = document.querySelector('#small-jump');
const summary = jump.querySelector('summary');
jump.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    jump.open = false;
    // Closing before the anchor's default action gives it the final page geometry.
    const target = document.querySelector(link.hash);
    if (target) {
        target.tabIndex = -1;
        target.focus({preventScroll: true});
    }
});
jump.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !jump.open) return;
    jump.open = false;
    summary.focus({preventScroll: true});
});
