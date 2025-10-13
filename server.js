import app from "./app.js";
import cloudinary from "cloudinary";
import http from "http";
import { initSocket } from "./socket/index.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = http.createServer(app);

// Allow same origins used by Express CORS
const socketCorsOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((o) => (typeof o === "string" ? o.trim() : o));

initSocket(server, socketCorsOrigins);

server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
