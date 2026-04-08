/**
 * Quantity stepper for cart and checkout prototypes.
 */

export function initQuantity() {
  document.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-quantity-action]');
    if (!actionButton) return;

    const quantityBlock = actionButton.closest('[data-quantity]');
    const input = quantityBlock?.querySelector('[data-quantity-input]');

    if (!input) return;

    const action = actionButton.dataset.quantityAction;
    updateQuantity(input, action);
  });

  document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-quantity-input]');
    if (!input) return;

    syncInputValue(input);
    dispatchQuantityChange(input);
  });
}

function updateQuantity(input, action) {
  const currentValue = Number(input.value) || 1;
  const minValue = Number(input.min) || 1;

  if (action === 'increment') {
    input.value = String(currentValue + 1);
    dispatchQuantityChange(input);
    return;
  }

  if (action !== 'decrement') return;
  if (currentValue <= minValue) return;

  input.value = String(currentValue - 1);
  dispatchQuantityChange(input);
}

function syncInputValue(input) {
  const minValue = Number(input.min) || 1;
  const nextValue = Number(input.value) || minValue;
  input.value = String(Math.max(minValue, nextValue));
}

function dispatchQuantityChange(input) {
  input.dispatchEvent(new CustomEvent('quantity:change', {
    bubbles: true,
    detail: {
      value: Number(input.value) || 1,
    },
  }));
}
