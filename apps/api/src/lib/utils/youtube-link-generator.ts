/**
 * Generates a YouTube search URL for a given DSA question title
 * @param questionTitle - The title of the DSA question
 * @returns YouTube search results URL
 * @example
 * generateYouTubeSearchLink("Two Sum") 
 * // Returns: "https://www.youtube.com/results?search_query=Two+Sum+leetcode+solution"
 */
export function generateYouTubeSearchLink(questionTitle: string): string {
    if (!questionTitle || questionTitle.trim() === '') {
        return '';
    }

    const searchQuery = `${questionTitle.trim()} leetcode solution`;
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://www.youtube.com/results?search_query=${encodedQuery}`;
}
