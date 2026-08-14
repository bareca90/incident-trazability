import app from "./infrastructure/http/app";
import { prisma } from "./infrastructure/database/prisma/client";
import { fileStorageService } from "./infrastructure/services/FileStorageService";

// Serialización segura de BigInt para JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const PORT = process.env.PORT ?? 3838;

async function bootstrap() {
  try {
    fileStorageService.ensureUploadDir();
    await prisma.$connect();
    console.log("✔ Conexión a PostgreSQL (Prisma) establecida correctamente");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📌 Entorno: ${process.env.NODE_ENV ?? "development"}`);
    });
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();

