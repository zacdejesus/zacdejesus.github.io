import { useEffect, useMemo, useState } from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' }
];

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

  useEffect(() => {
    async function getData() {
      try {
        const response = await fetch('./resumeData.json', { cache: 'no-store' });
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
  }, []);

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

    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);

    const updateActiveSection = () => {
      const offset = window.innerHeight * 0.3;
      let current = NAV_ITEMS[0].id;

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
  }, [status]);

  const year = useMemo(() => new Date().getFullYear(), []);

  if (status === 'loading') {
    return (
      <main className="state-view" aria-live="polite">
        <p>Loading portfolio content...</p>
      </main>
    );
  }

  if (status === 'error' || !data) {
    return (
      <main className="state-view" aria-live="assertive">
        <p>Content could not be loaded. Please try again.</p>
      </main>
    );
  }

  const { hero, about, experience, education, skills, site } = data;
  const heroStats = [
    { value: '5+ Years', label: 'Banking & Enterprise Mobile' },
    { value: 'Swift 6', label: 'Concurrency, SwiftUI, Combine' },
    { value: '90%', label: 'Deployment overhead reduced' }
  ];

  return (
    <>
      <a className="skip-link" href="#home">
        Skip to content
      </a>

      <header className="site-header" aria-label="Primary">
        <div className="container nav-shell">
          <a className="logo" href="#home" aria-label="Go to home section">
            ADJ
          </a>

          <nav>
            <ul className="nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    className={activeSection === item.id ? 'active' : ''}
                    href={`#${item.id}`}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="hero section shell-hero">
          <div className="container hero-grid">
            <div className="hero-stage">
              <div className="hero-pill-row">
                <p className="eyebrow">{site.tagline}</p>
                <span className="hero-pill">Open to senior roles in Spain</span>
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
              <ul className="social-list" aria-label="Social links">
                {hero.socialLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="hero-stats" aria-label="Career highlights">
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
              <p className="section-kicker">About</p>
              <h2>Building thoughtful software with product impact.</h2>
              <p>{about.bio}</p>
              <ul className="highlight-list">
                {about.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <aside className="about-card" aria-label="Contact details">
              <img
                src={about.images.about}
                alt={`${hero.name} working profile`}
                width="380"
                height="380"
                loading="lazy"
              />
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${about.contact.email}`}>{about.contact.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>
                    {about.contact.city}, {about.contact.country}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="container">
            <p className="section-kicker">Experience</p>
            <h2>Professional Journey</h2>
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
            <p className="section-kicker">Education</p>
            <h2>Academic Background</h2>
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
            <p className="section-kicker">Skills</p>
            <h2>Tools & Technologies</h2>
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

      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <p>{hero.name}</p>
          <p>{hero.role}</p>
          <p>© {year} All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
