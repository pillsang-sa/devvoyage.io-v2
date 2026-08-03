/**
 * Locale and time zone are pinned deliberately: the output then does not depend
 * on the build machine's settings, and it renders identically on the server and
 * in the browser, so no hydration correction is ever needed.
 */
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}
