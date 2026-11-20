// GRIPR Submit — Problem submission form handler

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJiG9VIuSmvUnNwEyKKeBJ2nA5LHvA0wdZDp-GiucRndrMyV-O8RfuqQ3eH9jwWy-0rg/exec';

const prompts = [
  "What repeatedly frustrates you?",
  "What feels broken but nobody fixes?",
  "What workflow makes you quietly furious?",
  "What did you wish existed today?",
  "What problem have you just accepted as normal?"
];

let currentPrompt = 0;
let rotating = false;

function rotatePrompt() {
  if (rotating) return;
  rotating = true;
  const el = document.getElementById('promptText');
  el.style.opacity = '0';
  el.style.transform = 'translateY(-8px)';
  setTimeout(() => {
    currentPrompt = (currentPrompt + 1) % prompts.length;
    el.textContent = prompts[currentPrompt];
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    rotating = false;
  }, 300);
}

function handleCharCount() {
  const textarea = document.getElementById('frustration');
  const counter = document.getElementById('charCount');
  const len = textarea.value.length;
  counter.textContent = len;

  if (len > 20) {
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('submitBtn').classList.add('ready');
  } else {
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').classList.remove('ready');
  }
}

function toggleEmail() {
  const notify = document.getElementById('notifyCheck');
  const emailRow = document.getElementById('emailRow');
  emailRow.style.display = notify.checked ? 'block' : 'none';
}

function handleSubmit(e) {
  e.preventDefault();

  const frustration = document.getElementById('frustration').value.trim();
  if (frustration.length < 20) return;

  const category = document.getElementById('category').value || 'None';
  const city = document.getElementById('city').value.trim() || 'None';
  const notifyEmail = document.getElementById('notifyEmail').value.trim();
  const notify = document.getElementById('notifyCheck').checked;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  // Format all the data into a single string for Column C
  const combinedData = `[PROBLEM SUBMISSION]
Frustration: ${frustration}
Category: ${category}
City: ${city}
Notify if built: ${notify ? 'Yes' : 'No'}`;

  // Send email to Column B, and combinedData to Column C (using 'choice' which was the old parameter)
  const body = [
    `email=${encodeURIComponent(notifyEmail || 'Anonymous')}`,
    `choice=${encodeURIComponent(combinedData)}`
  ].join('&');

  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })
  .then(() => {
    window.location.href = 'thankyou.html?from=submit';
  })
  .catch(() => {
    window.location.href = 'thankyou.html?from=submit';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Rotate prompts every 3.5s
  setInterval(rotatePrompt, 3500);

  // Char count
  document.getElementById('frustration')?.addEventListener('input', handleCharCount);

  // Notify toggle
  document.getElementById('notifyCheck')?.addEventListener('change', toggleEmail);

  // Form submit
  document.getElementById('submitForm')?.addEventListener('submit', handleSubmit);

  // Scroll effect on nav
  window.addEventListener('scroll', () => {
    document.querySelector('.nav-wrapper')?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});
