/**
 * Conventional Commits. The preset's defaults are left alone except for the
 * two notes below; `scope` stays optional, since most changes here touch the
 * whole site rather than one area of it.
 */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // The preset allows 100. Keeping the header under 72 is what stops `git log
    // --oneline` and GitHub's commit list from truncating a subject mid-word.
    "header-max-length": [2, "always", 72],
    // Trailers carry URLs that no wrap can shorten, so the body is not measured.
    "body-max-line-length": [0],
  },
};

export default config;
