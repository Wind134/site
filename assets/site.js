/* Lightbox + auto-upgrade of screenshot placeholders. */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ensureLightbox() {
    let lb = document.querySelector(".lightbox");
    if (lb) return lb;
    lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "查看大图");
    lb.innerHTML = '<button type="button" class="lightbox-close" aria-label="关闭">×</button><img alt="">';
    document.body.appendChild(lb);
    const img = lb.querySelector("img");
    const close = () => {
      lb.hidden = true;
      document.body.style.overflow = "";
    };
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.classList.contains("lightbox-close")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !lb.hidden) close();
    });
    lb._img = img;
    lb._close = close;
    return lb;
  }

  function openLightbox(src, alt) {
    const lb = ensureLightbox();
    lb._img.src = src;
    lb._img.alt = alt || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lb.querySelector(".lightbox-close").focus();
  }

  function bindZoom(root) {
    root.querySelectorAll("[data-zoom]").forEach((el) => {
      if (el.dataset.zoomBound) return;
      el.dataset.zoomBound = "1";
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const img = el.tagName === "IMG" ? el : el.querySelector("img");
        if (!img) return;
        openLightbox(el.getAttribute("href") || img.currentSrc || img.src, img.alt);
      });
    });
  }

  function swapPlaceholder(holder, src, alt) {
    const frame = holder.querySelector(".shot-frame") || holder;
    const picture = document.createElement("a");
    picture.href = src;
    picture.dataset.zoom = "1";
    picture.setAttribute("aria-label", "放大截图");
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt || holder.dataset.alt || "应用界面截图";
    picture.appendChild(img);
    frame.innerHTML = "";
    frame.appendChild(picture);
    frame.classList.remove("is-placeholder");
    bindZoom(frame);
  }

  function tryLoadScreenshots() {
    document.querySelectorAll("[data-screenshot]").forEach((el) => {
      const name = el.dataset.screenshot;
      const base = el.dataset.base || "./assets/screenshots/";
      const alt = el.dataset.alt || "";
      const webp = new Image();
      webp.onload = () => swapPlaceholder(el, base + name + ".webp", alt);
      webp.onerror = () => {
        const png = new Image();
        png.onload = () => swapPlaceholder(el, base + name + ".png", alt);
        png.src = base + name + ".png";
      };
      webp.src = base + name + ".webp";
    });
  }

  bindZoom(document);
  tryLoadScreenshots();
  void reduceMotion;
})();
