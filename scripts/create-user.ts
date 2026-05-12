import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] ?? "";

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <email> <password> [name]");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { email }, data: { passwordHash: hash, ...(name ? { name } : {}) } });
    console.log(`Updated password for ${email}`);
  } else {
    const hash = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { email, name: name || email.split("@")[0], passwordHash: hash, role: "ADMIN" } });
    console.log(`Created user ${email} (ADMIN)`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
