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
 * rather than SVG so a lane stacks vertically when its container is too narrow
 * instead of shrinking its text or scrolling sideways, and so every color comes
 * from the theme tokens. From @2xl a lane stays on one row, and a long step
 * wraps inside its own box.
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
      <div className="@container space-y-5 rounded-lg border border-border bg-subtle/40 p-4 sm:p-5">
        {lanes.map((lane) => (
          <div key={lane.label}>
            <p className="font-mono text-xs font-medium tracking-wider text-muted">
              {lane.label}
            </p>
            <ol
              aria-label={`${title}: ${lane.label}`}
              className="mt-2 flex flex-col items-start @2xl:flex-row @2xl:items-stretch"
            >
              {lane.steps.map((step, index) => (
                <li
                  key={step.label}
                  className="flex max-w-full min-w-0 flex-col items-start @2xl:flex-row @2xl:items-stretch"
                >
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="ms-3 flex shrink-0 items-center py-0.5 text-muted @2xl:ms-0 @2xl:px-1.5 @2xl:py-0"
                    >
                      <span className="inline-block rotate-90 @2xl:rotate-0">
                        →
                      </span>
                    </span>
                  ) : null}
                  <span
                    className={`flex min-w-0 flex-col justify-center rounded-md border px-2.5 py-1.5 ${
                      step.key
                        ? "border-accent bg-background ring-1 ring-accent"
                        : "border-border bg-background"
                    }`}
                  >
                    <span
                      className={`text-sm leading-snug ${
                        step.key
                          ? "font-semibold text-accent"
                          : "font-medium text-foreground"
                      }`}
                    >
                      {step.label}
                      {step.key ? (
                        <span className="sr-only"> (핵심 단계)</span>
                      ) : null}
                    </span>
                    {step.note ? (
                      <span className="font-mono text-xs leading-snug text-muted">
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
