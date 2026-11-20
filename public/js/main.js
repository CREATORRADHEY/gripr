// GRIPR — Main JS (shared across landing page)

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJiG9VIuSmvUnNwEyKKeBJ2nA5LHvA0wdZDp-GiucRndrMyV-O8RfuqQ3eH9jwWy-0rg/exec';

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Nav scroll state
window.addEventListener('scroll', () => {
  document.querySelector('.nav-wrapper')?.classList.toggle('scrolled', window.scrollY > 20);
});

// Waitlist form setup
function setupForm(formId, btnId) {
  const form = document.getElementById(formId);
  const btn = document.getElementById(btnId);
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    btn.disabled = true;
    btn.innerText = 'Joining...';

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `type=waitlist&email=${encodeURIComponent(email)}`
    })
    .then(() => {
      localStorage.setItem('gripr_user_email', email);
      window.location.href = 'thankyou.html?from=waitlist';
    })
    .catch(() => {
      window.location.href = 'thankyou.html?from=waitlist';
    });
  });
}

setupForm('heroForm', 'heroBtn');
setupForm('ctaForm', 'ctaBtn');
