const express = require("express");

const { generateUploadUrl } = require("./storage");
 
const router = express.Router();
 
router.get("/upload-url", generateUploadUrl);
 
module.exports = router;
