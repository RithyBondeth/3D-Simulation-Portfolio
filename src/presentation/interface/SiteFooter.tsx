import {
  ArrowUpRightIcon,
  CubeIcon,
  GithubLogoIcon,
  QuestionIcon,
} from "@phosphor-icons/react";
import profile from "../../data/portfolio/profile.json";
import BrandMark, { BrandName } from "../shared/BrandMark";
export default function SiteFooter({
  simple,
  onContact,
  onHelp,
  onWorld,
}: {
  simple: boolean;
  onContact: () => void;
  onHelp: () => void;
  onWorld: () => void;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-identity">
          <BrandMark />
          <div>
            <BrandName />
            <p>Thoughtful software, built with care.</p>
          </div>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            <GithubLogoIcon size={18} />
            GitHub
            <ArrowUpRightIcon size={13} />
          </a>
          <a href={profile.resume} target="_blank" rel="noopener noreferrer">
            Resume
            <ArrowUpRightIcon size={13} />
          </a>
          <button onClick={onContact}>
            Say hello
            <ArrowUpRightIcon size={15} />
          </button>
        </nav>
      </div>
      <div className="footer-bottom">
        <span className="footer-credit">
          © {new Date().getFullYear()} Rithy Bondeth
        </span>
        <span className="footer-location">Phnom Penh, Cambodia</span>
        {!simple && (
          <button className="credits-button" onClick={onHelp}>
            <QuestionIcon size={16} />
            Controls & credits
          </button>
        )}
        {simple && (
          <button className="footer-world-link" onClick={onWorld}>
            <CubeIcon size={16} />
            Explore the world
          </button>
        )}
      </div>
    </footer>
  );
}
