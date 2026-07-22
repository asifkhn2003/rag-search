const { CHUNK_SIZE, CHUNK_OVERLAP } = require("../config/constants");
/**
 * Split text into paragraphs (on blank lines), falling back to sentence
 * splitting for any paragraph that alone exceeds the chunk size.
 */
function splitIntoParagraphs(text) {
    return text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
}

function splitIntoSentences(text) {
    return text
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

/**
 * Split raw document text into overlapping chunks, respecting paragraph
 * and sentence boundaries where possible instead of cutting mid-sentence.
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    if (!text || typeof text !== "string" || !text.trim()) {
        return [];
    }

    const paragraphs = splitIntoParagraphs(text);
    const units = [];

    for (const para of paragraphs) {
        if (para.length <= chunkSize) {
            units.push(para);
        } else {
            units.push(...splitIntoSentences(para));
        }
    }

    const chunks = [];
    let current = "";

    for (const unit of units) {
        const candidate = current ? `${current}\n\n${unit}` : unit;

        if (candidate.length > chunkSize && current) {
            chunks.push(current);
            const tail = current.slice(-overlap);
            current = `${tail}\n\n${unit}`;
        } else {
            current = candidate;
        }
    }

    if (current.trim()) {
        chunks.push(current);
    }

    return chunks;
}

module.exports = { chunkText };