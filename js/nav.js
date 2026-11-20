/**
 * GRIPR.STUDIO — Universal Navigation Controller (B2B Refactor)
 * 
 * Rebuilds navigation around:
 * - Product (index.html#product)
 * - How It Works (index.html#how-it-works)
 * - Example Research Brief (brief.html)
 * - Research Missions (missions.html)
 * - Start a Mission (CTA -> missions.html)
 * 
 * Manages responsive mobile drawers, focus outline visibility, active links,
 * and global toasts.
 */

(function () {
  // Global Toast Notification Utility
  window.GriprUI = {
    showToast(message, type = 'info', duration = 3800) {
      let toastContainer = document.getElementById('griprToastContainer');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'griprToastContainer';
        toastContainer.className = 'gripr-toast-container';
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      toast.className = `gripr-toast toast-${type}`;
      toast.setAttribute('role', 'alert');

      const icon = type === 'success' ? '✓' : (type === 'error' ? '⚠️' : 'ℹ️');
      toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${message}</span>
        <button class="toast-close" aria-label="Dismiss">&times;</button>
      `;

      toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 250);
      });

      toastContainer.appendChild(toast);

      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.add('toast-fade-out');
          setTimeout(() => toast.remove(), 250);
        }
      }, duration);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Drawer Setup
    const nav = document.querySelector('nav');
    if (nav) {
      let toggleBtn = nav.querySelector('.nav-mobile-toggle');
      const navLinks = nav.querySelector('.nav-links');

      if (!toggleBtn && navLinks) {
        toggleBtn = document.createElement('button');
        toggleBtn.className = 'nav-mobile-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = `
          <span class="burger-bar"></span>
          <span class="burger-bar"></span>
          <span class="burger-bar"></span>
        `;
        nav.insertBefore(toggleBtn, nav.children[1] || navLinks);
      }

      if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', () => {
          const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
          toggleBtn.setAttribute('aria-expanded', !isExpanded);
          navLinks.classList.toggle('nav-links-open', !isExpanded);
          document.body.classList.toggle('nav-menu-open', !isExpanded);
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && navLinks.classList.contains('nav-links-open')) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('nav-links-open');
            document.body.classList.remove('nav-menu-open');
            toggleBtn.focus();
          }
        });

        // Close on link click inside drawer
        navLinks.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            toggleBtn.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('nav-links-open');
            document.body.classList.remove('nav-menu-open');
          });
        });
      }
    }

    // 2. Active Link Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const linkPath = href.split('?')[0].split('#')[0];
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
          link.classList.add('active-nav-link');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active-nav-link');
          link.removeAttribute('aria-current');
        }
      }
    });

    // 3. Nav Scroll State
    window.addEventListener('scroll', () => {
      const navWrapper = document.querySelector('.nav-wrapper');
      if (navWrapper) {
        navWrapper.classList.toggle('scrolled', window.scrollY > 15);
      }
    }, { passive: true });
  });
})();
