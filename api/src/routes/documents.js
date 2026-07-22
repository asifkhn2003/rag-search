const express = require("express");
const { PDFParse } = require("pdf-parse");
const db = require("../config/db");
const upload = require("../config/multer");
const { embedText } = require("../services/gemini");
const { chunkText } = require("../utils/chunker");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT d.id, d.title, d.filename, d.created_at,
                    COUNT(c.id) AS chunk_count
             FROM documents d
             LEFT JOIN document_chunks c ON c.document_id = d.id
             GROUP BY d.id
             ORDER BY d.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("List documents failed:", error);
        res.status(500).json({ error: "Failed to list documents." });
    }
});

router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "PDF file is required." });
    }

    const { originalname, mimetype, buffer } = req.file;

    if (mimetype !== "application/pdf") {
        return res.status(400).json({ error: "Only PDF files are supported currently." });
    }

    const client = await db.connect();

    try {
        const parsed = new PDFParse(new Uint8Array(buffer));
        const result = await parsed.getText();
        const text = result.text;

        if (!text || !text.trim()) {
            return res.status(422).json({ error: "No extractable text found in this PDF." });
        }

        // 2. Chunk text
        const chunks = chunkText(text);
        if (chunks.length === 0) {
            return res.status(422).json({ error: "Document produced no chunks after processing." });
        }

        await client.query("BEGIN");

        // 3. Insert document row
        const docResult = await client.query(
            `INSERT INTO documents (title, filename) VALUES ($1, $2) RETURNING id`,
            [originalname, originalname]
        );
        const documentId = docResult.rows[0].id;

        // 4. Embed + insert each chunk
        for (let i = 0; i < chunks.length; i++) {
            const chunkContent = chunks[i];
            const embedding = await embedText(chunkContent, "RETRIEVAL_DOCUMENT");

            await client.query(
                `INSERT INTO document_chunks (document_id, content, embedding, chunk_index)
         VALUES ($1, $2, $3, $4)`,
                [documentId, chunkContent, JSON.stringify(embedding), i]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Document uploaded and processed successfully.",
            documentId,
            chunkCount: chunks.length,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Document upload failed:", error);
        res.status(500).json({ error: "Failed to process document." });
    } finally {
        client.release();
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const result = await db.query(
            `DELETE FROM documents WHERE id = $1 RETURNING id`,
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Document not found." });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Delete document failed:", error);
        res.status(500).json({ error: "Failed to delete document." });
    }
});

module.exports = router;