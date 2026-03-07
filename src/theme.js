// Apply per-card theme from greeting data
export function applyCardTheme() {
    const data = window.__greetingData;
    const theme = data?.greeting_cards?.theme;
    if (theme && theme !== 'default') {
        document.documentElement.setAttribute('data-theme', theme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}
