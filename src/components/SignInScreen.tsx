import { signIn } from "@/auth";

export function SignInScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <div className="text-[22px] font-semibold tracking-tight">Job Tracker</div>
        <div className="mt-1.5 text-sm text-[var(--muted)]">
          Sign in to add jobs and keep your application history in sync across devices.
        </div>
      </div>
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button
          type="submit"
          className="cursor-pointer rounded-md border-0 bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--surface)] hover:bg-[#3a3833]"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
