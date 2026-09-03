// Central business contact used by every WhatsApp action.
const WHATSAPP_NUMBER = "60123256276";

// Returns the shared header markup and highlights the current page.
function createHeader(activePage) {
  const links = [{id:"home",href:"index.html",label:"Utama / Home"},{id:"about",href:"about.html",label:"Tentang / About"},{id:"crafts",href:"crafts.html",label:"Produk / Products"},{id:"services",href:"services.html",label:"Perkhidmatan / Services"},{id:"contact",href:"contact.html",label:"Hubungi / Contact"}];
  const linkMarkup = links.map(link => `<a class="${activePage === link.id ? "active" : ""}" href="${link.href}">${link.label}</a>`).join("");
  const whatsAppMarkup = `<a class="btn btn-primary" data-wa="Salam Kunang Studio, saya ingin membuat pertanyaan. / Hello, I would like to make an enquiry." href="#">WhatsApp <span>↗</span></a>`;
  return `<header class="site-header"><nav class="nav container" aria-label="Navigasi utama / Main navigation"><a class="brand" href="index.html"><img class="brand-logo" src="assets/images/logo/LOGO KUNANG STUDIO ENTERPRISE 2.jpeg" alt="Logo rasmi Kunang Studio / Official Kunang Studio logo"><span class="brand-name">KUNANG STUDIO<small>CRAFTS & BEAUTY</small></span></a><div class="desktop-links" aria-label="Navigasi desktop / Desktop navigation">${linkMarkup}${whatsAppMarkup}</div><div class="nav-links" id="nav-links">${linkMarkup}${whatsAppMarkup}</div><button class="menu-toggle" aria-label="Buka menu / Open menu" aria-controls="nav-links" aria-expanded="false">☰</button></nav></header>`;
}

// Returns the shared footer markup used across all five pages.
function createFooter() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><a class="brand footer-brand" href="index.html"><img class="brand-logo" src="assets/images/logo/LOGO KUNANG STUDIO ENTERPRISE 2.jpeg" alt="Logo rasmi Kunang Studio / Official Kunang Studio logo"><span class="brand-name">KUNANG STUDIO<small>CRAFTS & BEAUTY</small></span></a><p>Memelihara seni kraf, busana tradisional dan warisan masyarakat Dayak Sarawak.<span class="en">Preserving the crafts, traditional attire and heritage of Sarawak's Dayak community.</span></p></div><div><h4>NAVIGASI · NAVIGATION</h4><a href="about.html">Tentang / About</a><a href="crafts.html">Produk / Products</a><a href="services.html">Perkhidmatan / Services</a><a href="contact.html">Hubungi / Contact</a></div><div><h4>HUBUNGI · CONTACT</h4><a data-wa="Salam Kunang Studio, saya ingin membuat pertanyaan. / Hello, I would like to make an enquiry." href="#">WhatsApp: +60 12-325 6276</a><p>Sarawak, Malaysia</p><div class="social-list footer-social"><span>Facebook · Kunang Studi Enterprise</span><span>TikTok · corinaaknyamok</span></div></div></div><div class="footer-bottom"><span>© 2026 Kunang Studio Enterprise. Hak cipta terpelihara / All rights reserved.</span><span>Buatan tangan · Berakar warisan / Handmade · Heritage-rooted</span></div></div></footer><a class="floating-wa" data-wa="Salam Kunang Studio, saya ingin membuat pertanyaan. / Hello, I would like to make an enquiry." href="#" aria-label="Hubungi melalui WhatsApp / Contact via WhatsApp">WA</a>`;
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

// Converts social-media labels into consistent external links in the contact page and footer.
function setupSocialLinks() {
  const profiles = [
    {label: "Facebook · Kunang Studio Enterprise", url: "https://www.facebook.com/Kunangstudioenterprise/"},
    {label: "TikTok · corinaaknyamok", url: "https://www.tiktok.com/@corinaaknyamok?is_from_webapp=1&sender_device=pc"}
  ];
  document.querySelectorAll(".social-list").forEach(list => {
    list.replaceChildren(...profiles.map(profile => {
      const link = document.createElement("a");
      link.href = profile.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = `${profile.label} <span aria-hidden="true">↗</span>`;
      return link;
    }));
  });
}

// Connects the shared desktop/mobile menu and supports link-click and Escape-key closing.
function setupMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-links");
  const closeMenu = () => {
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
    button.setAttribute("aria-expanded", "false");
    button.textContent = "☰";
  };
  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    button.textContent = isOpen ? "×" : "☰";
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") { closeMenu(); button.focus(); } });
}

// Builds a category-specific product enquiry that asks for the details needed to size an order.
function getProductOrderMessage(card, openingMessage) {
  const productName = card.querySelector("h3")?.textContent.trim() || "Produk / Product";
  const commonFields = `\n\nMAKLUMAT TEMPAHAN / ORDER DETAILS\nNama / Name:\nProduk / Product: ${productName}\nKuantiti / Quantity:\nTarikh diperlukan / Required date:`;
  const sizeFields = {
    busana: "\nSaiz biasa / Usual size (S–3XL+):\nPinggang / Waist (cm):\nPinggul / Hip (cm):\nLabuh / Length (cm):\nUkuran tambahan / Additional measurements:",
    aksesori: "\nSaiz atau ukuran diperlukan / Required size or measurement (cm):\nWarna pilihan / Preferred colour:",
    kraf: "\nSaiz atau dimensi pilihan / Preferred size or dimensions (cm):"
  };
  return `${openingMessage}${commonFields}${sizeFields[card.dataset.category] || "\nSaiz diperlukan / Required size:"}`;
}

// Converts every labelled WhatsApp link into a working, pre-filled chat link.
function setupWhatsAppLinks() {
  document.querySelectorAll("[data-wa]").forEach(link => {
    const productCard = link.closest(".product-card");
    const message = productCard ? getProductOrderMessage(productCard, link.dataset.wa) : link.dataset.wa;
    link.href = getWhatsAppUrl(message);
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

// Opens product photographs at a larger size for closer customer reference.
function setupProductLightbox() {
  const lightbox = document.querySelector("#product-lightbox");
  if (!lightbox) return;
  const enlargedImage = lightbox.querySelector("img");
  const caption = lightbox.querySelector("p");
  document.querySelectorAll(".product-image-button img").forEach(image => {
    image.parentElement.addEventListener("click", () => {
      enlargedImage.src = image.src;
      enlargedImage.alt = image.alt;
      caption.textContent = image.alt;
      lightbox.showModal();
    });
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", event => { if (event.target === lightbox) lightbox.close(); });
}

// Adds concise English guidance to product cards and language metadata to translations.
function setupBilingualContent() {
  const productTranslations = {
    busana: "Genuine attire reference. Contact us to confirm measurements, materials, price and availability.",
    aksesori: "Genuine accessory reference. Contact us to confirm details, price and availability.",
    kraf: "Genuine craft reference. Contact us to confirm dimensions, price and stock."
  };
  document.querySelectorAll(".product-card").forEach(card => {
    const description = card.querySelector("p");
    const enquiryLink = card.querySelector("a[data-wa]");
    if (description && !description.querySelector(".en")) {
      const translation = document.createElement("span");
      translation.className = "en";
      translation.textContent = productTranslations[card.dataset.category];
      description.append(translation);
    }
    if (enquiryLink) enquiryLink.textContent = "Tanya Produk / Product Enquiry →";
  });
  document.querySelectorAll(".en, .en-title, .en-heading, .en-inline").forEach(element => element.lang = "en");
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
      error.textContent = missing ? "Ruangan ini diperlukan / This field is required." : "";
      valid = valid && !missing;
    });
    const email = form.elements.email;
    if (email.value && !email.validity.valid) { email.parentElement.querySelector(".error").textContent = "Sila masukkan emel yang sah / Enter a valid email."; valid = false; }
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
  setupSocialLinks();
  setupMobileMenu();
  setupWhatsAppLinks();
  setupCatalogueFilters();
  setupProductLightbox();
  setupBilingualContent();
  setupEnquiryForm();
  setupReviewGallery();
  setupRevealAnimations();
}

document.addEventListener("DOMContentLoaded", initializeSite);
