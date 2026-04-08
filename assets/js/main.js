import { initQuantity } from './modules/quantity.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initNotify } from './modules/notify.js';
import { initHeaderState } from './modules/header-state.js';
import { initProductActions } from './modules/product-actions.js';
import { initCatalog } from './modules/catalog.js';
import { initCart } from './modules/cart.js';
import { initCheckout } from './modules/checkout.js';

document.addEventListener('DOMContentLoaded', () => {
  initNotify();
  initHeaderState();
  initQuantity();
  initMobileMenu();
  initProductActions();
  initCatalog();
  initCart();
  initCheckout();
});
