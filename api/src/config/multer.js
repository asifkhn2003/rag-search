const multer = require("multer");
const { MAX_FILE_SIZE } = require("./constants");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are supported currently."));
        }
        cb(null, true);
    },
});

module.exports = upload;