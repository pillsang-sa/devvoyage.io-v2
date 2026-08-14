/**
 * The badges sit at the top of the page, so they are on screen from the start
 * and need no observer — a staggered CSS animation is enough, and this stays a
 * Server Component. The entrance runs on the <li>; the hover lift runs on the
 * inner <span>, because a filled animation would otherwise win over the
 * hover's `transform`.
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
          <span className="block cursor-default rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted transition-[color,border-color,transform] hover:-translate-y-0.5 hover:border-accent hover:text-accent motion-reduce:hover:translate-y-0">
            {skill}
          </span>
        </li>
      ))}
    </ul>
  );
}
