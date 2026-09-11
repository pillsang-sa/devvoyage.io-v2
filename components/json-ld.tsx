/**
 * Structured data belongs in a plain <script>, not `next/script`: it is data
 * for a crawler to read out of the HTML, not code to schedule and execute.
 *
 * `JSON.stringify` does not escape `</script>`, so a `<` anywhere in the payload
 * — a post title, a summary — could close the tag early and turn the rest of the
 * document into markup. Escaping it to `\u003c` keeps the JSON identical while
 * making that impossible.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
