import { notify } from './notify.js';
import {
  applyPromoCode,
  clearPromoCode,
  getCartSummary,
  removeFromCart,
  setCartItem,
} from './store.js';

export function initCart() {
  const itemsContainer = document.querySelector('[data-cart-items]');
  const summaryContainer = document.querySelector('[data-cart-summary]');

  if (!itemsContainer || !summaryContainer) return;

  const promoInput = summaryContainer.querySelector('[data-promo-input]');
  const promoButton = summaryContainer.querySelector('[data-apply-promo]');
  const emptyMessage = summaryContainer.querySelector('[data-cart-empty-message]');
  const checkoutButton = summaryContainer.querySelector('.button--primary');

  const renderCart = () => {
    const summary = getCartSummary();
    itemsContainer.innerHTML = summary.items
      .map((item) => {
        return `
          <article class="cart-item" data-cart-item data-product-id="${item.id}">
            <img class="cart-item__image" src="${item.image}" alt="Упаковка ${item.name}" width="480" height="620" loading="lazy">
            <div class="cart-item__content">
              <h2 class="cart-item__title">${item.name}</h2>
              <p class="cart-item__meta">Вкус: ${item.flavor}</p>
              <div class="cart-item__controls">
                <div class="quantity" data-quantity>
                  <button class="quantity__button" type="button" data-quantity-action="decrement" aria-label="Уменьшить количество">−</button>
                  <input class="quantity__input" type="number" name="${item.id}-qty" min="1" value="${item.quantity}" data-quantity-input>
                  <button class="quantity__button" type="button" data-quantity-action="increment" aria-label="Увеличить количество">+</button>
                </div>
                <p class="cart-item__price" data-cart-item-price>${formatCurrency(item.totalPrice)}</p>
                <button class="button button--link button--medium" type="button" data-remove-cart-item>Удалить</button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    if (!summary.items.length) {
      itemsContainer.innerHTML = '<p class="cart-summary__note">Товары появятся здесь после добавления из каталога.</p>';
    }

    updateSummary(summaryContainer, summary);

    if (promoInput) {
      promoInput.value = summary.promoCode;
    }

    if (emptyMessage) {
      emptyMessage.hidden = summary.items.length > 0;
    }

    if (checkoutButton) {
      checkoutButton.setAttribute('aria-disabled', String(summary.items.length === 0));
      checkoutButton.classList.toggle('is-disabled', summary.items.length === 0);
    }
  };

  itemsContainer.addEventListener('quantity:change', (event) => {
    const cartItem = event.target.closest('[data-cart-item]');
    if (!cartItem) return;

    const productId = cartItem.dataset.productId;
    const quantity = event.detail?.value || 1;

    if (!productId) return;

    setCartItem(productId, quantity);
  });

  itemsContainer.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-cart-item]');
    if (!removeButton) return;

    const cartItem = removeButton.closest('[data-cart-item]');
    const productId = cartItem?.dataset.productId;

    if (!productId) return;

    removeFromCart(productId);
    notify('Товар удалён из корзины', 'info');
  });

  promoButton?.addEventListener('click', () => {
    const code = promoInput?.value || '';

    if (!code.trim()) {
      clearPromoCode();
      notify('Промокод очищен', 'info');
      return;
    }

    const isApplied = applyPromoCode(code);
    if (!isApplied) {
      notify('Такой промокод не найден', 'error');
      return;
    }

    notify('Промокод применён', 'success');
  });

  document.addEventListener('store:updated', renderCart);
  renderCart();
}

export function updateSummary(container, summary) {
  const subtotalElement = container.querySelector('[data-summary-subtotal]');
  const discountElement = container.querySelector('[data-summary-discount]');
  const deliveryElement = container.querySelector('[data-summary-delivery]');
  const totalElement = container.querySelector('[data-summary-total]');

  if (subtotalElement) subtotalElement.textContent = formatCurrency(summary.subtotal);
  if (discountElement) {
    discountElement.textContent = summary.discount > 0
      ? `-${formatCurrency(summary.discount)}`
      : '0 ₽';
  }
  if (deliveryElement) {
    deliveryElement.textContent = summary.deliveryPrice > 0
      ? formatCurrency(summary.deliveryPrice)
      : 'Бесплатно';
  }
  if (totalElement) totalElement.textContent = formatCurrency(summary.total);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}
