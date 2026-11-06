import { useEffect, useMemo, useState } from 'react';

const NAV_IDS = ['home', 'about', 'projects', 'experience', 'education', 'skills', 'contact'];

function getInitialLang() {
  try {
    const saved = window.localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') {
      return saved;
    }
  } catch (error) {
    // localStorage can be unavailable; fall back to the browser language.
  }
  return (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
}

const LOADING_TEXT = {
  en: { loading: 'Loading portfolio content...', error: 'Content could not be loaded. Please try again.' },
  es: { loading: 'Cargando el portafolio...', error: 'No se pudo cargar el contenido. Inténtalo de nuevo.' }
};

function updateMetaTag(attr, key, value) {
  if (!value) {
    return;
  }

  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let tag = document.querySelector(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', value);
}

function App() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [activeSection, setActiveSection] = useState('home');
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem('lang', lang);
    } catch (error) {
      // Ignore storage errors.
    }
  }, [lang]);

  useEffect(() => {
    async function getData() {
      try {
        const response = await fetch(`./resumeData.${lang}.json`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load content (${response.status})`);
        }

        const result = await response.json();
        setData(result);
        setStatus('ready');
      } catch (error) {
        setStatus('error');
      }
    }

    getData();
  }, [lang]);

  useEffect(() => {
    if (!data?.site) {
      return;
    }

    const { title, description, canonicalUrl, socialImage } = data.site;
    document.title = title;

    updateMetaTag('name', 'description', description);
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:image', socialImage);
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', socialImage);

    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }
  }, [data]);

  useEffect(() => {
    if (status !== 'ready') {
      return undefined;
    }

    const sections = NAV_IDS.map((id) => document.getElementById(id)).filter(Boolean);

    const updateActiveSection = () => {
      const offset = window.innerHeight * 0.3;
      let current = NAV_IDS[0];

      sections.forEach((section) => {
        const top = section.getBoundingClientRect().top;
        if (top <= offset) {
          current = section.id;
        }
      });

      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [status, lang]);

  const year = useMemo(() => new Date().getFullYear(), []);

  if (status === 'loading') {
    return (
      <main className="state-view" aria-live="polite">
        <p>{LOADING_TEXT[lang].loading}</p>
      </main>
    );
  }

  if (status === 'error' || !data) {
    return (
      <main className="state-view" aria-live="assertive">
        <p>{LOADING_TEXT[lang].error}</p>
      </main>
    );
  }

  const { hero, about, projects, experience, education, skills, site, ui } = data;
  const heroStats = hero.stats;

  return (
    <>
      <a className="skip-link" href="#home">
        {ui.skip}
      </a>

      <header className="site-header" aria-label="Primary">
        <div className="container nav-shell">
          <a className="logo" href="#home" aria-label={ui.nav.home}>
            ADJ
          </a>

          <nav>
            <ul className="nav-list">
              {NAV_IDS.map((id) => (
                <li key={id}>
                  <a
                    className={activeSection === id ? 'active' : ''}
                    href={`#${id}`}
                    aria-current={activeSection === id ? 'page' : undefined}
                  >
                    {ui.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            className="lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            aria-label={ui.switchLabel}
          >
            {ui.switchTo}
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero section shell-hero">
          <div className="container hero-grid">
            <div className="hero-stage">
              <div className="hero-pill-row">
                <p className="eyebrow">{site.tagline}</p>
                <span className="hero-pill">{hero.pill}</span>
              </div>
              <h1 className="hero-title">{hero.name}</h1>
              <p className="hero-role">{hero.role}</p>
              <p className="hero-summary">{hero.summary}</p>
              <p className="hero-location">{hero.location}</p>
              <div className="hero-cta">
                <a className="btn primary" href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </a>
                <a className="btn secondary" href={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                </a>
              </div>
              <ul className="social-list" aria-label={ui.socialLabel}>
                {hero.socialLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="hero-stats" aria-label={ui.heroStatsLabel}>
                {heroStats.map((item) => (
                  <article key={item.value} className="hero-stat-card">
                    <p className="hero-stat-value">{item.value}</p>
                    <p className="hero-stat-label">{item.label}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container split">
            <div>
              <p className="section-kicker">{ui.aboutKicker}</p>
              <h2>{ui.aboutTitle}</h2>
              <p>{about.bio}</p>
              <ul className="highlight-list">
                {about.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <aside className="about-card" aria-label={ui.contactLabel}>
              <img
                src={about.images.about}
                alt={`${hero.name} ${ui.imageAlt}`}
                width="380"
                height="380"
                loading="lazy"
              />
              <dl>
                <div>
                  <dt>{ui.email}</dt>
                  <dd>
                    <a href={`mailto:${about.contact.email}`}>{about.contact.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>{ui.location}</dt>
                  <dd>
                    {about.contact.city}, {about.contact.country}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section id="projects" className="section">
          <div className="container">
            <p className="section-kicker">{ui.projectsKicker}</p>
            <h2>{ui.projectsTitle}</h2>
            <p className="section-intro">{ui.projectsIntro}</p>
            <div className="project-grid">
              {projects.map((project) => (
                <article key={project.name} className="panel project-card">
                  <img
                    src={project.image}
                    alt={`${ui.screenshotOf} ${project.name}`}
                    width="1280"
                    height="800"
                    loading="lazy"
                  />
                  <div className="project-body">
                    <p className="panel-meta">{project.kind}</p>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <ul className="chip-list project-tags">
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <div className="project-links">
                      {project.links.map((link, index) => (
                        <a
                          key={link.url}
                          className={`btn ${index === 0 ? 'primary' : 'secondary'}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="container">
            <p className="section-kicker">{ui.experienceKicker}</p>
            <h2>{ui.experienceTitle}</h2>
            <div className="card-grid">
              {experience.map((job) => (
                <article key={`${job.company}-${job.period}`} className="panel">
                  <p className="panel-meta">{job.period}</p>
                  <h3>{job.role}</h3>
                  <p className="panel-company">{job.company}</p>
                  <p>{job.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="education" className="section">
          <div className="container">
            <p className="section-kicker">{ui.educationKicker}</p>
            <h2>{ui.educationTitle}</h2>
            <div className="card-grid">
              {education.map((item) => (
                <article key={`${item.institution}-${item.period}`} className="panel">
                  <p className="panel-meta">{item.period}</p>
                  <h3>{item.program}</h3>
                  <p className="panel-company">{item.institution}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="section">
          <div className="container">
            <p className="section-kicker">{ui.skillsKicker}</p>
            <h2>{ui.skillsTitle}</h2>
            <div className="skills-grid">
              {skills.map((group) => (
                <article key={group.category} className="panel skill-panel">
                  <h3>{group.category}</h3>
                  <ul className="chip-list">
                    {group.items.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container">
            <p className="section-kicker">{ui.contactKicker}</p>
            <h2>{ui.contactTitle}</h2>
            <p className="section-intro">{ui.contactIntro}</p>
            <div className="panel contact-panel">
              <dl>
                <div>
                  <dt>{ui.email}</dt>
                  <dd>
                    <a href={`mailto:${about.contact.email}`}>{about.contact.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>{ui.phone}</dt>
                  <dd>
                    <a href={`tel:${about.contact.phone.replace(/\s/g, '')}`}>{about.contact.phone}</a>
                  </dd>
                </div>
                <div>
                  <dt>{ui.location}</dt>
                  <dd>
                    {about.contact.city}, {about.contact.country}
                  </dd>
                </div>
              </dl>
              <div className="project-links">
                <a className="btn primary" href={about.contact.whatsapp} target="_blank" rel="noreferrer">
                  {ui.whatsapp}
                </a>
                <a className="btn secondary" href={`mailto:${about.contact.email}`}>
                  {ui.sendEmail}
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <p>{hero.name}</p>
          <p>{hero.role}</p>
          <p>© {year} {ui.rights}</p>
        </div>
      </footer>
    </>
  );
}

export default App;
