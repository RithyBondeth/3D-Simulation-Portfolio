# Header and footer polish — 2026-10-13

Branch: `bondeth/header-footer-polish`.

The header now has a rounded navigation rail, a readable two-line identity on desktop, grouped Work/About navigation, and a framed view switch. Phones retain Work, view switching, and the normal-view theme control without overflow. Accessible button names match their visible labels.

The footer has an identity block, GitHub/Resume/Contact navigation, copyright and location, and Controls & credits or an entry back into the world. Driving uses a compact 54 px utility footer to preserve scene space.

Validation: 32 tests passed; TypeScript and production build passed, with the existing 3D chunk advisory. Browser checks verified 320 px and 390 px phone layouts without overflow, light/dark appearance, footer contact and help actions, normal/world switching, and driving footer sizing. No console errors observed. Screenshots: [desktop](header-footer-desktop.jpg), [phone](header-footer-mobile.jpg).
