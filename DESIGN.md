---
name: Mario Lin Portfolio
description: A light personal portfolio about making ideas tangible.
colors:
  blue: "#0068d7"
  blue-hover: "#005fc5"
  ink: "#1d1d1f"
  secondary: "#65656b"
  white: "#fff"
  surface: "#f5f5f7"
  line: "#e5e5e8"
  project-stage: "#f1f3f4"
  interest-stage: "#f7f7f9"
  segmented-track: "#e4e7ea"
  round-control: "#f1f1f3"
  current-background: "#edf5ff"
  current-text: "#0063c7"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
    fontSize: "clamp(3.25rem,6.6vw,5.375rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-.04em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
    fontSize: "clamp(2.25rem,4.4vw,3.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-.035em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
    fontSize: "1.5625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-.035em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif"
    fontSize: "0.9375rem"
    lineHeight: 1.8
  code:
    fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace"
    fontSize: ".875rem"
    lineHeight: 1.85
rounded:
  stage: "16px"
  stage-mobile: "14px"
  code: "12px"
  pill: "30px"
  segment: "25px"
  circle: "50%"
spacing:
  page-gutter: "clamp(1.5rem,5vw,5rem)"
  page-gutter-mobile: "24px"
  page-gutter-small: "20px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "13px 21px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
  button-text:
    textColor: "{colors.secondary}"
  button-round:
    backgroundColor: "{colors.round-control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    width: "38px"
    height: "38px"
  segmented:
    backgroundColor: "{colors.segmented-track}"
    rounded: "{rounded.pill}"
    padding: "4px"
  interest-stage:
    backgroundColor: "{colors.interest-stage}"
    rounded: "{rounded.stage}"
    height: "290px"
  current-chip:
    backgroundColor: "{colors.current-background}"
    textColor: "{colors.current-text}"
    padding: "5px 9px"
    rounded: "20px"
---

# Design System: Mario Lin Portfolio

## Overview

**Creative North Star: "Making ideas tangible"**

A light, spacious personal portfolio in the confirmed Apple-inspired visual world. White and cool porcelain keep graphite typography, restrained blue actions, and authored spatial studies in focus. Platform typography is an explicit design commitment.

Content sits flush in generous margins. Functional translucent navigation maintains context while scrolling; rounded controls and quiet tonal stages frame direct manipulation. WebGL and inline SVG supply imagery; the city is a photo-derived reconstruction with estimated dimensions.

**Key Characteristics:**
- White and cool porcelain surfaces
- Platform typography with optical sizing
- Blue actions and visible focus
- Direct, interruptible spatial interaction

## Colors

### Primary

Restrained blue identifies primary actions, linked destinations, selected timeline position, and keyboard focus. The darker blue is a hover treatment.

### Neutral

White is the main canvas; porcelain marks broad background bands. Graphite carries headings, secondary gray supports prose, and pale lines separate content. The project and interest stages have distinct cool neutral fills. The current-status chip has its own pale blue and blue text. These local roles do not create additional global accent palettes.

In increased contrast, the source overrides secondary text to `#33333b` and lines to `#73737c`; stage borders become visible. Scene material colors stay local to the authored city geometry.

## Typography

The display and body use the platform stack in the frontmatter, with optical sizing enabled and a root size of 100%. Code uses the monospace stack. Balanced headings use semibold weight and tight tracking; prose uses relaxed line spacing.

The frontmatter records the desktop hero, section heading, common title, story body, and code roles. Hero introduction copy is larger (1.125rem, line-height 1.65). At 1050px the hero display becomes `clamp(3rem,6.9vw,4.5rem)`; at 720px it becomes `clamp(2.875rem,10.1vw,4.5rem)` with line-height 1.06; at 360px it becomes 2.75rem. Section headings on mobile use 2.3125rem. Fine metadata is not a reusable body-text scale.

## Layout

The content shell is capped at 1120px with two fluid gutters. At a 1440px viewport the cap governs the shell; at 662px and 390px the mobile gutter leaves 614px and 342px respectively. These widths describe source behavior, not a separate visual-verification claim.

Desktop uses paired hero columns, side-by-side section introductions, an interest menu beside its stage, and two-column stories and journey content. Major vertical intervals are about 110–122px. At 1050px columns and gaps tighten. At 720px hero, introductions, stories, and journey stack; interests become a horizontal selector above the stage, with approximately 65–75px section intervals. The project stage changes from 540px to 490px to 390px in these ranges, and to 350px at 360px. At 1600px the hero receives more height. The header is sticky (76px desktop, 66px mobile), with content anchors offset by 96px.

## Elevation & Depth

Broad surfaces are flat and separated by tone or fine lines. The sticky header uses translucent white, blur, and saturation to preserve context; reduced transparency and increased contrast replace it with opaque white. Small diffuse shadows distinguish the selected segment, primary-action hover, and tilted code study. The city uses rendered lighting and soft cast shadows; the silver study uses actual ThreeUI shaders. Neither is a shipping raster asset.

**The Context Rule.** Translucency belongs to the sticky navigation chrome and yields to the user's transparency and contrast preferences.

## Shapes

Stages have gently rounded corners, reduced slightly on mobile. Primary actions and segmented controls are pills; compact icon controls are circular. The code study is a rounded, slightly rotated sheet. Interface icons use consistent outlined SVG geometry with round caps and joins, rather than text glyphs.

## Components

### Buttons

The primary pill pairs white text with blue and a directional SVG. Hover darkens the fill, adds a soft shadow, and advances its arrow; press scales it to .97. The text action uses secondary gray and darkens on hover. The disclosure is a pale circular plus button that rotates its icon when expanded and scales to .94 on press. The reset control is a white circle. Links and buttons share a blue focus outline (3px, offset 5px); disabled buttons reduce opacity to .45.

### Chips

The existing pale-blue current-status chip is a local timeline marker. Its small type is not a general labeling standard.

### Cards / Containers

The project stage is a cool neutral rounded viewport with overlaid title and tools. The interest stage is a quieter rounded viewport. General prose remains flush in the page layout rather than being placed in repeated cards. The code sheet has a diffuse shadow and a fixed slight rotation.

### Navigation

A compact wordmark, in-page links, and blue external contact link occupy the sticky header. Hover turns in-page links blue. At 720px, the Journey link and external contact text are hidden while the external icon retains its accessible name. No mobile menu is implemented.

### Spatial controls

The city has Together and Exploded view buttons in a segmented group, a spring-driven white selection indicator, and a reset control. Selection is exposed through `aria-pressed`; the project disclosure uses `aria-expanded` and an explicit controlled region. City drag maps directly to bounded yaw and pitch, projects release velocity, and settles with interruptible springs. Touch keeps vertical scrolling available; arrow keys adjust rotation and Home resets it. Layer changes use response .4 and damping 1; the segmented indicator uses response .3 and damping 1. Both preserve presentation and velocity when retargeted.

**The Motion Preference Rule.** Reduced motion and the manual animation switch remove decorative movement and settle state changes directly. The ThreeUI clock pauses while disabled, offscreen, or in a hidden document; city rendering runs only while needed. The snippets below represent source HTML/CSS states; JavaScript spring and WebGL behavior remains in the source components.

## Do's and Don'ts

### Do:
- **Do** use blue for actions and keyboard focus.
- **Do** label estimated model dimensions and interpreted geometry.
- **Do** preserve reduced-motion, reduced-transparency, and increased-contrast treatments.
- **Do** use authored SVG geometry for interface icons.

### Don't:
- **Don't** restore the replaced graphite/lime identity.
- **Don't** add tickers, section numbers, neon, or fake trademarks.
- **Don't** claim the photo-derived model has measured dimensions or fabrication accuracy.
