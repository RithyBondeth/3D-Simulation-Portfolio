export function isAIProject(project: {
  tags: string[];
  domains: string[];
  description: string;
}): boolean {
  return (
    project.tags.some((t) =>
      /^(LLM APIs|LiteLLM|MCP|LangChain|LangGraph|OpenAI|Anthropic|Gemini|AI)$/i.test(
        t,
      ),
    ) ||
    project.domains.some((d) => /\bAI\b/i.test(d)) ||
    /\bAI\b/.test(project.description)
  );
}
