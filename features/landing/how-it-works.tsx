const STEPS = [
  {
    num: "1",
    title: "Pick a name",
    description: "Enter any display name. No signup, no email, no password.",
    cardBg: "bg-white",
    circleBg: "bg-primary",
    circleText: "text-white",
    titleColor: "text-[#0A0A0A]",
    descColor: "text-[#6B7280]",
  },
  {
    num: "2",
    title: "Create a session",
    description:
      "One click and you get a unique session URL ready to share with anyone.",
    cardBg: "bg-[#FFB199]",
    circleBg: "bg-primary",
    circleText: "text-white",
    titleColor: "text-[#0A0A0A]",
    descColor: "text-[#22 2]",
  },
  {
    num: "3",
    title: "Code together",
    description:
      "Share the link. Your teammate joins instantly and you see each other typing live.",
    cardBg: "bg-primary",
    circleBg: "bg-white",
    circleText: "text-primary",
    titleColor: "text-[white]",
    descColor: "text-[white]",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#FBF6F2] py-32 px-6 md:px-12 ">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] text-center mb-14">
          Up and running in 3&nbsp;steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className={`flex flex-col items-center text-center gap-3 ${step.cardBg} rounded-[40px] p-8`}
            >
              <div
                className={`w-10 h-10 rounded-full ${step.circleBg} flex items-center justify-center`}
              >
                <span className={`text-base font-bold ${step.circleText}`}>
                  {step.num}
                </span>
              </div>
              <h3 className={`text-lg font-semibold ${step.titleColor}`}>
                {step.title}
              </h3>
              <p
                className={`text-sm leading-[1.4] max-w-[280px] ${step.descColor}`}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
