import { projectHref } from "../../domain/portfolio/portfolio-route.ts";

const escapeHTML = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );

/** Keep legacy static links usable without loading the island application. */
export function projectDocument(
  html: string,
  project: { id: string; title: string; description: string },
) {
  const title = escapeHTML(`${project.title} | Rithy Bondeth`);
  const description = escapeHTML(project.description);
  const canonical = projectHref(project.id);
  const withMeta = (
    source: string,
    attribute: "name" | "property",
    key: string,
    content: string,
  ) =>
    source.replace(
      new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*/?>`),
      () => `<meta ${attribute}="${key}" content="${content}" />`,
    );
  let document = html.replace(
    /<title>[^<]*<\/title>/,
    () => `<title>${title}</title>`,
  );
  document = withMeta(document, "name", "description", description);
  for (const [attribute, key, content] of [
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:url", canonical],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
  ] as const)
    document = withMeta(document, attribute, key, content);
  document = document.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    () => `<link rel="canonical" href="${canonical}" />`,
  );
  return document
    .replace(/<script\b[\s\S]*?<\/script>/g, "")
    .replace(/<link[^>]+rel="stylesheet"[^>]*>/g, "")
    .replace(
      "</head>",
      `<meta http-equiv="refresh" content="0;url=${canonical}" /><meta name="robots" content="noindex,follow" /></head>`,
    )
    .replace(
      /<body[^>]*>[\s\S]*<\/body>/,
      `<body><p>Continue to <a href="${canonical}">${title}</a> on bondeth.dev.</p></body>`,
    );
}
