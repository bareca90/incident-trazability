import bcrypt from "bcryptjs";

export class HashService {
  private readonly ROUNDS = 12;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.ROUNDS);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

export const hashService = new HashService();
