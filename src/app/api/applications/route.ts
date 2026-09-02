import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUSES } from "@/lib/types";

export async function GET() {
  const applications = await prisma.application.findMany({
    orderBy: { dateApplied: "desc" },
  });
  return NextResponse.json(applications);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { company, role, location, lat, lng, status, dateApplied } = body;

  if (!company || !role || !location || lat == null || lng == null) {
    return NextResponse.json(
      { error: "company, role, location, lat, and lng are required" },
      { status: 400 },
    );
  }

  if (status && !APPLICATION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      company,
      role,
      location,
      lat: Number(lat),
      lng: Number(lng),
      status: status ?? "Applied",
      dateApplied: dateApplied ? new Date(dateApplied) : undefined,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
