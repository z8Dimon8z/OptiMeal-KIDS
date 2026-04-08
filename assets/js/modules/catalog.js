export function initCatalog() {
  const grid = document.querySelector('[data-catalog-grid]');
  const sortSelect = document.querySelector('[data-catalog-sort]');
  const filtersForm = document.querySelector('[data-catalog-filters]');
  const countElement = document.querySelector('[data-catalog-count]');

  if (!grid || !sortSelect || !filtersForm || !countElement) return;

  const cards = Array.from(grid.querySelectorAll('[data-product-card]'));
  if (!cards.length) return;

  const renderCatalog = () => {
    const filters = getFilters(filtersForm);
    const sortedCards = sortCards(cards, sortSelect.value);
    let visibleCount = 0;

    sortedCards.forEach((card) => {
      const isVisible = matchesFilters(card, filters);
      card.hidden = !isVisible;

      if (isVisible) {
        grid.appendChild(card);
        visibleCount += 1;
      }
    });

    countElement.textContent = formatProductCount(visibleCount);
  };

  filtersForm.addEventListener('change', renderCatalog);
  filtersForm.addEventListener('click', (event) => {
    const flavorChip = event.target.closest('[data-flavor-chip]');
    if (!flavorChip) return;

    flavorChip.setAttribute(
      'aria-pressed',
      String(flavorChip.getAttribute('aria-pressed') !== 'true'),
    );
    renderCatalog();
  });

  sortSelect.addEventListener('change', renderCatalog);
  renderCatalog();
}

function getFilters(form) {
  const activeCategories = Array.from(form.querySelectorAll('[data-filter-category]:checked'))
    .map((input) => input.dataset.filterCategory);
  const activeFlavors = Array.from(form.querySelectorAll('[data-flavor-chip][aria-pressed="true"]'))
    .map((button) => button.dataset.filterFlavor);
  const inStockOnly = form.querySelector('[data-filter-stock]')?.checked ?? false;

  return {
    activeCategories,
    activeFlavors,
    inStockOnly,
  };
}

function matchesFilters(card, filters) {
  const { productCategory, productFlavor, productStock } = card.dataset;

  const categoryMatch = filters.activeCategories.length === 0
    ? true
    : filters.activeCategories.includes(productCategory);
  const flavorMatch = filters.activeFlavors.length === 0
    ? true
    : filters.activeFlavors.includes(productFlavor);
  const stockMatch = !filters.inStockOnly || productStock === 'true';

  return categoryMatch && flavorMatch && stockMatch;
}

function sortCards(cards, sortValue) {
  return [...cards].sort((cardA, cardB) => {
    const priceA = Number(cardA.dataset.productPrice) || 0;
    const priceB = Number(cardB.dataset.productPrice) || 0;
    const ratingA = Number(cardA.dataset.productRating) || 0;
    const ratingB = Number(cardB.dataset.productRating) || 0;
    const reviewsA = Number(cardA.dataset.productReviews) || 0;
    const reviewsB = Number(cardB.dataset.productReviews) || 0;
    const badgeA = cardA.dataset.productBadge;
    const badgeB = cardB.dataset.productBadge;

    if (sortValue === 'price-asc') return priceA - priceB;
    if (sortValue === 'price-desc') return priceB - priceA;
    if (sortValue === 'rating') return ratingB - ratingA;
    if (sortValue === 'new') return Number(badgeB === 'new') - Number(badgeA === 'new');

    return reviewsB - reviewsA;
  });
}

function formatProductCount(count) {
  if (count === 1) return '1 товар';
  if (count >= 2 && count <= 4) return `${count} товара`;
  return `${count} товаров`;
}
