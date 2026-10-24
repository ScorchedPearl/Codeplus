// Create a member account from the terminal (needed for the very first account).
//
//   npm run member:add
//
// Asks for name, email and password; the password isn't shown while you type.

import { createInterface } from "node:readline/promises";
import postgres from "postgres";
import { hashPassword, passwordProblem } from "../lib/password.ts";

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function askHidden(question: string) {
  process.stdout.write(question);
  const stdin = process.stdin;
  stdin.setRawMode?.(true);
  stdin.resume();
  let value = "";
  return new Promise<string>((resolve) => {
    const onData = (buf: Buffer) => {
      for (const ch of buf.toString("utf8")) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode?.(false);
          stdin.off("data", onData);
          process.stdout.write("\n");
          return resolve(value);
        }
        if (ch === "\u0003") process.exit(130); // Ctrl+C
        if (ch === "\u007f") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

const name = (await rl.question("Name: ")).trim();
const email = (await rl.question("Email: ")).trim().toLowerCase();
rl.pause();
const password = await askHidden("Password: ");
const again = await askHidden("Repeat password: ");
rl.close();

if (!name || !email.includes("@")) throw new Error("Name and a valid email are required");
if (password !== again) throw new Error("Passwords don't match");
const problem = passwordProblem(password);
if (problem) throw new Error(problem);

const url = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_POOLED is not set (run with --env-file=.env.local)");
const sql = postgres(url, { prepare: false });
try {
  const [exists] = await sql`select 1 from members where lower(email) = ${email}`;
  if (exists) throw new Error("There's already an account with that email");
  await sql`insert into members (name, email, password_hash) values (${name}, ${email}, ${await hashPassword(password)})`;
  console.log(`Created an account for ${name}. Sign in at /login`);
} finally {
  await sql.end();
}
