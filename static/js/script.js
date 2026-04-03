/* ═══════════════════════════════════════════════════════
   SCRIPT.JS — Humoyun Jo'rayev CV
   Features:
   - Scroll-reveal animations
   - Skill bar animations (triggered on scroll)
   - Sticky navbar shadow on scroll
   - Mobile hamburger menu toggle
   - PDF download via html2pdf.js
═══════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────
   1. NAVBAR: add shadow class on scroll
────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ──────────────────────────────────────────
   2. HAMBURGER MENU TOGGLE (mobile)
────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

/* ──────────────────────────────────────────
   3. SCROLL REVEAL ANIMATION
   Uses IntersectionObserver for performance.
   Elements with class .reveal fade+slide up
   when they enter the viewport.
────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after animation to save resources
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,   // Trigger when 12% of element is visible
    rootMargin: '0px 0px -40px 0px'
  }
);

// Observe all elements with .reveal class
document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});

/* ──────────────────────────────────────────
   4. SKILL BAR ANIMATION
   Animates the width of .skill-fill bars
   when the skills section scrolls into view.
────────────────────────────────────────── */
const skillBarObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find all skill bars within this section
        entry.target.querySelectorAll('.skill-fill').forEach(bar => {
          const targetWidth = bar.getAttribute('data-width');
          // Small delay for visual polish
          setTimeout(() => {
            bar.style.width = targetWidth + '%';
          }, 200);
        });
        skillBarObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

// Observe the skills section
const skillsSection = document.getElementById('skills');
if (skillsSection) {
  skillBarObserver.observe(skillsSection);
}

/* ──────────────────────────────────────────
   5. PDF DOWNLOAD
   Uses html2pdf.js library (loaded via CDN).
   Captures the #cv-content element and
   exports it as a downloadable PDF file.
────────────────────────────────────────── */
const pdfOverlay     = document.getElementById('pdfOverlay');
const mainDlBtn      = document.getElementById('mainDownloadBtn');
const navDlBtn       = document.getElementById('navDownloadBtn');

/**
 * generatePDF()
 * Converts the #cv-content section to PDF and triggers download.
 */
function generatePDF() {
  // Show loading overlay
  pdfOverlay.classList.add('active');

  // Target element to export
  const element = document.getElementById('cv-content');

  // html2pdf configuration options
  const options = {
    margin:       [10, 10, 10, 10],       // Top, right, bottom, left (mm)
    filename:     'Humoyun_Juraev_CV.pdf',
    image:        { type: 'jpeg', quality: 0.97 },
    html2canvas: {
      scale:       2,           // 2× resolution for crisp output
      useCORS:     true,        // Allow cross-origin images
      scrollY:     0,
      windowWidth: 1140         // Render at desktop width
    },
    jsPDF: {
      unit:        'mm',
      format:      'a4',
      orientation: 'portrait'
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy']
    }
  };

  // Generate and download PDF
  html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => {
      // Hide overlay once done
      pdfOverlay.classList.remove('active');
    })
    .catch((err) => {
      console.error('PDF generation error:', err);
      pdfOverlay.classList.remove('active');
      alert('PDF generation failed. Please try again.');
    });
}

// Attach click handlers to both download buttons
if (mainDlBtn) mainDlBtn.addEventListener('click', generatePDF);
if (navDlBtn)  navDlBtn.addEventListener('click', generatePDF);

/* ──────────────────────────────────────────
   6. SMOOTH ACTIVE LINK HIGHLIGHTING
   Highlights the nav link whose section
   is currently in view using IntersectionObserver.
────────────────────────────────────────── */
const sections    = document.querySelectorAll('section[id]');
const navAnchors  = document.querySelectorAll('.nav-links a');

const activeLinkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.style.color = '';
          a.style.background = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color      = 'var(--blue-mid)';
            a.style.background = 'var(--blue-pale)';
          }
        });
      }
    });
  },
  {
    threshold:   0.4,
    rootMargin:  '-68px 0px -40% 0px'
  }
);

sections.forEach(s => activeLinkObserver.observe(s));

/* ──────────────────────────────────────────
   7. HERO TYPING EFFECT (subtle)
   Adds a blinking cursor effect after the
   hero title line for a developer feel.
────────────────────────────────────────── */
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
  // Create cursor element
  const cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.style.cssText = `
    color: var(--blue-mid);
    font-weight: 300;
    margin-left: 4px;
    animation: blink 1.1s step-end infinite;
  `;

  // Inject blink keyframe dynamically
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
  `;
  document.head.appendChild(styleEl);
  heroTitle.appendChild(cursor);
}
