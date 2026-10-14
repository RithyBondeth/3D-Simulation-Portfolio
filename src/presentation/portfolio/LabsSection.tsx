import { mainPortfolio, writing } from "../../domain/portfolio/portfolio-story";
import {
  ArrowUpRightIcon,
  BrainIcon,
  CodeIcon,
  MagnifyingGlassIcon,
  TerminalWindowIcon,
} from "@phosphor-icons/react";

import profile from "../../data/portfolio/profile.json";
export default function LabsSection() {
  const labs = [
    {
      name: "Retrieval playground",
      description:
        "Explore how a question finds the right context before an AI model answers.",
      href: "rag-retrieval",
      label: "RAG & search",
      icon: MagnifyingGlassIcon,
    },
    {
      name: "Structured outputs",
      description:
        "Turn a free-form model response into dependable, typed data.",
      href: "structured-output",
      label: "Reliable AI",
      icon: CodeIcon,
    },
    {
      name: "LLM evaluation",
      description:
        "Compare model responses and see what makes an evaluation useful.",
      href: "llm-evals",
      label: "Measure & improve",
      icon: BrainIcon,
    },
  ];
  return (
    <>
      <div className="lab-hero">
        <TerminalWindowIcon size={40} weight="duotone" />
        <span>Always learning. Always building.</span>
        <p>Small experiments with the ideas behind intelligent software.</p>
      </div>
      <div className="lab-list">
        {labs.map((l) => (
          <a
            href={`https://www.bondeth.dev/en/labs/${l.href}`}
            target="_blank"
            rel="noopener noreferrer"
            key={l.name}
          >
            <l.icon size={27} weight="duotone" />
            <div>
              <span>{l.label}</span>
              <h3>{l.name}</h3>
              <p>{l.description}</p>
            </div>
            <ArrowUpRightIcon size={19} />
          </a>
        ))}
      </div>
      <section className="writing-overview" aria-labelledby="writing-title">
        <h3 id="writing-title">From the notebook</h3>
        {writing.map((article) => (
          <a key={article.href} href={`${mainPortfolio}/blog/${article.href}`}>
            <span>{article.topic}</span>
            <strong>{article.title}</strong>
            <ArrowUpRightIcon size={16} />
          </a>
        ))}
      </section>
      <a
        className="video-overview"
        href={profile.youtube}
        target="_blank"
        rel="noopener noreferrer"
      >
        <TerminalWindowIcon size={24} />
        <span>
          <strong>Technical videos</strong>
          <small>Systems and ideas, explained in English and Khmer.</small>
        </span>
        <ArrowUpRightIcon size={18} />
      </a>
      <a
        className="text-button"
        href="https://www.bondeth.dev/en/blog"
        target="_blank"
        rel="noopener noreferrer"
      >
        Read the stories behind the work
        <ArrowUpRightIcon size={16} />
      </a>
    </>
  );
}
