const express = require("express");
const cors = require("cors");
const db = require("./config/db");
require("dotenv").config();

const documentsRouter = require("./routes/documents");
const chatRouter = require("./routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "techfa support api is operational",
    });
});

app.use("/documents", documentsRouter);
app.use("/chat", chatRouter);

// multer general error handler
app.use((err, req, res, next) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
});

const PORT = process.env.PORT;

(async () => {
    try {
        await db.query("SELECT 1");
        console.log("Database connection established successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error.message);
        process.exit(1);
    }
})();