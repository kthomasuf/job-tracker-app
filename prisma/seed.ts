import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const sample = [
  {
    company: "Acme Corp",
    role: "Software Engineer",
    location: "New York, NY",
    lat: 40.7128,
    lng: -74.006,
    status: "Interviewing",
    dateApplied: new Date("2026-07-01"),
  },
  {
    company: "Globex",
    role: "Frontend Engineer",
    location: "Austin, TX",
    lat: 30.2672,
    lng: -97.7431,
    status: "Applied",
    dateApplied: new Date("2026-07-15"),
  },
  {
    company: "Initech",
    role: "Backend Engineer",
    location: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    status: "Rejected",
    dateApplied: new Date("2026-06-20"),
  },
  {
    company: "Umbrella Inc",
    role: "Full Stack Engineer",
    location: "Denver, CO",
    lat: 39.7392,
    lng: -104.9903,
    status: "Offer",
    dateApplied: new Date("2026-06-10"),
  },
  {
    company: "Hooli",
    role: "Software Engineer II",
    location: "Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    status: "Applied",
    dateApplied: new Date("2026-08-01"),
  },
];

async function main() {
  await prisma.application.deleteMany();
  await prisma.application.createMany({ data: sample });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
