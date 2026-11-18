/* ==========================================================
   main.js: interactions for the profile website.
   Vanilla JavaScript only, no libraries.
   ========================================================== */

// Lets CSS know JavaScript is running (used by the scroll-reveal styles)
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  setFooterYear();
  setupMobileMenu();
  setupScrollProgress();
  setupActiveNavLink();
  splitLettersForAnimation();
  setupScrollReveal();
  setupRouteProgress();
  setupShowMore();
  setupInterestFilter();
  setupFlipCards();
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

/* Scroll reveal: add .is-visible when an element enters the screen */
function setupScrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (item) { item.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(function (item) { observer.observe(item); });
}

/* Journey route: the solid line and the boat follow your scroll.
   0 = route not reached yet, 1 = scrolled past the whole route. */
function setupRouteProgress() {
  var route = document.querySelector('.route');
  if (!route) {
    return;
  }
  var ticking = false;

  function update() {
    var rect = route.getBoundingClientRect();
    var middleOfScreen = window.innerHeight * 0.6;
    var progress = (middleOfScreen - rect.top) / rect.height;
    progress = Math.min(Math.max(progress, 0), 1);
    route.style.setProperty('--route-progress', progress.toFixed(3));
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', update);
  update();
}

/* "Show more" buttons: reveal extra text and update the label */
function setupShowMore() {
  document.querySelectorAll('.show-more').forEach(function (button) {
    var target = document.getElementById(button.getAttribute('aria-controls'));
    if (!target) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      target.hidden = isOpen;
      button.textContent = isOpen ? 'show more ▾' : 'show less ▴';
    });
  });
}

/* Interests: filter tabs show only the postcards of one category */
function setupInterestFilter() {
  var tabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.postcard');
  if (!tabs.length) {
    return;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var filter = tab.dataset.filter;

      tabs.forEach(function (t) {
        var isActive = t === tab;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-pressed', String(isActive));
      });

      cards.forEach(function (card) {
        var show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
        if (show) {
          // Restart the pop-in animation so the cards "reshuffle"
          card.classList.remove('pop-in');
          void card.offsetWidth;
          card.classList.add('pop-in', 'is-visible');
        }
      });
    });
  });
}

/* Family: tap or press Enter on a card to flip it (hover also flips on desktop) */
function setupFlipCards() {
  document.querySelectorAll('.flip-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
    });
  });
}