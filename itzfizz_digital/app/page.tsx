import Hero from "../components/hero";

export default function Home() {
  return (
    <main>
      <Hero />

      <section
        id="next-section"
        className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-ink bg-[radial-gradient(ellipse_50%_40%_at_50%_100%,rgba(200,243,106,0.16),transparent_70%)] px-6 py-[100px] text-center text-paper"
      >
        <p className="text-[10px] font-extrabold tracking-[3.4px] text-green">
          THE JOURNEY CONTINUES
        </p>

        <h2 className="mt-5 font-display text-[length:clamp(68px,12vw,150px)] leading-[0.88] font-normal tracking-[0.04em]">
          BUILT FOR
          <br />
          <span className="text-green">MOMENTUM.</span>
        </h2>

        <p className="mt-[26px] max-w-[400px] text-sm leading-[1.8] text-[#b7b9af]">
          Great experiences aren&apos;t rushed. They&apos;re revealed, one moment at a time.
        </p>

        <a
          href="#hero"
          className="mt-[38px] rounded-full border border-green px-6 py-[13px] text-[11px] font-extrabold tracking-[2px] text-green transition-colors duration-300 hover:bg-green hover:text-ink"
        >
          DRIVE AGAIN ↑
        </a>
      </section>
    </main>
  );
}