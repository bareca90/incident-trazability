import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const MAX_SIZE   = parseInt(process.env.MAX_FILE_SIZE_MB ?? "20") * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    // Block executables
    const blocked = [".exe", ".bat", ".sh", ".cmd", ".ps1"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (blocked.includes(ext)) {
      cb(new Error(`Tipo de archivo no permitido: ${ext}`));
      return;
    }
    cb(null, true);
  },
});
