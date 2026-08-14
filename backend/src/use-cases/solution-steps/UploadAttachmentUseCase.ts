import { ISolutionStepRepository } from "../../domain/repositories/ISolutionStepRepository";
import { fileStorageService } from "../../infrastructure/services/FileStorageService";
import { NotFoundError } from "../../shared/errors/AppError";
import { TipoAdjunto } from "../../domain/entities/SolutionStep";
import path from "path";

const MIME_TO_TIPO: Record<string, TipoAdjunto> = {
  "image/jpeg": "imagen", "image/png": "imagen", "image/gif": "imagen", "image/webp": "imagen",
  "application/pdf": "documento", "application/msword": "documento",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "documento",
  "text/plain": "script", "text/x-sql": "script", "application/x-sh": "script",
  "application/zip": "comprimido", "application/x-rar-compressed": "comprimido",
};

export class UploadAttachmentUseCase {
  constructor(private repo: ISolutionStepRepository) {}

  async execute(stepId: string, file: Express.Multer.File, userId: string, descripcion?: string) {
    const step = await this.repo.findById(stepId);
    if (!step) throw new NotFoundError("Paso");

    const tipo: TipoAdjunto = MIME_TO_TIPO[file.mimetype] ?? "otro";
    const checksum = fileStorageService.getSha256(file.path);

    return this.repo.createAttachment({
      stepId,
      tipo,
      nombreOriginal: file.originalname,
      nombreStorage:  file.filename,
      rutaStorage:    file.path,
      mimeType:       file.mimetype,
      tamanoBytes:    BigInt(file.size),
      checksumSha256: checksum,
      descripcion,
      subidoPor:      userId,
    });
  }
}
