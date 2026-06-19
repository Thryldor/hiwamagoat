/* =========================================================================
   CONFIG — modifie ces valeurs (puis dépose les fichiers dans assets/)
   ========================================================================= */
const CONFIG = {
  illustrations: [
    { src: "assets/illu_1.png", alt: "Illustration 1 de Hiwamari" },
    { src: "assets/illu_2.png", alt: "Illustration 2 de Hiwamari" },
  ],
  artiste: {
    photo: "assets/nexemesis.jpg",
    nom: "Nexemesis",
    message: "Bon retour Mari ! Ta communauté est géniale, chéris les à tout jamais ces gros trolls !",
    twitter: "https://x.com/nexemesis",
    vgen: "https://vgen.co/nexemesis",
  },
  // Pseudos qui défilent sur l'accueil (le 1er est le pseudo principal)
  alias: ["Hiwamari", "Mawi", "Mowi", "Pwincess des fleurs", "HiwaMaStar", "HiwaMarmotte", "HiwamaForceuse", "HiwamaFit", "HiwamaGoat"],
  musique: "assets/shadow.mp3",
  // Date/heure du dernier stream (heure locale) — pour le compteur sur l'accueil
  dernierStream: "2026-05-27T20:33:00",
  // Émotes affichées sur le bouton "Entrer" quand il esquive (petite blague)
  emotes: {
    haha: "assets/hiwamaHaha.webp",     // 1ʳᵉ esquive
    sideye: "assets/hiwamaSideye.webp", // dernière esquive
    noo: "assets/hiwamaNoo.webp",       // message des Flowy
  },
};

/* ========================================================================= */

const $ = (sel) => document.querySelector(sel);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- Fond : étoiles + pétales flottants ---- */
function buildBackground() {
  const layer = $("#bgLayer");
  if (!layer) return;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--dur", `${3 + Math.random() * 4}s`);
    star.style.setProperty("--delay", `${Math.random() * 4}s`);
    frag.appendChild(star);
  }
  for (let i = 0; i < 14; i++) {
    const petal = document.createElement("div");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--size", `${10 + Math.random() * 12}px`);
    petal.style.setProperty("--dur", `${10 + Math.random() * 10}s`);
    petal.style.setProperty("--delay", `${Math.random() * 12}s`);
    frag.appendChild(petal);
  }
  // Fleurs (5 pétales + cœur) qui dérivent, en plus des pétales
  const blossomVariants = ["a", "b", "c"];
  for (let i = 0; i < 12; i++) {
    const b = makeBloom(blossomVariants[i % 3]);
    b.style.setProperty("--bsize", `${18 + Math.round(Math.random() * 22)}px`);
    b.style.left = `${Math.random() * 100}%`;
    b.style.setProperty("--dur", `${14 + Math.random() * 12}s`);
    b.style.setProperty("--delay", `${-Math.random() * 16}s`);
    frag.appendChild(b);
  }
  layer.appendChild(frag);
}

/* Fabrique une fleur (5 pétales + cœur) — réutilisée pour le fond et la carte */
function makeBloom(variant) {
  const b = document.createElement("div");
  b.className = "blossom blossom--" + variant;
  for (let p = 0; p < 5; p++) {
    const petal = document.createElement("span");
    petal.className = "blossom__petal";
    petal.style.setProperty("--pa", `${p * 72}deg`);
    b.appendChild(petal);
  }
  const core = document.createElement("span");
  core.className = "blossom__core";
  b.appendChild(core);
  return b;
}

/* ---- Tournesol : génère les pétales des deux rangées ---- */
function buildSunflower() {
  const fill = (selector, count, offsetDeg) => {
    const layer = document.querySelector(selector);
    if (!layer) return;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement("div");
      petal.className = "sf-petal";
      petal.style.setProperty("--a", `${offsetDeg + i * (360 / count)}deg`);
      layer.appendChild(petal);
    }
  };
  fill(".sunflower__petals--outer", 18, 0);
  fill(".sunflower__petals--inner", 14, 360 / 28); // décalage d'un demi-pétale
}

/* ---- Audio ---- */
const audio = $("#bgAudio");
const soundControl = $("#soundControl");
const soundBtn = $("#soundBtn");
const volumeSlider = $("#volumeSlider");

function initAudio() {
  audio.src = CONFIG.musique;
  audio.volume = parseFloat(volumeSlider.value);
}

function startMusic() {
  // Démarre au geste utilisateur (politique autoplay). Échoue silencieusement
  // si le fichier est absent.
  const reveal = () => { soundControl.hidden = false; };
  audio.play().then(reveal).catch(reveal);
}

// Met l'icône à jour selon l'état (coupé / volume bas / volume haut)
function updateSoundIcon() {
  let icon, label;
  if (audio.muted || audio.volume === 0) {
    icon = "🔇"; label = "Activer le son";
  } else if (audio.volume < 0.25) {
    icon = "🔉"; label = "Couper le son";
  } else {
    icon = "🔊"; label = "Couper le son";
  }
  soundBtn.textContent = icon;
  soundBtn.setAttribute("aria-label", label);
}

// Clic sur le bouton = coupe / réactive le son
function toggleSound() {
  audio.muted = !audio.muted;
  updateSoundIcon();
}

// Slider = règle le volume (et réactive le son si coupé)
function onVolumeChange() {
  audio.volume = parseFloat(volumeSlider.value);
  if (audio.muted && audio.volume > 0) audio.muted = false;
  updateSoundIcon();
}

soundBtn.addEventListener("click", toggleSound);
volumeSlider.addEventListener("input", onVolumeChange);

/* ---- Transition entre écrans ---- */
const homeScreen = $("#home");
const showcaseScreen = $("#showcase");
const enterBtn = $("#enterBtn");
const heroSunflower = $("#heroSunflower");

function goToShowcase() {
  startMusic();

  const duration = prefersReducedMotion ? 0 : parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--transition-screen")
  ) || 900;

  homeScreen.classList.add("is-leaving");
  heroSunflower.classList.add("is-blooming");

  // Affiche le showcase à la fin de la transition pour un fondu croisé
  setTimeout(() => {
    homeScreen.classList.remove("is-active", "is-leaving");
    showcaseScreen.classList.add("is-active", "is-entering");
    showcaseScreen.setAttribute("aria-hidden", "false");
    homeScreen.setAttribute("aria-hidden", "true");
    // Sort le focus de l'écran caché (évite un focus sous aria-hidden)
    enterBtn.blur();
    showcaseScreen.focus();
  }, duration);
}

/* Petite blague : le bouton esquive (survol sur desktop, tap sur mobile) puis se laisse attraper */
let dodgeCount = 0;
const MAX_DODGES = 3;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function setEnterContent(src, label) {
  enterBtn.innerHTML = `<img class="enter-emote" src="${src}" alt="" /><span class="enter-label">${label}</span>`;
}

let dodgeTx = 0, dodgeTy = 0;
let homeCX = null, homeCY = null;   // position de repos du bouton (capturée une fois)

function dodge() {
  if (prefersReducedMotion || dodgeCount >= MAX_DODGES) return;
  dodgeCount++;

  if (dodgeCount >= MAX_DODGES) {
    // Se rend : revient au centre et redevient normal
    enterBtn.classList.remove("is-dodging");
    enterBtn.style.transform = "";
    dodgeTx = dodgeTy = 0;
    enterBtn.textContent = "Bon allez entre";
    return;
  }

  // Capture la position de repos une seule fois (bouton immobile au départ)
  if (homeCX === null) {
    const r0 = enterBtn.getBoundingClientRect();
    homeCX = r0.left + r0.width / 2;
    homeCY = r0.top + r0.height / 2;
  }

  // Émote + texte : sideye/« Bah alors ? » sur la dernière esquive, sinon haha/« Haha ! »
  const isLastDodge = dodgeCount === MAX_DODGES - 1;
  if (isLastDodge) setEnterContent(CONFIG.emotes.sideye, "Bah alors ?");
  else setEnterContent(CONFIG.emotes.haha, "Haha !");

  enterBtn.classList.add("is-dodging");

  // Saut ALÉATOIRE vers un point visible, assez loin de la position logique actuelle
  const W = window.innerWidth, H = window.innerHeight;
  const halfW = 160, halfH = 70;                 // marge conservatrice (émote + texte)
  const minX = halfW, maxX = W - halfW;
  const minY = halfH, maxY = H - halfH;
  const curX = homeCX + dodgeTx, curY = homeCY + dodgeTy;  // position logique (pas le rect en vol)
  const minDist = Math.min(360, (maxX - minX) * 0.6, (maxY - minY) * 0.6);
  let best = { x: curX, y: curY }, bestD = -1;
  for (let i = 0; i < 50; i++) {
    const tx = minX + Math.random() * Math.max(0, maxX - minX);
    const ty = minY + Math.random() * Math.max(0, maxY - minY);
    const d = Math.hypot(tx - curX, ty - curY);
    if (d > bestD) { bestD = d; best = { x: tx, y: ty }; }
    if (d >= minDist) break;   // assez loin : on garde ce point
  }
  // translate ABSOLU depuis la position de repos (toujours dans les bornes)
  dodgeTx = best.x - homeCX;
  dodgeTy = best.y - homeCY;
  enterBtn.style.transform = `translate(${dodgeTx}px, ${dodgeTy}px)`;
}

// Desktop (souris) : esquive au survol
enterBtn.addEventListener("mouseenter", () => { if (canHover) dodge(); });

// Clic / tap : desktop entre directement ; mobile esquive d'abord, puis entre une fois attrapé
function handleEnterClick() {
  if (prefersReducedMotion) { goToShowcase(); return; }
  if (!canHover && dodgeCount < MAX_DODGES) { dodge(); return; }
  goToShowcase();
}
enterBtn.addEventListener("click", handleEnterClick);

/* ---- Galerie : illustrations + artiste ---- */
const stage = $("#stage");
const stageImg = $("#stageImg");
const thumbsWrap = $("#thumbs");

let currentIndex = 0;
const illus = CONFIG.illustrations;

function populateArtist() {
  const pp = $("#artistPp");
  // Si la photo est absente : image transparente -> seul le cercle dégradé reste (pas d'icône cassée)
  pp.addEventListener("error", () => {
    pp.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";
  }, { once: true });
  pp.src = CONFIG.artiste.photo;
  pp.alt = `Photo de profil de ${CONFIG.artiste.nom}`;
  $("#artistName").textContent = CONFIG.artiste.nom;

  // Message de l'artiste (masqué si absent)
  const msg = $("#artistMessage");
  if (msg) {
    if (CONFIG.artiste.message) msg.textContent = CONFIG.artiste.message;
    else msg.style.display = "none";
  }

  // Liens sociaux : X + VGen (masqués si absents)
  const setSocial = (id, url) => {
    const el = $(id);
    if (!el) return;
    if (url) el.href = url;
    else el.style.display = "none";
  };
  setSocial("#artistTwitter", CONFIG.artiste.twitter);
  setSocial("#artistVgen", CONFIG.artiste.vgen);

  // Emotes du message des Flowy (noo + sideye)
  const setFlowyEmote = (sel, key) => {
    const el = $(sel);
    if (el && CONFIG.emotes && CONFIG.emotes[key]) {
      el.addEventListener("error", () => { el.style.display = "none"; }, { once: true });
      el.src = CONFIG.emotes[key];
      el.alt = key;
    }
  };
  setFlowyEmote("#flowyEmoteNoo", "noo");
  setFlowyEmote("#flowyEmote", "sideye");
}

/* Fleurs décoratives (même type que le fond) encadrant la carte « Message des Flowy » */
function buildFlowyFlowers() {
  const card = $("#flowyCard");
  if (!card) return;
  const specs = [
    { cls: "fd--1", variant: "c" },
    { cls: "fd--2", variant: "a" },
    { cls: "fd--3", variant: "b" },
    { cls: "fd--4", variant: "c" },
  ];
  specs.forEach((s) => {
    const f = makeBloom(s.variant);
    f.classList.add("deco-bloom", s.cls);
    f.setAttribute("aria-hidden", "true");
    card.appendChild(f);
  });
}

// Précharge toutes les illustrations dès l'accueil (elles sont lourdes) :
// switch et lightbox deviennent instantanés une fois sur le showcase.
function preloadIllustrations() {
  illus.forEach((it) => {
    const img = new Image();
    img.decoding = "async";
    img.src = it.src;
  });
}

function buildThumbs() {
  illus.forEach((it, i) => {
    const btn = document.createElement("button");
    // Verrouillée par défaut : l'aperçu reste masqué tant que l'illu n'a pas été vue
    btn.className = "thumb is-locked" + (i === 0 ? " is-active" : "");
    btn.setAttribute("aria-label", `Illustration ${i + 1} (à découvrir)`);
    const img = document.createElement("img");
    img.alt = "";
    const lock = document.createElement("span");
    lock.className = "thumb__lock";
    lock.textContent = "?";
    lock.setAttribute("aria-hidden", "true");
    btn.append(img, lock);
    btn.addEventListener("click", () => showIllu(i, i >= currentIndex ? 1 : -1));
    thumbsWrap.appendChild(btn);
  });
}

// Révèle l'aperçu d'une vignette une fois l'illustration vue
function unlockThumb(i) {
  const btn = thumbsWrap.children[i];
  if (!btn || !btn.classList.contains("is-locked")) return;
  btn.querySelector("img").src = illus[i].src;
  btn.classList.remove("is-locked");
  btn.setAttribute("aria-label", `Illustration ${i + 1}`);
}

let swapAnim = null;
let swapTimer = null;
const SWAP_DURATION = 640;

function showIllu(index, direction = 1) {
  currentIndex = (index + illus.length) % illus.length;
  const data = illus[currentIndex];

  // vignette active + révélée (l'illu est désormais vue)
  [...thumbsWrap.children].forEach((t, i) => t.classList.toggle("is-active", i === currentIndex));
  unlockThumb(currentIndex);

  const apply = () => { stageImg.src = data.src; stageImg.alt = data.alt; };

  // Premier affichage ou mouvement réduit : swap direct
  if (!stageImg.getAttribute("src") || prefersReducedMotion || !stageImg.animate) {
    apply();
    return;
  }

  // Annule une transition en cours (clics rapides)
  if (swapAnim) swapAnim.cancel();
  if (swapTimer) clearTimeout(swapTimer);

  const dx = 80 * direction;
  // L'ancienne illu glisse dehors (flou + rotation + shrink), reste invisible
  // pendant le swap, puis la nouvelle entre du côté opposé.
  swapAnim = stageImg.animate(
    [
      { opacity: 1, filter: "blur(0px)",  transform: "translateX(0) scale(1)" },
      { opacity: 0, filter: "blur(12px)", transform: `translateX(${-dx}px) scale(0.9)`, offset: 0.45 },
      { opacity: 0, filter: "blur(12px)", transform: `translateX(${dx}px) scale(0.9)`,  offset: 0.55 },
      { opacity: 1, filter: "blur(0px)",  transform: "translateX(0) scale(1)" },
    ],
    { duration: SWAP_DURATION, easing: "cubic-bezier(.5,0,.2,1)" }
  );

  // Change l'image au creux (invisible), à ~50% de l'animation
  swapTimer = setTimeout(apply, SWAP_DURATION * 0.5);
  swapAnim.finished.then(() => { swapAnim = null; }).catch(() => {});
}

function nextIllu() { showIllu(currentIndex + 1, 1); }
function prevIllu() { showIllu(currentIndex - 1, -1); }

// Gère l'image manquante -> état placeholder
stageImg.addEventListener("error", () => stage.classList.add("is-empty"));
stageImg.addEventListener("load", () => {
  stage.classList.remove("is-empty");
  // Cadre = ratio exact de l'image chargée : hauteur maximisée, aucun crop
  if (stageImg.naturalWidth && stageImg.naturalHeight) {
    stage.style.aspectRatio = `${stageImg.naturalWidth} / ${stageImg.naturalHeight}`;
  }
});

// Navigation clavier (uniquement sur l'écran showcase)
document.addEventListener("keydown", (e) => {
  if (!showcaseScreen.classList.contains("is-active")) return;
  if (e.key === "ArrowRight") nextIllu();
  if (e.key === "ArrowLeft") prevIllu();
});

/* ---- Lightbox ---- */
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxClose = $("#lightboxClose");

function openLightbox() {
  const data = illus[currentIndex];
  if (stage.classList.contains("is-empty")) return; // rien à agrandir
  lightboxImg.src = data.src;
  lightboxImg.alt = data.alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

stage.addEventListener("click", openLightbox);
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox(); // clic en dehors de l'image
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
});

/* ---- Compteur : temps écoulé depuis le dernier stream ---- */
const streamCounter = $("#streamCounter");
function updateStreamCounter() {
  if (!streamCounter) return;
  const last = new Date(CONFIG.dernierStream);
  if (isNaN(last.getTime())) return;
  let s = Math.max(0, Math.floor((Date.now() - last.getTime()) / 1000));
  const j = Math.floor(s / 86400); s -= j * 86400;
  const h = Math.floor(s / 3600);  s -= h * 3600;
  const m = Math.floor(s / 60);    s -= m * 60;
  const p = (n, mot) => `${n} ${mot}${n > 1 ? "s" : ""}`;
  // Garde uniquement les unités non nulles ; si tout est à 0, affiche « 0 seconde »
  const parts = [[j, "jour"], [h, "heure"], [m, "minute"], [s, "seconde"]]
    .filter(([n]) => n > 0)
    .map(([n, mot]) => p(n, mot));
  if (!parts.length) parts.push(p(0, "seconde"));
  const last2 = parts.length > 1 ? parts.slice(-2).join(" et ") : parts[0];
  const duree = parts.length > 2 ? parts.slice(0, -2).join(", ") + ", " + last2 : last2;
  streamCounter.textContent = `Ça fait ${duree} que tu n'as pas stream`;
}
updateStreamCounter();
setInterval(updateStreamCounter, 1000);

/* ---- Pseudos qui défilent sur l'accueil ---- */
const homeTitle = $("#homeTitle");
function startTitleCycle() {
  if (!homeTitle) return;
  const aliases = Array.isArray(CONFIG.alias) && CONFIG.alias.length ? CONFIG.alias : null;
  if (!aliases) return;
  homeTitle.textContent = aliases[0];
  if (prefersReducedMotion || aliases.length < 2) return; // pseudo statique
  let i = 0;
  setInterval(() => {
    const out = homeTitle.animate(
      [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-20px)" }],
      { duration: 340, easing: "ease-in", fill: "forwards" }
    );
    out.onfinish = () => {
      i = (i + 1) % aliases.length;
      homeTitle.textContent = aliases[i];
      const inAnim = homeTitle.animate(
        [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 380, easing: "ease-out", fill: "forwards" }
      );
      // Retire les fills pour revenir au style de base (sinon le fill de "out" garde le titre invisible)
      inAnim.onfinish = () => { out.cancel(); inAnim.cancel(); };
    };
  }, 2800);
}

/* ---- Init ---- */
buildBackground();
buildSunflower();
initAudio();
populateArtist();
buildFlowyFlowers();
buildThumbs();
preloadIllustrations();
showIllu(0);
startTitleCycle();
