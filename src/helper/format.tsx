/**
 * Format superscripts and fractions in a given text string.
 * - Converts "x^y" to <sup> tags.
 * - Converts "num/den" numerical fractions to a stacked layout.
 * - Converts "(expression) / (expression)" to a stacked layout.
 * Returns a React component using dangerouslySetInnerHTML.
 */
export const renderFormattedText = (text: string) => {
  if (!text) return "";

  // 1. Format superscripts (e.g. n^2, s^2)
  let formatted = text.replace(/([a-zA-Z0-9\(\)]+)\^([a-zA-Z0-9\(\)\-\+]+)/g, "$1<sup>$2</sup>");

  // 2. Format parenthesized algebraic fractions (e.g. (sin 4x) / (3x))
  // Matches: (expression) / (expression)
  formatted = formatted.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, (_, num, den) => {
    return `<span style="display: inline-flex; flex-direction: column; vertical-align: middle; align-items: center; padding: 0 4px; line-height: 1.1; font-size: 0.9em;"><span style="border-bottom: 1px solid currentColor; padding-bottom: 1.5px; width: 100%; text-align: center;">${num}</span><span style="padding-top: 1.5px; width: 100%; text-align: center;">${den}</span></span>`;
  });

  // 3. Format numerical fractions (e.g. 15/28), avoiding dates like 16/7/2026
  formatted = formatted.replace(/\b(\d+)\/(\d+)\b/g, (match, num, den, offset, fullText) => {
    const isDate = fullText[offset - 1] === "/" || fullText[offset + match.length] === "/";

    if (isDate) return match;

    return `<span style="display: inline-flex; flex-direction: column; vertical-align: middle; align-items: center; padding: 0 4px; line-height: 1.1; font-size: 0.9em;"><span style="border-bottom: 1px solid currentColor; padding-bottom: 1.5px; width: 100%; text-align: center;">${num}</span><span style="padding-top: 1.5px; width: 100%; text-align: center;">${den}</span></span>`;
  });

  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};
