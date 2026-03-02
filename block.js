// ==============================================
// Disable Right-Click Context Menu
// ==============================================
window.addEventListener('contextmenu', function(e) {
    e.preventDefault(); // Prevent right-click menu
    alert('Right-click is disabled on this site.');
});

// ==============================================
// Disable Certain Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J)
// ==============================================
window.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12') {
        e.preventDefault();
        alert('Inspect is disabled!');
    }

    // Ctrl+Shift+I or Cmd+Option+I (Mac) - DevTools
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        alert('Inspect is disabled!');
    }

    // Ctrl+Shift+C - Inspect Element
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        alert('Inspect is disabled!');
    }

    // Ctrl+Shift+J - Console
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        alert('Inspect is disabled!');
    }

    // Ctrl+U - View Page Source
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        alert('Viewing source is disabled!');
    }
});

// ==============================================
// Disable Right-Click, Inspect, Text Selection & Copy
// ==============================================
(function() {
    // Disable right-click
    window.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Disable certain keyboard shortcuts
    window.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12') e.preventDefault();

        // Ctrl+Shift+I / Cmd+Option+I - DevTools
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','c','j'].includes(e.key.toLowerCase())) e.preventDefault();

        // Ctrl+U - View Source
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') e.preventDefault();

        // Ctrl+C / Ctrl+X - Copy / Cut
        if ((e.ctrlKey || e.metaKey) && ['c','x'].includes(e.key.toLowerCase())) e.preventDefault();
    });

    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
    });

    // Disable dragging text/images
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    // Optional: Disable double-click selection
    document.addEventListener('mousedown', function(e) {
        if (e.detail > 1) e.preventDefault();
    });
})();