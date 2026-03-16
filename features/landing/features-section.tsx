const FEATURES = [
  {
    title: "Instant Sync",
    body: "Every keystroke appears on all connected screens within milliseconds. Last-write-wins conflict resolution keeps editing simple and predictable, so you focus on the code — not the tooling.",
  },
  {
    title: "Live Cursors",
    body: 'See exactly where your teammate is typing with named, color-coded cursor bars that update in real time. No more asking "where are you?" — just look at the editor.',
  },
  {
    title: "Share a URL, Done",
    body: "Every session gets a unique URL. Share it over Slack, Discord, or email and your collaborator clicks to join instantly. No account required, zero friction.",
  },
  {
    title: "Multi-language Support",
    body: "TypeScript, Rust, Python, Go, JavaScript and more. Pick a language and the Monaco-powered editor highlights syntax automatically. Switch anytime with a single click.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#FBF6F2] max-md:bg-white py-16 lg:py-32 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] text-center mb-4">
          Built for real-time collaboration
        </h2>
        <p className="text-center text-[#6B7280] text-base sm:text-lg mb-12 max-w-xl mx-auto">
          Everything you need for seamless pair programming.
        </p>

        <div className="md:bg-white md:rounded-[46px] md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-[#FAF5F0] rounded-[40px] p-8 sm:p-10"
              >
                <h3 className="text-xl sm:text-[22px] font-semibold text-primary">
                  {f.title}
                </h3>
                <div className="h-px bg-[#E5E0DA] my-4" />
                <p className="text-[#4B5563] text-[15px] leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
