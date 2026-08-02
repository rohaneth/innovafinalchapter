import { PrismaClient } from "@prisma/client";
import path from "path";

import { PrismaLibSql } from "@prisma/adapter-libsql";

const prismaClientSingleton = () => {
  const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
  
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
