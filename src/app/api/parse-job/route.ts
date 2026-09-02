import { NextRequest, NextResponse } from "next/server";
import { fetchLinkedInJob } from "@/lib/linkedin-job";

const LINKEDIN_JOB_URL = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/jobs\//i;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const url = body?.url;

  if (typeof url !== "string" || !LINKEDIN_JOB_URL.test(url)) {
    return NextResponse.json(
      { error: "Enter a linkedin.com/jobs/... URL" },
      { status: 400 },
    );
  }

  try {
    const job = await fetchLinkedInJob(url);

    if (!job.company && !job.role) {
      return NextResponse.json(
        { error: "Couldn't read that posting — fill in the fields manually" },
        { status: 422 },
      );
    }

    return NextResponse.json(job);
  } catch {
    return NextResponse.json(
      { error: "Couldn't reach that posting — fill in the fields manually" },
      { status: 502 },
    );
  }
}
