import Hero from "../components/hero";

export default function Home() {
  return (
    <main>
      <Hero />

      <section className="next-section" id="next-section">
        <p className="eyebrow">THE JOURNEY CONTINUES</p>
        <h2>
          BUILT FOR
          <br />
          <span>MOMENTUM.</span>
        </h2>
        <p>Great experiences aren&apos;t rushed. They&apos;re revealed, one moment at a time.</p>
        <a href="#hero">DRIVE AGAIN ↑</a>
      </section>
    </main>
  );
}