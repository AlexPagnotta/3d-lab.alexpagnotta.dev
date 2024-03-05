/**
 * Wrapper for the window.matchMedia function
 * @param query The query to match
 * @returns     List of matched media queries
 */
const getMatch = (query: string) => {
  return window.matchMedia(query);
};

/**
 * Parse media query removing the prefix
 * @param query The query to parse
 * @returns     The parsed media query
 */
const parseQueryString = (query: string) => {
  return query.replaceAll("@media only screen and", "").trim();
};

/**
 * Parse query and get listener
 * @param query Media query string
 * @returns     List of matched media queries
 */
export const parseAndMatch = (query: string) => getMatch(parseQueryString(query));
