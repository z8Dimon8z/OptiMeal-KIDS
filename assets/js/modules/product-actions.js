import { notify } from './notify.js';
import { addToCart, getWishlist, toggleWishlist } from './store.js';

export function initProductActions() {
  const productCards = document.querySelectorAll('[data-product-card]');
  if (!productCards.length) return;

  syncWishlistState();

  document.addEventListener('click', (event) => {
    const addToCartButton = event.target.closest('[data-add-to-cart]');
    if (addToCartButton) {
      const productCard = addToCartButton.closest('[data-product-card]');
      if (!productCard) return;

      const productId = productCard.dataset.productId;
      if (!productId) return;

      addToCart(productId);
      notify('Товар добавлен в корзину', 'success');
      return;
    }

    const wishlistButton = event.target.closest('[data-wishlist-toggle]');
    if (!wishlistButton) return;

    const productCard = wishlistButton.closest('[data-product-card]');
    if (!productCard) return;

    const productId = productCard.dataset.productId;
    if (!productId) return;

    const isActive = toggleWishlist(productId);
    syncWishlistState();
    notify(
      isActive ? 'Товар добавлен в избранное' : 'Товар удалён из избранного',
      'info',
    );
  });

  document.addEventListener('store:updated', syncWishlistState);
}

function syncWishlistState() {
  const wishlist = getWishlist();
  const productCards = document.querySelectorAll('[data-product-card]');

  productCards.forEach((card) => {
    const wishlistButton = card.querySelector('[data-wishlist-toggle]');
    const productId = card.dataset.productId;

    if (!wishlistButton || !productId) return;

    const isActive = wishlist.includes(productId);
    wishlistButton.setAttribute('aria-pressed', String(isActive));
    wishlistButton.classList.toggle('is-active', isActive);
    wishlistButton.textContent = isActive ? '♥' : '♡';
  });
}
