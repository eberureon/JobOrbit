export function exportMarkdown(
  values: { full_name: string },
  skillsList: string[],
  linksList: string[],
  buildMarkdown: (values: any, skills: string[], links: string[]) => string,
) {
  const md = buildMarkdown(values, skillsList, linksList);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (values.full_name || "resume").replace(/\s+/g, "_").toLowerCase() + ".md";
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
