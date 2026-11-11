# Design System — Tuition Manager

How the app should look and feel. Read this before building any UI task in [PLAN.md](PLAN.md).

**Base:** the Cal.com design analysis from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/cal) (MIT licence). That file describes a marketing website, so this document keeps its tokens (colour, type, radius, spacing, elevation) and replaces the marketing components (hero, pricing, testimonials, footer) with what an admin dashboard needs. Sections marked **(added)** are not in the source.

**Not a clone:** the goal is the same calm, near-monochrome feel, not Cal.com's identity. No Cal.com logo, wordmark or copy.

---

## 1. Principles

1. **Monochrome actions.** Primary buttons are near-black (white in dark mode). Colour is never used to make a button "pop".
2. **Colour means status.** Green, amber, red and the badge pastels appear only where they carry meaning: paid, late, absent, discount type.
3. **Flat and quiet.** Hairline borders and soft grey surfaces do the separating. Shadows are faint and rare.
4. **Dense where it is data, generous where it is not.** Tables are compact. Page padding, cards and forms breathe.
5. **One primary action per view.** "Add student" is primary. Everything else on that page is secondary or a text link.

## 2. Colour tokens

Never write a hex value in a component. Use the shadcn CSS variable through its Tailwind class (`bg-primary`, `text-muted-foreground`, `border-border`).

### Light (from source)

| Role                                            | Hex       | shadcn variable                                                                                                                      |
| ----------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Page background                                 | `#ffffff` | `--background`                                                                                                                       |
| Headings, primary text                          | `#111111` | `--foreground`                                                                                                                       |
| Body text                                       | `#374151` | `--body` (custom variable, Tailwind class `text-body`). Not `text-foreground/80`, which gives a translucent `#111111`, not this grey |
| Secondary text                                  | `#6b7280` | `--muted-foreground`                                                                                                                 |
| Soft surface (sidebar, table header, tab group) | `#f8f9fa` | `--muted`, `--sidebar`                                                                                                               |
| Card surface (stat cards, empty states)         | `#f5f5f5` | `--secondary`, `--accent`                                                                                                            |
| Border, divider, input border                   | `#e5e7eb` | `--border`, `--input`                                                                                                                |
| Subtle divider                                  | `#f3f4f6` | —                                                                                                                                    |
| Primary button                                  | `#111111` | `--primary`                                                                                                                          |
| Primary button pressed                          | `#242424` | —                                                                                                                                    |
| Text on primary                                 | `#ffffff` | `--primary-foreground`                                                                                                               |
| Focus ring                                      | `#111111` | `--ring`                                                                                                                             |
| Link / info accent (rare)                       | `#3b82f6` | `--chart-1`                                                                                                                          |
| Success                                         | `#10b981` | `--success`                                                                                                                          |
| Warning                                         | `#f59e0b` | `--warning`                                                                                                                          |
| Error                                           | `#ef4444` | `--destructive`                                                                                                                      |

Success, warning and error at these values are for fills, icons and borders only. As text on white, `#10b981` and `#f59e0b` fail WCAG AA. Status text uses the badge text shades in the status table below.

### Dark (added)

The source has no dark theme. These values extend its two dark surface tokens (`#101010`, `#1a1a1a`).

| Role                                     | Hex                               |
| ---------------------------------------- | --------------------------------- |
| Page background                          | `#101010`                         |
| Raised surface (cards, sidebar, dialogs) | `#1a1a1a`                         |
| Soft surface (table header, hover row)   | `#222222`                         |
| Border, input border                     | `#2e2e2e`                         |
| Headings, primary text                   | `#fafafa`                         |
| Body text (`--body`)                     | `#d4d4d8`                         |
| Secondary text                           | `#a1a1aa`                         |
| Primary button                           | `#fafafa` with `#111111` text     |
| Focus ring                               | `#fafafa`                         |
| Success / Warning / Error                | `#34d399` / `#fbbf24` / `#f87171` |

Check every text and background pair for WCAG AA contrast (4.5:1 for body text) in both themes.

### Status colours (added)

Every status is a badge with a tinted background, a text label and, where space allows, an icon. Never colour alone.

| Meaning                 | Base colour       | Badge text (light)   | Badge text (dark)    |
| ----------------------- | ----------------- | -------------------- | -------------------- |
| Present, Paid, Active   | Success `#10b981` | `#047857`            | `#6ee7b7`            |
| Late, Partially paid    | Warning `#f59e0b` | `#b45309`            | `#fcd34d`            |
| Absent, Unpaid, Overdue | Error `#ef4444`   | `#b91c1c`            | `#fca5a5`            |
| Inactive                | Neutral grey      | `--muted-foreground` | `--muted-foreground` |
| Discount: half card     | Violet `#8b5cf6`  | `#6d28d9`            | `#c4b5fd`            |
| Discount: free card     | Pink `#ec4899`    | `#be185d`            | `#f9a8d4`            |
| Discount: custom        | Orange `#fb923c`  | `#c2410c`            | `#fdba74`            |

Badge background is the base colour at about 12% opacity. Badge text uses the shade from the table, set as CSS variables (for example `--success-foreground`), never as hex in a component. Each text shade should reach 4.5:1 on its tinted badge background in its theme. Confirm this with a contrast checker in T-006.

### Charts (added)

Series order: `#3b82f6`, `#8b5cf6`, `#34d399`, `#fb923c`, `#ec4899`. Grid lines use the border colour. A single-series chart uses the first colour only.

## 3. Typography

| Token      | Size | Weight | Line height | Tracking | Use in this app                              |
| ---------- | ---- | ------ | ----------- | -------- | -------------------------------------------- |
| display-sm | 28px | 600    | 1.2         | -0.5px   | Page title (`h1`), big numbers on stat cards |
| title-lg   | 22px | 600    | 1.3         | -0.3px   | Section heading, dialog title                |
| title-md   | 18px | 600    | 1.4         | 0        | Card title                                   |
| title-sm   | 16px | 600    | 1.4         | 0        | Sub-heading, list label                      |
| body-md    | 16px | 400    | 1.5         | 0        | Form inputs, paragraphs                      |
| body-sm    | 14px | 400    | 1.5         | 0        | Table cells, sidebar links, helper text      |
| caption    | 13px | 500    | 1.4         | 0        | Badges, table headers, timestamps            |
| button     | 14px | 600    | 1           | 0        | Button labels                                |

The source's larger display sizes (36px to 64px) are for marketing heroes. Do not use them here. The login page title may go up to 36px.

**Fonts**

- **Inter** for everything. Page titles use weight 600 with tight tracking, which is the substitute the source recommends for Cal Sans.
- **Noto Sans Sinhala** as the next font in the stack **(added)**. Inter has no Sinhala glyphs.
- **JetBrains Mono** for admission numbers and receipt numbers.
- Numbers in tables and totals use `tabular-nums` so columns line up **(added)**.

**Sinhala rules (added)**

- Line height 1.6 or more. Sinhala vowel signs sit above and below the line and clip at 1.2.
- No negative letter-spacing on Sinhala text. Tracking is set per locale.
- Never truncate a Sinhala label mid-word. Let it wrap.
- Expect Sinhala strings to be about 30% wider than English. Buttons and table headers must cope.

## 4. Shape, spacing, elevation

**Radius**

| Value  | Use                                                               |
| ------ | ----------------------------------------------------------------- |
| 6px    | Dropdown items, small inline buttons, table row actions           |
| 8px    | Buttons, inputs, selects, tabs. Set shadcn `--radius` to `0.5rem` |
| 12px   | Cards, dialogs, popovers, table container                         |
| 9999px | Badges, avatars, segmented control                                |

Nothing above 12px inside the app.

**Spacing:** 4px base. Use 4, 8, 12, 16, 24, 32, 48.

- Page padding: 24px desktop, 16px mobile.
- Gap between page sections: 32px.
- Card padding: 24px.
- Gap between cards in a grid: 24px desktop, 16px mobile.
- Form field gap: 16px. Label to input: 8px.

**Elevation**

| Level    | Treatment                     | Use                                   |
| -------- | ----------------------------- | ------------------------------------- |
| Flat     | No border, no shadow          | Page, sidebar, header                 |
| Hairline | 1px border                    | Cards, inputs, table container        |
| Soft     | `0 1px 2px rgba(0,0,0,0.05)`  | Active segment in a segmented control |
| Raised   | `0 4px 12px rgba(0,0,0,0.08)` | Dropdowns, popovers, dialogs          |

In dark mode, raise with a lighter surface instead of a shadow.

## 5. Components

Built from shadcn/ui and restyled with the tokens above.

### From the source

- **Primary button:** `--primary` background, 40px tall, 8px radius, 14px/600 label. Pressed state is slightly lighter. Disabled is grey surface with muted text.
- **Secondary button:** background colour, 1px border, same size.
- **Icon button:** 36px circle with a border. Always has an `aria-label`.
- **Text input:** 40px tall, 8px radius, 1px border. On focus the border becomes the foreground colour with a visible ring.
- **Segmented control (the source's "nav-pill-group"):** pill-shaped soft-grey wrapper with 6px padding. The active segment is a background-coloured pill with the soft shadow. Use for present / absent / late, paid / unpaid / all, and month or week switches.
- **Badge:** pill, 13px/500, 4px by 12px padding.
- **Avatar:** 36px circle with initials on a pastel fill. Derive the pastel from the student's id so it stays the same.

### Added for the dashboard

- **Sidebar:** 240px wide, soft surface, 1px right border. Links are 14px/500 with a 20px icon. Active link has a card-surface background and foreground text. Becomes a drawer under 768px.
- **Header:** 56px tall, background colour, 1px bottom border. Holds the mobile menu button, breadcrumb, language switch, theme switch and user menu.
- **Page header:** page title, one line of muted description, primary action on the right. Stacks on mobile.
- **Stat card:** 12px radius, 1px border, 24px padding. Caption label, big number in display-sm with `tabular-nums`, optional muted comparison line.
- **Data table:** inside a 12px-radius bordered container. Header row on soft surface, 13px/500 muted labels. Rows 48px tall with a hairline divider and a soft hover background. Numbers right-aligned. Row actions in a "more" menu at the end.
- **Form layout:** single column, max width 560px. Related fields may sit two-up on desktop. Error text sits under the field in the error colour with an icon, and the input border turns the error colour.
- **Dialog:** 12px radius, max width 480px, raised elevation. Title, short description, actions bottom right with the primary on the right. Destructive confirmation uses the destructive button variant.
- **Empty state:** centred in the content area. Muted icon, title-md heading, one muted sentence, one primary action.
- **Loading:** skeleton blocks that match the final layout. No full-page spinners.
- **Toast:** bottom right on desktop, top on mobile. Success and error variants with an icon.
- **Attendance grid:** sticky first column for student names, one narrow column per session date. Each cell shows a status mark: a filled dot for present, a ring for late, a cross for absent, each with an accessible label.
- **Timetable block:** 8px radius, pastel background at low opacity with a 3px left border in the full colour. Shows subject, grade and time. Colour is assigned per subject.
- **Receipt:** always printed in the light palette on white, regardless of the active theme.

## 6. Responsive

| Width         | Layout                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Under 768px   | Sidebar is a drawer. One column. Tables scroll sideways inside their container. Stat cards two-up. |
| 768 to 1024px | Sidebar collapses to icons. Stat cards two-up.                                                     |
| Over 1024px   | Full sidebar. Stat cards four-up. Content max width 1200px.                                        |

Touch targets are at least 40 by 40px. The 36px icon button gets extra padding on touch screens.

## 7. Do and don't

**Do**

- Use near-black (white in dark mode) for the single primary action on a page.
- Use borders and soft grey surfaces to group things.
- Pair every status colour with text.
- Keep page titles at weight 600.

**Don't**

- Don't use blue, green or any accent on a primary button.
- Don't put a shadow on a card that is not floating.
- Don't use a radius above 12px.
- Don't use more than one primary button in a view.
- Don't add gradients, glass effects or decorative illustrations.

## 8. Motion (added)

- 150ms ease-out for hover, focus and segmented control changes. 200ms for dialogs and drawers.
- Respect `prefers-reduced-motion`: disable transitions and skeleton shimmer.
