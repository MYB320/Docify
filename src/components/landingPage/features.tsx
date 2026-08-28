import { Users, Zap, Lock, Sparkles } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Users,
      title: "Real-time collaboration",
      description:
        "See your team's cursors and edits in real-time. No more version conflicts or lost work.",
    },
    {
      icon: Zap,
      title: "Lightning fast",
      description:
        "Built on modern infrastructure. Experience instant sync across all devices with sub-50ms latency.",
    },
    {
      icon: Sparkles,
      title: "AI-powered writing",
      description:
        "Get intelligent suggestions, grammar fixes, and content improvements as you write.",
    },
    {
      icon: Lock,
      title: "Enterprise security",
      description:
        "End-to-end encryption, SSO, and compliance with SOC 2, GDPR, and HIPAA standards.",
    },
  ];

  return (
    <section className="py-24 sm:py-32" id="features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            Features
          </div>
          <h2 className="font-sans font-bold text-4xl sm:text-5xl text-balance mb-4">
            Everything you need to collaborate
          </h2>
          <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
            Powerful features designed for teams that move fast and ship quality
            work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-sans font-semibold text-xl text-balance">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-pretty leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
