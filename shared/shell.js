/* Shared site chrome: injects the topbar + off-canvas sidebar nav used by
   every section page. A page only needs to:
     1. Link shared/shell.css and load this script.
     2. Set <body data-section="some-id"> so the matching nav link is marked active.
   Add new sections to SECTIONS below to make them selectable from the sidebar. */
(function () {
  const shellScript = document.currentScript;
  const siteRoot = new URL("../", shellScript.src);

  const SECTIONS = [
    { id: "cifras", label: "Cifras", href: "index.html" }
  ];

  function resolveHref(href) {
    return new URL(href, siteRoot).href;
  }

  function buildTopbar() {
    const topbar = document.createElement("header");
    topbar.className = "app-topbar";
    topbar.innerHTML = `
      <button type="button" class="menu-toggle" aria-label="Abrir menú de secciones" aria-expanded="false" aria-controls="app-sidebar">
        <span></span><span></span><span></span>
      </button>
      <span class="app-topbar-title">Games and Crackers</span>
    `;
    return topbar;
  }

  function buildSidebar() {
    const currentSection = document.body.dataset.section;

    const aside = document.createElement("aside");
    aside.id = "app-sidebar";
    aside.className = "app-sidebar";
    aside.setAttribute("aria-hidden", "true");

    const nav = document.createElement("nav");
    nav.className = "sidebar-nav";
    nav.setAttribute("aria-label", "Secciones del sitio");

    const heading = document.createElement("div");
    heading.className = "sidebar-heading";
    heading.innerHTML = `
      <span>Secciones</span>
      <button type="button" class="sidebar-close" aria-label="Cerrar menú">&times;</button>
    `;
    nav.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "sidebar-list";

    SECTIONS.forEach((section) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.className = "sidebar-link";
      link.href = resolveHref(section.href);
      link.textContent = section.label;

      if (section.id === currentSection) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }

      item.appendChild(link);
      list.appendChild(item);
    });

    nav.appendChild(list);
    aside.appendChild(nav);
    return aside;
  }

  function buildBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    return backdrop;
  }

  function initShell() {
    const topbar = buildTopbar();
    const sidebar = buildSidebar();
    const backdrop = buildBackdrop();

    document.body.prepend(backdrop);
    document.body.prepend(sidebar);
    document.body.prepend(topbar);

    const toggleButton = topbar.querySelector(".menu-toggle");
    const closeButton = sidebar.querySelector(".sidebar-close");

    function openSidebar() {
      document.body.classList.add("sidebar-open");
      sidebar.setAttribute("aria-hidden", "false");
      toggleButton.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
      document.body.classList.remove("sidebar-open");
      sidebar.setAttribute("aria-hidden", "true");
      toggleButton.setAttribute("aria-expanded", "false");
    }

    function toggleSidebar() {
      if (document.body.classList.contains("sidebar-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }

    toggleButton.addEventListener("click", toggleSidebar);
    closeButton.addEventListener("click", closeSidebar);
    backdrop.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSidebar();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShell);
  } else {
    initShell();
  }
})();
