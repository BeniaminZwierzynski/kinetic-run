# Design System: High-End Performance & Tonal Depth

## 1. Overview & Creative North Star: "The Kinetic Void"

This design system is built upon the concept of **"The Kinetic Void."** It moves beyond the static, boxed layouts of traditional fitness trackers to create an environment that feels as fluid and high-performance as the athletes using it. We are not just building an interface; we are crafting a digital cockpit for the modern runner.

The system breaks the "template" look through **intentional asymmetry** and **tonal layering**. By removing rigid borders and high-contrast dividers, we allow the content to breathe. Large-scale typography and overlapping elements create a sense of forward motion, while the deep, monochromatic palette provides a premium, "stealth" aesthetic that minimizes eye strain during early morning or late-night runs.

---

## 2. Colors: The Art of the Monolith

The palette is a sophisticated range of deep blacks, pure whites, and architectural grays. This is not a "dark mode" version of a light app; it is a dark-first experience designed for high-contrast legibility.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts or subtle tonal transitions. Use `surface-container-low` (#1B1B1B) against a `background` (#131313) to create a section. Lines feel like cages; tonal shifts feel like architecture.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, premium materials.
- **Base Layer:** `surface` (#131313).
- **Secondary Sectioning:** `surface-container-low` (#1B1B1B) or `surface-container` (#1F1F1F).
- **Interactive Elements:** `surface-container-high` (#2A2A2A) or `highest` (#353535).

### The "Glass & Gradient" Rule
To elevate the app above "flat" design, use Glassmorphism for floating UI (like a sticky run-tracking bar). 
- **Recipe:** `surface-variant` (#353535) at 60% opacity + 24px `backdrop-blur`.
- **Signature Gradients:** For primary CTAs (e.g., "Start Run"), use a subtle vertical gradient from `primary` (#FFFFFF) to `primary-container` (#D4D4D4). This adds a metallic, premium weight to the interaction.

---

## 3. Typography: Editorial Authority

We use two distinct sans-serif voices to balance performance data with lifestyle motivation.

*   **Display & Headlines (Lexend):** A modern, geometric sans-serif. Use `display-lg` (3.5rem) for primary run metrics (Distance, Pace) to give them an authoritative, "impossible to miss" presence. 
*   **Body & Labels (Manrope):** A high-readability sans-serif for secondary data and settings. 

**Hierarchy Strategy:**
*   **High Contrast:** Use `primary` (#FFFFFF) for headlines and `on-surface-variant` (#C6C6C6) for secondary labels. This 100:70 contrast ratio ensures the user’s eye hits the most important data first.
*   **Data Density:** In run-summaries, use `headline-lg` for the value and `label-md` (uppercase) for the unit to create a professional, editorial look.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "web 2.0." In this system, depth is achieved through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` (#0E0E0E) card on a `surface-container-low` (#1B1B1B) section. The slight "dip" in value creates a natural recess for content.
*   **Ambient Shadows:** If an element must float (e.g., a "Pause" button), use a shadow with a 40px blur, 0% spread, and 6% opacity using a tint of `on-surface`. It should feel like an atmospheric glow, not a shadow.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` (#474747) at **15% opacity**. Anything higher is too aggressive for this aesthetic.

---

## 5. Components

### Buttons: The "Pill" Standard
All buttons must use the `full` (9999px) roundedness scale. 
- **Primary:** `primary` (#FFFFFF) background with `on-primary` (#1A1C1C) text. 
- **Secondary:** `surface-container-highest` (#353535) background. 
- **Interaction:** On hover/tap, transition background colors with a `300ms cubic-bezier(0.4, 0, 0.2, 1)`.

### Cards: Soft Sculpting
Cards should use the `md` (1.5rem) or `lg` (2rem) roundedness scale. 
- **Rule:** Forbid divider lines within cards. Use `body-sm` text with increased tracking and `on-surface-variant` color to separate metadata from the title.

### Input Fields & Inputs
- **Modern Minimalist:** Inputs should be `surface-container-high` (#2A2A2A) with a `full` (pill) radius.
- **Focus State:** Instead of a thick border, use a subtle increase in brightness to `surface-bright` (#393939).

### Specialized Running Components
- **The Pace Ribbon:** A continuous horizontal scroll component using `surface-container-lowest` (#0E0E0E) with no gaps between items, creating a "film strip" of data.
- **Biometric Waveform:** For heart rate or elevation, use a stroke of `primary` (#FFFFFF) with a soft gradient fill that fades into the `surface` background.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. A wider left margin (e.g., 32px vs 24px) for headlines creates a sophisticated, editorial "stagger."
*   **Do** lean into white space. If you think there’s enough room, add 16px more.
*   **Do** use `lexend` for anything numeric. It is optimized for the clarity runners need while moving.

### Don’t
*   **Don't** use pure `#000000` for backgrounds. Use our `surface` (#131313) to avoid "black crush" and maintain detail in the shadows.
*   **Don't** use standard 1px dividers. If you need to separate content, use an 8px vertical gap or a change in `surface-container` tier.
*   **Don't** use bright accent colors (blues, oranges). This is a monochromatic system; use weight and scale, not color, to denote importance. Use `error` (#FFB4AB) only for critical warnings.