import { getCartCount } from './store.js';

export function initHeaderState() {
  const counters = document.querySelectorAll('[data-cart-count]');
  if (!counters.length) return;

  const renderCounters = () => {
    const count = getCartCount();
    counters.forEach((counter) => {
      counter.textContent = String(count);
      counter.hidden = count === 0;
    });
  };

  renderCounters();
  document.addEventListener('store:updated', renderCounters);
}
