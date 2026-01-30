// main.js - minimal, robust renderer (GitHub Pages safe)
"use strict";

async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error("Échec récupération " + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (!c) return;
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else node.appendChild(c);
  });
  return node;
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function isExternal(href) {
  return typeof href === "string" && href.startsWith("http");
}

function isPdf(href) {
  return typeof href === "string" && href.toLowerCase().endsWith(".pdf");
}

function renderHeaderLinks(navList, headerActions, data) {
  clearChildren(navList);
  clearChildren(headerActions);

  const links = data.header && data.header.links ? data.header.links : [];
  for (const item of links) {
    const li = el("li");
    const a = el("a", { href: item.href || "#", text: item.label || "" });
    if (isExternal(item.href)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
    li.appendChild(a);
    navList.appendChild(li);
  }

  // Header action: CV download (GitHub Pages safe relative path)
  const cv =
    data.header && data.header.cv ? data.header.cv : "./public/cv.pdf";

  const btn = el("a", {
    href: cv,
    class: "button",
    text: "Télécharger le CV (PDF)",
  });
  btn.setAttribute("aria-label", "Télécharger le CV en PDF");

  // Only force download if it's a pdf
  if (isPdf(cv)) btn.setAttribute("download", "");

  headerActions.appendChild(btn);
}

function renderHero(data) {
  const title = data.hero && data.hero.title ? data.hero.title : "";
  const subtitle = data.hero && data.hero.subtitle ? data.hero.subtitle : "";

  const t = document.getElementById("hero-title");
  const st = document.getElementById("hero-subtitle");
  if (t) t.textContent = title;
  if (st) st.textContent = subtitle;

  const actions = document.getElementById("hero-actions");
  if (!actions) return;

  clearChildren(actions);
  const buttons = data.hero && data.hero.buttons ? data.hero.buttons : [];

  for (const b of buttons) {
    const btnClass = b.primary ? "btn btn-primary" : "btn";
    const href = b.href || "#";
    const a = el("a", { href, class: btnClass, text: b.label || "" });

    if (href.startsWith("#")) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else if (isExternal(href)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }

    // Only force download for PDFs
    if (isPdf(href)) a.setAttribute("download", "");

    actions.appendChild(a);
  }
}

function renderProfil(container, data) {
  clearChildren(container);
  const lines = data.profil && data.profil.lines ? data.profil.lines : [];
  for (const line of lines) {
    container.appendChild(el("p", { text: line }));
  }
}

function renderParcours(listNode, data) {
  clearChildren(listNode);
  const items = Array.isArray(data.parcours) ? data.parcours : [];
  for (const it of items) {
    const li = el("li");
    const range = it.range ? String(it.range) : "";
    const title = it.title ? String(it.title) : "";
    const desc = it.desc ? String(it.desc) : "";

    if (range) li.appendChild(el("strong", { text: range + " — " }));
    li.appendChild(document.createTextNode((title ? title + " : " : "") + desc));
    listNode.appendChild(li);
  }
}

function renderNiveau(mathListNode, algoListNode, data) {
  clearChildren(mathListNode);
  clearChildren(algoListNode);

  const math = data.niveau && Array.isArray(data.niveau.math) ? data.niveau.math : [];
  const algo = data.niveau && Array.isArray(data.niveau.algo) ? data.niveau.algo : [];

  for (const m of math) mathListNode.appendChild(el("li", { text: m }));
  for (const a of algo) algoListNode.appendChild(el("li", { text: a }));
}

function renderPreuves(gridNode, data) {
  clearChildren(gridNode);
  const proofs = Array.isArray(data.preuves) ? data.preuves : [];

  for (const p of proofs) {
    const card = el("article", { class: "proof", role: "listitem" });

    const title = el("h4", { text: p.title || "" });
    const desc = el("p", { text: p.desc || "" });
    const actions = el("div", { class: "actions" });

    const href = p.href || "#";
    const label = p.button || "Ouvrir";

    const a = el("a", { href, class: "btn", text: label });

    if (isExternal(href)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }

    // Only force download for PDFs
    if (p.pdf || isPdf(href)) a.setAttribute("download", "");

    actions.appendChild(a);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(actions);
    gridNode.appendChild(card);
  }
}

function renderContact(node, data) {
  clearChildren(node);
  const c = data.contact || {};

  const wrap = el("div");
  const mail = c.email || "[REPLACE_EMAIL]";

  wrap.appendChild(
    el("p", {
      html: `<strong>Email:</strong> <a href="mailto:${mail}">${mail}</a>`,
    })
  );

  if (c.linkedin) {
    wrap.appendChild(
      el("p", {
        html: `<strong>LinkedIn:</strong> <a href="${c.linkedin}" target="_blank" rel="noopener noreferrer">${c.linkedin}</a>`,
      })
    );
  }

  if (c.github) {
    wrap.appendChild(
      el("p", {
        html: `<strong>GitHub:</strong> <a href="${c.github}" target="_blank" rel="noopener noreferrer">${c.github}</a>`,
      })
    );
  }

  node.appendChild(wrap);
  node.appendChild(
    el("p", { text: "Disponible pour échanger sur mon dossier et mon projet d’études." })
  );
}

function renderFooter(node, data) {
  clearChildren(node);
  const f = data.footer || {};

  const left = el("div", {
    class: "small-muted",
    text: `${f.name || ""} — ${f.year || ""}`,
  });

  const linksWrap = el("div");
  if (Array.isArray(f.links)) {
    for (const l of f.links) {
      const a = el("a", { href: l.href || "#", text: l.label || "" });
      if (isExternal(l.href)) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
      a.className = "small-muted";
      linksWrap.appendChild(a);
      linksWrap.appendChild(document.createTextNode(" "));
    }
  }

  node.appendChild(left);
  node.appendChild(linksWrap);
}

function buildToc() {
  const toc = document.getElementById("toc-list");
  if (!toc) return;

  clearChildren(toc);
  const sections = ["profil", "parcours", "niveau", "preuves", "contact"];

  for (const s of sections) {
    const label = s[0].toUpperCase() + s.slice(1);
    const li = el("li");
    const a = el("a", { href: "#" + s, text: label });

    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(s);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    li.appendChild(a);
    toc.appendChild(li);
  }
}

async function init() {
  // GitHub Pages safe: relative path (NOT "/data/content.json")
  const data = await loadJSON("./data/content.json");
  if (!data) {
    console.error("Impossible de charger content.json");
    return;
  }

  // Header
  const navList = document.querySelector(".nav-list");
  const headerActions = document.getElementById("header-actions");
  if (navList && headerActions) renderHeaderLinks(navList, headerActions, data);

  // Hero
  renderHero(data);

  // Profil
  const profil = document.getElementById("profil-content");
  if (profil) renderProfil(profil, data);

  // Parcours
  const parcours = document.getElementById("parcours-list");
  if (parcours) renderParcours(parcours, data);

  // Niveau
  const mathList = document.getElementById("niveau-math-list");
  const algoList = document.getElementById("niveau-algo-list");
  if (mathList && algoList) renderNiveau(mathList, algoList, data);

  // Preuves
  const preuves = document.getElementById("preuves-grid");
  if (preuves) renderPreuves(preuves, data);

  // Contact
  const contact = document.getElementById("contact-content");
  if (contact) renderContact(contact, data);

  // Footer
  const footer = document.getElementById("footer-inner");
  if (footer) renderFooter(footer, data);

  // TOC
  buildToc();
}

document.addEventListener("DOMContentLoaded", init);
