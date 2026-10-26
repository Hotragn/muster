// ?theme=light or ?theme=dark pins the colour scheme (used for screenshots); otherwise the OS decides.
const t = new URLSearchParams(location.search).get('theme');
if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
