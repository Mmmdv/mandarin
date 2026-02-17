/**
 * Inserts soft hyphens (\u00AD) into text to allow for syllable-based line breaking.
 * Following linguistic rules for Azerbaijani, Russian, and English:
 * 
 * Azerbaijani: VC-CV, VCC-CV, V-CV
 * Russian: Split between consonants, but keep Ь, Ъ, Й with preceding letter.
 * English: Heuristic based on consonant clusters and vowel patterns.
 */
export const hyphenateText = (text: string): string => {
    if (!text) return "";

    // Comprehensive vowel list including English 'y'
    const vowels = "aeəiıoöuüаеёиоуыэюяy";
    const isVowel = (c: string) => c && vowels.includes(c.toLowerCase());

    // Russian "sticky" characters that should never start a syllable
    const russianSticky = "ьъй";
    const isSticky = (c: string) => c && russianSticky.includes(c.toLowerCase());

    // English digraphs that are usually kept together or handled specially
    const englishDigraphs = ["th", "sh", "ch", "ph", "ng", "qu", "gh", "ck"];

    return text.split(" ").map(word => {
        if (word.length <= 3) return word;

        const vowelIndices: number[] = [];
        for (let i = 0; i < word.length; i++) {
            if (isVowel(word[i])) vowelIndices.push(i);
        }

        if (vowelIndices.length <= 1) return word;

        const hyphenPositions = new Set<number>();

        for (let i = 0; i < vowelIndices.length - 1; i++) {
            const v1 = vowelIndices[i];
            const v2 = vowelIndices[i + 1];
            const numC = v2 - v1 - 1;

            let splitPos: number;

            if (numC === 0) {
                // Case V-V (e.g., "a-ile", "po-et")
                splitPos = v1;
            } else {
                // Rule: Split before the last consonant (V-CV, VC-CV, VCC-CV)
                splitPos = v2 - 2;

                // Adjust for Russian "sticky" characters (ь, ъ, й)
                // If the character AFTER the split is sticky, move split forward
                if (isSticky(word[splitPos + 1])) {
                    splitPos++;
                }

                // Adjust for English digraphs at the split point
                // If we are splitting in the middle of a digraph, adjust
                const potentialDigraph = word.substring(splitPos, splitPos + 2).toLowerCase();
                if (englishDigraphs.includes(potentialDigraph)) {
                    // Split after the digraph instead of in the middle
                    splitPos++;
                }

                // Never hyphenate at the very end of a word or before the last character
                if (splitPos >= word.length - 2) {
                    splitPos = v1; // Fallback to after first vowel or skip
                }
            }

            if (splitPos >= 0 && splitPos < word.length - 1) {
                hyphenPositions.add(splitPos);
            }
        }

        let hyphenatedWord = "";
        for (let i = 0; i < word.length; i++) {
            hyphenatedWord += word[i];
            if (hyphenPositions.has(i) && i < word.length - 1) {
                hyphenatedWord += "\u00AD";
            }
        }
        return hyphenatedWord;
    }).join(" ");
};
