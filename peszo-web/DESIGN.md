# PesZO Design System

This project uses a dark-first "carbon and gold" visual system. Interfaces should feel like a premium financial terminal — disciplined, data-dense, precise, and authoritative. The gold accent appears sparingly, like a signature on a serious document.

---

## Stack

- Framework: React 18 + TypeScript + Vite
- Styling: Tailwind CSS with custom design tokens
- Components: shadcn/ui primitives
- Icons: Lucide React
- Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (all numbers)
- Dark mode: Dark only — no light mode
- Utilities: cn() from src/utils/cn.ts

---

## Visual Direction

PesZO is a financial life simulator, not a generic SaaS dashboard or a gamified quiz app.

- Use warm dark backgrounds with brown undertones — never cold blue-tinted dark, never pure black
- Gold accent appears in ONE place per screen — active nav item, primary CTA, XP rewards
- Data elements are sharp — 0px border radius
- Interactive elements have 4px — just enough to feel clickable
- Borders define elements — no box shadows anywhere
- Numbers always render in JetBrains Mono — this single rule makes the app feel financial
- Avoid anything that reads as game UI — the financial data must always feel serious

Reference energy: Bloomberg Terminal discipline, Dragonfly dark mode restraint, Linear spacing and typography hierarchy.

---

## Color Tokens

All tokens defined in src/design-system/tokens.ts and mapped to Tailwind in tailwind.config.ts. Never use raw hex values in component files — always use the Tailwind token name.

### Backgrounds

base: #0C0A08 — page canvas, warm near-black
surface1: #141210 — cards and panels
surface2: #1C1917 — elevated elements, modals
surface3: #242220 — tooltips, highest elevation

### Borders

borderSubtle: #2C2925 — subtle dividers, card borders
borderDefault: #3C3835 — inputs, interactive borders
borderStrong: #4C4844 — emphasized borders

### Text

textPrimary: #F5F0E8 — warm white, primary content
textSecondary: #8C8680 — supporting text, labels
textMuted: #4C4844 — disabled, placeholder

### Gold Accent

goldMuted: #C9A84C — primary usage, most common
goldDefault: #D4B357 — hover states
goldBright: #E8C876 — highlights
goldGlow: #C9A84C18 — subtle glow on active quest cards only

### Semantic Colors

success: #4ADE80 — gains, positive events, completed quests
danger: #F87171 — losses, debt alerts, errors
warning: #FBBF24 — caution states, medium risk debt
info: #60A5FA — neutral information

---

## Typography

Three fonts. Each has a strict role. Never use a font outside its assigned role.

### Space Grotesk — headings only

Used for page titles, section headings, quest titles, card headings.
Never for body text, labels, or numbers.
Tailwind class: font-heading

### Inter — body and labels

Used for body text, descriptions, labels, nav items, button text, badges.
Never for numbers or headings.
Tailwind class: font-body

### JetBrains Mono — ALL numbers, no exceptions

Used for every peso amount (₱45,000), every percentage (36.7%), every numerical metric, simulation month labels, asset prices, XP values.
Never for body text, headings, or labels.
Tailwind class: font-mono
Rule: if it is a number — it is JetBrains Mono. No exceptions anywhere in the app.

### Type Scale

xs: 11px — badges, captions, uppercase labels
sm: 13px — secondary body, table cells
base: 15px — primary body text
lg: 17px — emphasized body
xl: 20px — section headings
2xl: 24px — page headings
3xl: 32px — hero numbers, net worth display
4xl: 48px — full-screen metric displays

---

## Border Radius

Strict rules. Not suggestions.

0px — ALL data elements: metric cards, data tables, table rows, simulation event lists
4px (rounded-sm) — ALL interactive elements: buttons, inputs, nav items, badges, filter tabs
6px (rounded-md) — larger containers: quest panels, modal dialogs, insight cards
9999px (rounded-full) — pill badges only when pill shape is specifically needed

Never use rounded-lg (8px) or larger on any element in this project.

---

## Spacing Scale

4px — tight internal spacing
8px — between label and value inside a card
12px — between related elements
16px — padding inside cards
24px — between card sections
32px — page padding
48px — between major page sections
64px — hero spacing on onboarding

---

## Shadows and Depth

Borders define elements. Not shadows. Box shadows are banned with one exception.

Default: no shadow — the border defines the card.
Exception: active gold glow on quest choice cards only — box-shadow: 0 0 20px #C9A84C18

Never use drop shadows, card shadows, or elevation shadows anywhere else.

---

## Components

### Metric Card

Used on Dashboard, Budget, Portfolio, Liabilities, Simulation screens.

Background: bg-surface1
Border: border border-borderSubtle
Radius: 0px — sharp corners always
Padding: p-5
Label: font-body text-xs text-secondary uppercase tracking-wider
Value: font-mono text-3xl text-primary
Trend positive: font-body text-xs text-success
Trend negative: font-body text-xs text-danger
Trend neutral: font-body text-xs text-secondary

All four cards on a screen must have identical treatment — never highlight one card differently from the others.

### Insight Card

Used on Budget, Portfolio, Liabilities, Simulation. The card with a colored left border giving the player an actionable insight.

Background: bg-surface2
Border: border border-borderDefault
Left border gold (#C9A84C): general insight
Left border danger (#F87171): debt alert
Left border warning (#FBBF24): caution
Radius: 0px
Padding: p-4
Label: font-body text-xs uppercase tracking-wider — same color as left border
Body: font-body text-sm text-secondary leading-relaxed

### Primary Button

Background: bg-gold (#C9A84C)
Text: font-body text-sm font-bold uppercase text-base
Radius: rounded-sm (4px)
Padding: px-4 py-2
Hover: bg-goldDefault (#D4B357)
Never use gradients, shadows, or rounded-lg or larger.

### Secondary Button

Background: bg-surface2
Border: border border-borderDefault
Text: font-body text-sm text-primary
Radius: rounded-sm (4px)
Hover: border-borderStrong

### Input

Background: bg-surface1
Border: border border-borderDefault
Radius: rounded-sm (4px)
Height: h-11 standard, h-16 for hero peso inputs
Focus: border-gold — no ring, border color change only
Peso inputs: ₱ prefix in text-gold font-mono text-2xl, value in font-mono text-2xl text-primary

### Navigation Item

Height: h-11 (44px)
Padding: px-4
Inactive: text-secondary, no background
Active: bg-surface2 + border-l-[3px] border-gold + text-primary
Both background fill AND left border always together — never just one alone.

### Badge

Background: bg-surface3
Border: border border-borderSubtle
Text: font-body text-xs uppercase tracking-wider
Radius: rounded-sm (4px)
Success variant: text-success border-success/30 bg-success/10
Danger variant: text-danger border-danger/30 bg-danger/10
Warning variant: text-warning border-warning/30 bg-warning/10
Gold variant: text-gold border-gold/30 bg-gold/10
Neutral variant: text-secondary border-borderDefault bg-surface3

### Quest Choice Card

The decision cards on the Quest screen. The one place hover glow is allowed.

Background: bg-surface1
Border: border border-borderDefault
Radius: rounded-md (6px)
Padding: p-4
Title: font-body text-base text-primary font-semibold
Description: font-body text-sm text-secondary
Hover: border-gold + box-shadow: 0 0 16px #C9A84C18

### Dashboard-Specific Component Treatments

These treatments apply only to the Dashboard screen. They are different from the real Quest screen's treatments.

Quest widget (Dashboard preview, NOT the real Quest screen): active quest gets border-t-2 border-gold plus a small gold dot + "ACTIVE QUEST" uppercase label above the title. This is DIFFERENT from the Quest Choice Card's hover-glow treatment (which is reserved for the actual Quest screen's choice cards). The Dashboard version is a static preview/link, not an interactive choice card.

Health Score: rendered as a circular SVG progress ring (ProgressRing component in src/design-system/components/ProgressRing.tsx), not plain text and not a pie chart. A single-value gauge is a different pattern from the pie-chart ban already in Forbidden Patterns.

Metric card trend indicators: positive/negative comparison text below the value, using existing success/danger tokens. For expense-type metrics specifically, the color logic is INVERTED - an increase in expenses shows as danger/red, a decrease shows as success/green. The opposite of income-type metrics. This must be implemented via an invertTrend flag, not a naive "positive number = green" rule.

---

## Layout

### App Shell

Fixed left sidebar: w-60 (240px)
Sidebar background: bg-surface1
Sidebar right border: border-r border-borderSubtle
Main content: flex-1 overflow-y-auto bg-base
Full height: h-screen overflow-hidden flex

### Page Structure

Page padding: p-8 (32px all sides)
Top bar: flex items-center justify-between pb-6 mb-6 border-b border-borderSubtle
Page title: font-heading text-xl text-primary
Month badge: bg-surface2 border border-borderDefault font-body text-sm text-secondary px-3 py-1.5 rounded-sm

### Grid Patterns

4 metric cards: grid grid-cols-4 gap-4
Dashboard main content: grid grid-cols-5 gap-6 — quest panel col-span-3, health score col-span-2
Budget and Portfolio: grid grid-cols-[55fr_45fr] gap-6
Quest screen: flex — left panel fixed w-[380px] + flex-1 right panel
Two equal columns: grid grid-cols-2 gap-6

### Sidebar Bottom

Border top: border-t border-borderSubtle
Advance Month button: mx-4 bg-gold text-base font-bold uppercase h-11 rounded-sm font-body text-sm
Player info row: flex justify-between px-4 py-2 font-body text-xs text-secondary

### Login/Register Exception - Split Hero Layout

Login and Register (and ONLY these two screens - no other screen in the app) use a two-panel layout instead of the standard app-shell pattern. This is a deliberate, scoped exception.

Left panel: 50% width, intentionally uses a LIGHT background (authPanelLight token, #FFFFFF) - a scoped, deliberate exception to the "dark mode only, no light mode" rule. This token is not to be reused anywhere else. Contains: PesZO wordmark, tagline "Stop pestering zero." with supporting subcopy, and the piggy mascot image, bottom-anchored.
Right panel: 50% width, bg-base, contains the actual login/register form (standard Card/Input/Button treatment).
On mobile (below md breakpoint), the left panel is hidden entirely - mobile users see only the standard centered card layout.

This exception exists because Login/Register are the only two screens outside the main app shell, designed live without a Stitch mockup, and treated as a deliberate one-time hero moment rather than part of the ongoing dark app experience.

---

## Interaction

Hover on cards: border color change only — never background change, never transform
Active nav item: bg-surface2 + border-l-[3px] border-gold — both properties always together
Focus visible: border-gold — no focus ring, border color handles focus state
Disabled: opacity-50 pointer-events-none
Quest card hover: border-gold + gold glow — the one exception where glow is allowed
Advance Month button: the primary action of the entire app, only element with full gold background

Keep motion minimal. No decorative animations. No page entrance animations. No hover transforms except quest choice cards.

ProgressRing fill animation is a deliberate, narrow exception to "no page entrance animations" - justified as feedback tied to a real state change (the score itself), not decoration. It respects prefers-reduced-motion per the accessibility rule below. This is the ONLY animated element in the app besides the existing quest-card hover glow exception.

---

## Forbidden Patterns

Never use these in PesZO under any circumstance:

- Pure black #000000 anywhere in the app
- Blue or purple accents
- Gradients of any kind
- Box shadows except the quest card gold glow
- rounded-lg (8px) or larger on any element
- Emojis in UI text, button labels, or code comments
- Pie charts — use horizontal bars or stacked bars instead
- Cold blue-tinted dark backgrounds
- Bright saturated gold — always use #C9A84C muted gold
- White backgrounds or light mode of any kind
- Raw hex values written directly in component className strings
- Multiple accent colors competing on the same screen
- Striped table rows — use borders only between rows

---

## Accessibility

- Maintain visible focus state on all interactive elements using border-gold
- Keep text contrast high — textPrimary (#F5F0E8) on base (#0C0A08) always passes WCAG AA
- Use semantic HTML — button for actions, a for navigation links
- All icons that carry meaning alone must have aria-label
- Respect prefers-reduced-motion — wrap any animation in a media query check
- Touch targets minimum 44px height — all nav items and buttons already follow this
