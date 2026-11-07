---
name: Kinetic Obsidian
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#bbc9cf'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#859399'
  outline-variant: '#3c494e'
  surface-tint: '#47d6ff'
  primary: '#a5e7ff'
  on-primary: '#003543'
  primary-container: '#00d2ff'
  on-primary-container: '#00566a'
  inverse-primary: '#00677f'
  secondary: '#b4c5ff'
  on-secondary: '#002a78'
  secondary-container: '#0053db'
  on-secondary-container: '#cdd7ff'
  tertiary: '#beee00'
  on-tertiary: '#283500'
  tertiary-container: '#a6d000'
  on-tertiary-container: '#435500'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b6ebff'
  primary-fixed-dim: '#47d6ff'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#c3f400'
  tertiary-fixed-dim: '#abd600'
  on-tertiary-fixed: '#161e00'
  on-tertiary-fixed-variant: '#3c4d00'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 54px
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses a high-performance, futuristic athletic mindset. Crafted for athletes, powerlifters, and high-intensity fitness trackers, the visual language balances disciplined restraint with high-output intensity. The interface communicates speed, tactical precision, and measurable biological feedback.

The style synthesizes high-contrast dark mode with technical glassmorphism. Deep obsidian and void-black foundations eliminate cognitive clutter, allowing hyper-vibrant electric cyan and energetic neon accents to drive immediate visual priority. Glass-morphic surface plates, micro-glow borders, and crisp tabular metrics emulate precision telemetry gear and heads-up tactical training displays.

## Colors

The palette is engineered around luminous high-visibility accents set against light-absorbing obsidian foundations:

- **Primary (`#00D2FF`)**: Electric Cyan. Signals interactive energy, primary active states, focus timers, and forward progression.
- **Secondary (`#2563EB`)**: Electric Azure. Used for structural elevation, inactive track outlines, selected segmented state fills, and supportive brand depth.
- **Tertiary (`#CCFF00`)**: High-Voltage Lime. Reserved for explosive physiological states, personal records, live heart-rate alerts, and completed set milestones.
- **Neutral Base (`#090D16` / `#030712`)**: Deep Midnight Obsidian. Serves as the bedrock surface layer, anchoring visual comfort during low-light training spaces.

### Surface System
- `surface-canvas`: `#030712` (True deep void base)
- `surface-card`: `rgba(9, 13, 22, 0.72)` (Translucent midnight layer with blur)
- `surface-elevated`: `rgba(17, 24, 39, 0.8)` (Floating telemetry modules and bottom sheets)
- `border-subtle`: `rgba(255, 255, 255, 0.08)`
- `border-active`: `rgba(0, 210, 255, 0.5)` with micro-glow drop-shadow

## Typography

The typographic hierarchy relies on Plus Jakarta Sans for all structural text, headlines, and control labels, delivering high readability with geometric optimism and clean modern authority. 

When presenting digital readouts, rep intervals, heart rates, rest countdowns, and real-time biometric metrics, use standard monospaced formatting (`JetBrains Mono` or tabular numerals) to prevent layout shifts during live ticker animations. All operational labels use uppercase tracking (`letter-spacing: 0.05em`) to evoke sports telemetry.

## Layout & Spacing

The layout is built upon an 8-point rhythmic grid with an aggressive fluid responsive structure. Mobile screens leverage single-column modular stacks with fixed thumb-zone ergonomics for gym-floor interaction.

- **Mobile (< 768px)**: 4-column fluid layout with a base 16px gutter and edge margin. Interactive touch targets mandate at least 48px hit areas for one-handed operation mid-exercise.
- **Tablet (768px - 1024px)**: 8-column layout with 24px gutters. Splits active session telemetry from exercise drill logs.
- **Desktop (> 1024px)**: 12-column telemetry dashboard with 32px gutters and 48px margins, centering workout builder sequences and telemetry data streams.

## Elevation & Depth

Depth is established without mud or visual noise by blending glassmorphic translucency, selective light blooms, and edge luminance:

- **Level 0 (Floor)**: Canvas background `#030712` with subtle radial gradient blooms of `#00D2FF` at 4% opacity anchored to active corners.
- **Level 1 (Card Plate)**: Background `rgba(9, 13, 22, 0.70)`, backdrop-filter `blur(16px)`, border `1px solid rgba(255, 255, 255, 0.07)`.
- **Level 2 (Interactive Floating)**: Background `rgba(15, 23, 42, 0.85)`, backdrop-filter `blur(20px)`, border `1px solid rgba(0, 210, 255, 0.25)`, drop-shadow `0 8px 32px rgba(0, 0, 0, 0.6)`.
- **Level 3 (Focused / Active Telemetry)**: Outer bloom `0 0 20px rgba(0, 210, 255, 0.35)`, border `1px solid #00D2FF`, interior ambient gradient highlighting live biometric tracking.

## Shapes

The design uses rounded geometry (`roundedness: 2`). Base interactive containers utilize a clean 8px radius (`0.5rem`), while standard workout cards and floating sheets step up to 16px (`1rem`), and modal wrappers implement 24px (`1.5rem`).

Pill-radii (`9999px`) are strictly reserved for state chips, status badges, counter trackers, and floating workout start triggers to ensure high-priority calls-to-action remain instantly recognizable.

## Components

### Buttons
- **Primary Button**: Solid Electric Cyan (`#00D2FF`) with deep dark text (`#030712`), semibold weight, rounded-md (8px) or pill (for bottom action sheets). Interactive state produces a glowing box-shadow (`0 0 16px rgba(0, 210, 255, 0.45)`).
- **Secondary Button**: Translucent obsidian fill (`rgba(255, 255, 255, 0.05)`), border `1px solid rgba(0, 210, 255, 0.35)`, text `#00D2FF`.
- **Destructive/Halt Button**: Dark crimson tint fill with border `1px solid rgba(239, 68, 68, 0.4)`, text `#EF4444`.

### Workout Chips & Status Badges
- Pill-shaped badges using semi-transparent backgrounds (`rgba(0, 210, 255, 0.1)`) with vivid 1px borders and uppercase `label-sm` typography. 
- Rest Timer Chip uses Tertiary Lime (`#CCFF00`) border and text to signal urgency.

### Cards & Modules
- Glassmorphic panels backed by `rgba(9, 13, 22, 0.75)` with `16px` border radii. 
- Workout cards include a top metric ribbon showing Target Sets, Reps, and Current Weight via tabular figures.

### Form Inputs & Exercise Steppers
- Inactive state: Deep void base `#030712` with 1px border `rgba(255, 255, 255, 0.12)`, text `#FFFFFF`.
- Active / Focus: Border `#00D2FF` with `0 0 8px rgba(0, 210, 255, 0.3)`.
- Numeric steppers: Prominent +/- buttons with minimum 48px square touch points for sweat-resistant manipulation.

### Checkboxes & Set Completion Radios
- Square-rounded checkboxes (`6px` radius). Completed sets trigger an instantaneous shift from dark slate border to solid `#CCFF00` or `#00D2FF` fill with an animated micro-burst tick icon.

### Live Workout Execution Deck (Domain-Specific)
- Sticky bottom execution bar showing interval progress bars, audio cue toggles, and tap-to-complete giant action triggers designed for effortless thumb reach while moving.