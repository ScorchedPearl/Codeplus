export const site = {
  name: "CodePlus",
  institute: "IIIT Allahabad",
  location: "Prayagraj, Uttar Pradesh",
  tagline: "Learn. Compete. Grow.",
  description:
    "CodePlus is a program at the Indian Institute of Information Technology, Allahabad that fosters an interest in competitive programming and data structures & algorithms. Senior students are selected as Teaching Assistants who organise contests, run training sessions and workshops, and mentor juniors as they sharpen their problem-solving.",
  email: "iit2024087@iiita.ac.in",
  // TODO: fill in once the club shares its handles; empty entries are hidden
  socials: {
    codeforces: "",
    instagram: "",
    linkedin: "",
    discord: "",
  },
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/calendar", label: "Calendar" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/resources", label: "Resources" },
] as const;
