export type ResourceKind = "video" | "playlist" | "extension" | "website" | "channel" | "blog" | "tool" | "sheet";

export type Resource = {
  title: string;
  url: string;
  kind: ResourceKind;
  source?: string;
  mustFollow?: boolean;
};

export type ResourceGroup = { title: string; note?: string; items: Resource[] };

export type ResourceSection = { id: string; eyebrow: string; title: string; intro: string; groups: ResourceGroup[] };

const chromeStore = (name: string) => `https://chromewebstore.google.com/search/${encodeURIComponent(name)}`;
const ytSearch = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const ytChannel = (q: string) => `${ytSearch(q)}&sp=EgIQAg%3D%3D`;

export const resourceSections: ResourceSection[] = [
  {
    id: "setup",
    eyebrow: "Step 0",
    title: "Installation & extensions",
    intro: "Get a working C++ setup, then add the tools that make contests faster.",
    groups: [
      {
        title: "Install C++ and an editor",
        items: [
          {
            title: "How to set up C/C++ in VS Code",
            url: ytSearch("Amit Thinks How to Setup C/C++ in VS Code Updated 2025"),
            kind: "video",
            source: "Amit Thinks",
          },
          { title: "Visual Studio Code", url: "https://code.visualstudio.com/", kind: "website", source: "code.visualstudio.com" },
          {
            title: "Best competitive coding setup (Sublime) for Linux, Windows & macOS",
            url: ytSearch("Luv Best Competitive Coding Setup for Linux Windows and MAC OS"),
            kind: "video",
            source: "Luv",
          },
        ],
      },
      {
        title: "Test-case parsers",
        note: "Pull sample tests straight from the problem page into your editor.",
        items: [
          {
            title: "Competitive Companion",
            url: "https://github.com/jmerle/competitive-companion",
            kind: "extension",
            source: "Chrome & Firefox",
          },
          {
            title: "CPH (Competitive Programming Helper)",
            url: "https://marketplace.visualstudio.com/items?itemName=DivyanshuAgrawal.competitive-programming-helper",
            kind: "extension",
            source: "VS Code",
          },
          {
            title: "FastOlympicCoding",
            url: "https://codeforces.com/blog/entry/60627",
            kind: "extension",
            source: "Sublime Text",
          },
        ],
      },
      {
        title: "Useful Codeforces extensions",
        items: [
          {
            title: "Carrot",
            url: "https://chromewebstore.google.com/detail/gakohpplicjdhhfllilcjpfildodfnnn",
            kind: "extension",
            source: "Live rating predictor",
          },
          { title: "CF Analytics", url: chromeStore("CF Analytics"), kind: "extension", source: "Chrome" },
          { title: "CF GetRating", url: chromeStore("CF GetRating"), kind: "extension", source: "Chrome" },
          { title: "CF College Standings", url: chromeStore("CF College Standings"), kind: "extension", source: "Chrome" },
          {
            title: "Codeforces Practice Tracker",
            url: chromeStore("Codeforces Practice Tracker"),
            kind: "extension",
            source: "Chrome",
          },
          {
            title: "Codeforces Rating-Based Heatmap",
            url: chromeStore("Codeforces Rating-Based Heatmap"),
            kind: "extension",
            source: "Chrome",
          },
        ],
      },
      {
        title: "LeetCode parsing",
        items: [
          { title: "LeetParse", url: chromeStore("LeetParse"), kind: "extension", source: "Chrome" },
          {
            title: "LeetParse for VS Code",
            url: "https://marketplace.visualstudio.com/search?term=LeetParse&target=VSCode",
            kind: "extension",
            source: "VS Code",
          },
        ],
      },
      {
        title: "Debugging & online IDE",
        items: [
          {
            title: "C++ Debug Template",
            url: "https://codeforces.com/blog/entry/125435",
            kind: "blog",
            source: "Codeforces blog",
          },
          {
            title: "CodeChef Online IDE",
            url: "https://www.codechef.com/ide",
            kind: "tool",
            source: "C++, Python, Java, Rust…",
          },
        ],
      },
    ],
  },
  {
    id: "learn",
    eyebrow: "Step 1",
    title: "Learn",
    intro: "Start with the must-follows, then branch out with the channels and catalogs below.",
    groups: [
      {
        title: "Must follow",
        items: [
          {
            title: "Competitive Programming / DSA Course (Hindi)",
            url: "https://www.youtube.com/playlist?list=PLauivoElc3ggagradg8MfOZreCMmXMmJ-",
            kind: "playlist",
            source: "Luv",
            mustFollow: true,
          },
          {
            title: "CSES Problem Set",
            url: "https://cses.fi/problemset/",
            kind: "website",
            source: "cses.fi",
            mustFollow: true,
          },
          {
            title: "Algorithms for Competitive Programming",
            url: "https://cp-algorithms.com/",
            kind: "website",
            source: "cp-algorithms.com",
            mustFollow: true,
          },
          {
            title: "USACO Guide",
            url: "https://usaco.guide/dashboard",
            kind: "website",
            source: "usaco.guide",
            mustFollow: true,
          },
          {
            title: "Codeforces EDU Courses",
            url: "https://codeforces.com/edu/courses",
            kind: "website",
            source: "codeforces.com",
            mustFollow: true,
          },
        ],
      },
      {
        title: "Practice sheets",
        note: "Curated problem lists to work through in order.",
        items: [
          { title: "C2 Ladders", url: "https://c2-ladders.com/", kind: "sheet", source: "Codeforces problems by rating" },
          {
            title: "TLE Eliminators CP-31 Sheet",
            url: "https://www.tle-eliminators.com/cp-sheet",
            kind: "sheet",
            source: "31 problems per rating, 800–1900",
          },
          {
            title: "Striver's A2Z DSA Sheet",
            url: "https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet",
            kind: "sheet",
            source: "takeuforward · DSA",
          },
        ],
      },
      {
        title: "YouTube channels",
        items: [
          { title: "Errichto Algorithms", url: "https://www.youtube.com/@Errichto", kind: "channel", source: "YouTube" },
          { title: "Priyansh Agarwal", url: ytChannel("Priyansh Agarwal"), kind: "channel", source: "YouTube" },
          { title: "Kartik Arora", url: ytChannel("Kartik Arora"), kind: "channel", source: "YouTube" },
          { title: "Utkarsh Gupta", url: ytChannel("Utkarsh Gupta"), kind: "channel", source: "YouTube" },
          { title: "CodeNCode", url: ytChannel("CodeNCode"), kind: "channel", source: "YouTube" },
        ],
      },
      {
        title: "Other resources",
        items: [
          { title: "Codeforces Catalog", url: "https://codeforces.com/catalog", kind: "website", source: "codeforces.com" },
        ],
      },
    ],
  },
];
