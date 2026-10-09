import { auth } from "@/auth";
import { getJobs } from "@/lib/actions/jobs";
import { JobTrackerApp } from "@/components/JobTrackerApp";
import { SignInScreen } from "@/components/SignInScreen";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return <SignInScreen />;
  }

  const jobs = await getJobs();

  return <JobTrackerApp initialJobs={jobs} userEmail={session.user.email} />;
}
