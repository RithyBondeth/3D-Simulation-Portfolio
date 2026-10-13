import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

import opentype from "opentype.js";
import { byteHead, byteEyes, byteMouth, byteLightPalette } from "../src/lib/brand.ts";

// Outline local Ubuntu glyphs so SVG and PNG use the same font on every machine.
const fonts = await Promise.all([400, 700].map(async (weight) => {
  const bytes = await readFile(`node_modules/@fontsource/ubuntu/files/ubuntu-latin-${weight}-normal.woff`);
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}));
const text = (value, x, y, size, color, bold = false, spacing = 0) => {
  const font = fonts[bold ? 1 : 0];
  let cursor = x;
  return `<g aria-label="${value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}" fill="${color}">${font.stringToGlyphs(value).map((glyph, index, glyphs) => {
    const path = glyph.getPath(cursor, y, size).toPathData(2);
    cursor += (glyph.advanceWidth + (glyphs[index + 1] ? font.getKerningValue(glyph, glyphs[index + 1]) : 0)) * size / font.unitsPerEm + spacing;
    return `<path d="${path}"/>`;
  }).join("")}</g>`;
};
const byte = [...byteHead, ...byteEyes, ...byteMouth].map(([x, y, width, height, paint]) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${byteLightPalette[paint]}"/>`
).join("");

// Original vector artwork; the PNG is committed so production needs no image service.
const buildings = [
  [738, 336, 43, 82, "#89a99c"],
  [804, 311, 38, 114, "#7395a5"],
  [990, 326, 40, 101, "#a6b18c"],
  [1040, 367, 35, 67, "#b99478"],
];
const towers = buildings
  .map(
    ([x, y, w, h, color]) =>
      `<g><path d="M${x},${y} l${w},-21 v-${h} l-${w},21Z" fill="${color}"/><path d="M${x + w},${y - 21} l20,13 v-${h} l-20,-13Z" fill="#597b79"/><path d="M${x},${y - h} l${w},-21 20,13 -${w},21Z" fill="#e1dec7"/>${Array.from({ length: 4 }, (_, i) => `<path d="M${x + 6},${y - h + 18 + i * 17} l${w - 11},-15 v7 l-${w - 11},15Z" fill="#31575e"/>`).join("")}</g>`,
  )
  .join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="#294d3c" opacity=".1"/></pattern><linearGradient id="base" x2="0" y2="1"><stop stop-color="#9eaf8b"/><stop offset="1" stop-color="#698877"/></linearGradient></defs>
<rect width="1200" height="630" fill="#edf1e7"/><rect x="590" width="610" height="630" fill="url(#dots)"/>
<g transform="translate(64 61) scale(1.8)" shape-rendering="crispEdges">${byte}</g>
${text("Bondeth", 136, 89, 24, "#294d3c", true, -1.08)}
<g transform="translate(136 97)"><path d="M0 0h20v4H0Z" fill="${byteLightPalette.accent}"/><path d="M24 0h13v4H24Z" fill="#536659" opacity=".7"/><path d="M41 0h8v4H41Z" fill="#536659" opacity=".45"/><path d="M53 0h4v4H53Z" fill="#536659" opacity=".25"/></g>
${text("Useful software.", 66, 224, 66, "#294d3c", true, -3)}
${text("A curious world.", 66, 301, 66, byteLightPalette.accent, true, -3)}
${text("Rithy Bondeth · Developer & AI Engineer", 69, 363, 22, "#536659")}
${text("Explore the work. Take the scenic route.", 69, 402, 20, "#536659")}
<path d="M66 502h452" stroke="#294d3c" stroke-opacity=".2"/>
${text("3d.bondeth.dev", 69, 549, 20, "#294d3c")}
${text("Made in Phnom Penh, Cambodia", 69, 580, 15, "#536659")}
<ellipse cx="891" cy="510" rx="241" ry="43" fill="#294d3c" opacity=".08"/>
<path d="M652 361 878 258 1139 398 906 516 668 404Z" fill="url(#base)"/>
<path d="M652 361 878 258 1139 398 906 468Z" fill="#b1c4a2"/>
<path d="M684 362 877 279 1107 398 906 444Z" fill="#446562"/>
<path d="M707 361 879 299 1080 397 905 424Z" fill="#d8d6bb"/>
<path d="M688 365 877 286 1099 397 905 436Z" fill="none" stroke="#e8e6cf" stroke-width="2" stroke-dasharray="8 8"/>
${towers}
<path d="M893 410 978 374 1024 401 938 440Z" fill="#78b2a7"/>
<path d="M881 409 966 374 978 380 893 416Z" fill="#c3aa7b"/>
<g fill="#86533d"><path d="M869 364v-102h8v106Z"/><path d="M946 355v-101h8v105Z"/><path d="M917 389v-106h8v110Z"/></g>
<path d="M844 269 909 227 980 263 917 302Z" fill="#a44f38"/>
<path d="M844 269 917 302v5l-73-33Z" fill="#d6ab5d"/>
<path d="M917 302 980 263v5l-63 39Z" fill="#bb8a3f"/>
<path d="M863 253 909 217 962 247 917 277Z" fill="#bc6340"/>
<path d="M878 238 909 207 946 233 917 254Z" fill="#d1884f"/>
<path d="M904 213 912 172 921 216Z" fill="#d4a447"/>
<path d="M884 236 890 211 897 241 891 246Z M930 239 936 210 944 233Z" fill="#dfb462"/>
<circle cx="912" cy="168" r="4" fill="#d4a447"/>
<g fill="#6f957c"><circle cx="735" cy="393" r="13"/><circle cx="727" cy="387" r="9"/><circle cx="1058" cy="412" r="13"/><circle cx="1005" cy="438" r="10"/></g>
<g transform="translate(1073 198)"><circle r="28" fill="#d5b89b"/><ellipse rx="45" ry="12" fill="none" stroke="#8fb2a7" stroke-width="5" transform="rotate(-25)"/></g>
<path d="M735 209h43m-21-21v42" stroke="#b77951" stroke-width="2"/>
${text("17 PROJECTS / 4 DISTRICTS", 990, 558, 12, "#536659")}
</svg>`;
await writeFile("public/social-preview.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("public/social-preview.png");
