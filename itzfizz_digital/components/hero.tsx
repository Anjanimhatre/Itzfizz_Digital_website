"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STATS = [
  { value: 58, tag: "01 · Pick-ups", mark: "↗", text: "Increase in pick up point use" },
  { value: 23, tag: "02 · Support", mark: "↘", text: "Decrease in customer phone calls" },
  { value: 27, tag: "03 · Pick-ups", mark: "↗", text: "Increase in pick up point use" },
  { value: 40, tag: "04 · Support", mark: "↘", text: "Decrease in customer phone calls" },
];

function Letters({ text }: { text: string }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <span
          key={i}
          className={
            ch === " "
              ? "inline-block min-w-[0.3em]"
              : "inline-block min-w-[0.52em] md:min-w-[0.55em]"
          }
          aria-hidden="true"
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    gsap.registerPlugin(ScrollTrigger);

    const q = <T extends HTMLElement>(selector: string) =>
      hero.querySelector(selector) as T;

    const car = q<HTMLElement>("#car-wrap");
    const carBody = q<HTMLElement>("#car-body");
    const speedLines = q<HTMLElement>("#speed-lines");
    const beam = q<HTMLElement>("#beam");
    const trail = q<HTMLElement>("#road-trail");
    const headlineFill = q<HTMLElement>("#headline-fill");
    const progressBar = q<HTMLElement>(".scroll-track span");
    const progressLabel = q<HTMLElement>("#progress-label");
    const statCards = gsap.utils.toArray<HTMLElement>(".stat-card", hero);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Layout measurements (re-run on every resize/refresh) ---------- */
    let cardThresholds: number[] = [];
    let maxCarX = 0;
    let carWidth = 0;
    let heroWidth = 1;
    let headLeft = 0;
    let headWidth = 1;

    const measureLayout = () => {
      const heroRect = hero.getBoundingClientRect();
      const headRect = headlineFill.getBoundingClientRect();

      heroWidth = heroRect.width || 1;
      carWidth = car.offsetWidth;

      // The car drives completely off the right edge so it never parks on the headline.
      maxCarX = heroWidth + 4;

      headLeft = headRect.left - heroRect.left;
      headWidth = headRect.width || 1;

      const startFront = (carWidth * 0.92) / heroWidth;
      const endFront = 1;

      const rects = statCards.map((card) => card.getBoundingClientRect());

      // On phones the cards wrap into rows, so reveal them one after another
      // along the drive instead of by x position.
      const wrapped = rects.some((r) => Math.abs(r.top - rects[0].top) > 8);
      const steps = [0.2, 0.42, 0.64, 0.86];

      cardThresholds = rects.map((rect, i) => {
        if (wrapped) {
          return startFront + (endFront - startFront) * (steps[i] ?? 0.9);
        }
        const center = (rect.left + rect.width / 2 - heroRect.left) / heroWidth;
        return Math.min(endFront - 0.02, Math.max(center, startFront + 0.06));
      });
    };

    const setReveal = (px: number) => {
      const r = ((px - headLeft) / headWidth) * 100;
      headlineFill.style.setProperty("--r", r.toFixed(2));
    };

    /* ---------- Counters inside the cards ---------- */
    const counters = statCards.map((card) => {
      const el = card.querySelector<HTMLElement>(".stat-number")!;
      const end = Number(el.dataset.count);
      return { el, end, state: { value: end, tween: null as gsap.core.Tween | null } };
    });

    const runCounter = (index: number, on: boolean) => {
      const { el, end, state } = counters[index];
      state.tween?.kill();
      state.value = 0;

      if (!on) {
        el.textContent = "0%";
        return;
      }

      state.tween = gsap.to(state, {
        value: end,
        duration: 1.1,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = `${Math.round(state.value)}%`;
        },
      });
    };

    let tick: ((time: number, deltaMs: number) => void) | null = null;
    let onResizeReduced: (() => void) | null = null;
    const onLoad = () => {
      measureLayout();
      ScrollTrigger.refresh();
    };

    const ctx = gsap.context(() => {
      /* ---------- Initial state ---------- */
      gsap.set(trail, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(progressBar, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(speedLines, { opacity: 0, scaleX: 0.3, transformOrigin: "100% 50%" });

      const cardsOn = new Array(statCards.length).fill(false);
      counters.forEach((c) => {
        c.el.textContent = "0%";
      });

      measureLayout();
      setReveal(0);

      document.fonts?.ready.then(() => {
        measureLayout();
        ScrollTrigger.refresh();
      });
      window.addEventListener("load", onLoad);

      /* ---------- Reduced motion: show the finished scene ---------- */
      if (reduceMotion) {
        const showAll = () => {
          measureLayout();
          headlineFill.style.setProperty("--r", "130");
          gsap.set(car, { x: 0 });
        };

        statCards.forEach((card, i) => {
          card.classList.add("is-on");
          counters[i].el.textContent = `${counters[i].end}%`;
        });
        gsap.set(trail, { scaleX: 1 });
        gsap.set(progressBar, { scaleX: 1 });
        progressLabel.textContent = "04 / 04";
        showAll();
        onResizeReduced = showAll;
        window.addEventListener("resize", showAll);
        return;
      }

      /* ---------- Intro ---------- */
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".navbar", { y: -15, autoAlpha: 0, duration: 0.7 })
        .from(".road-area", { autoAlpha: 0, duration: 0.8 }, "-=0.4")
        .from(
          ".eyebrow, .hero-description",
          { y: 12, autoAlpha: 0, duration: 0.6, stagger: 0.12 },
          "-=0.5"
        )
        .from(car, { autoAlpha: 0, duration: 0.6 }, "-=0.4");

      /* ---------- Scroll progress (target) ---------- */
      let target = 0;

      ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 2.2)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measureLayout();
          target = self.progress;
        },
        onUpdate: (self) => {
          target = self.progress;
        },
      });

      /* ---------- Per-frame driving simulation ---------- */
      const setCarX = gsap.quickSetter(car, "x", "px");
      const setTrail = gsap.quickSetter(trail, "scaleX");
      const setBar = gsap.quickSetter(progressBar, "scaleX");
      const setBodyY = gsap.quickSetter(carBody, "y", "px");
      const setBodyRot = gsap.quickSetter(carBody, "rotation", "deg");
      const setLinesOpacity = gsap.quickSetter(speedLines, "opacity");
      const setLinesScale = gsap.quickSetter(speedLines, "scaleX");
      const setBeam = gsap.quickSetter(beam, "opacity");

      let current = 0; // smoothed progress (the car's real position)
      let previous = 0;
      let speed = 0; // 0..1 smoothed speed
      let clock = 0;
      let lastStep = 0;
      let revealPx = 0; // where the solid headline has been uncovered to

      tick = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs, 50) / 1000;
        if (dt <= 0) return;

        clock += dt;

        // The car chases the scroll position with inertia, so it eases in and out.
        current += (target - current) * (1 - Math.exp(-dt * 7));
        if (Math.abs(target - current) < 0.00004) current = target;

        const velocity = (current - previous) / dt;
        previous = current;

        const rawSpeed = Math.min(1, Math.abs(velocity) / 0.9);
        speed += (rawSpeed - speed) * (1 - Math.exp(-dt * 9));

        const carX = maxCarX * current;
        const carFront = (carX + carWidth * 0.92) / heroWidth;

        setCarX(carX);
        setTrail(Math.min(1, (carX + carWidth * 0.62) / heroWidth));

        // Headline: uncovered slowly, trailing behind the car's body.
        const revealTarget = carX + carWidth * 0.45;
        revealPx += (revealTarget - revealPx) * (1 - Math.exp(-dt * 2.4));
        if (Math.abs(revealTarget - revealPx) < 0.1) revealPx = revealTarget;
        setReveal(revealPx);

        // Engine idle shake + road vibration that grows with speed.
        const shake = 0.3 + speed * 1.6;
        const vibrate =
          (Math.sin(clock * 58) * 0.55 + Math.sin(clock * 33 + 1.3) * 0.45) * shake;
        const roll =
          Math.sin(clock * 21) * 0.28 * speed + (velocity > 0 ? 0.25 : -0.25) * speed;

        setBodyY(vibrate);
        setBodyRot(roll);

        // Speed streaks behind the car and headlight glow ahead of it.
        setLinesOpacity(Math.min(0.95, speed * 1.1));
        setLinesScale(0.25 + speed * 0.95);
        setBeam(0.45 + speed * 0.45);

        // Reveal each stat card as the car drives past it.
        for (let i = 0; i < statCards.length; i++) {
          const on = carFront >= cardThresholds[i];
          if (on !== cardsOn[i]) {
            cardsOn[i] = on;
            statCards[i].classList.toggle("is-on", on);
            runCounter(i, on);
          }
        }

        // Progress indicator (throttle text writes).
        setBar(current);
        const step = Math.min(4, Math.floor(current * 4) + 1);
        if (step !== lastStep) {
          lastStep = step;
          progressLabel.textContent = `0${step} / 04`;
        }
      };

      gsap.ticker.add(tick);
    }, hero);

    return () => {
      if (tick) gsap.ticker.remove(tick);
      window.removeEventListener("load", onLoad);
      if (onResizeReduced) window.removeEventListener("resize", onResizeReduced);
      counters.forEach((c) => c.state.tween?.kill());
      ctx.revert();
    };
  }, []);

  return (
    <section
      className="hero hero-bg relative isolate h-svh min-h-[560px] overflow-hidden"
      id="hero"
      ref={heroRef}
    >
      {/* ---------- Navbar ---------- */}
      <header className="navbar absolute top-0 left-0 z-10 flex h-[65px] w-full items-center justify-between px-[5%] md:h-[78px] md:px-[6%]">
        <a
          href="#hero"
          className="flex items-center gap-2.5 text-[13px] font-extrabold tracking-[1.6px]"
          aria-label="ITZFIZZ home"
        >
          <span className="grid size-9 place-items-center rounded-full bg-ink text-[11px] tracking-normal text-green shadow-[0_6px_16px_-6px_rgba(23,25,20,0.5)]">
            IF
          </span>
          <span>ITZFIZZ</span>
        </a>

        <span className="hidden text-[10px] font-extrabold tracking-[3px] text-muted md:block">
          MOVE DIFFERENT.
        </span>

        <a
          href="#next-section"
          className="group inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-[13px] py-2 text-[9px] font-extrabold tracking-[2px] backdrop-blur-sm transition-colors duration-300 ease-out-expo hover:border-green hover:bg-green md:px-4 md:py-2.5 md:text-[10px]"
        >
          OUR IMPACT
          <span className="text-sm transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      </header>

      {/* ---------- Stage: cards → road → tagline ---------- */}
      <div className="stage absolute inset-x-0 top-[65px] bottom-14 flex flex-col md:top-[78px] md:bottom-16">
        {/* Stat cards sit above the road; each one switches on when the car passes it */}
        <div className="pointer-events-none relative z-[3] mb-3.5 grid min-h-0 flex-[1_1_0] grid-cols-2 content-end items-stretch gap-2.5 px-[5%] md:mb-9 md:grid-cols-4 md:items-end md:gap-[clamp(12px,2vw,28px)] md:px-[6%]">
          {STATS.map((s) => (
            <article
              key={s.tag}
              style={{ "--value": `${s.value}%` } as React.CSSProperties}
              className="stat-card group relative translate-y-7 scale-95 rounded-[14px] border border-white/90 bg-linear-to-br from-white/95 to-white/70 p-3 opacity-0 shadow-[0_0_0_1px_rgba(23,25,20,0.09),0_2px_6px_rgba(23,25,20,0.04),0_22px_44px_-22px_rgba(23,25,20,0.35)] backdrop-blur-xl transition duration-700 ease-out-expo will-change-[opacity,transform] md:rounded-[18px] md:p-5 md:pb-5
                before:absolute before:top-[calc(100%+30px)] before:left-[calc(50%-4px)] before:size-[9px] before:scale-0 before:rounded-full before:bg-green before:shadow-[0_0_0_2px_#171914,0_0_0_6px_rgba(200,243,106,0.4)] before:transition-transform before:delay-[400ms] before:duration-[400ms] before:ease-out-expo max-md:before:hidden
                after:absolute after:top-full after:left-1/2 after:h-[34px] after:w-px after:origin-top after:scale-y-0 after:bg-linear-to-b after:from-ink/5 after:to-ink/50 after:transition-transform after:delay-150 after:duration-500 after:ease-out-expo max-md:after:hidden
                [&.is-on]:translate-y-0 [&.is-on]:scale-100 [&.is-on]:opacity-100 [&.is-on]:before:scale-100 [&.is-on]:after:scale-y-100"
            >
              <div className="stat-top mb-2 flex items-center justify-between before:absolute before:top-0 before:left-3 before:h-[3px] before:w-7 before:rounded-b-sm before:bg-green-dark md:mb-3.5 md:before:left-5 md:before:w-[38px]">
                <span className="text-[8px] font-extrabold tracking-[1.2px] text-muted uppercase md:text-[10px] md:tracking-[1.8px]">
                  {s.tag}
                </span>
                <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] leading-none text-green md:size-[26px] md:text-[13px]">
                  {s.mark}
                </span>
              </div>

              <span
                className="stat-number block font-display text-[38px] leading-[0.95] tracking-[1px] text-ink tabular-nums max-[380px]:text-[32px] md:text-[length:clamp(44px,5.2vw,76px)]"
                data-count={s.value}
              >
                {s.value}%
              </span>

              <p className="mt-1 max-w-[190px] text-[10.5px] leading-[1.4] font-semibold text-[#5d6157] max-[380px]:text-[9.5px] md:mt-2 md:text-xs md:leading-normal [@media(max-height:700px)_and_(min-width:768px)]:hidden">
                {s.text}
              </p>

              <div className="mt-4 h-[5px] overflow-hidden rounded-full bg-ink/10 max-md:hidden [@media(max-height:700px)_and_(min-width:768px)]:mt-2.5">
                <i className="block h-full w-(--value) origin-left scale-x-0 rounded-[inherit] bg-linear-to-r from-green-dark to-green transition-transform delay-[250ms] duration-[1100ms] ease-out-expo group-[.is-on]:scale-x-100" />
              </div>
            </article>
          ))}
        </div>

        {/* Road + headline + car */}
        <div
          className="road-area relative z-[2] h-(--road-h) flex-none"
          aria-label="Car driving across a road"
        >
          <div className="road">
            <div className="road-edge" />
            <div className="road-center-line" />
            <div className="road-trail" id="road-trail" />
            <div className="road-grain" />
          </div>

          {/* Headline lives between the road and the car: the car drives in front of it */}
          <div className="pointer-events-none absolute inset-0 z-[3] grid place-items-center">
            <h1
              id="headline"
              aria-label="WELCOME ITZ FIZZ"
              className="[grid-area:1/1] font-display text-[length:min(calc(var(--road-h)_*_0.4),14vw)] leading-[0.92] font-normal tracking-[0.07em] text-transparent select-none md:tracking-[0.12em]"
            >
              <span className="flex justify-center whitespace-nowrap">
                <Letters text="WELCOME" />
              </span>
              <span className="mt-1 flex justify-center whitespace-nowrap">
                <Letters text="ITZ FIZZ" />
              </span>
            </h1>

            <div
              id="headline-fill"
              aria-hidden="true"
              className="headline-fill [grid-area:1/1] font-display text-[length:min(calc(var(--road-h)_*_0.4),14vw)] leading-[0.92] font-normal tracking-[0.07em] text-ink select-none md:tracking-[0.12em]"
            >
              <span className="flex justify-center whitespace-nowrap">
                <Letters text="WELCOME" />
              </span>
              <span className="mt-1 flex justify-center whitespace-nowrap">
                <Letters text="ITZ FIZZ" />
              </span>
            </div>
          </div>

          <div
            id="car-wrap"
            role="img"
            aria-label="Graphite sports car viewed from above, driving left to right"
            className="car-wrap absolute inset-y-0 left-0 z-[4] flex w-[clamp(110px,30vw,170px)] items-center will-change-transform max-[380px]:w-[100px] md:w-[clamp(120px,16vw,270px)]"
          >
            <div id="car-body" className="relative w-full will-change-transform">
              <div className="speed-lines" id="speed-lines" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="beam" id="beam" aria-hidden="true" />

              {/* Top-down car rotated 90° so the nose points along the road (to the right) */}
              <svg className="relative z-[2] block h-auto w-full overflow-visible drop-shadow-[0_8px_6px_rgba(0,0,0,0.35)]" viewBox="-80 80 340 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  
                  <linearGradient id="carPaint" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#0e1113"/>
                    <stop offset=".18" stopColor="#2f363b"/>
                    <stop offset=".34" stopColor="#4b545b"/>
                    <stop offset=".5" stopColor="#262c30"/>
                    <stop offset=".72" stopColor="#3a4147"/>
                    <stop offset=".9" stopColor="#1b1f23"/>
                    <stop offset="1" stopColor="#0b0d0f"/>
                  </linearGradient>
                  
                  <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity=".22"/>
                    <stop offset=".3" stopColor="#ffffff" stopOpacity=".02"/>
                    <stop offset=".62" stopColor="#000000" stopOpacity="0"/>
                    <stop offset="1" stopColor="#000000" stopOpacity=".38"/>
                  </linearGradient>
                  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#7f8e96"/>
                    <stop offset=".35" stopColor="#1a252b"/>
                    <stop offset="1" stopColor="#05090b"/>
                  </linearGradient>
                  <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#d7eef5" stopOpacity=".5"/>
                    <stop offset="1" stopColor="#d7eef5" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="tire" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#0b0c0d"/>
                    <stop offset=".5" stopColor="#25282b"/>
                    <stop offset="1" stopColor="#0b0c0d"/>
                  </linearGradient>
                  <linearGradient id="lamp" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#eaf6ff"/>
                    <stop offset="1" stopColor="#9fd0ff"/>
                  </linearGradient>
                  <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f2f4f5"/>
                    <stop offset=".5" stopColor="#7c858b"/>
                    <stop offset="1" stopColor="#2a2f33"/>
                  </linearGradient>
                  <pattern id="carbon" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill="#0c0e0f"/>
                    <rect width="3" height="3" fill="#20262a"/>
                    <rect x="3" y="3" width="3" height="3" fill="#20262a"/>
                  </pattern>
                  <clipPath id="bodyClip">
                    <path d="M48 40 Q54 17 90 15 Q126 17 132 40 L150 103 Q157 132 155 219 L148 276 Q141 310 119 326 Q90 341 61 326 Q39 310 32 276 L25 219 Q23 132 30 103Z"/>
                  </clipPath>
                  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5"/>
                  </filter>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.2"/>
                  </filter>
                </defs>

                <g transform="rotate(90 90 170)">
                  
                  <path d="M45 48 Q48 15 90 12 Q132 15 135 48 L154 110 L155 242 Q149 300 122 322 Q90 339 58 322 Q31 300 25 242 L26 110Z"
                    fill="#000" opacity=".5" transform="translate(9 7)" filter="url(#softShadow)"/>

                  
                  <g>
                    <rect x="8" y="72" width="30" height="70" rx="10" fill="url(#tire)" stroke="#000" strokeWidth="1.5"/>
                    <rect x="142" y="72" width="30" height="70" rx="10" fill="url(#tire)" stroke="#000" strokeWidth="1.5"/>
                    <rect x="6" y="222" width="32" height="74" rx="10" fill="url(#tire)" stroke="#000" strokeWidth="1.5"/>
                    <rect x="142" y="222" width="32" height="74" rx="10" fill="url(#tire)" stroke="#000" strokeWidth="1.5"/>
                  </g>
                  <g stroke="#3b4044" strokeWidth="1.2" opacity=".8">
                    <path d="M12 82h22M12 92h22M12 102h22M12 112h22M12 122h22M12 132h22"/>
                    <path d="M146 82h22M146 92h22M146 102h22M146 112h22M146 122h22M146 132h22"/>
                    <path d="M10 232h24M10 243h24M10 254h24M10 265h24M10 276h24M10 287h24"/>
                    <path d="M146 232h24M146 243h24M146 254h24M146 265h24M146 276h24M146 287h24"/>
                  </g>
                  
                  <g fill="url(#chrome)" opacity=".85">
                    <rect x="31" y="92" width="6" height="30" rx="3"/>
                    <rect x="143" y="92" width="6" height="30" rx="3"/>
                    <rect x="31" y="244" width="6" height="32" rx="3"/>
                    <rect x="143" y="244" width="6" height="32" rx="3"/>
                  </g>

                  
                  <path d="M48 40 Q54 17 90 15 Q126 17 132 40 L150 103 Q157 132 155 219 L148 276 Q141 310 119 326 Q90 341 61 326 Q39 310 32 276 L25 219 Q23 132 30 103Z"
                    fill="url(#carPaint)" stroke="#050607" strokeWidth="2"/>

                  <g clipPath="url(#bodyClip)">
                    
                    <rect x="20" y="10" width="140" height="335" fill="url(#sheen)"/>

                    
                    <path d="M42 62 Q47 38 70 30 L58 104 L46 238 L52 300 Q38 280 36 246 L33 130Z" fill="#ffffff" opacity=".16"/>
                    <path d="M138 62 Q133 38 110 30 L122 104 L134 238 L128 300 Q142 280 144 246 L147 130Z" fill="#000" opacity=".22"/>

                    
                    <path d="M83 16 L83 322" stroke="#c8f36a" strokeWidth="3.2" opacity=".95"/>
                    <path d="M97 16 L97 322" stroke="#c8f36a" strokeWidth="3.2" opacity=".95"/>
                    <path d="M88 16 L88 322 M92 16 L92 322" stroke="#050607" strokeWidth="1.5" opacity=".55"/>

                    
                    <g fill="#050607" opacity=".9">
                      <path d="M58 70 L74 66 L74 78 L60 82Z"/>
                      <path d="M122 70 L106 66 L106 78 L120 82Z"/>
                    </g>
                    <g stroke="#6b757c" strokeWidth="1" opacity=".7">
                      <path d="M61 72 L72 69M61 76 L72 73"/>
                      <path d="M119 72 L108 69M119 76 L108 73"/>
                    </g>
                  </g>

                  
                  <path d="M46 28 Q90 8 134 28 L130 33 Q90 15 50 33Z" fill="#050607"/>
                  <path d="M52 29 Q90 12 128 29" fill="none" stroke="#c8f36a" strokeWidth="1.6"/>
                  <g fill="#050607">
                    <path d="M54 38 Q60 34 70 36 L68 46 Q58 46 54 42Z"/>
                    <path d="M126 38 Q120 34 110 36 L112 46 Q122 46 126 42Z"/>
                  </g>

                  
                  <g filter="url(#glow)" opacity=".85">
                    <path d="M40 48 L66 54 L63 61 L38 55Z" fill="#cfe9ff"/>
                    <path d="M140 48 L114 54 L117 61 L142 55Z" fill="#cfe9ff"/>
                  </g>
                  <path d="M40 48 L66 54 L63 61 L38 55Z" fill="url(#lamp)" stroke="#05080a" strokeWidth="1.2"/>
                  <path d="M140 48 L114 54 L117 61 L142 55Z" fill="url(#lamp)" stroke="#05080a" strokeWidth="1.2"/>
                  <path d="M43 52 L62 56.5" stroke="#ffffff" strokeWidth="1.4"/>
                  <path d="M137 52 L118 56.5" stroke="#ffffff" strokeWidth="1.4"/>

                  
                  <g stroke="#050607" strokeWidth="1.3" fill="none" opacity=".8">
                    <path d="M33 124 Q30 170 33 214"/>
                    <path d="M147 124 Q150 170 147 214"/>
                    <path d="M44 128 Q41 170 44 210"/>
                    <path d="M136 128 Q139 170 136 210"/>
                  </g>

                  
                  <path d="M52 65 Q58 44 90 41 Q122 44 128 65 L119 112 Q90 124 61 112Z"
                    fill="url(#glass)" stroke="#06090b" strokeWidth="2.5"/>
                  <path d="M59 62 Q66 49 88 47 L78 112 L64 108Z" fill="url(#glassGlare)"/>
                  <path d="M96 50 Q116 52 122 64 L114 106" fill="none" stroke="#9bb4bf" strokeWidth="1" opacity=".35"/>

                  
                  <path d="M54 125 Q60 116 90 116 Q120 116 126 125 L129 192 Q124 207 90 208 Q56 207 51 192Z"
                    fill="url(#carbon)" stroke="#050607" strokeWidth="2"/>
                  <path d="M58 128 Q90 120 122 128" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity=".28"/>
                  <path d="M60 196 Q90 204 120 196" fill="none" stroke="#000" strokeWidth="2" opacity=".5"/>
                  
                  <path d="M83 118 L83 207 M97 118 L97 207" stroke="#c8f36a" strokeWidth="3" opacity=".95"/>

                  
                  <path d="M61 216 Q90 207 119 216 L128 258 Q121 282 90 287 Q59 282 52 258Z"
                    fill="url(#glass)" stroke="#06090b" strokeWidth="2.5"/>
                  <path d="M66 224 Q90 218 114 224 L118 242 Q90 248 62 242Z" fill="#cde8f1" opacity=".13"/>

                  
                  <g stroke="#050607" strokeWidth="2" opacity=".85">
                    <path d="M60 292 Q90 296 120 292"/>
                    <path d="M58 298 Q90 303 122 298"/>
                  </g>

                  
                  <path d="M20 303 Q90 291 160 303 L158 316 Q90 306 22 316Z" fill="url(#carbon)" stroke="#050607" strokeWidth="1.8"/>
                  <path d="M24 306 Q90 295 156 306" fill="none" stroke="#c8f36a" strokeWidth="1.6"/>
                  <rect x="17" y="298" width="6" height="22" rx="2" fill="#0a0c0d" stroke="#c8f36a" strokeWidth="1"/>
                  <rect x="157" y="298" width="6" height="22" rx="2" fill="#0a0c0d" stroke="#c8f36a" strokeWidth="1"/>

                  
                  <g filter="url(#glow)" opacity=".9">
                    <path d="M44 322 Q90 334 136 322" fill="none" stroke="#ff2b3d" strokeWidth="3.5"/>
                  </g>
                  <path d="M44 322 Q90 334 136 322" fill="none" stroke="#ff6b78" strokeWidth="1.6"/>

                  
                  <g>
                    <circle cx="72" cy="333" r="5" fill="#050607"/>
                    <circle cx="72" cy="333" r="3.6" fill="url(#chrome)"/>
                    <circle cx="72" cy="333" r="2" fill="#050607"/>
                    <circle cx="108" cy="333" r="5" fill="#050607"/>
                    <circle cx="108" cy="333" r="3.6" fill="url(#chrome)"/>
                    <circle cx="108" cy="333" r="2" fill="#050607"/>
                  </g>

                  
                  <g>
                    <path d="M28 102 L10 93 Q6 98 9 104 L27 116Z" fill="#20262a" stroke="#050607" strokeWidth="1.2"/>
                    <path d="M152 102 L170 93 Q174 98 171 104 L153 116Z" fill="#20262a" stroke="#050607" strokeWidth="1.2"/>
                    <path d="M12 96 L24 102" stroke="#c8f36a" strokeWidth="1.4"/>
                    <path d="M168 96 L156 102" stroke="#c8f36a" strokeWidth="1.4"/>
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Tagline below the road */}
        <div className="pointer-events-none relative z-[3] flex-none px-[3%] pt-[clamp(18px,4svh,40px)] text-center md:px-[6%]">
          <p className="eyebrow text-[9px] font-extrabold tracking-[2.4px] text-ink md:text-[10px] md:tracking-[3.4px]">
            A LITTLE CHANGE. A BIG IMPACT.
          </p>
          <p className="hero-description mt-[clamp(8px,1.4svh,14px)] text-[8.5px] font-bold tracking-[1.4px] text-muted md:text-[10px] md:tracking-[2.4px]">
            EVERY JOURNEY STARTS WITH A LITTLE MOMENTUM.
          </p>
        </div>
      </div>

      {/* ---------- Bottom progress ---------- */}
      <footer className="absolute inset-x-[5%] bottom-[18px] z-[6] flex items-center gap-2.5 text-[9px] font-extrabold tracking-[1.2px] md:inset-x-[6%] md:bottom-6 md:gap-4 md:text-[10px] md:tracking-[2px]">
        <span>SCROLL TO DRIVE</span>
        <div className="scroll-track h-[3px] flex-1 overflow-hidden rounded-[3px] bg-[#d8d9d0]">
          <span className="block h-full w-full rounded-[inherit] bg-linear-to-r from-green-dark to-green" />
        </div>
        <span className="min-w-[52px] text-right tabular-nums" id="progress-label">
          01 / 04
        </span>
      </footer>
    </section>
  );
}