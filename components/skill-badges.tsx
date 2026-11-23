/**
 * The badges sit at the top of the page, so they are on screen from the start
 * and need no observer — a staggered CSS animation is enough, and this stays a
 * Server Component. They are labels, not controls, so they have no hover state.
 */
export function SkillBadges({ skills }: { skills: readonly string[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <li
          key={skill}
          data-badge=""
          style={{ animationDelay: `${150 + index * 40}ms` }}
        >
          <span className="block cursor-default rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted">
            {skill}
          </span>
        </li>
      ))}
    </ul>
  );
}
