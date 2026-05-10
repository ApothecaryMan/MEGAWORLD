---
name: megaworld-design
description: A specialized design engine for the MEGAWORLD project, enforcing Pure Flat (no shadows) and Instant (no transitions) aesthetics.
---

# MEGAWORLD Design Engine (Pure Flat)

This skill enforces the visual and technical standards of the MEGAWORLD project. Use this for all UI development in this repository.

## Design Philosophy
- **Pure Flat**: ABSOLUTELY NO shadows (`box-shadow`, `text-shadow`) or gradients.
- **Instant Response**: NO transitions or animations (`transition: none !important`).
- **Typography-First**: Focused on high-quality Arabic reading experiences.

## Technical Specifications
### Colors & Borders
- **BG Primary**: `--color-background-primary` (e.g., `#f5f3f0` for Default, `#1a1a2e` for Night).
- **Text Primary**: `--color-text-primary`.
- **Standard Border**: `1px solid rgba(128,128,128, 0.35)`.
- **Radius**: `0px` (Strictly square).

### Typography
- **UI**: `'Outfit'`, `'Inter'`. Size: `13px`.
- **Reading**: `'Amiri'`. Line-height: `2.2`.

### Components
- **Buttons (`.btn-flat`)**: Color swap on hover/active. Height: `28px`.
- **Icons (`.btn-icon`)**: Opacity jump (0.5 to 1.0) on hover.

## Rules for the Agent
- Use CSS variables for all colors.
- Ensure RTL compatibility using logical properties.
- Keep UI compact and density high.
