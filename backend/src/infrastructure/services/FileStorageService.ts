import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export class FileStorageService {
  ensureUploadDir(): void {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  getFilePath(filename: string): string {
    return path.join(UPLOAD_DIR, filename);
  }

  getSha256(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  deleteFile(filename: string): void {
    const fp = this.getFilePath(filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }

  getPublicUrl(filename: string): string {
    const base = process.env.PUBLIC_URL ?? "http://localhost:3000";
    return `${base}/uploads/${filename}`;
  }
}

export const fileStorageService = new FileStorageService();
