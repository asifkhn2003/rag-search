module.exports = {
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB

    MAX_HISTORY_MESSAGES: 10,

    CHUNK_SIZE: 1500, // target characters per chunk
    CHUNK_OVERLAP: 200, // characters repeated at start of next chunk

    RETRIEVAL_TOP_K: 4, // number of chunks to retrieve per query

    EMBEDDING_MODEL:  process.env.EMBEDDING_MODEL,
    ZEN_BASE_URL: process.env.ZEN_BASE_URL,
    ZEN_API_KEY: process.env.ZEN_API_KEY,

    PRIMARY_MODEL: process.env.PRIMARY_MODEL,
    FALLBACK_MODEL: process.env.FALLBACK_MODEL,
};