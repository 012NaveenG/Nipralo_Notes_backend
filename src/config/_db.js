import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";

const _db = drizzle(process.env.DATABASE_URL);

export { _db };
