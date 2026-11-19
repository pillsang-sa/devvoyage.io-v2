export type FlowStep = {
  label: string;
  note?: string;
  /* Marks the step the surrounding story is about. */
  key?: boolean;
};

export type FlowLane = {
  label: string;
  steps: FlowStep[];
};

/**
 * A request's path through the system, one lane per path. Built from HTML
 * rather than SVG so a lane wraps at phone width instead of shrinking its text
 * or scrolling sideways, and so every color comes from the theme tokens.
 */
export function RequestFlow({
  title,
  lanes,
  caption,
}: {
  title: string;
  lanes: FlowLane[];
  caption?: string;
}) {
  return (
    <figure className="mt-3">
      <div className="space-y-5 rounded-lg border border-border bg-subtle/40 p-4 sm:p-5">
        {lanes.map((lane) => (
          <div key={lane.label}>
            <p className="font-mono text-[11px] font-medium tracking-wider text-muted">
              {lane.label}
            </p>
            <ol
              aria-label={`${title}: ${lane.label}`}
              className="mt-2 flex flex-wrap items-stretch gap-y-2"
            >
              {lane.steps.map((step, index) => (
                <li key={step.label} className="flex items-stretch">
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="flex items-center px-1.5 text-muted"
                    >
                      →
                    </span>
                  ) : null}
                  <span
                    className={`flex flex-col justify-center rounded-md border px-2.5 py-1.5 ${
                      step.key
                        ? "border-accent bg-background"
                        : "border-border bg-background"
                    }`}
                  >
                    <span
                      className={`text-[13px] font-medium leading-snug ${
                        step.key ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.note ? (
                      <span className="font-mono text-[11px] leading-snug text-muted">
                        {step.note}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      {caption ? (
        <figcaption className="mt-2 text-xs leading-relaxed text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
