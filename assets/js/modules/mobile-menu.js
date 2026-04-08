export function initMobileMenu() {
  const menus = document.querySelectorAll('[data-mobile-menu]');
  if (!menus.length) return;

  menus.forEach((menu) => {
    const toggleButton = menu.querySelector('[data-menu-toggle]');
    const nav = menu.querySelector('[data-menu-nav]');

    if (!toggleButton || !nav) return;

    const closeMenu = () => {
      menu.classList.remove('is-menu-open');
      toggleButton.setAttribute('aria-expanded', 'false');
    };

    toggleButton.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-menu-open');
      toggleButton.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  });
}
