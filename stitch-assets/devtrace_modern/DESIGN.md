---
name: DevTrace Modern
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#40484e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#70787e'
  outline-variant: '#c0c7cf'
  surface-tint: '#1b6489'
  primary: '#00405b'
  on-primary: '#ffffff'
  primary-container: '#00587c'
  on-primary-container: '#8fcdf6'
  inverse-primary: '#8fcef7'
  secondary: '#45636d'
  on-secondary: '#ffffff'
  secondary-container: '#c8e8f4'
  on-secondary-container: '#4b6973'
  tertiary: '#7d0008'
  on-tertiary: '#ffffff'
  tertiary-container: '#a9000f'
  on-tertiary-container: '#ffb3aa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7e7ff'
  primary-fixed-dim: '#8fcef7'
  on-primary-fixed: '#001e2e'
  on-primary-fixed-variant: '#004c6c'
  secondary-fixed: '#c8e8f4'
  secondary-fixed-dim: '#accbd8'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#2d4b55'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.01em
  code-data:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for high-end technical environments, balancing clinical precision with a sophisticated, premium aesthetic. It targets developers and technical stakeholders who require clarity without sacrificing visual appeal.

The design style is **Corporate Modern with Glassmorphic accents**. It utilizes a "Layered Technical" approach: high-density data is housed within soft, approachable containers. The interface evokes a sense of reliability and depth through the use of subtle background blurs on navigation elements and extremely refined typography. The emotional response should be one of "effortless control"—complex data made to feel light and manageable.

## Colors

The palette is anchored by **Deep Blue (#00587C)**, which represents authority and high-importance actions. **Soft Blue (#A6C5D1)** is used for secondary interactive surfaces, providing a gentle contrast that prevents visual fatigue.

**Backgrounds** must avoid pure white. Use a cool, systematic gray (#F8FAFC) for the base canvas to reduce glare and emphasize depth. **Alert Red (#DC2626)** is reserved strictly for destructive actions and critical system failures. For text, use a dark slate (#1E293B) to maintain high legibility against the cool gray backgrounds.

## Typography

This design system utilizes **Inter** for all primary UI elements, favoring a slightly tighter tracking for headlines and a more generous, legible tracking for body copy. 

For technical data, logs, and metadata, use **Geist** to provide a distinct "developer-centric" feel that differentiates raw data from the UI chrome. Headlines should always use a medium-to-bold weight to establish a clear hierarchy. For mobile devices, `display-lg` should be scaled down to 32px to ensure full visibility without excessive wrapping.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure on desktop. A consistent 8px rhythmic scale drives all padding and margins, ensuring a mathematical harmony across the interface.

**Desktop:** 32px outer margins with 24px gutters. The sidebar is fixed at 280px.
**Tablet:** 24px outer margins with 16px gutters.
**Mobile:** 16px outer margins. The sidebar transitions to a full-screen overlay.

Use generous internal padding (16px–24px) for cards to create a "spacious" feel, even when the underlying data density is high. Tables should use a "Compact-Luxury" approach: 12px vertical cell padding but 20px horizontal padding to allow the eye to track rows easily.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Tonal Layering**. 

1.  **Canvas (Level 0):** The #F8FAFC background.
2.  **Surface (Level 1):** White (#FFFFFF) cards and containers. These use a soft, diffuse shadow: `0 4px 20px -2px rgba(0, 88, 124, 0.08)`.
3.  **Overlay (Level 2):** Menus and Popovers. These utilize a Backdrop Blur (12px) with 95% opacity white to create a glassmorphic effect.
4.  **Floating (Level 3):** Tooltips and Notifications. Use a more pronounced shadow with a hint of the Primary Deep Blue to indicate interaction.

Navigation sidebars should be visually separated from the main content canvas by a subtle vertical line or a slight 2px offset with a soft shadow, rather than a heavy background color change.

## Shapes

The shape language is defined by **Rounded (12px)** corners for all primary containers, including cards, modals, and input fields. 

- Use **6px (Soft)** for smaller inner elements like nested buttons or tags within a card.
- Use **Full (Pill)** for status indicators and primary action buttons to make them instantly recognizable as interactive elements.
- Form inputs must match the 12px container rounding to maintain a cohesive visual "stack."

## Components

**Buttons:** 
- *Primary:* Deep Blue (#00587C) background, white text, pill-shaped.
- *Secondary:* Soft Blue (#A6C5D1) background with Deep Blue text.
- *Ghost:* No background, Deep Blue text, 12px radius.

**Cards:** 
Always white background (#FFFFFF) with a 1px border (#E2E8F0) and the Level 1 shadow. Headers within cards should have a subtle bottom border and use `headline-md` typography.

**Sidebar Navigation:** 
The sidebar should feel lightweight. Use active states that employ a Soft Blue (#A6C5D1) background at 20% opacity with a Deep Blue vertical "pill" indicator on the left edge.

**Tables:** 
Row-based layout with no vertical borders. Use a subtle hover state (#F1F5F9). Headers must use `label-caps` for maximum clarity.

**Input Fields:** 
12px rounded corners, 1px border (#CBD5E1). On focus, the border transitions to Deep Blue with a 3px outer glow in Soft Blue at 30% opacity.