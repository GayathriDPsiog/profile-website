/* ==========================================================
   main.js: interactions for the profile website.
   Vanilla JavaScript only, no libraries.
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {
  setFooterYear();
  setupMobileMenu();
  setupScrollProgress();
  setupActiveNavLink();
  splitLettersForAnimation();
});

/* Footer: always show the current year */
function setFooterYear() {
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* Mobile menu: the hamburger button opens and closes the nav links */
function setupMobileMenu() {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  if (!header || !toggle) {
    return;
  }

  function setOpen(isOpen) {
    header.classList.toggle('nav-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setOpen(!header.classList.contains('nav-open'));
  });

  // Close the menu after a link is chosen
  header.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      setOpen(false);
    });
  });
}

/* Scroll progress: the bar (and the tiny boat) move as the page scrolls */
function setupScrollProgress() {
  var header = document.querySelector('.site-header');
  if (!header) {
    return;
  }
  var ticking = false;

  function update() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    header.style.setProperty('--progress', percent.toFixed(2) + '%');
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* Active nav link: highlight the link of the section on screen */
function setupActiveNavLink() {
  var links = document.querySelectorAll('.nav-links a');
  if (!links.length || !('IntersectionObserver' in window)) {
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        links.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('main section[id]').forEach(function (section) {
    observer.observe(section);
  });
}

/* Hero name: wrap each letter in a span so CSS can make the letters rise
   one by one. Letters are grouped per word so a word never breaks apart. */
function splitLettersForAnimation() {
  document.querySelectorAll('[data-split-letters]').forEach(function (el) {
    var text = el.textContent.trim();
    var index = 0;
    el.setAttribute('aria-label', text);
    el.textContent = '';

    text.split(' ').forEach(function (word) {
      var wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      wordSpan.setAttribute('aria-hidden', 'true');

      word.split('').forEach(function (char) {
        var letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = char;
        letter.style.setProperty('--i', index);
        index += 1;
        wordSpan.appendChild(letter);
      });

      el.appendChild(wordSpan);
    });
  });
}