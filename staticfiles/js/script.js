const API = {
  profile: "/api/profile/",
  skills: "/api/skills/",
  projects: "/api/projects/",
  education: "/api/education/",
  languages: "/api/languages/",
  extra: "/api/extra/",
  exportPdf: "/api/export-pdf/",
};

const FALLBACK_IMAGE = "/static/image/image.png";

const state = {
  profile: null,
  skills: [],
  projects: [],
  education: [],
  languages: [],
  extra: [],
};

const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");
const pdfOverlay = document.getElementById("pdfOverlay");
const mainDlBtn = document.getElementById("mainDownloadBtn");
const navDlBtn = document.getElementById("navDownloadBtn");

window.addEventListener("scroll", () => {
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  }
});

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("open");
    });
  });
}

function splitFullName(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return [fullName || "Portfolio", ""];
  }
  return [parts.slice(0, -1).join(" "), parts.at(-1)];
}

function levelToPercent(level = "") {
  const map = {
    beginner: 40,
    intermediate: 70,
    advanced: 95,
  };
  return map[level.toLowerCase()] || 60;
}

function levelToDots(level = "") {
  const normalized = level.toLowerCase();
  if (normalized.includes("native") || normalized.includes("advanced")) return 5;
  if (normalized.includes("upper")) return 4;
  if (normalized.includes("intermediate")) return 3;
  if (normalized.includes("elementary")) return 2;
  if (normalized.includes("beginner")) return 1;
  return 3;
}

function fetchJson(url) {
  return fetch(url).then((response) => {
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Request failed for ${url}`);
    return response.json();
  });
}

function createBadge(text) {
  return `<span class="badge">${text}</span>`;
}

function createSkillMarkup(skill) {
  const percent = levelToPercent(skill.level);
  return `
    <div class="skill-item">
      <div class="skill-info">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-pct">${percent}%</span>
      </div>
      <div class="skill-bar">
        <div class="skill-fill" data-width="${percent}"></div>
      </div>
    </div>
  `;
}

function normalizeTechStack(techStack) {
  if (Array.isArray(techStack)) return techStack.filter(Boolean);
  if (typeof techStack === "string" && techStack.trim()) {
    return techStack.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function getProjectMonogram(title = "") {
  const parts = String(title).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function createProjectMarkup(project, index) {
  const tags = normalizeTechStack(project.tech_stack)
    .map((item) => `<span class="tag">${item}</span>`)
    .join("");

  return `
    <article class="project-card reveal ${index === 1 ? "reveal-delay" : index > 1 ? "reveal-delay-2" : ""}">
      <div class="project-header">
        <div class="project-icon">${getProjectMonogram(project.title)}</div>
        <div class="project-meta">
          <span class="project-kicker">Loyiha</span>
          <span class="project-num">${String(index + 1).padStart(2, "0")}</span>
        </div>
      </div>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-desc">${project.description}</p>
      <div class="project-stack">
        <span class="project-stack-label">Texnologiyalar</span>
        <div class="project-tags">${tags || '<span class="tag">Portfolio</span>'}</div>
      </div>
      <a href="${project.github_link}" target="_blank" rel="noopener" class="project-link">
        GitHub'da Ko'rish
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  `;
}

function createEducationMarkup(item) {
  return `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-body">
        <span class="timeline-date">${item.start_year} - ${item.end_year}</span>
        <h3 class="timeline-title">${item.direction}</h3>
        <p class="timeline-place">${item.school_name}</p>
      </div>
    </div>
  `;
}

function createLanguageMarkup(item) {
  const dots = Array.from({ length: 5 }, (_, index) => {
    return `<span class="dot ${index < levelToDots(item.level) ? "active" : ""}"></span>`;
  }).join("");

  return `
    <div class="lang-item">
      <span class="lang-flag">A</span>
      <div class="lang-info">
        <span class="lang-name">${item.name}</span>
        <span class="lang-level">${item.level}</span>
      </div>
      <div class="lang-dots">${dots}</div>
    </div>
  `;
}

function createExtraCard(item) {
  return `
    <div class="trait-card">
      <div class="trait-top">
        <div class="trait-icon">+</div>
        <span class="trait-kicker">Qo'shimcha ma'lumot</span>
      </div>
      <h4>Kuchli tomonim</h4>
      <p>${item.text}</p>
    </div>
  `;
}

function createSoftSkill(item) {
  return `
    <div class="soft-skill-card">
      <div class="soft-skill-icon">+</div>
      <div class="soft-skill-content">
        <h4>Qo'shimcha</h4>
        <p>${item.text}</p>
      </div>
    </div>
  `;
}

function getContactIcon(type) {
  const icons = {
    phone: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.2 11.2 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.5a1 1 0 0 1 1-1H7.2a1 1 0 0 1 1 1 11.2 11.2 0 0 0 .56 3.5 1 1 0 0 1-.24 1z"></path>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16a2 2 0 0 1 2 2v.4l-10 6.25L2 8.4V8a2 2 0 0 1 2-2zm18 4.75V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.25l9.47 5.91a1 1 0 0 0 1.06 0z"></path>
      </svg>
    `,
    github: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.42-4.04-1.42a3.17 3.17 0 0 0-1.33-1.76c-1.08-.74.08-.73.08-.73a2.51 2.51 0 0 1 1.83 1.22 2.56 2.56 0 0 0 3.5 1 2.57 2.57 0 0 1 .76-1.61c-2.67-.3-5.47-1.34-5.47-5.95A4.67 4.67 0 0 1 6.62 8.8a4.34 4.34 0 0 1 .12-3.18s1-.32 3.3 1.22a11.4 11.4 0 0 1 6 0c2.28-1.54 3.3-1.22 3.3-1.22a4.34 4.34 0 0 1 .12 3.18 4.67 4.67 0 0 1 1.24 3.24c0 4.62-2.8 5.64-5.48 5.94a2.88 2.88 0 0 1 .82 2.24v3.32c0 .32.22.69.83.57A12 12 0 0 0 12 .5z"></path>
      </svg>
    `,
    location: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s7-6.18 7-12a7 7 0 1 0-14 0c0 5.82 7 12 7 12zm0-9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"></path>
      </svg>
    `,
    telegram: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.4 4.6a1.3 1.3 0 0 0-1.42-.2L3.2 11.2a1 1 0 0 0 .1 1.88l4.13 1.34 1.55 4.78a1 1 0 0 0 1.8.23l2.28-3.1 4.48 3.3a1.3 1.3 0 0 0 2.06-.77l2.2-13a1.3 1.3 0 0 0-.4-1.28zM9.34 14.12l8.78-5.58-7.1 6.82-.28 2.83z"></path>
      </svg>
    `,
  };

  return icons[type] || icons.location;
}

function createContactCard(type, label, value, href = "", delayClass = "") {
  const tag = href ? "a" : "div";
  const attrs = href ? `href="${href}" target="_blank" rel="noopener"` : "";
  const safeAttrs = type === "phone" || type === "email" ? `href="${href}"` : attrs;
  return `
    <${tag} class="contact-card reveal ${delayClass}" ${href ? safeAttrs : ""}>
      <div class="contact-icon contact-icon-${type}">${getContactIcon(type)}</div>
      <div class="contact-info">
        <span class="contact-label">${label}</span>
        <span class="contact-value">${value}</span>
      </div>
    </${tag}>
  `;
}

function renderProfile() {
  const profile = state.profile;
  if (!profile) return;

  const [firstName, lastName] = splitFullName(profile.full_name);
  const heroName = document.querySelector(".hero-name");
  const heroTitle = document.querySelector(".hero-title");
  const heroDesc = document.querySelector(".hero-desc");
  const avatarImage = document.querySelector(".avatar-image");
  const navLogo = document.querySelector(".nav-logo");
  const footerCopy = document.querySelector(".footer-copy");
  const footerGithub = document.querySelector(".footer-github");

  document.title = `${profile.full_name} | ${profile.title}`;

  if (heroName) heroName.innerHTML = `${firstName}<br /><span>${lastName || profile.title}</span>`;
  if (heroTitle) {
    heroTitle.innerHTML = [
      createBadge(profile.title),
      createBadge(profile.location),
      createBadge("Django REST API"),
    ].join("");
  }
  if (heroDesc) heroDesc.textContent = profile.bio;
  if (avatarImage) {
    avatarImage.src = profile.profile_image || FALLBACK_IMAGE;
    avatarImage.alt = profile.full_name;
  }
  if (navLogo) {
    const first = firstName.charAt(0) || "C";
    const second = (lastName.charAt(0) || firstName.charAt(1) || "V").toUpperCase();
    navLogo.innerHTML = `${first}${second}<span class="dot">.</span>`;
  }
  if (footerCopy) {
    footerCopy.textContent = `${new Date().getFullYear()} ${profile.full_name}. Portfolio backend orqali boshqariladi.`;
  }
  if (footerGithub) {
    footerGithub.href = profile.github;
  }

  const aboutText = document.querySelector(".about-text");
  if (aboutText) {
    aboutText.innerHTML = `
      <p><strong>${profile.location}</strong>da yashovchi ${profile.title.toLowerCase()} sifatida men ishonchli va kengayadigan web backendlar yaratishga e'tibor beraman.</p>
      <p>${profile.bio}</p>
      <div class="about-stats">
        <div class="stat">
          <span class="stat-num">${state.projects.length}</span>
          <span class="stat-label">Loyiha Yaratildi</span>
        </div>
        <div class="stat">
          <span class="stat-num">${state.skills.length}</span>
          <span class="stat-label">Texnologiyalar</span>
        </div>
        <div class="stat">
          <span class="stat-num">${state.languages.length}</span>
          <span class="stat-label">Tillar</span>
        </div>
      </div>
    `;
  }

  const contactGrid = document.querySelector(".contact-grid");
  if (contactGrid) {
    const telegramLink = profile.telegram || "https://t.me/humoyun_coder";
    const telegramValue = telegramLink.startsWith("http")
      ? `@${telegramLink.replace(/^https?:\/\/(t\.me\/)?/, "").replace(/^@/, "")}`
      : telegramLink;

    contactGrid.innerHTML = [
      createContactCard("phone", "Telefon", profile.phone, `tel:${profile.phone}`),
      createContactCard("email", "Email", profile.email, `mailto:${profile.email}`, "reveal-delay"),
      createContactCard("telegram", "Telegram", telegramValue, telegramLink, "reveal-delay-2"),
      createContactCard("location", "Manzil", profile.location),
      createContactCard("github", "GitHub", profile.github.replace(/^https?:\/\//, ""), profile.github),
    ].join("");
  }
}

function renderSkills() {
  const skillsGrid = document.querySelector(".skills-grid");
  if (!skillsGrid) return;

  const content = state.skills.length
    ? state.skills.map(createSkillMarkup).join("")
    : `<p class="empty-state">Ko'nikmalar hali qo'shilmagan.</p>`;

  skillsGrid.innerHTML = `
    <div class="skill-group reveal">
      <h3 class="skill-group-title">Asosiy Ko'nikmalar</h3>
      ${content}
    </div>
  `;
}

function renderProjects() {
  const projectsGrid = document.querySelector(".projects-grid");
  if (!projectsGrid) return;

  projectsGrid.innerHTML = state.projects.length
    ? state.projects.map(createProjectMarkup).join("")
    : `<div class="empty-state-card">Loyihalar hali qo'shilmagan.</div>`;
}

function renderEducation() {
  const timeline = document.querySelector(".timeline");
  if (!timeline) return;

  timeline.innerHTML = state.education.length
    ? state.education.map(createEducationMarkup).join("")
    : `<p class="empty-state">Ta'lim ma'lumotlari hali qo'shilmagan.</p>`;
}

function renderLanguagesAndExtra() {
  const langList = document.querySelector(".lang-list");
  const softSkills = document.querySelector(".soft-skills");
  const aboutTraits = document.querySelector(".about-traits");

  if (langList) {
    langList.innerHTML = state.languages.length
      ? state.languages.map(createLanguageMarkup).join("")
      : `<p class="empty-state">Tillar hali qo'shilmagan.</p>`;
  }

  if (softSkills) {
    softSkills.innerHTML = state.extra.length
      ? state.extra.map(createSoftSkill).join("")
      : `
        <div class="soft-skill-card">
          <div class="soft-skill-icon">i</div>
          <div class="soft-skill-content">
            <h4>Qo'shimcha</h4>
            <p>Qo'shimcha ma'lumot kiritilganda shu yerda chiroyli ko'rinishda chiqadi.</p>
          </div>
        </div>
      `;
  }

  if (aboutTraits) {
    aboutTraits.innerHTML = state.extra.length
      ? state.extra.map(createExtraCard).join("")
      : `
        <div class="trait-card">
          <div class="trait-top">
            <div class="trait-icon">i</div>
            <span class="trait-kicker">Qo'shimcha ma'lumot</span>
          </div>
          <h4>Ma'lumot kutilmoqda</h4>
          <p>Admin panel orqali extra info qo'shsangiz bu yerda ko'rinadi.</p>
        </div>
      `;
  }
}

function setupReveal() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });
}

function setupSkillBars() {
  const skillsSection = document.getElementById("skills");
  if (!skillsSection) return;

  const skillBarObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".skill-fill").forEach((bar) => {
            const width = bar.getAttribute("data-width");
            setTimeout(() => {
              bar.style.width = `${width}%`;
            }, 200);
          });
          skillBarObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  skillBarObserver.observe(skillsSection);
}

function setupActiveLinks() {
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  const activeLinkObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navAnchors.forEach((anchor) => {
            anchor.style.color = "";
            anchor.style.background = "";
            if (anchor.getAttribute("href") === `#${id}`) {
              anchor.style.color = "var(--blue-mid)";
              anchor.style.background = "var(--blue-pale)";
            }
          });
        }
      });
    },
    {
      threshold: 0.4,
      rootMargin: "-68px 0px -40% 0px",
    }
  );

  sections.forEach((section) => activeLinkObserver.observe(section));
}

function setupHeroCursor() {
  const heroTitle = document.querySelector(".hero-title");
  if (!heroTitle) return;

  const cursor = document.createElement("span");
  cursor.textContent = "|";
  cursor.style.cssText = `
    color: var(--blue-mid);
    font-weight: 300;
    margin-left: 4px;
    animation: blink 1.1s step-end infinite;
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `;
  document.head.appendChild(styleEl);
  heroTitle.appendChild(cursor);
}

async function downloadPdf() {
  try {
    pdfOverlay.classList.add("active");
    const response = await fetch(API.exportPdf);
    if (!response.ok) throw new Error("PDF export failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cv.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("PDF yuklab olishda xatolik yuz berdi.");
  } finally {
    pdfOverlay.classList.remove("active");
  }
}

async function loadPortfolio() {
  try {
    const [profile, skills, projects, education, languages, extra] = await Promise.all([
      fetchJson(API.profile),
      fetchJson(API.skills),
      fetchJson(API.projects),
      fetchJson(API.education),
      fetchJson(API.languages),
      fetchJson(API.extra),
    ]);

    state.profile = profile;
    state.skills = skills || [];
    state.projects = projects || [];
    state.education = education || [];
    state.languages = languages || [];
    state.extra = extra || [];

    renderSkills();
    renderProjects();
    renderEducation();
    renderLanguagesAndExtra();
    renderProfile();

    setupReveal();
    setupSkillBars();
    setupActiveLinks();
    setupHeroCursor();
  } catch (error) {
    console.error(error);
    const heroDesc = document.querySelector(".hero-desc");
    if (heroDesc) {
      heroDesc.textContent = "Ma'lumotlarni yuklashda xatolik yuz berdi.";
    }
  }
}

if (mainDlBtn) mainDlBtn.addEventListener("click", downloadPdf);
if (navDlBtn) navDlBtn.addEventListener("click", downloadPdf);

loadPortfolio();
