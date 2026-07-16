/**
 * Format superscripts in a given text string.
 * Converts patterns like "n^2" or "10^-5" to include <sup> tags.
 * Returns a React component using dangerouslySetInnerHTML.
 */
export const renderFormattedText = (text: string) => {
  if (!text) return "";
  
  const formatted = text.replace(
    /([a-zA-Z0-9\(\)]+)\^([a-zA-Z0-9\(\)\-\+]+)/g,
    "$1<sup>$2</sup>"
  );
  
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};
