import { useState } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  MapPinIcon,
} from "@phosphor-icons/react";

import profile from "../../data/portfolio/profile.json";
export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  return (
    <div className="contact-content">
      <div className="contact-illustration">
        <EnvelopeSimpleIcon size={64} weight="duotone" />
        <span>Good things start with a hello.</span>
      </div>
      <p className="lead">
        Have a project in mind, a problem to solve, or an idea worth exploring?
        I’d love to hear about it.
      </p>
      <div className="contact-availability">
        <span className="availability-dot" />
        Available for selected software & AI projects
      </div>
      <a className="email-link" href={`mailto:${profile.email}`}>
        {profile.email}
        <ArrowUpRightIcon size={20} />
      </a>
      <button className="text-button copy-button" onClick={copy}>
        {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        {copied ? "Email copied" : "Copy email address"}
      </button>
      <div className="sr-only" role="status">
        {copied ? "Email address copied to clipboard." : ""}
      </div>
      {copyError && (
        <p role="alert">
          Copy isn’t available here. You can select the address above or open it
          in your email app.
        </p>
      )}
      <a
        className="primary-button"
        href={`mailto:${profile.email}?subject=Let%27s%20build%20something`}
      >
        Say hello
        <ArrowUpRightIcon size={17} />
      </a>
      <div className="social-links">
        <a href={profile.github} target="_blank" rel="noopener noreferrer">
          <GithubLogoIcon size={22} />
          GitHub
          <ArrowUpRightIcon size={14} />
        </a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          <LinkedinLogoIcon size={22} />
          LinkedIn
          <ArrowUpRightIcon size={14} />
        </a>
      </div>
      <p className="contact-location">
        <MapPinIcon size={16} />
        Phnom Penh, Cambodia · UTC+7
      </p>
    </div>
  );
}
