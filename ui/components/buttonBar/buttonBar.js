function toggleControls() {
    const controls = document.getElementById('controls');
    const isCollapsed = controls.classList.toggle('collapsed');

    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');

    if (isCollapsed) {
        iconOpen.style.display = "block";
        iconClose.style.display = "none";
    } else {
        iconOpen.style.display = "none";
        iconClose.style.display = "block";
    }
}