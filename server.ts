import express from "express";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    try {
      const { email, version } = req.body;
      const apiKey = process.env.RESEND_API_KEY?.trim();

      if (!apiKey) return res.status(500).json({ error: "Missing API Key" });

      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "lakkmrinal@gmail.com",
        subject: `Portfolio Contact: ${email}`,
        html: `<strong>New message from:</strong> ${email}<br/><strong>Version:</strong> ${version}`,
      });

      if (error) return res.status(400).json({ error: error.name, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ error: "Server Error", message: err.message });
    }
  });

  // VITE MIDDLEWARE (Inlined Config to bypass Windows path errors)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: false, // CRITICAL: Tells Vite to ignore vite.config.ts
      root: process.cwd(),
      plugins: [react(), tailwindcss()], // Move plugins here
      server: { 
        middlewareMode: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();