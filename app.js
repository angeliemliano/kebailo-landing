/* =========================
   KEBAILO — Interactions
   - Reveal on scroll (fade-in)
   - FAQ accordion
   - Catalog filter + search
   - Mobile menu
   ========================= */

(function () {
  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile menu
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobileMenu");

  function setMobileMenu(open) {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenu.hidden = !open;
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      setMobileMenu(!isOpen);
    });

    // Close mobile menu when clicking a link
    mobileMenu.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.tagName === "A") setMobileMenu(false);
    });

    // Close on resize up
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) setMobileMenu(false);
    });
  }

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  // FAQ accordion
  const accordion = document.querySelector("[data-accordion]");
  if (accordion) {
    accordion.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-q");
      if (!btn) return;

      const item = btn.closest(".faq-item");
      const panel = item.querySelector(".faq-a");
      const isOpen = item.classList.contains("is-open");

      // close others (uno abierto a la vez)
      accordion.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          const openBtn = openItem.querySelector(".faq-q");
          const openPanel = openItem.querySelector(".faq-a");
          if (openBtn) openBtn.setAttribute("aria-expanded", "false");
          if (openPanel) openPanel.hidden = true;
        }
      });

      item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  }

  // Catalog filter + search
  const tabs = Array.from(document.querySelectorAll(".tab[data-filter]"));
  const cards = Array.from(document.querySelectorAll(".product-card"));
  const searchInput = document.getElementById("searchInput");

  let currentFilter = "all";
  let currentQuery = "";

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function applyCatalog() {
    const q = normalize(currentQuery);

    cards.forEach((card) => {
      const cat = card.getAttribute("data-category") || "";
      const name = card.getAttribute("data-name") || "";
      const text = normalize(name + " " + card.innerText);

      const matchesFilter = currentFilter === "all" ? true : cat === currentFilter;
      const matchesQuery = q ? text.includes(q) : true;

      card.style.display = matchesFilter && matchesQuery ? "" : "none";
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      currentFilter = tab.getAttribute("data-filter") || "all";
      applyCatalog();
    });
  });

  // Category shortcut buttons
  document.querySelectorAll("[data-filter-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter-btn");
      const targetTab = document.querySelector(`.tab[data-filter="${filter}"]`);
      if (targetTab) targetTab.click();
      const catalog = document.getElementById("catalogo");
      if (catalog) catalog.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentQuery = e.target.value;
      applyCatalog();
    });
  }

  // Product carousels (2 fotos por card + badges Frente/Espalda)
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".c-track");
    const slides = Array.from(root.querySelectorAll(".c-track img"));
    const prev = root.querySelector(".c-prev");
    const next = root.querySelector(".c-next");
    const dots = Array.from(root.querySelectorAll(".c-dot"));
    const badges = Array.from(root.querySelectorAll(".c-badge"));

    if (!track || slides.length < 2 || !prev || !next) return;

    let index = 0;

    function update() {
      track.style.transform = `translateX(${-index * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
      badges.forEach((b, i) => b.classList.toggle("is-active", i === index));
    }

    prev.addEventListener("click", (e) => {
      e.preventDefault();
      index = (index - 1 + slides.length) % slides.length;
      update();
    });

    next.addEventListener("click", (e) => {
      e.preventDefault();
      index = (index + 1) % slides.length;
      update();
    });

    badges.forEach((b, i) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        index = i;
        update();
      });
    });

    // swipe en mobile
    let startX = 0;
    let isDown = false;

    root.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
    });

    root.addEventListener("pointerup", (e) => {
      if (!isDown) return;
      isDown = false;
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 35) return;
      index = dx < 0 ? (index + 1) % slides.length : (index - 1 + slides.length) % slides.length;
      update();
    });

    update();
  });


  // Colors catalog (swatches)
  const COLORS = [
    { code: "01", name: "Negro", hex: "#000000" },
    { code: "02", name: "Amarillo Tweety", hex: "#FFE300" },
    { code: "03", name: "Amarillo Fluo", hex: "#B7FF00" },
    { code: "13", name: "Lila Glicina", hex: "#8E6AD6" },
    { code: "14", name: "Violeta Imperial", hex: "#4B178C" },
    { code: "15", name: "Azul Francia", hex: "#0B74D1" },

    { code: "04", name: "Peach Fluo", hex: "#FF8DA0" },
    { code: "05", name: "Naranja Intenso", hex: "#FF4D2E" },
    { code: "06", name: "Rojo Malvón", hex: "#D1001A" },
    { code: "16", name: "Azul Marino", hex: "#1B1D6E" },
    { code: "17", name: "Turquesa", hex: "#0094B8" },
    { code: "18", name: "Azul Petróleo", hex: "#1466B8" },

    { code: "07", name: "Flamenco Fluo", hex: "#FF5FA2" },
    { code: "08", name: "Pink", hex: "#FFB2E6" },
    { code: "09", name: "Rosa Bebé", hex: "#F9D5D3" },
    { code: "19", name: "Verde Aqua", hex: "#A9F1E0" },
    { code: "20", name: "Celeste Pastel", hex: "#A7D7F0" },
    { code: "21", name: "Verde Mint", hex: "#2ED57A" },

    { code: "10", name: "Fucsia Bikini", hex: "#C019B5" },
    { code: "11", name: "Chicle Fluo", hex: "#FF00B7" },
    { code: "12", name: "Violeta Guinda", hex: "#7A007B" },
    { code: "22", name: "Beige Nougat", hex: "#A9A18C" },
    { code: "23", name: "Coral", hex: "#E24B6E" },
    { code: "24", name: "Verde Benetton", hex: "#00A83A" },
  ];

  // Si querés el color EXACTO (tela), ajustá los hex acá arriba.
  const colorsGrid = document.getElementById("colorsGrid");
  const colorSearch = document.getElementById("colorSearch");
  const colorsReset = document.querySelector("[data-colors-reset]");

  function esc(str){
    return String(str || "").replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function renderColors(list){
    if (!colorsGrid) return;
    colorsGrid.innerHTML = list.map((c) => `
      <article class="color-card" data-color="${esc(c.code)} ${esc(c.name)} ${esc(c.hex)}" style="--swatch:${esc(c.hex)}">
        <div class="color-swatch" aria-hidden="true"></div>
        <div class="color-meta">
          <div class="color-top">
            <h3 class="color-name">${esc(c.name)}</h3>
          </div>
        </div>
      </article>
    `).join("");
  }

  function normalize(str){
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function applyColorSearch(){
    const q = normalize(colorSearch ? colorSearch.value : "");
    const cards = Array.from(document.querySelectorAll(".color-card"));
    cards.forEach((card) => {
      const hay = normalize(card.getAttribute("data-color"));
      card.style.display = q ? (hay.includes(q) ? "" : "none") : "";
    });
  }

  // Render initial
  if (colorsGrid) {
    renderColors(COLORS);
  }

  if (colorSearch){
    colorSearch.addEventListener("input", applyColorSearch);
  }
  if (colorsReset){
    colorsReset.addEventListener("click", () => {
      if (colorSearch) colorSearch.value = "";
      applyColorSearch();
    });
  }

  // Copy to clipboard
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const hex = btn.getAttribute("data-copy");
    try{
      await navigator.clipboard.writeText(hex);
      const old = btn.textContent;
      btn.textContent = "Copiado ✓";
      setTimeout(() => (btn.textContent = old), 900);
    }catch{
      // fallback
      const ta = document.createElement("textarea");
      ta.value = hex;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      const old = btn.textContent;
      btn.textContent = "Copiado ✓";
      setTimeout(() => (btn.textContent = old), 900);
    }
  });

    // ===== Lightbox fullscreen para carousels =====
  const lb = document.getElementById("lightbox");
  const lbTrack = document.getElementById("lbTrack");
  const lbDots = document.getElementById("lbDots");
  const lbName = document.getElementById("lbName");
  const lbPrev = lb ? lb.querySelector(".lb-prev") : null;
  const lbNext = lb ? lb.querySelector(".lb-next") : null;
  const lbBadges = lb ? Array.from(lb.querySelectorAll("[data-lb-badge]")) : [];

  let lbIndex = 0;
  let lbSlides = [];

  function openLightbox(productName, imgs, startIndex=0){
    if (!lb || !lbTrack) return;
    lbIndex = startIndex;
    lbSlides = imgs;

    if (lbName) lbName.textContent = productName || "Producto";

    lbTrack.innerHTML = imgs.map((src, i) =>
      `<img src="${src}" alt="${productName} - ${i===0 ? "frente" : "espalda"}" loading="lazy">`
    ).join("");

    if (lbDots){
      lbDots.innerHTML = imgs.map((_, i) =>
        `<span class="lb-dot ${i===startIndex ? "is-active" : ""}"></span>`
      ).join("");
    }

    lb.hidden = false;
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateLightbox();
  }

  function closeLightbox(){
    if (!lb) return;
    lb.hidden = true;
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function updateLightbox(){
    if (!lbTrack) return;
    lbTrack.style.transform = `translateX(${-lbIndex * 100}%)`;

    if (lbDots){
      Array.from(lbDots.querySelectorAll(".lb-dot")).forEach((d,i)=>{
        d.classList.toggle("is-active", i === lbIndex);
      });
    }
    lbBadges.forEach((b,i)=> b.classList.toggle("is-active", i === lbIndex));
  }

  // Abrir al tocar el carrusel del producto (pero no si tocás flechas/badges)
  document.addEventListener("click", (e) => {
    const carousel = e.target.closest("[data-carousel]");
    if (!carousel) return;

    if (e.target.closest(".c-btn") || e.target.closest(".c-badge")) return;

    const card = carousel.closest(".product-card");
    const productName =
      (card && card.getAttribute("data-name")) ||
      carousel.getAttribute("data-name") ||
      "Producto";

    const imgs = Array.from(carousel.querySelectorAll(".c-track img"))
      .map(img => img.getAttribute("src"))
      .filter(Boolean);

    if (!imgs.length) return;

    const activeBadgeIndex = (() => {
      const badges = Array.from(carousel.querySelectorAll(".c-badge"));
      const idx = badges.findIndex(b => b.classList.contains("is-active"));
      return idx >= 0 ? idx : 0;
    })();

    openLightbox(productName, imgs, activeBadgeIndex);
  });

  // Cerrar haciendo click afuera o en X
  if (lb){
    lb.addEventListener("click", (e) => {
      if (e.target.matches("[data-lb-close]")) closeLightbox();
    });
  }

  // Navegación
  if (lbPrev) lbPrev.addEventListener("click", () => {
    lbIndex = (lbIndex - 1 + lbSlides.length) % lbSlides.length;
    updateLightbox();
  });

  if (lbNext) lbNext.addEventListener("click", () => {
    lbIndex = (lbIndex + 1) % lbSlides.length;
    updateLightbox();
  });

  lbBadges.forEach((b) => {
    b.addEventListener("click", () => {
      const i = Number(b.getAttribute("data-lb-badge"));
      if (!Number.isNaN(i)) { lbIndex = i; updateLightbox(); }
    });
  });

  // Teclado
  document.addEventListener("keydown", (e) => {
    if (!lb || lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") { lbIndex = (lbIndex - 1 + lbSlides.length) % lbSlides.length; updateLightbox(); }
    if (e.key === "ArrowRight"){ lbIndex = (lbIndex + 1) % lbSlides.length; updateLightbox(); }
  });


  applyCatalog();
})();
