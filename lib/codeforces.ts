import "server-only";

export type CfUser = { rating?: number; rank?: string };

const API = "https://codeforces.com/api/user.info";
const CHUNK = 300;

/**
 * Current Codeforces rating per handle (keys lowercased), cached for an hour.
 * Unknown handles are dropped and retried; any other failure just means no colours.
 */
export async function getCfUsers(handles: string[]): Promise<Record<string, CfUser>> {
  const out: Record<string, CfUser> = {};
  const unique = [...new Set(handles.map((h) => h.toLowerCase()))];

  for (let i = 0; i < unique.length; i += CHUNK) {
    let chunk = unique.slice(i, i + CHUNK);
    for (let attempt = 0; attempt < 6 && chunk.length; attempt++) {
      try {
        const res = await fetch(`${API}?handles=${chunk.join(";")}&checkHistoricHandles=false`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(5000),
        });
        const body = (await res.json()) as {
          status: string;
          comment?: string;
          result?: { handle: string; rating?: number; rank?: string }[];
        };
        if (body.status === "OK") {
          for (const u of body.result ?? []) out[u.handle.toLowerCase()] = { rating: u.rating, rank: u.rank };
          break;
        }
        const missing = body.comment?.match(/handle (\S+) not found/i)?.[1]?.toLowerCase();
        if (!missing) break;
        chunk = chunk.filter((h) => h !== missing);
      } catch {
        break;
      }
    }
  }
  return out;
}

/** Codeforces rank colours, adjusted slightly so they read on both themes. */
export function ratingColor(rating?: number) {
  if (rating === undefined) return undefined;
  if (rating >= 2400) return "#e5383b";
  if (rating >= 2100) return "#f08c00";
  if (rating >= 1900) return "#b05ad6";
  if (rating >= 1600) return "#4a7bff";
  if (rating >= 1400) return "#14a8a0";
  if (rating >= 1200) return "#2fa84f";
  return "#8f8f8f";
}
