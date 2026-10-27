# ITZFIZZ — Scroll-Driven Car Experience

A single-page, scroll-driven hero built with **Next.js (App Router)**, **React**, **TypeScript** and **GSAP**. As you scroll, a graphite sports car drives along a road, uncovering the **WELCOME ITZ FIZZ** headline behind it and switching on four animated stat cards.

## Features

- **Scroll-driven car** – the hero is pinned and the car follows your scroll with inertia, so it eases in and out.
- **Headline behind the car** – the text sits between the road and the car and is invisible until the car uncovers it with a soft, slow wipe.
- **Realistic motion** – engine shake, body roll, speed streaks behind the car and a headlight beam that react to scroll speed.
- **Animated stat cards** – each card activates as the car passes, with a count-up number, progress bar and connector to the road.
- **Responsive** – layout, road height, car size and headline size scale fluidly; cards switch from 4 across to a 2 × 2 grid on phones and reveal in sequence.
- **Accessible** – respects `prefers-reduced-motion` (shows the finished scene) and uses proper ARIA labels.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js (App Router) | Framework and routing |
| React + TypeScript | Components and typing |
| GSAP + ScrollTrigger | Scroll pinning, intro animation, counters |
| Tailwind CSS v4 | Styling via utility classes in the components |
| Plain CSS (`globals.css`) | Design tokens, plus the road, headline mask and headlight beam |
| `next/font` | Bebas Neue and DM Sans |

## Getting Started

### Prerequisites

- Node.js 18.18 or newer
- npm (or yarn / pnpm)

### Install and run

```bash
# 1. Install dependencies
npm install

# 2. Make sure GSAP and Tailwind v4 are installed
npm install gsap
npm install tailwindcss @tailwindcss/postcss

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── components/
│   └── Hero.tsx      # Hero markup + GSAP / ScrollTrigger logic (client component)
├── globals.css       # Tailwind import, design tokens and a few custom effects
├── layout.tsx        # Root layout, fonts and metadata
├── page.tsx          # Home page: hero + closing section
└── favicon.ico
public/               # Static assets
```

## How It Works

1. `ScrollTrigger` pins the hero for about 2.2 screen heights and reports scroll progress (0 → 1).
2. A per-frame GSAP ticker smooths that progress, so the car chases the scroll position instead of snapping to it.
3. The car's position drives everything else: the green trail on the road, the headline reveal (`--r` CSS variable used as a mask), and which stat cards are switched on.
4. The headline is rendered twice: an invisible base layer for layout and screen readers, and a solid layer revealed with a mask behind the car.
5. The car sits at `z-index: 4`, above the headline (`z-index: 3`) and the road, so it always drives in front of the text.

## Customising

| What | Where |
|---|---|
| Stat numbers and labels | `STATS` array at the top of `Hero.tsx` |
| Headline text | The `<Letters text="..." />` calls in `Hero.tsx` (keep both layers identical) |
| Colours, fonts, road height | CSS variables in `:root` in `globals.css` |
| Scroll length | `end: () => \`+=${window.innerHeight * 2.2}\`` in `Hero.tsx` |
| Car smoothness | The `7` in `Math.exp(-dt * 7)` (higher = snappier) |
| Headline reveal speed | The `2.4` in `Math.exp(-dt * 2.4)` (lower = slower) |
| Car appearance | The inline `<svg className="car-svg">` in `Hero.tsx` |

## Browser Support

Latest Chrome, Edge, Firefox and Safari, on desktop and mobile.

## Notes

- Components that use GSAP must be client components (`"use client"`).
- If the page looks wrong after changing files, stop the dev server, delete the `.next` folder and run `npm run dev` again.

## License

See the [LICENSE](./LICENSE) file.
