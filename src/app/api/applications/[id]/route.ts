import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUSES } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { company, role, location, lat, lng, status, dateApplied } = body;

  if (status && !APPLICATION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  const application = await prisma.application.update({
    where: { id: Number(id) },
    data: {
      ...(company !== undefined && { company }),
      ...(role !== undefined && { role }),
      ...(location !== undefined && { location }),
      ...(lat !== undefined && { lat: Number(lat) }),
      ...(lng !== undefined && { lng: Number(lng) }),
      ...(status !== undefined && { status }),
      ...(dateApplied !== undefined && { dateApplied: new Date(dateApplied) }),
    },
  });

  return NextResponse.json(application);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.application.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
