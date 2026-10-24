export type TeamRole = "Coordinator" | "Senior Member";

export type TeamMember = {
  name: string;
  role: TeamRole;
  email?: string;
  photo?: string;
  codeforces?: string;
};

// Moves to the `members` table in Phase 6. Phone numbers stay out of public data.
export const team: TeamMember[] = [
  { name: "Vishwas Pahwa", role: "Coordinator", email: "iit2024087@iiita.ac.in" },
  { name: "Aditya Ajay", role: "Coordinator" },
  { name: "Aviral Awasthi", role: "Senior Member" },
  { name: "Dhruva Goyal", role: "Senior Member" },
  { name: "Kunal", role: "Senior Member" },
  { name: "Dewansh Khandelwal", role: "Senior Member" },
  { name: "Himanshu Vitthalani", role: "Senior Member" },
];
