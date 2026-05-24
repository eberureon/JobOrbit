export function parseList(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function safeParseJson(text: string): string[] {
  try {
    const v = JSON.parse(text);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function buildMarkdown(
  values: {
    full_name: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    experience: string;
    education: string;
  },
  skills: string[],
  links: string[],
): string {
  const lines: string[] = [];
  lines.push(`# ${values.full_name || "Your Name"}`);
  if (values.headline) lines.push(`### ${values.headline}`);
  const contactBits = [values.email, values.phone, values.location].filter(Boolean);
  if (contactBits.length) lines.push(contactBits.join(" · "));
  lines.push("");
  if (values.summary) {
    lines.push("## Summary", "", values.summary, "");
  }
  if (skills.length) {
    lines.push("## Skills", "", skills.map((s) => `- ${s}`).join("\n"), "");
  }
  if (values.experience) {
    lines.push("## Experience", "", values.experience, "");
  }
  if (values.education) {
    lines.push("## Education", "", values.education, "");
  }
  if (links.length) {
    lines.push("## Links", "", links.map((l) => `- ${l}`).join("\n"), "");
  }
  return lines.join("\n");
}
