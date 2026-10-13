import sharp from "sharp";
import { writeFile } from "node:fs/promises";

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
<g transform="translate(64 56)"><rect width="56" height="56" rx="16" fill="#294d3c"/><path d="M17 14v29h12c6 0 11-3 11-7s-5-7-11-7H17m0 0h12c5 0 9-3 9-7s-4-8-9-8h-5" fill="none" stroke="#f6f6e8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="45" r="3" fill="#e5ad82"/></g>
<text x="136" y="92" fill="#294d3c" font-family="Arial,sans-serif" font-size="24" font-weight="700">Bondeth World</text>
<text x="66" y="224" fill="#294d3c" font-family="Arial,sans-serif" font-size="66" font-weight="700" letter-spacing="-3">Useful software.</text>
<text x="66" y="301" fill="#a24f33" font-family="Arial,sans-serif" font-size="66" font-weight="700" letter-spacing="-3">A curious world.</text>
<text x="69" y="363" fill="#536659" font-family="Arial,sans-serif" font-size="22">Rithy Bondeth · Developer &amp; AI Engineer</text>
<text x="69" y="402" fill="#536659" font-family="Arial,sans-serif" font-size="20">Explore the work. Take the scenic route.</text>
<path d="M66 502h452" stroke="#294d3c" stroke-opacity=".2"/>
<text x="69" y="549" fill="#294d3c" font-family="monospace" font-size="20">3d.bondeth.dev</text>
<text x="69" y="580" fill="#536659" font-family="Arial,sans-serif" font-size="15">Made in Phnom Penh, Cambodia</text>
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
<text x="990" y="558" fill="#536659" font-family="monospace" font-size="12">17 PROJECTS / 4 DISTRICTS</text>
</svg>`;
await writeFile("public/social-preview.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("public/social-preview.png");
