export type AlgorithmId = "mlkem" | "mldsa" | "slhdsa";

export interface AlgorithmData {
  id: AlgorithmId;
  name: string;
  fipsRef: string;
}

export const algorithms: AlgorithmData[] = [
  { id: "mlkem", name: "ML-KEM", fipsRef: "FIPS 203" },
  { id: "mldsa", name: "ML-DSA", fipsRef: "FIPS 204" },
  { id: "slhdsa", name: "SLH-DSA", fipsRef: "FIPS 205" },
];

export type TimelineId = "y2016" | "y2022" | "y2024" | "y2025" | "y2027" | "y2030" | "y2035";

export interface TimelineEntryData {
  id: TimelineId;
}

// Standardization milestones and the government mandate deadlines that
// follow from them, as one chronological spine rather than two separate
// timelines.
export const timeline: TimelineEntryData[] = [
  { id: "y2016" },
  { id: "y2022" },
  { id: "y2024" },
  { id: "y2025" },
  { id: "y2027" },
  { id: "y2030" },
  { id: "y2035" },
];

export type SourceId = "nist" | "nsa" | "cloudflare" | "csa";

export interface SourceData {
  id: SourceId;
  label: string;
  href: string;
}

export const sources: SourceData[] = [
  {
    id: "nist",
    label: "NIST CSRC",
    href: "https://csrc.nist.gov/projects/post-quantum-cryptography",
  },
  {
    id: "nsa",
    label: "NSA · CNSA 2.0",
    href: "https://www.nsa.gov/Press-Room/News-Highlights/Article/Article/3148990/",
  },
  {
    id: "cloudflare",
    label: "Cloudflare / shattered.io",
    href: "https://shattered.io/post-quantum-cryptography-2026/",
  },
  {
    id: "csa",
    label: "Cloud Security Alliance",
    href: "https://cloudsecurityalliance.org/blog/2024/08/15/nist-fips-203-204-and-205-finalized-an-important-step-towards-a-quantum-safe-future",
  },
];
