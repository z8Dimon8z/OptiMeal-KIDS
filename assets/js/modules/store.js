const STORAGE_KEY = 'optimeal-kids-store';
const DEFAULT_PROMO_CODE = 'KIDS10';
const PROMO_DISCOUNT_RATE = 0.1;
const FREE_DELIVERY_THRESHOLD = 3000;
const DELIVERY_PRICE = 250;

const PRODUCTS = {
  'berry-mix': {
    id: 'berry-mix',
    name: 'Berry Mix Gummies',
    price: 1290,
    oldPrice: 1590,
    image: './assets/img/product-berry.svg',
    flavor: 'ягодный микс',
    category: 'gummies',
    stock: true,
  },
  'sunny-banana': {
    id: 'sunny-banana',
    name: 'Sunny Banana Chews',
    price: 1490,
    oldPrice: 1690,
    image: './assets/img/product-banana.svg',
    flavor: 'банан',
    category: 'multivitamins',
    stock: true,
  },
  'apple-daily': {
    id: 'apple-daily',
    name: 'Apple Daily Vitamins',
    price: 1190,
    image: './assets/img/product-apple.svg',
    flavor: 'яблоко',
    category: 'probiotics',
    stock: true,
  },
  'immunity-strawberry': {
    id: 'immunity-strawberry',
    name: 'Immunity Strawberry',
    price: 1350,
    image: './assets/img/product-berry.svg',
    flavor: 'клубника',
    category: 'gummies',
    stock: false,
  },
};

const DEFAULT_STATE = {
  cart: {
    'berry-mix': 1,
    'sunny-banana': 2,
  },
  wishlist: [],
  promoCode: DEFAULT_PROMO_CODE,
  checkout: {},
};

export function getProductById(productId) {
  return PRODUCTS[productId] || null;
}

export function getStore() {
  const rawStore = localStorage.getItem(STORAGE_KEY);

  if (!rawStore) {
    saveStore(DEFAULT_STATE);
    return structuredClone(DEFAULT_STATE);
  }

  try {
    const parsedStore = JSON.parse(rawStore);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsedStore,
      cart: {
        ...DEFAULT_STATE.cart,
        ...(parsedStore.cart || {}),
      },
      wishlist: Array.isArray(parsedStore.wishlist) ? parsedStore.wishlist : [],
      checkout: parsedStore.checkout || {},
    };
  } catch (error) {
    console.error('Failed to parse store:', error);
    saveStore(DEFAULT_STATE);
    return structuredClone(DEFAULT_STATE);
  }
}

export function setCartItem(productId, quantity) {
  const store = getStore();

  if (quantity <= 0) {
    delete store.cart[productId];
  } else {
    store.cart[productId] = quantity;
  }

  saveStore(store);
  dispatchStoreUpdate();
}

export function addToCart(productId, quantity = 1) {
  const store = getStore();
  const currentQuantity = store.cart[productId] || 0;

  store.cart[productId] = currentQuantity + quantity;
  saveStore(store);
  dispatchStoreUpdate();
}

export function removeFromCart(productId) {
  const store = getStore();

  delete store.cart[productId];
  saveStore(store);
  dispatchStoreUpdate();
}

export function toggleWishlist(productId) {
  const store = getStore();
  const hasProduct = store.wishlist.includes(productId);

  store.wishlist = hasProduct
    ? store.wishlist.filter((id) => id !== productId)
    : [...store.wishlist, productId];

  saveStore(store);
  dispatchStoreUpdate();

  return !hasProduct;
}

export function applyPromoCode(code) {
  const store = getStore();
  const normalizedCode = String(code || '').trim().toUpperCase();

  if (normalizedCode !== DEFAULT_PROMO_CODE) {
    return false;
  }

  store.promoCode = normalizedCode;
  saveStore(store);
  dispatchStoreUpdate();

  return true;
}

export function clearPromoCode() {
  const store = getStore();
  store.promoCode = '';
  saveStore(store);
  dispatchStoreUpdate();
}

export function saveCheckoutData(checkoutData) {
  const store = getStore();
  store.checkout = {
    ...store.checkout,
    ...checkoutData,
  };
  saveStore(store);
}

export function clearCart() {
  const store = getStore();
  store.cart = {};
  saveStore(store);
  dispatchStoreUpdate();
}

export function getCartItems() {
  const store = getStore();

  return Object.entries(store.cart)
    .map(([productId, quantity]) => {
      const product = getProductById(productId);
      if (!product) return null;

      return {
        ...product,
        quantity,
        totalPrice: product.price * quantity,
      };
    })
    .filter(Boolean);
}

export function getWishlist() {
  return getStore().wishlist;
}

export function getCheckoutData() {
  return getStore().checkout || {};
}

export function getCartCount() {
  return getCartItems().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSummary() {
  const store = getStore();
  const items = getCartItems();
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const promoDiscount = store.promoCode === DEFAULT_PROMO_CODE
    ? Math.round(subtotal * PROMO_DISCOUNT_RATE)
    : 0;
  const deliveryPrice = subtotal === 0
    ? 0
    : subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_PRICE;
  const total = subtotal - promoDiscount + deliveryPrice;

  return {
    items,
    subtotal,
    discount: promoDiscount,
    deliveryPrice,
    total,
    promoCode: store.promoCode || '',
    hasFreeDelivery: deliveryPrice === 0,
  };
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function dispatchStoreUpdate() {
  document.dispatchEvent(new CustomEvent('store:updated'));
}
