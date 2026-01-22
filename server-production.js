// server-production.js - Production-ready version with DB support
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

// Check if MongoDB is connected
const useDatabase = () => {
  return require("mongoose").connection.readyState === 1;
};

// Optional font paths (add these files to assets/fonts to enable Unicode/IPA)
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

// Admin credentials (from environment variables)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || "admin",
  password: process.env.ADMIN_PASSWORD || "admin123",
};

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

// Serve static files (place this before API routes)
app.use(express.static("."));

// Start server after attempting MongoDB connection
(async () => {
  // Try to connect to MongoDB
  try {
    await connectDB();
  } catch (err) {
    console.warn("⚠️  MongoDB not available, using JSON fallback");
  }

app.get("/tts", async (req, res) => {
  try {
    const text = req.query.text;
    const lang = req.query.lang;

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

// API to get children by age and search (supports both MongoDB and JSON fallback)
app.get("/api/children", async (req, res) => {
  try {
    const { age, search, gender } = req.query;

    if (useDatabase()) {
      // Use MongoDB
      let query = {};
      if (age) query.age = parseInt(age);
      if (gender) query.gender = new RegExp(`^${gender}$`, "i"); // Case-insensitive gender match
      if (search) {
        query.$or = [
          { name: new RegExp(search, "i") },
          { parent: new RegExp(search, "i") },
          { city: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ];
      }
      const children = await Child.find(query).select("-reports");
      return res.json(children);
    } else {
      // Fallback to JSON with Kannada key support
      let children = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

      if (age) {
        children = children.filter(
          (child) =>
            String(child["ವಯಸ್ಸು"] || child.age).trim() === String(age).trim(),
        );
      }

      if (search) {
        const s = search.trim().toLowerCase();
        children = children.filter(
          (child) =>
            (child["ಹೆಸರು"] &&
              String(child["ಹೆಸರು"]).toLowerCase().includes(s)) ||
            (child["ಪೋಷಕರು"] &&
              String(child["ಪೋಷಕರು"]).toLowerCase().includes(s)) ||
            (child["ನಗರ"] && String(child["ನಗರ"]).toLowerCase().includes(s)) ||
            (child.name && String(child.name).toLowerCase().includes(s)) ||
            (child.parent && String(child.parent).toLowerCase().includes(s)) ||
            (child.city && String(child.city).toLowerCase().includes(s)),
        );
      }
      return res.json(children);
    }
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ error: "Failed to fetch children" });
  }
});

// API to add a new child (supports both MongoDB and JSON fallback)
app.post("/api/children", async (req, res) => {
  try {
    if (useDatabase()) {
      // Use MongoDB
      const childData = { ...req.body };
      // Ensure phone is always present (even if empty string)
      if (!childData.phone) childData.phone = "";
      // Normalize gender to proper case
      if (childData.gender) {
        const genderLower = childData.gender.toLowerCase();
        if (genderLower === "male") childData.gender = "Male";
        else if (genderLower === "female") childData.gender = "Female";
        else if (genderLower === "other") childData.gender = "Other";
      }
      // Only allow fields defined in schema
      const allowedFields = [
        "name", "age", "gender", "parent", "city", "email", "address", "phone"
      ];
      const filteredData = {};
      for (const key of allowedFields) {
        if (childData[key] !== undefined) filteredData[key] = childData[key];
      }
      const newChild = new Child(filteredData);
      await newChild.save();
      return res.status(201).json(newChild);
    } else {
      // Fallback to JSON
      let children = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      const newChild = req.body;
      if (!newChild.phone) newChild.phone = "";
      newChild.id = children.length ? children[children.length - 1].id + 1 : 1;
      children.push(newChild);
      fs.writeFileSync(DATA_PATH, JSON.stringify(children, null, 2));
      return res.status(201).json(newChild);
    }
  } catch (error) {
    console.error("Error creating child:", error);
    res.status(500).json({ error: "Failed to create child record" });
  }
});

// API to update a child's details (supports both MongoDB and JSON fallback)
app.put("/api/children/:id", async (req, res) => {
  try {
    if (useDatabase()) {
      // Use MongoDB - search by custom id field, not _id
      const updateData = { ...req.body };
      // Normalize gender to proper case
      if (updateData.gender) {
        const genderLower = updateData.gender.toLowerCase();
        if (genderLower === "male") updateData.gender = "Male";
        else if (genderLower === "female") updateData.gender = "Female";
        else if (genderLower === "other") updateData.gender = "Other";
      }
      const child = await Child.findOneAndUpdate(
        { id: parseInt(req.params.id) },
        { $set: updateData },
        { new: true, runValidators: true },
      );
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }
      return res.json(child);
    } else {
      // Fallback to JSON
      let children = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      const childId = parseInt(req.params.id, 10);
      const childIndex = children.findIndex((c) => c.id === childId);

      if (childIndex === -1) {
        return res.status(404).json({ error: "Child not found" });
      }

      const updatedChild = {
        ...children[childIndex],
        ...req.body,
        id: childId,
      };

      children[childIndex] = updatedChild;
      fs.writeFileSync(DATA_PATH, JSON.stringify(children, null, 2));
      return res.json(updatedChild);
    }
  } catch (error) {
    console.error("Error updating child:", error);
    res.status(500).json({ error: "Failed to update child record" });
  }
});

// Add a new report for a child (supports both MongoDB and JSON fallback)
app.post("/api/children/:id/report", async (req, res) => {
  try {
    if (useDatabase()) {
      // Use MongoDB - search by custom id field, not _id
      const child = await Child.findOne({ id: parseInt(req.params.id) });
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }

      const incoming = req.body || {};
      const sodaResults = Array.isArray(incoming.sodaResults)
        ? incoming.sodaResults
        : [];
      const summary = incoming.summary || summarizeSODA(sodaResults);

      const newReport = {
        date: incoming.date || new Date(),
        ...incoming,
        sodaResults,
        summary,
      };

      child.reports.push(newReport);
      await child.save();
      return res.status(201).json(newReport);
    } else {
      // Fallback to JSON
      let children = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      const childId = parseInt(req.params.id, 10);
      const child = children.find((c) => c.id === childId);

      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }

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
      return res.status(201).json(report);
    }
  } catch (error) {
    console.error("Error adding report:", error);
    res.status(500).json({ error: "Failed to add report" });
  }
});

// Get all reports for a child (supports both MongoDB and JSON fallback)
app.get("/api/children/:id/reports", async (req, res) => {
  try {
    if (useDatabase()) {
      // Use MongoDB - search by custom id field, not _id
      const child = await Child.findOne({ id: parseInt(req.params.id) }).select("reports");
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }
      return res.json(child.reports || []);
    } else {
      // Fallback to JSON
      let children = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      const childId = parseInt(req.params.id, 10);
      const child = children.find((c) => c.id === childId);
      if (!child) {
        return res.status(404).json({ error: "Child not found" });
      }
      return res.json(child.reports || []);
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
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
  doc.image(imgPath, {
    fit: [500, 750],
    align: "center",
    valign: "center",
  });
  doc.end();
});

// Child login endpoint (by numeric id)
app.post("/api/children/login", async (req, res) => {
  try {
    if (!useDatabase()) {
      // Fallback to JSON
      let children = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      const { id, phone } = req.body;
      const child = children.find((c) => c.id === Number(id));
      if (child) {
        // Optionally check phone
        if (phone && child.phone && child.phone !== phone) {
          return res.status(401).json({ error: "Phone number does not match" });
        }
        return res.json(child);
      } else {
        return res.status(404).json({ error: "Child not found" });
      }
    } else {
      // Use MongoDB
      const { id, phone } = req.body;
      if (!id) return res.status(400).json({ error: "Child ID required" });
      const child = await Child.findOne({ id: Number(id) });
      if (!child) return res.status(404).json({ error: "Child not found" });
      // Optionally check phone
      if (phone && child.phone && child.phone !== phone) {
        return res.status(401).json({ error: "Phone number does not match" });
      }
      return res.json(child);
    }
  } catch (error) {
    console.error("Error in child login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Admin login endpoint with JWT token
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    const token = generateToken(username);
    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

// Protected admin route example
app.get("/api/admin/stats", verifyToken, async (req, res) => {
  try {
    if (useDatabase()) {
      const totalChildren = await Child.countDocuments();
      const childrenByAge = await Child.aggregate([
        { $group: { _id: "$age", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      return res.json({ totalChildren, childrenByAge });
    } else {
      const children = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      return res.json({ totalChildren: children.length });
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Generate comprehensive report PDF (kept from original for compatibility)
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

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Report_${child.name || "Child"}_${Date.now()}.pdf"`,
    );
    doc.pipe(res);

    // Register Kannada font if available
    const useKannadaFont = fs.existsSync(FONT_KANNADA);
    if (useKannadaFont) {
      doc.registerFont("Kannada", FONT_KANNADA);
      doc.registerFont("KannadaBold", FONT_KANNADA); // Use same font for bold
    }
    if (fs.existsSync(FONT_LATIN)) {
      doc.registerFont("Latin", FONT_LATIN);
    }

    // Kannada translations
    const labels = {
      title: "ಕನ್ನಡ ಮಾತು ಮೌಲ್ಯಮಾಪನ ವರದಿ",
      childDetails: "ಮಗುವಿನ ವಿವರಗಳು:",
      name: "ಹೆಸರು:",
      age: "ವಯಸ್ಸು:",
      gender: "ಲಿಂಗ:",
      parent: "ಪೋಷಕರು:",
      city: "ನಗರ:",
      summaryTitle: "SODA ವಿಶ್ಲೇಷಣೆ ಸಾರಾಂಶ:",
      correct: "ಸರಿ:",
      substitution: "ಬದಲಿ:",
      omission: "ಕಳೆದುಹೋಗಿದೆ:",
      addition: "ಸೇರಿಸಿದೆ:",
      distortion: "ವಿರೂಪ:",
      detailedAnalysis: "ವಿವರವಾದ ವಿಶ್ಲೇಷಣೆ:",
      word: "ಪದ:",
      error: "ದೋಷ:",
      recommendations: "ಶಿಫಾರಸುಗಳು:",
      na: "ಲಭ್ಯವಿಲ್ಲ",
      // Gender translations
      male: "ಪುರುಷ",
      female: "ಹೆಣ್ಣು",
      other: "ಇತರ",
      // Error type translations
      correctType: "ಸರಿ",
      substitutionType: "ಬದಲಿ",
      omissionType: "ಕಳೆದುಹೋಗಿದೆ",
      additionType: "ಸೇರಿಸಿದೆ",
      distortionType: "ವಿರೂಪ"
    };

    // Helper function to translate gender
    const translateGender = (gender) => {
      if (!gender) return labels.na;
      const g = gender.toLowerCase();
      if (g === "male") return labels.male;
      if (g === "female") return labels.female;
      if (g === "other") return labels.other;
      return gender;
    };

    // Helper function to translate error type
    const translateErrorType = (errorType) => {
      if (!errorType) return labels.na;
      const e = errorType.toLowerCase();
      if (e === "correct") return labels.correctType;
      if (e === "substitution") return labels.substitutionType;
      if (e === "omission") return labels.omissionType;
      if (e === "addition") return labels.additionType;
      if (e === "distortion") return labels.distortionType;
      return errorType;
    };

    // Set default font to Kannada if available, otherwise Helvetica
    const defaultFont = useKannadaFont ? "Kannada" : "Helvetica";
    const boldFont = useKannadaFont ? "KannadaBold" : "Helvetica-Bold";

    // Title
    doc
      .fontSize(20)
      .font(boldFont)
      .text(labels.title, { align: "center" });
    doc.moveDown();

    // Child details
    doc.fontSize(14).font(boldFont).text(labels.childDetails);
    doc.fontSize(12).font(defaultFont);
    doc.text(`${labels.name} ${child.name || labels.na}`);
    doc.text(`${labels.age} ${child.age || labels.na}`);
    doc.text(`${labels.gender} ${translateGender(child.gender)}`);
    doc.text(`${labels.parent} ${child.parent || labels.na}`);
    doc.text(`${labels.city} ${child.city || labels.na}`);
    doc.moveDown();

    // Summary
    doc.fontSize(14).font(boldFont).text(labels.summaryTitle);
    doc.fontSize(12).font(defaultFont);
    doc.text(`${labels.correct} ${summary.Correct}`);
    doc.text(`${labels.substitution} ${summary.Substitution}`);
    doc.text(`${labels.omission} ${summary.Omission}`);
    doc.text(`${labels.addition} ${summary.Addition}`);
    doc.text(`${labels.distortion} ${summary.Distortion}`);
    doc.moveDown();

    // Detailed results
    if (sodaResults.length > 0) {
      doc.fontSize(14).font(boldFont).text(labels.detailedAnalysis);
      doc.fontSize(10).font(defaultFont);
      sodaResults.forEach((item, index) => {
        const errorType = translateErrorType(item.error_type);
        const wordText = item.word || labels.na;
        doc.text(
          `${index + 1}. ${labels.word} ${wordText}, ${labels.error} ${errorType}`,
        );
      });
      doc.moveDown();
    }

    // Suggestions
    if (suggestions.length > 0) {
      doc.fontSize(14).font(boldFont).text(labels.recommendations);
      doc.fontSize(12).font(defaultFont);
      suggestions.forEach((sugg, idx) => {
        doc.text(`${idx + 1}. ${sugg}`);
      });
    }

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Start server (wrapped in async function at top)
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 TTS endpoint: http://localhost:${PORT}/tts?text=ಅಮ್ಮ`);
  console.log(`🔗 Python backend: ${PYTHON_BACKEND_URL}`);
  console.log(`💾 Database: ${useDatabase() ? "MongoDB" : "JSON fallback"}`);
  console.log(`☁️  Storage: ${cloudStorage.useCloud ? "Azure Blob" : "Local"}`);
  console.log(`🔐 Admin user: ${ADMIN_CREDENTIALS.username}`);
});

})(); // End of async function
