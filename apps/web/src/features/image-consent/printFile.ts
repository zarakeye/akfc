/**
 * Impression d'un fichier servi par le site (PDF ou image), sans quitter la page : il est chargé
 * dans un cadre invisible puis imprimé par le navigateur. Si le navigateur refuse (Safari et
 * certains lecteurs PDF intégrés), le fichier s'ouvre dans un nouvel onglet, d'où l'imprimer.
 */
export function printFile(src: string, kind: "pdf" | "image"): void {
  // Safari (Mac, iPhone) imprime la page entière au lieu du PDF du cadre : on ouvre le PDF à part,
  // le visualiseur de Safari a son propre bouton d'impression.
  const safari = /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);
  if (kind === "pdf" && safari) {
    window.open(src, "_blank", "noopener");
    return;
  }
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  const cleanup = (): void => {
    window.setTimeout(() => frame.remove(), 60_000);
  };
  frame.onload = () => {
    try {
      const win = frame.contentWindow;
      if (!win) throw new Error("cadre indisponible");
      win.focus();
      win.print();
    } catch {
      window.open(src, "_blank", "noopener");
    }
    cleanup();
  };
  if (kind === "pdf") {
    frame.src = src;
  } else {
    const esc = src.replace(/"/g, "&quot;");
    frame.srcdoc = `<!doctype html><html><head><style>@page{margin:10mm}html,body{margin:0}img{display:block;max-width:100%;max-height:100vh;margin:auto}</style></head><body><img src="${esc}" alt=""></body></html>`;
  }
  document.body.appendChild(frame);
}
