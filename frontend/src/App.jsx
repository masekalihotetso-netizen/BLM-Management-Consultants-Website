import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, isConfigured } from './firebase';
import logo from '../assets/blm-logo.jpg';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const services = [
  ['Business Registration', 'Support with business registration, licensing and tax clearance.', 'registration'],
  ['Business Consultancy', 'General business consultancy and management support.', 'consultancy'],
  ['Tender Documents', 'Professional preparation and presentation of tender documentation.', 'tenders'],
  ['Tax Returns', 'Annual tax return filing and tax clearance renewal support.', 'tax']
];
const serviceOptions = ['Business registration, licensing & tax clearance', 'General business consultancy & management', 'Tender document preparation', 'Company constitutional document amendments', 'Annual tax return filing & tax clearance renewal', 'Other enquiry'];

function Header({ page }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <a className="brand" href="/" aria-label="BLM Management Consultants home"><img src={logo} alt="BLM logo" /><span><strong>BLM</strong><small>Management Consultants</small></span></a>
    <button className="nav-toggle" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
    <nav className={`nav ${open ? 'open' : ''}`} id="siteNav">
      {[['Home', '/'], ['About', '/about'], ['Services', '/services'], ['Contact', '/contact']].map(([label, href]) => <a key={href} className={page === label.toLowerCase() ? 'active' : ''} href={href}>{label}</a>)}
    </nav>
  </header>;
}

function Footer() {
  return <footer className="footer"><div><strong>BLM Management Consultants Pty Ltd</strong><p>Accountancy at it's finest.</p></div><div><strong>Visit us</strong><p>LAT House, Opposite Lakeside Hotel</p></div><div><strong>Call us</strong><p>5951 7955 • 6370 3548</p></div><div><strong>Quick links</strong><p><a href="/about">About</a> · <a href="/services">Services</a> · <a href="/contact">Contact</a></p></div><div><strong>Facebook</strong><p><a href="https://www.facebook.com/profile.php?id=61550081564660" target="_blank" rel="noreferrer">BLM Management Consultants</a></p></div><div className="copyright">© {new Date().getFullYear()} BLM Management Consultants Pty Ltd. All rights reserved.</div></footer>;
}

function Layout({ page, children }) { return <><Header page={page} />{children}<Footer /></>; }

function Home() {
  return <Layout page="home"><main><section className="hero"><div className="hero-overlay" /><div className="hero-content"><p className="eyebrow">ACCOUNTANCY AT IT'S FINEST</p><h1>Great ideas to <span>grow</span> your business.</h1><p className="lead">Practical business registration, tax, consultancy and compliance support for businesses ready to move forward.</p><div className="hero-actions"><a className="btn btn-primary" href="/services">Explore our services</a><a className="btn btn-outline" href="/contact">Talk to BLM</a></div></div><div className="hero-card"><span className="hero-card-icon">✓</span><div><strong>Business-focused support</strong><small>Registration • Tax • Tenders • Consultancy</small></div></div></section><section className="section intro"><div className="section-heading"><p className="eyebrow">WELCOME TO BLM</p><h2>Helping businesses build with confidence.</h2></div><div className="intro-grid"><p>BLM Management Consultants Pty Ltd provides professional business and management support designed to help entrepreneurs and established businesses handle important administrative, tax and compliance requirements.</p><div className="quick-facts"><div><strong>5+</strong><span>Core service areas</span></div><div><strong>1</strong><span>Business-focused partner</span></div><div><strong>2</strong><span>Contact lines</span></div></div></div></section><section className="section services-preview"><div className="section-heading center"><p className="eyebrow">WHAT WE DO</p><h2>Professional services for growing businesses</h2></div><div className="cards">{services.map(([title, description, id], index) => <article className="service-card" key={id}><div className="icon">{['▣', '◫', '✎', '↻'][index]}</div><h3>{title}</h3><p>{description}</p><a href={`/services#${id}`}>Learn more →</a></article>)}</div></section><section className="cta"><div><p className="eyebrow">READY TO GROW?</p><h2>Let's turn your business ideas into action.</h2></div><a className="btn btn-primary light-btn" href="/contact">Contact BLM</a></section></main></Layout>;
}

function About() { return <Layout page="about"><main><section className="page-hero"><p className="eyebrow">ABOUT BLM</p><h1>Practical support for businesses with ambition.</h1><p>We help businesses manage the details that keep good ideas moving.</p></section><section className="section two-col"><div><p className="eyebrow">OUR APPROACH</p><h2>Clear advice. Useful action.</h2></div><div><p>BLM Management Consultants Pty Ltd provides professional business and management support for entrepreneurs and established businesses.</p><p>From registration and tax clearance to tenders and compliance documents, our work is designed to make business administration easier to navigate.</p></div></section><section className="section cards">{['Professional', 'Practical', 'Business-focused'].map((title, index) => <article className="service-card" key={title}><div className="icon">{['◎', '✓', '↗'][index]}</div><h3>{title}</h3><p>{['Clear and structured support for business administration and compliance tasks.', 'Useful guidance focused on the next step, not unnecessary complexity.', 'Services shaped around the real needs of growing businesses.'][index]}</p></article>)}</section></main></Layout>; }

function Services() { return <Layout page="services"><main><section className="page-hero"><p className="eyebrow">OUR SERVICES</p><h1>Business support that keeps you moving.</h1><p>Professional help with the administrative, tax and compliance work behind a healthy business.</p></section><section className="section service-list">{[['01', 'REGISTRATION & LICENSING', 'Business registration, licensing & tax clearance', 'Assistance with the administrative requirements involved in establishing and maintaining a compliant business.'], ['02', 'CONSULTANCY', 'General business consultancy & management', 'Practical support for business planning, administration and management decisions.'], ['03', 'TENDER DOCUMENTS', 'Tender document preparation', 'Professional preparation and presentation of clear, complete tender documentation.'], ['04', 'TAX & COMPLIANCE', 'Annual tax returns & company documents', 'Support with annual tax return filing, tax clearance renewal and constitutional document amendments.']].map(([number, eyebrow, title, description]) => <article className="service-detail" id={title.toLowerCase().includes('registration') ? 'registration' : title.toLowerCase().includes('consultancy') ? 'consultancy' : title.toLowerCase().includes('tender') ? 'tenders' : 'tax'} key={number}><div className="detail-number">{number}</div><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div></article>)}</section></main></Layout>; }

function Contact() {
  const [status, setStatus] = useState({ text: '', type: '' });
  async function submit(event) { event.preventDefault(); setStatus({ text: 'Sending your enquiry...', type: '' }); const data = Object.fromEntries(new FormData(event.currentTarget).entries()); try { const response = await fetch(`${API_BASE}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); setStatus({ text: 'Thank you. Your enquiry has been received.', type: 'success' }); event.currentTarget.reset(); } catch (error) { setStatus({ text: error.message || 'The enquiry could not be sent.', type: 'error' }); } }
  return <Layout page="contact"><main><section className="page-hero"><p className="eyebrow">CONTACT US</p><h1>Let's discuss your business needs.</h1><p>Send an enquiry or use the contact details below.</p></section><section className="section contact-grid"><div className="contact-info"><div className="contact-item"><span>⌖</span><div><strong>Office</strong><p>LAT House, Opposite Lakeside Hotel</p></div></div><div className="contact-item"><span>☎</span><div><strong>Phone</strong><p><a href="tel:+26659517955">5951 7955</a><br /><a href="tel:+26663703548">6370 3548</a></p></div></div><div className="contact-item"><span>f</span><div><strong>Facebook</strong><p><a href="https://www.facebook.com/profile.php?id=61550081564660" target="_blank" rel="noreferrer">BLM Management Consultants</a></p></div></div><div className="notice"><strong>Business enquiries</strong><p>For pricing, document requirements or a consultation, use the form and BLM can follow up with you.</p></div></div><form className="contact-form" onSubmit={submit}><div className="form-row"><label>Full name<input name="name" required placeholder="Your name" /></label><label>Phone<input name="phone" required placeholder="Phone number" /></label></div><label>Service needed<select name="service" required defaultValue=""><option value="">Choose a service</option>{serviceOptions.map(option => <option key={option}>{option}</option>)}</select></label><label>Message<textarea name="message" rows="6" required placeholder="Tell us briefly what you need help with..." /></label><button className="btn btn-primary" type="submit">Send enquiry</button><p className={`form-status ${status.type}`} role="status">{status.text}</p></form></section></main></Layout>;
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event) { event.preventDefault(); setBusy(true); setError(''); try { await signInWithEmailAndPassword(auth, email, password); } catch { setError('Sign in failed. Use an approved administrator account.'); } finally { setBusy(false); } }
  if (!isConfigured) return <main className="admin-login"><div className="login-card"><p className="eyebrow">ADMIN SETUP</p><h1>Firebase configuration required</h1><p>Add the Vite Firebase variables to `frontend/.env.local` before using the dashboard.</p></div></main>;
  return <main className="admin-login"><form className="login-card" onSubmit={submit}><a className="admin-brand" href="/"><strong>BLM</strong><span>Management Consultants</span></a><p className="eyebrow">PRIVATE WORKSPACE</p><h1>Administrator sign in</h1><p>Only approved BLM administrators can view enquiries.</p><label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="username" /></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <p className="admin-error" role="alert">{error}</p>}<button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in...' : 'Sign in securely'}</button><a className="back-link" href="/">← Back to website</a></form></main>;
}

function AdminDashboard({ user }) {
  const [enquiries, setEnquiries] = useState([]); const [query, setQuery] = useState(''); const [error, setError] = useState(''); const [updated, setUpdated] = useState('');
  async function request(path, options = {}) { const token = await user.getIdToken(); const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Request failed.'); return result; }
  async function load() { setError(''); try { setEnquiries(await request('/api/enquiries')); setUpdated(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })); } catch (loadError) { setError(loadError.message); } }
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => enquiries.filter(item => [item.name, item.phone, item.service, item.message].some(value => String(value).toLowerCase().includes(query.toLowerCase()))), [enquiries, query]);
  async function changeStatus(id, status) { try { await request(`/api/enquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); setEnquiries(items => items.map(item => item.id === id ? { ...item, status } : item)); } catch (statusError) { setError(statusError.message); } }
  const count = status => enquiries.filter(item => item.status === status).length;
  return <main className="admin-shell"><header className="admin-header"><a className="admin-brand" href="/"><strong>BLM</strong><span>Management Consultants</span></a><div className="admin-actions"><span>{user.email}</span><button className="back-link" onClick={() => signOut(auth)}>Sign out</button></div></header><section className="admin-main"><div className="admin-intro"><div><p className="eyebrow">PRIVATE WORKSPACE</p><h1>Enquiries dashboard</h1><p>Review incoming business enquiries and keep their follow-up status current.</p></div><button className="refresh-button" onClick={load}>Refresh enquiries</button></div><section className="summary-grid" aria-label="Enquiry summary"><article className="summary-card"><span>Total enquiries</span><strong>{enquiries.length}</strong></article><article className="summary-card"><span>New</span><strong>{count('New')}</strong></article><article className="summary-card"><span>Contacted</span><strong>{count('Contacted')}</strong></article><article className="summary-card"><span>Closed</span><strong>{count('Closed')}</strong></article></section><section className="enquiries-panel"><div className="panel-toolbar"><div><h2>All enquiries</h2><p>{updated ? `Updated ${updated}` : 'Loading...'}</p></div><label className="search-field"><span className="sr-only">Search enquiries</span><input type="search" placeholder="Search name, phone or service" value={query} onChange={event => setQuery(event.target.value)} /></label></div>{error && <p className="admin-error" role="alert">{error}</p>}<div className="table-wrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Service</th><th>Message</th><th>Status</th><th>Date</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td>{item.name}</td><td><a href={`tel:${item.phone}`}>{item.phone}</a></td><td>{item.service}</td><td className="message">{item.message}</td><td><select className={`status-select status-${item.status.toLowerCase()}`} value={item.status} onChange={event => changeStatus(item.id, event.target.value)} aria-label={`Status for ${item.name}`}><option>New</option><option>Contacted</option><option>Closed</option></select></td><td>{formatDate(item.createdAt)}</td></tr>)}</tbody></table>{filtered.length === 0 && <p className="empty-state">No enquiries match your search.</p>}</div></section></section></main>;
}

function formatDate(value) { const date = value?._seconds ? new Date(value._seconds * 1000) : new Date(value); return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }

function Admin() {
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(undefined);
  useEffect(() => auth ? onAuthStateChanged(auth, async nextUser => {
    setUser(nextUser);
    if (!nextUser) return setIsAdmin(false);
    const token = await nextUser.getIdTokenResult();
    if (token.claims.admin !== true) {
      await signOut(auth);
      return setIsAdmin(false);
    }
    setIsAdmin(true);
  }) : undefined, []);
  if (user === undefined || (user && isAdmin === undefined)) return <main className="admin-login"><p>Loading secure workspace...</p></main>;
  if (user && isAdmin) return <AdminDashboard user={user} />;
  return <AdminLogin />;
}

export default function App() { const path = window.location.pathname.replace(/\/$/, '') || '/'; if (path === '/admin') return <Admin />; if (path === '/about') return <About />; if (path === '/services') return <Services />; if (path === '/contact') return <Contact />; return <Home />; }
