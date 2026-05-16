import fs from "fs";

import * as pdfjs from "pdf-parse";

import Document from "../models/Document.js";

/* Upload Document */

export const uploadDocument = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // file path
    const filePath = req.file.path;

    // read file
    const dataBuffer = fs.readFileSync(filePath);

    // parse pdf
    const pdfData = await pdf(dataBuffer);

    // extracted text
    const text = pdfData.text || "";

    // metadata
    const metadata = {
      title:
        text.slice(0, 60) || "Untitled Document",

      summary:
        text.slice(0, 200) || "No summary generated",

      keywords: [
        "PDF",
        "Metadata",
        "AI",
      ],

      routedTo:
        req.user.domain || "general",

      confidence: "92%",
    };

    // save in mongodb
    const document = await Document.create({
      user: req.user._id,

      domain: req.user.domain,

      fileName: req.file.originalname,

      extractedText: text,

      metadata,
    });

    return res.status(201).json({
      message:
        "Document uploaded successfully",

      document,
    });

  } catch (error) {

    console.log("UPLOAD ERROR:");
    console.log(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

/* Fetch Documents */

export const getDocuments = async (req, res) => {
  try {

    const documents = await Document.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(documents);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};