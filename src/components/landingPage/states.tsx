export function Stats() {
  const stats = [
    {
      value: "10M+",
      label: "Documents created",
      company: "Notion",
    },
    {
      value: "99.9%",
      label: "Uptime guarantee",
      company: "Figma",
    },
    {
      value: "50ms",
      label: "Average sync time",
      company: "Linear",
    },
    {
      value: "150+",
      label: "Countries worldwide",
      company: "Stripe",
    },
  ];

  return (
    <section className="border-y border-border bg-muted/30 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="font-sans font-bold text-4xl sm:text-5xl text-balance">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs font-semibold text-foreground/60 font-mono">
                {stat.company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
