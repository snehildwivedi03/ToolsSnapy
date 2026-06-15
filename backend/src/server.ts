import app from "./app.js";
import { startCleanupService } from "./services/share/cleanup.service.js";

const PORT = Number(process.env.PORT) || 5000;

// Start listening and log the running environment
app.listen(PORT, () => {
  console.log(`[ToolSnapy] Server running on http://localhost:${PORT}`);
  console.log(`[ToolSnapy] Health: http://localhost:${PORT}/api/health`);
  console.log(`[ToolSnapy] ENV: ${process.env.NODE_ENV ?? "development"}`);
  startCleanupService();
});
