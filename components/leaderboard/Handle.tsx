import { ratingColor, type CfUser } from "@/lib/codeforces";

export function Handle({ handle, user }: { handle: string; user?: CfUser }) {
  const color = ratingColor(user?.rating);
  return (
    <a
      href={`https://codeforces.com/profile/${encodeURIComponent(handle)}`}
      target="_blank"
      rel="noreferrer"
      title={user?.rating ? `${user.rank ?? "rated"} · ${user.rating}` : "View on Codeforces"}
      className="font-semibold hover:underline"
      style={{ color: color ?? "var(--ink)" }}
    >
      {handle}
    </a>
  );
}
