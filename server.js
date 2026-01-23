// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const sizeOf = require("image-size");
const connectDB = require("./config/database");
const Child = require("./models/Child");
const { generateToken, verifyToken } = require("./middleware/auth");
const cloudStorage = require("./utils/cloudStorage");

const app = express();
const PORT = process.env.PORT || 3000;
const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL || "http://localhost:5000";
const DATA_PATH = path.join(__dirname, "assets", "data", "children.json");

// Connect to MongoDB
connectDB().catch((err) => {
  console.warn("⚠️  MongoDB not available, using JSON fallback");
});

// Check if MongoDB is connected
const useDatabase = () => {
  return require("mongoose").connection.readyState === 1;
};

// Optional font paths (add these files to assets/fonts to enable Unicode/IPA)
// Try both variable and regular Kannada font filenames
const FONT_KANNADA_VAR = path.join(
  __dirname,
  "assets",
  "fonts",
  "NotoSansKannada-VariableFont_wdth,wght.ttf",
);
const FONT_KANNADA_REG = path.join(
  __dirname,
  "assets",
  "fonts",
  "NotoSansKannada-Regular.ttf",
);
const FONT_KANNADA = fs.existsSync(FONT_KANNADA_REG)
  ? FONT_KANNADA_REG
  : FONT_KANNADA_VAR;
const FONT_LATIN = path.join(
  __dirname,
  "assets",
  "fonts",
  "NotoSans-Regular.ttf",
);

// Summarize SODA results into category counts
function summarizeSODA(results = []) {
  const summary = {
    Correct: 0,
    Substitution: 0,
    Omission: 0,
    Addition: 0,
    Distortion: 0,
  };
  results.forEach((item) => {
    if (item?.error_type === "Distortion") summary.Distortion++;
    else if (item?.error_type === "Substitution") summary.Substitution++;
    else if (item?.error_type === "Omission") summary.Omission++;
    else if (item?.error_type === "Addition") summary.Addition++;
    else summary.Correct++;
  });
  return summary;
}

// Allow cross-origin requests (important for browser to access this audio)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "https://kannada-speech.onrender.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Serve static files (place this before API routes)
app.use(express.static("."));

app.get("/tts", async (req, res) => {
  try {
    const { text, lang } = req.query;

    if (!text) {
      return res.status(400).send("Missing 'text' query parameter");
    }

    const encodedText = encodeURIComponent(text);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang || "kn-IN"}&client=tw-ob`;

    const response = await axios.get(ttsUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    // ✅ Set proper audio headers
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": response.data.length,
      "Access-Control-Allow-Origin": "*",
    });

    res.send(response.data);
  } catch (err) {
    console.error("TTS Error:", err.message);
    res.status(500).send("Error generating speech");
  }
});

// API to get children by age and search (robust Kannada key support)
app.get("/api/children", (req, res) => {
  const { age, search } = req.query;
  const dataPath = path.join(__dirname, "assets", "data", "children.json");
  let children = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  // Filter by age (support both string and number)
  if (age) {
    children = children.filter(
      (child) => String(child["ವಯಸ್ಸು"]).trim() === String(age).trim(),
    );
  }

  // Filter by search (case-insensitive, all Kannada keys)
  if (search) {
    const s = search.trim().toLowerCase();
    children = children.filter(
      (child) =>
        (child["ಹೆಸರು"] && String(child["ಹೆಸರು"]).toLowerCase().includes(s)) ||
        (child["ಪೋಷಕರು"] &&
          String(child["ಪೋಷಕರು"]).toLowerCase().includes(s)) ||
        (child["ನಗರ"] && String(child["ನಗರ"]).toLowerCase().includes(s)) ||
        (child["ಲಿಂಗ"] && String(child["ಲಿಂಗ"]).toLowerCase().includes(s)) ||
        (child["ಇಮೇಲ್"] && String(child["ಇಮೇಲ್"]).toLowerCase().includes(s)) ||
        (child["ವಿಳಾಸ"] && String(child["ವಿಳಾಸ"]).toLowerCase().includes(s)) ||
        (child["ದೂರವಾಣಿ"] &&
          String(child["ದೂರವಾಣಿ"]).toLowerCase().includes(s)),
    );
  }
  res.json(children);
});

// API to add a new child (Kannada fields)
app.post("/api/children", (req, res) => {
  const dataPath = path.join(__dirname, "assets", "data", "children.json");
  let children = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const newChild = req.body;
  newChild.id = children.length ? children[children.length - 1].id + 1 : 1;
  children.push(newChild);
  fs.writeFileSync(dataPath, JSON.stringify(children, null, 2));
  res.status(201).json(newChild);
});

// API to update a child's details
app.put("/api/children/:id", (req, res) => {
  const dataPath = path.join(__dirname, "assets", "data", "children.json");
  let children = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const childId = parseInt(req.params.id, 10);
  const childIndex = children.findIndex((c) => c.id === childId);

  if (childIndex === -1) {
    return res.status(404).json({ error: "Child not found" });
  }

  // Update child data while preserving existing reports
  const updatedChild = {
    ...children[childIndex],
    ...req.body,
    id: childId, // Ensure ID doesn't change
  };

  children[childIndex] = updatedChild;
  fs.writeFileSync(dataPath, JSON.stringify(children, null, 2));
  res.json(updatedChild);
});

// Add a new report for a child (SODA-first)
app.post("/api/children/:id/report", (req, res) => {
  let children = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const childId = parseInt(req.params.id, 10);
  const child = children.find((c) => c.id === childId);

  if (!child) return res.status(404).send("Child not found");

  const incoming = req.body || {};
  const sodaResults = Array.isArray(incoming.sodaResults)
    ? incoming.sodaResults
    : [];
  const summary = incoming.summary || summarizeSODA(sodaResults);
  const report = {
    ...incoming,
    date: incoming.date || new Date().toISOString(),
    sodaResults,
    summary,
  };

  if (!Array.isArray(child.reports)) child.reports = [];
  child.reports.push(report);

  fs.writeFileSync(DATA_PATH, JSON.stringify(children, null, 2));
  res.status(201).json(report);
});

// Get all reports for a child
app.get("/api/children/:id/reports", (req, res) => {
  const dataPath = path.join(__dirname, "assets", "data", "children.json");
  let children = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const childId = parseInt(req.params.id, 10);
  const child = children.find((c) => c.id === childId);
  if (!child) return res.status(404).send("Child not found");
  res.json(child.reports || []);
});

app.get("/download-reference-pdf", (req, res) => {
  const imgPath = path.join(__dirname, "assets", "reference.jpg");
  if (!fs.existsSync(imgPath)) {
    return res.status(404).send("Image not found");
  }

  const doc = new PDFDocument({ autoFirstPage: true, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Normative_Reference.pdf",
  );

  doc.pipe(res);

  // Fit the image to the A4 page with some margin
  doc.image(imgPath, {
    fit: [500, 750], // A4 size minus margins
    align: "center",
    valign: "center",
  });

  doc.end();
});

// Admin credentials (in production, use environment variables and hashed passwords)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

// Admin login endpoint
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  console.log("Admin login attempt:", { username, password }); // Debug log

  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    console.log("Admin login successful"); // Debug log
    res.json({ success: true, message: "Login successful" });
  } else {
    console.log("Admin login failed"); // Debug log
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Generate comprehensive report PDF
app.post("/api/generate-report", (req, res) => {
  try {
    const payload = req.body || {};
    const child = payload.childDetails || {};
    const report = payload.report || {};
    const sodaResults = Array.isArray(report.sodaResults)
      ? report.sodaResults
      : [];
    const summary = {
      Correct: report.summary?.Correct ?? 0,
      Substitution: report.summary?.Substitution ?? 0,
      Omission: report.summary?.Omission ?? 0,
      Addition: report.summary?.Addition ?? 0,
      Distortion: report.summary?.Distortion ?? 0,
    };
    const suggestions = Array.isArray(payload.suggestions)
      ? payload.suggestions
      : [];

    const doc = new PDFDocument({
      autoFirstPage: true,
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Register fonts if available for proper Kannada/IPA rendering
    if (fs.existsSync(FONT_KANNADA)) {
      doc.registerFont("kn", FONT_KANNADA);
    }
    if (fs.existsSync(FONT_LATIN)) {
      doc.registerFont("ipa", FONT_LATIN);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=child_report.pdf",
    );
    doc.pipe(res);

    // Debug log (non-sensitive)
    console.log(
      "Generating PDF for child:",
      child?.name || child?.["ಹೆಸರು"] || "",
      "records:",
      sodaResults.length,
    );

    // Title
    doc
      .fontSize(20)
      .font(fs.existsSync(FONT_KANNADA) ? "kn" : "Helvetica-Bold")
      .text("ಮಗುವಿನ ಪ್ರಗತಿ ವರದಿ", { align: "center" })
      .moveDown(0.5);

    // Child details
    doc
      .fontSize(14)
      .font(fs.existsSync(FONT_KANNADA) ? "kn" : "Helvetica-Bold")
      .text("ಮಗುವಿನ ವಿವರಗಳು", { underline: true })
      .moveDown(0.3);
    doc
      .fontSize(11)
      .font(fs.existsSync(FONT_KANNADA) ? "kn" : "Helvetica")
      .text(`ಹೆಸರು: ${child["ಹೆಸರು"] || child.name || ""}`)
      .text(`ವಯಸ್ಸು: ${child["ವಯಸ್ಸು"] || child.age || ""}`)
      .text(`ಲಿಂಗ: ${child["ಲಿಂಗ"] || child.gender || ""}`)
      .text(`ಪೋಷಕರು: ${child["ಪೋಷಕರು"] || child.parent || ""}`)
      .text(`ನಗರ: ${child["ನಗರ"] || child.city || ""}`)
      .text(`ಇಮೇಲ್: ${child["ಇಮೇಲ್"] || child.email || ""}`)
      .text(`ವಿಳಾಸ: ${child["ವಿಳಾಸ"] || child.address || ""}`)
      .moveDown(0.4);

    // Test meta
    doc
      .fontSize(14)
      .font(fs.existsSync(FONT_KANNADA) ? "kn" : "Helvetica-Bold")
      .text("ಪರೀಕ್ಷೆ ವಿವರ", { underline: true })
      .moveDown(0.3);
    doc
      .fontSize(11)
      .font(fs.existsSync(FONT_KANNADA) ? "kn" : "Helvetica")
      .text(
        `ಪರೀಕ್ಷೆಯ ದಿನಾಂಕ: ${report.date ? new Date(report.date).toLocaleString() : ""}`,
      )
      .text(`ಒಟ್ಟು ಸರಿಯಾದವು: ${summary.Correct ?? 0}`)
      .text(
        `ಒಟ್ಟು ತಪ್ಪುಗಳು: ${(summary.Substitution ?? 0) + (summary.Omission ?? 0) + (summary.Addition ?? 0) + (summary.Distortion ?? 0)}`,
      )
      .moveDown(0.6);

    // SODA table grouped by error type (simple text layout to avoid PDF NaN issues)
    doc
      .fontSize(14)
      .font(fs.existsSync(FONT_KANNADA) ? "kn" : "Helvetica-Bold")
      .text("SODA ವಿಶ್ಲೇಷಣೆ", { underline: true })
      .moveDown(0.3);
    const order = [
      "Correct",
      "Substitution",
      "Omission",
      "Addition",
      "Distortion",
    ];
    const labels = {
      Correct: "ಸರಿಯಾಗಿವೆ",
      Substitution: "ಬದಲಾವಣೆ",
      Omission: "ಹೊರಗುಳಿಕೆ",
      Addition: "ಸೇರಿಕೆ",
      Distortion: "ವಿಕೃತಿ",
    };

    const hasKannadaFont = fs.existsSync(FONT_KANNADA);
    const latinFont = fs.existsSync(FONT_LATIN) ? "ipa" : "Helvetica";

    order.forEach((type) => {
      const rows = sodaResults.filter(
        (r) => (r.error_type || "Correct") === type,
      );
      if (!rows.length) return;

      doc.moveDown(0.2);
      doc
        .fontSize(12)
        .font(hasKannadaFont ? "kn" : "Helvetica-Bold")
        .text(labels[type] || type);

      doc.fontSize(10).font(latinFont);
      doc.text("Error Type | Target Word | Spoken Phonemes");
      doc.text("------------------------------------------------------------");

      rows.forEach((r) => {
        const spoken = r.spoken_ipa || r.spoken || r.spoken_phonemes || "";
        const target = r.target_word || "";

        // Error type (Latin)
        doc.font(latinFont).text(`${type} | `, { continued: true });

        // Target word (Kannada if font available)
        if (hasKannadaFont) {
          doc.font("kn").text(target, { continued: true });
        } else {
          doc.font(latinFont).text(target, { continued: true });
        }

        // Spoken phonemes (Latin / IPA)
        doc.font(latinFont).text(` | ${spoken}`);
      });
      doc.moveDown(0.6);
    });

    /* ================= NEW ADDITION : FINAL SUMMARY ================= */

    doc.moveDown(1);

    /* ---- Correct List ---- */
    doc
      .fontSize(14)
      .font(hasKannadaFont ? "kn" : "Helvetica-Bold")
      .text("ಸರಿಯಾಗಿ ಉಚ್ಚರಿಸಿದ ಪದಗಳು", { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(11)
      .font(hasKannadaFont ? "kn" : "Helvetica")
      .text(
        Array.isArray(payload.correctList) && payload.correctList.length
          ? payload.correctList.join(", ")
          : "ಯಾವುದೂ ಇಲ್ಲ",
      );

    doc.moveDown(0.6);

    /* ---- Wrong List ---- */
    doc
      .fontSize(14)
      .font(hasKannadaFont ? "kn" : "Helvetica-Bold")
      .text("ತಪ್ಪಾಗಿ ಉಚ್ಚರಿಸಿದ ಪದಗಳು", { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(11)
      .font(hasKannadaFont ? "kn" : "Helvetica")
      .text(
        Array.isArray(payload.wrongList) && payload.wrongList.length
          ? payload.wrongList.join(", ")
          : "ಯಾವುದೂ ಇಲ್ಲ",
      );

    doc.moveDown(0.6);

    /* ---- Practice List ---- */
    doc
      .fontSize(14)
      .font(hasKannadaFont ? "kn" : "Helvetica-Bold")
      .text("ಅಭ್ಯಾಸಕ್ಕೆ ಅಗತ್ಯವಿರುವ ಧ್ವನಿಗಳು", { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(11)
      .font(hasKannadaFont ? "kn" : "latinFont")
      .text(
        Array.isArray(payload.practiceList) && payload.practiceList.length
          ? payload.practiceList.join(", ")
          : "ವಿಶೇಷ ಅಭ್ಯಾಸ ಅಗತ್ಯವಿಲ್ಲ",
      );

    doc.moveDown(0.6);

    /* ---- Final Suggestion ---- */
    doc
      .fontSize(14)
      .font(hasKannadaFont ? "kn" : "Helvetica-Bold")
      .text("ಒಟ್ಟು ಸಲಹೆ", { underline: true })
      .moveDown(0.3);

    doc
      .fontSize(11)
      .font(hasKannadaFont ? "kn" : "Helvetica")
      .text(
        payload.suggestion
          ? payload.suggestion
          : "ಮಗು ವಯಸ್ಸಿಗೆ ಅನುಗುಣವಾಗಿ ಧ್ವನಿಗಳನ್ನು ಸರಿಯಾಗಿ ಉಚ್ಚರಿಸುತ್ತಿದೆ. ನಿರಂತರ ಅಭ್ಯಾಸ ಮುಂದುವರಿಸಿರಿ.",
      );

    /* ================= END OF NEW ADDITION ================= */

    // // Suggestions
    // doc.fontSize(14).font(fs.existsSync(FONT_KANNADA) ? 'kn' : 'Helvetica-Bold').text('ಅಭ್ಯಾಸ ಶಿಫಾರಸುಗಳು', { underline: true }).moveDown(0.3);
    // doc.fontSize(11).font(fs.existsSync(FONT_KANNADA) ? 'kn' : 'Helvetica');
    // if (suggestions.length) {
    //   suggestions.forEach((s, idx) => doc.text(`${idx + 1}. ${s}`));
    // } else {
    //   doc.text('ಯಾವುದೇ ಶಿಫಾರಸುಗಳಿಲ್ಲ');
    // }

    // Footer
    doc
      .moveDown(1)
      .fontSize(9)
      .font(fs.existsSync(FONT_KANNADA) ? "kn" : "Helvetica")
      .text(`ವರದಿ ಉತ್ಪಾದಿಸಿದ ದಿನಾಂಕ: ${new Date().toLocaleString()}`, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ TTS Server running at http://localhost:${PORT}`);
  console.log(
    `🔐 Admin credentials: username: ${ADMIN_CREDENTIALS.username}, password: ${ADMIN_CREDENTIALS.password}`,
  );
});
