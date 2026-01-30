// main.js - minimal, robust renderer
"use strict";

async function loadJSON(path){
  try{
    const res = await fetch(path, {cache: "no-cache"});
    if(!res.ok) throw new Error("Échec récupération " + res.status);
    return await res.json();
  }catch(err){
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
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (!c) return;
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else node.appendChild(c);
  });
  return node;
}

function safeLink(href, text, classes = "", extra = {}) {
  const a = el("a", { href: href, class: classes, text });
  if (href && href.startsWith("http")) {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  }
  for (const [k,v] of Object.entries(extra)) a.setAttribute(k,v);
  return a;
}

function clearChildren(node){
  while(node.firstChild) node.removeChild(node.firstChild);
}

function renderHeaderLinks(navList, headerActions, data){
  clearChildren(navList);
  clearChildren(headerActions);

  const links = data.header && data.header.links ? data.header.links : [];
  for(const item of links){
    const li = el("li");
    const a = el("a", { href: item.href || "#", text: item.label || "" });
    li.appendChild(a);
    navList.appendChild(li);
  }

  // header action: CV download
  const cv = data.header && data.header.cv ? data.header.cv : "/public/cv.pdf";
  const btn = el("a", { href: cv, class: "button", text: "Télécharger le CV (PDF)" });
  btn.setAttribute("aria-label", "Télécharger le CV en PDF");
  headerActions.appendChild(btn);
}

function renderHero(heroSection, data){
  const title = data.hero && data.hero.title ? data.hero.title : "";
  const subtitle = data.hero && data.hero.subtitle ? data.hero.subtitle : "";
  document.getElementById("hero-title").textContent = title;
  document.getElementById("hero-subtitle").textContent = subtitle;

  const actions = document.getElementById("hero-actions");
  clearChildren(actions);
  const buttons = data.hero && data.hero.buttons ? data.hero.buttons : [];

  for(const b of buttons){
    const btnClass = b.primary ? "btn btn-primary" : "btn";
    const a = el("a", { href: b.href || "#", class: btnClass, text: b.label || "" });
    if(b.href && b.href.startsWith("#")){
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(b.href);
        if(target) target.scrollIntoView({behavior:"smooth", block:"start"});
      });
    } else if (b.href && b.href.startsWith("/")) {
      a.setAttribute("download", "");
    }
    actions.appendChild(a);
  }
}

function renderProfil(container, data){
  clearChildren(container);
  const lines = data.profil && data.profil.lines ? data.profil.lines : [];
  for(const line of lines){
    const p = el("p", { text: line });
    container.appendChild(p);
  }
}

function renderParcours(listNode, data){
  clearChildren(listNode);
  const items = data.parcours || [];
  for(const it of items){
    const li = el("li");
    const strong = el("strong", { text: it.range + " — " });
    li.appendChild(strong);
    li.appendChild(document.createTextNode((it.title ? it.title + " : " : "") + (it.desc || "")));
    listNode.appendChild(li);
  }
}

function renderNiveau(mathListNode, algoListNode, data){
  clearChildren(mathListNode);
  clearChildren(algoListNode);
  const math = data.niveau && data.niveau.math ? data.niveau.math : [];
  const algo = data.niveau && data.niveau.algo ? data.niveau.algo : [];
  for(const m of math){
    const li = el("li", { text: m });
    mathListNode.appendChild(li);
  }
  for(const a of algo){
    const li = el("li", { text: a });
    algoListNode.appendChild(li);
  }
}

function renderPreuves(gridNode, data){
  clearChildren(gridNode);
  const proofs = data.preuves || [];
  for(const p of proofs){
    const card = el("article", { class: "proof", role: "listitem" });

    const title = el("h4", { text: p.title || "" });
    const desc = el("p", { text: p.desc || "" });
    const actions = el("div", { class: "actions" });

    const href = p.href || "#";
    const label = p.button || "Ouvrir";
    const btnClass = p.pdf ? "btn" : "btn";

    const a = el("a", { href: href, class: btnClass, text: label });
    if (p.pdf || href.startsWith("/")) {
      a.setAttribute("download", "");
    }
    if (href && href.startsWith("http")) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
    actions.appendChild(a);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(actions);
    gridNode.appendChild(card);
  }
}

function renderContact(node, data){
  clearChildren(node);
  const c = data.contact || {};
  const dl = el("div");
  const mail = c.email || "[REPLACE_EMAIL]";
  const li = el("p", { html: `<strong>Email:</strong> <a href="mailto:${mail}">${mail}</a>` });
  dl.appendChild(li);
  if(c.linkedin){
    const L = el("p", { html: `<strong>LinkedIn:</strong> <a href="${c.linkedin}" target="_blank" rel="noopener noreferrer">${c.linkedin}</a>` });
    dl.appendChild(L);
  }
  if(c.github){
    const G = el("p", { html: `<strong>GitHub:</strong> <a href="${c.github}" target="_blank" rel="noopener noreferrer">${c.github}</a>` });
    dl.appendChild(G);
  }
  const note = el("p", { text: "Disponible pour échanger sur mon dossier et mon projet d’études." });
  node.appendChild(dl);
  node.appendChild(note);
}

function renderFooter(node, data){
  clearChildren(node);
  const f = data.footer || {};
  const left = el("div", { class: "small-muted", text: `${f.name || ""} — ${f.year || ""}` });
  const linksWrap = el("div");
  if(f.links && Array.isArray(f.links)){
    for(const l of f.links){
      const a = el("a", { href: l.href || "#", text: l.label || "" });
      if(l.href && l.href.startsWith("http")) a.setAttribute("target","_blank");
      a.className = "small-muted";
      linksWrap.appendChild(a);
      linksWrap.appendChild(document.createTextNode(" "));
    }
  }
  node.appendChild(left);
  node.appendChild(linksWrap);
}

function buildToc(data){
  const toc = document.getElementById("toc-list");
  clearChildren(toc);
  const sections = ["profil","parcours","niveau","preuves","contact"];
  for(const s of sections){
    const label = s[0].toUpperCase() + s.slice(1);
    const li = el("li");
    const a = el("a", { href: "#"+s, text: label });
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      document.getElementById(s).scrollIntoView({behavior:"smooth", block:"start"});
    });
    li.appendChild(a);
    toc.appendChild(li);
  }
}

async function init(){
  const data = await loadJSON("/data/content.json");
  if(!data){
    console.error("Impossible de charger content.json");
    return;
  }
  // Header
  const navList = document.querySelector(".nav-list");
  const headerActions = document.getElementById("header-actions");
  renderHeaderLinks(navList, headerActions, data);

  // Hero
  renderHero(document.getElementById("hero"), data);

  // Profil
  renderProfil(document.getElementById("profil-content"), data);

  // Parcours
  renderParcours(document.getElementById("parcours-list"), data);

  // Niveau
  renderNiveau(document.getElementById("niveau-math-list"), document.getElementById("niveau-algo-list"), data);

  // Preuves
  renderPreuves(document.getElementById("preuves-grid"), data);

  // Contact
  renderContact(document.getElementById("contact-content"), data);

  // Footer
  renderFooter(document.getElementById("footer-inner"), data);

  // TOC
  buildToc(data);
}

document.addEventListener("DOMContentLoaded", init);
