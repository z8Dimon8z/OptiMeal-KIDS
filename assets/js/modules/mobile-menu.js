export function initMobileMenu() {
  const headers = document.querySelectorAll('.site-header__inner');

  headers.forEach((header) => {
    const toggleButton = header.querySelector('.site-menu-toggle');
    const nav = header.querySelector('.site-nav');

    if (!toggleButton || !nav) {
      return;
    }

    const closeMenu = () => {
      header.classList.remove('is-menu-open');
      toggleButton.setAttribute('aria-expanded', 'false');
    };

    toggleButton.addEventListener('click', () => {
      const isOpen = header.classList.toggle('is-menu-open');
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
