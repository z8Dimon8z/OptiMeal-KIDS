/**
 * Quantity stepper for cart and checkout prototypes.
 */

export function initQuantity() {
  const quantityBlocks = document.querySelectorAll('[data-quantity]');
  if (!quantityBlocks.length) return;

  quantityBlocks.forEach((quantityBlock) => {
    const input = quantityBlock.querySelector('[data-quantity-input]');
    if (!input) return;

    quantityBlock.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-quantity-action]');
      if (!actionButton) return;

      const action = actionButton.dataset.quantityAction;
      updateQuantity(input, action);
    });
  });
}

function updateQuantity(input, action) {
  const currentValue = Number(input.value) || 1;
  const minValue = Number(input.min) || 1;

  if (action === 'increment') {
    input.value = String(currentValue + 1);
    return;
  }

  if (action !== 'decrement') return;
  if (currentValue <= minValue) return;

  input.value = String(currentValue - 1);
}
