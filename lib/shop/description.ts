import sanitizeHtml from 'sanitize-html';
export function formatDescription(html: string) {
  const headingRanks: number[] = [];
  const normalizeHeading: sanitizeHtml.Transformer = (tagName, attribs) => {
    const rank = Number(tagName.slice(1));
    while (headingRanks.length && headingRanks[headingRanks.length - 1] >= rank) {
      headingRanks.pop();
    }
    headingRanks.push(rank);
    return { tagName: `h${Math.min(headingRanks.length + 1, 6)}`, attribs };
  };
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'width', 'height'], th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'] },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    transformTags: {
      h1: normalizeHeading,
      h2: normalizeHeading,
      h3: normalizeHeading,
      h4: normalizeHeading,
      h5: normalizeHeading,
      h6: normalizeHeading,
    },
  });
}
