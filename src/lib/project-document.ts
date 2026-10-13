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

/** Static metadata is available to social crawlers before JavaScript runs. */
export function projectDocument(
  html: string,
  project: { id: string; title: string; description: string },
) {
  const title = escapeHTML(`${project.title} | Rithy Bondeth`);
  const description = escapeHTML(project.description);
  const canonical = `https://3d.bondeth.dev/projects/${encodeURIComponent(project.id)}/`;
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
  return document;
}
