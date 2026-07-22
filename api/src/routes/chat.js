const express = require("express");
const db = require("../config/db");
const { embedText, generateAnswer } = require("../services/gemini");
const { RETRIEVAL_TOP_K, MAX_HISTORY_MESSAGES } = require("../config/constants");

const router = express.Router();

router.post("/ask", async (req, res) => {
    const { question } = req.body;
    let { conversationId } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
        return res.status(400).json({ error: "Field 'question' is required and must be a non-empty string." });
    }

    const client = await db.connect();

    try {
        if (conversationId) {
            const check = await client.query(`SELECT id FROM conversations WHERE id = $1`, [conversationId]);
            if (check.rows.length === 0) {
                return res.status(404).json({ error: "conversation_id not found." });
            }
        } else {
            const created = await client.query(`INSERT INTO conversations DEFAULT VALUES RETURNING id`);
            conversationId = created.rows[0].id;
        }

        const historyResult = await client.query(
            `SELECT role, content FROM messages
             WHERE conversation_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [conversationId, MAX_HISTORY_MESSAGES]
        );
        const history = historyResult.rows.reverse();

        const queryEmbedding = await embedText(question, "RETRIEVAL_QUERY");

        const retrieval = await client.query(
            `SELECT content, chunk_index, document_id
             FROM document_chunks
             ORDER BY embedding <=> $1
             LIMIT $2`,
            [JSON.stringify(queryEmbedding), RETRIEVAL_TOP_K]
        );

        const contextChunks = retrieval.rows.map((row) => row.content);

        const answer = retrieval.rows.length === 0
            ? "I don't have any documents in my knowledge base yet to answer this question."
            : await generateAnswer(question, contextChunks, history);

        await client.query("BEGIN");
        await client.query(
            `INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'user', $2)`,
            [conversationId, question]
        );
        await client.query(
            `INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'assistant', $2)`,
            [conversationId, answer]
        );
        await client.query("COMMIT");

        res.status(200).json({
            answer,
            conversation_id: conversationId,
            sources: retrieval.rows.map((row) => ({
                documentId: row.document_id,
                chunkIndex: row.chunk_index,
            })),
        });
    } catch (error) {
        await client.query("ROLLBACK").catch(() => { });
        console.error("Chat ask failed:", error);
        res.status(500).json({ error: "Failed to process question." });
    } finally {
        client.release();
    }
});

module.exports = router;