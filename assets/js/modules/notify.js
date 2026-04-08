let notifyTimeouts = new WeakMap();

export function initNotify() {
  getOrCreateContainer();
}

export function notify(message, type = 'info') {
  const container = getOrCreateContainer();
  const toast = createToast(message, type);

  container.appendChild(toast);

  const timeoutId = window.setTimeout(() => {
    toast.remove();
    notifyTimeouts.delete(toast);
  }, 4000);

  notifyTimeouts.set(toast, timeoutId);
}

function getOrCreateContainer() {
  let container = document.getElementById('notify-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notify-container';
    container.className = 'notify-stack';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }

  return container;
}

function createToast(message, type) {
  const toast = document.createElement('div');
  const closeButton = document.createElement('button');

  toast.className = `notify notify--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  closeButton.className = 'notify__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Закрыть уведомление');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    const timeoutId = notifyTimeouts.get(toast);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    toast.remove();
  });

  toast.appendChild(closeButton);

  return toast;
}
