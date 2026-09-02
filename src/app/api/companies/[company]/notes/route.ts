import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ company: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { company: companyParam } = await params;
  const company = decodeURIComponent(companyParam);

  const body = await request.json().catch(() => null);
  const notes = body?.notes;

  if (typeof notes !== "string") {
    return NextResponse.json({ error: "notes must be a string" }, { status: 400 });
  }

  const note = await prisma.companyNote.upsert({
    where: { company },
    update: { notes },
    create: { company, notes },
  });

  return NextResponse.json(note);
}
