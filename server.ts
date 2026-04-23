import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { initializeApp, getApp, getApps } from "firebase-admin/app";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
}

// Global Firebase Admin Initialization
const adminApp = getApps().length === 0 ? initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: firebaseConfig.projectId
}) : getApp();

const firestore = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId || undefined);

const app = express();
const PORT = 3000;

app.use(express.json());

async function startServer() {
  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Secure Grading API
  app.post("/api/grade-submission", async (req, res) => {
    const { submissionId, examId } = req.body;
    
    if (!submissionId || !examId) {
      return res.status(400).json({ error: "Missing submissionId or examId" });
    }

    try {
      // 1. Fetch the submission
      const submissionRef = firestore.collection('submissions').doc(submissionId);
      const submissionSnap = await submissionRef.get();
      
      if (!submissionSnap.exists) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      const submissionData = submissionSnap.data();
      if (!submissionData) return res.status(500).json({ error: "Invalid submission data" });

      // 2. Fetch the correct answers
      const keyRef = firestore.collection('exam_keys').doc(examId);
      const keySnap = await keyRef.get();
      
      if (!keySnap.exists) {
        return res.status(404).json({ error: "Exam key not found" });
      }
      
      const keyData = keySnap.data();
      if (!keyData || !keyData.answers) return res.status(500).json({ error: "Invalid key data" });

      const correctAnswers = keyData.answers;
      const studentAnswers = submissionData.answers || {};
      
      // 3. Calculate Score
      let score = 0;
      const questionIds = Object.keys(correctAnswers);
      questionIds.forEach(qId => {
        if (studentAnswers[qId] !== undefined && String(studentAnswers[qId]) === String(correctAnswers[qId])) {
          score++;
        }
      });

      // 4. Update the submission
      await submissionRef.update({
        score,
        status: 'submitted',
        gradedAt: admin.firestore.FieldValue.serverTimestamp(),
        gradeMethod: 'server'
      });

      res.json({ success: true, score, totalQuestions: questionIds.length });
    } catch (error: any) {
      console.error("Grading error detail:", error);
      res.status(error.code === 7 ? 403 : 500).json({ 
        error: error.message || "Internal server error during grading",
        code: error.code
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
