import { updateSummary } from './cart.js';
import { notify } from './notify.js';
import { clearCart, getCartSummary, getCheckoutData, saveCheckoutData } from './store.js';

const STEP_FIELDS = {
  contacts: ['last-name', 'first-name', 'email', 'phone'],
  delivery: ['city', 'street', 'house'],
  payment: ['payment-method'],
  confirm: ['privacy'],
};

export function initCheckout() {
  const form = document.querySelector('[data-checkout-form]');
  const summaryContainer = document.querySelector('[data-checkout-summary]');
  const steps = document.querySelectorAll('[data-checkout-step]');

  if (!form || !summaryContainer || !steps.length) return;

  hydrateForm(form);
  renderCheckoutSummary(summaryContainer);
  syncSteps(form, steps);

  form.addEventListener('input', () => {
    persistForm(form);
    validateChangedField(form, document.activeElement);
    syncSteps(form, steps);
  });

  form.addEventListener('change', () => {
    persistForm(form);
    syncSteps(form, steps);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!getCartSummary().items.length) {
      notify('Корзина пуста. Добавьте товары перед оформлением.', 'error');
      return;
    }

    const isValid = validateForm(form);
    syncSteps(form, steps);

    if (!isValid) {
      notify('Пожалуйста, заполните обязательные поля', 'error');
      return;
    }

    persistForm(form);
    clearCart();
    renderCheckoutSummary(summaryContainer);
    form.reset();
    notify('Заказ оформлен. Мы уже начали его собирать.', 'success');
    syncSteps(form, steps);
  });

  document.addEventListener('store:updated', () => {
    renderCheckoutSummary(summaryContainer);
  });
}

function hydrateForm(form) {
  const checkoutData = getCheckoutData();

  Object.entries(checkoutData).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (!field) return;

    if (field instanceof RadioNodeList) {
      const target = form.querySelector(`[name="${name}"][value="${value}"]`);
      if (target) target.checked = true;
      return;
    }

    if (field.type === 'checkbox') {
      field.checked = Boolean(value);
      return;
    }

    field.value = String(value);
  });
}

function persistForm(form) {
  const formData = new FormData(form);
  const payload = {};

  Array.from(form.elements).forEach((element) => {
    if (!(element instanceof HTMLElement) || !element.getAttribute('name')) return;

    if (element instanceof HTMLInputElement && element.type === 'checkbox') {
      payload[element.name] = element.checked;
      return;
    }
  });

  formData.forEach((value, key) => {
    payload[key] = value;
  });

  saveCheckoutData(payload);
}

function validateForm(form) {
  const fields = Array.from(form.elements).filter((element) => {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
  });

  let isValid = true;

  fields.forEach((field) => {
    const fieldValid = validateField(form, field);
    if (!fieldValid) isValid = false;
  });

  const paymentField = form.querySelector('[name="payment-method"]:checked');
  if (!paymentField) isValid = false;

  return isValid;
}

function validateChangedField(form, field) {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
  validateField(form, field);
}

function validateField(form, field) {
  if (!field.name) return true;

  const errorElement = form.querySelector(`[data-field-error="${field.name}"]`);

  if (field.type === 'radio') return true;

  let message = '';

  if (field.required && field.type === 'checkbox' && !field.checked) {
    message = 'Нужно подтвердить согласие';
  } else if (field.required && !String(field.value).trim()) {
    message = 'Поле обязательно для заполнения';
  } else if (field.type === 'email' && field.value && !/^\S+@\S+\.\S+$/.test(field.value)) {
    message = 'Введите корректный email';
  } else if (field.type === 'tel' && field.value && field.value.replace(/\D/g, '').length < 11) {
    message = 'Введите телефон полностью';
  }

  if (errorElement) {
    errorElement.textContent = message;
  }

  field.classList.toggle('is-error', Boolean(message));
  field.setAttribute('aria-invalid', String(Boolean(message)));

  return !message;
}

function syncSteps(form, steps) {
  const statuses = {
    contacts: isStepComplete(form, STEP_FIELDS.contacts),
    delivery: isStepComplete(form, STEP_FIELDS.delivery),
    payment: Boolean(form.querySelector('[name="payment-method"]:checked')),
    confirm: Boolean(form.querySelector('[name="privacy"]')?.checked),
  };

  let firstIncompleteReached = false;

  steps.forEach((step) => {
    const stepName = step.dataset.checkoutStep;
    if (!stepName) return;

    const isComplete = statuses[stepName];
    step.classList.toggle('checkout-steps__item--active', !firstIncompleteReached);
    step.classList.toggle('is-complete', isComplete);

    if (!isComplete && !firstIncompleteReached) {
      firstIncompleteReached = true;
    }
  });
}

function isStepComplete(form, fieldNames) {
  return fieldNames.every((fieldName) => {
    const field = form.elements.namedItem(fieldName);

    if (!field) return false;
    if (field instanceof RadioNodeList) return Boolean(field.value);
    if (field instanceof HTMLInputElement && field.type === 'checkbox') return field.checked;

    return String(field.value).trim().length > 0;
  });
}

function renderCheckoutSummary(container) {
  const itemsContainer = container.querySelector('[data-checkout-items]');
  if (!itemsContainer) return;

  const summary = getCartSummary();
  itemsContainer.innerHTML = summary.items
    .map((item) => {
      return `
        <div class="summary-card-item">
          <img class="summary-card-item__image" src="${item.image}" alt="Упаковка ${item.name}" width="480" height="620" loading="lazy">
          <div>
            <p>${item.name}</p>
            <small>${item.quantity} шт.</small>
          </div>
          <strong>${formatCurrency(item.totalPrice)}</strong>
        </div>
      `;
    })
    .join('');

  if (!summary.items.length) {
    itemsContainer.innerHTML = '<p class="cart-summary__note">После оформления новые товары можно выбрать в каталоге.</p>';
  }

  updateSummary(container, summary);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}
