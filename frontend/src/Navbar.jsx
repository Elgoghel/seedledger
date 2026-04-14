import { NavLink, useLocation } from "react-router-dom";

const ITT_PAGES = ["/story", "/results", "/faq"];

export default function Navbar() {
  const { pathname } = useLocation();
  const showSubNav = ITT_PAGES.includes(pathname);

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">MARWAN ELGOGHEL</NavLink>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive || showSubNav ? "active" : ""}>Projects</NavLink>
          <NavLink to="/ask" className={({ isActive }) => isActive ? "active" : ""}>Inquiries</NavLink>
        </div>
      </nav>
      <div className={`subnav ${showSubNav ? "subnav-open" : ""}`}>
        <div className="subnav-inner">
          <span className="subnav-label">ITT</span>
          <NavLink to="/story" className={({ isActive }) => `subnav-link ${isActive ? "active" : ""}`}>Story</NavLink>
          <NavLink to="/results" className={({ isActive }) => `subnav-link ${isActive ? "active" : ""}`}>Results</NavLink>
          <NavLink to="/faq" className={({ isActive }) => `subnav-link ${isActive ? "active" : ""}`}>FAQ</NavLink>
        </div>
      </div>
    </>
  );
}
