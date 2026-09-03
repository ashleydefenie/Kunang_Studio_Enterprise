// Central business contact used by every WhatsApp action.
const WHATSAPP_NUMBER = "60123256276";

// Returns the shared header markup and highlights the current page.
function createHeader(activePage) {
  const links = [{id:"home",href:"index.html",label:"Laman Utama"},{id:"about",href:"about.html",label:"Mengenai Kami"},{id:"crafts",href:"crafts.html",label:"Produk (Product)"},{id:"services",href:"services.html",label:"Perkhidmatan (Service)"},{id:"contact",href:"contact.html",label:"Hubungi"}];
  return `<header class="site-header"><nav class="nav container" aria-label="Navigasi utama"><a class="brand" href="index.html"><span class="brand-mark">K</span><span>KUNANG STUDIO<small>CRAFTS & BEAUTY</small></span></a><div class="nav-links" id="nav-links">${links.map(link=>`<a class="${activePage===link.id?"active":""}" href="${link.href}">${link.label}</a>`).join("")}<a class="btn btn-primary" data-wa="Salam Kunang Studio, saya ingin membuat pertanyaan." href="#">WhatsApp <span>↗</span></a></div><button class="menu-toggle" aria-label="Buka menu" aria-controls="nav-links" aria-expanded="false">☰</button></nav></header>`;
}

// Returns the shared footer markup used across all five pages.
function createFooter() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><a class="brand" href="index.html"><span class="brand-mark">K</span><span>KUNANG STUDIO<small>CRAFTS & BEAUTY</small></span></a><p>Memelihara seni kraf, busana tradisional dan warisan masyarakat Dayak Sarawak.</p></div><div><h4>NAVIGASI</h4><a href="about.html">Mengenai Kami</a><a href="crafts.html">Produk (Product)</a><a href="services.html">Perkhidmatan (Service)</a><a href="contact.html">Hubungi Kami</a></div><div><h4>HUBUNGI</h4><a href="tel:+60123256276">+60 12-325 6276</a><p>Sarawak, Malaysia</p><p>TikTok · @corinaaknyamok</p></div></div><div class="footer-bottom"><span>© 2026 Kunang Studio Enterprise. Hak cipta terpelihara.</span><span>Buatan tangan · Berakar warisan</span></div></div></footer><a class="floating-wa" data-wa="Salam Kunang Studio, saya ingin membuat pertanyaan." href="#" aria-label="Hubungi melalui WhatsApp">WA</a>`;
}

// Builds a WhatsApp click-to-chat URL with safely encoded text.
function getWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Inserts the reusable header and footer into the current document.
function renderSharedLayout() {
  const page = document.body.dataset.page;
  document.querySelector("#site-header").innerHTML = createHeader(page);
  document.querySelector("#site-footer").innerHTML = createFooter();
}

// Connects the mobile menu button and closes the menu after navigation.
function setupMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-links");
  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "×" : "☰";
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => document.body.classList.remove("menu-open")));
}

// Converts every labelled WhatsApp link into a working, pre-filled chat link.
function setupWhatsAppLinks() {
  document.querySelectorAll("[data-wa]").forEach(link => {
    link.href = getWhatsAppUrl(link.dataset.wa);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

// Filters catalogue cards by their data-category without reloading the page.
function setupCatalogueFilters() {
  const filters = document.querySelectorAll(".filter");
  if (!filters.length) return;
  filters.forEach(button => button.addEventListener("click", () => {
    filters.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".product-card").forEach(card => card.classList.toggle("hidden", button.dataset.filter !== "all" && card.dataset.category !== button.dataset.filter));
  }));
}

// Validates the enquiry form and forwards a formatted enquiry to WhatsApp.
function setupEnquiryForm() {
  const form = document.querySelector("#enquiry-form");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    let valid = true;
    form.querySelectorAll("[required]").forEach(field => {
      const error = field.parentElement.querySelector(".error");
      const missing = !field.value.trim();
      error.textContent = missing ? "Ruangan ini diperlukan." : "";
      valid = valid && !missing;
    });
    const email = form.elements.email;
    if (email.value && !email.validity.valid) { email.parentElement.querySelector(".error").textContent = "Sila masukkan emel yang sah."; valid = false; }
    if (!valid) return;
    const message = `Salam Kunang Studio, saya ingin membuat pertanyaan.\n\nNama: ${data.get("name")}\nWhatsApp: ${data.get("phone")}\nEmel: ${data.get("email") || "-"}\nKategori: ${data.get("category")}\nMesej: ${data.get("message")}`;
    window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  });
}

// Builds the complete review list from the uploaded files grouped by service.
function getReviewScreenshots() {
  const customer = Array.from({length: 46}, (_, index) => ({category: "customer", label: "Customer", file: `TESTIMONI CUSTOMER ${index + 1}.jpeg`}));
  const makeup = Array.from({length: 3}, (_, index) => ({category: "makeup", label: "Makeup", file: `TESTIMONI MAKE UP ${index + 1}.jpeg`}));
  const tawak = Array.from({length: 3}, (_, index) => ({category: "tawak", label: "Tawak", file: `TESTIMONI TAWAK ${index + 1}.jpeg`}));
  return [...customer, ...makeup, ...tawak];
}

// Creates one accessible review card for an uploaded screenshot.
function createReviewCard(review, index) {
  const card = document.createElement("figure");
  card.className = "review-card";
  card.innerHTML = `<div class="review-shot"><img src="assets/images/reviews/${review.file}" alt="Tangkapan skrin testimoni ${review.label} ${index + 1}" loading="lazy"></div><figcaption><span>${review.label}</span><strong>Testimoni ${String(index + 1).padStart(2, "0")}</strong></figcaption>`;
  return card;
}

// Renders review batches and connects category filters and the load-more control.
function setupReviewGallery() {
  const grid = document.querySelector("#review-grid");
  if (!grid) return;
  const allReviews = getReviewScreenshots();
  const filters = document.querySelectorAll("[data-review-filter]");
  const moreButton = document.querySelector("#review-more");
  let activeCategory = "all";
  let visibleCount = 6;

  // Refreshes the gallery for the selected category and visible batch size.
  function renderReviews() {
    const selected = activeCategory === "all" ? allReviews : allReviews.filter(review => review.category === activeCategory);
    grid.replaceChildren(...selected.slice(0, visibleCount).map(createReviewCard));
    moreButton.hidden = visibleCount >= selected.length;
  }

  filters.forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.reviewFilter;
    visibleCount = 6;
    filters.forEach(filter => filter.classList.toggle("active", filter === button));
    renderReviews();
  }));
  moreButton.addEventListener("click", () => { visibleCount += 6; renderReviews(); });
  renderReviews();
}

// Reveals content as it enters the viewport, while respecting reduced-motion settings.
function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { items.forEach(item => item.classList.add("visible")); return; }
  document.body.classList.add("reveal-ready");
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), {threshold:.12});
  items.forEach(item => observer.observe(item));
}

// Starts all site features after shared components have been rendered.
function initializeSite() {
  renderSharedLayout();
  setupMobileMenu();
  setupWhatsAppLinks();
  setupCatalogueFilters();
  setupEnquiryForm();
  setupReviewGallery();
  setupRevealAnimations();
}

document.addEventListener("DOMContentLoaded", initializeSite);
