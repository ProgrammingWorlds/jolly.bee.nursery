
/* =========================================
   JOLLY BEE NURSERY
   Interactive animations and effects
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const loader = document.getElementById("loader");
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const yearElement = document.getElementById("currentYear");

  // Current year
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Loading screen
  const hideLoader = () => {
    if (loader) {
      loader.classList.add("loaded");
    }
  };

  window.addEventListener("load", hideLoader, { once: true });

  // Safety fallback in case some resources take too long
  window.setTimeout(hideLoader, 2500);

  // Mobile navigation
  function closeMenu() {
    if (!menuToggle || !navLinks) return;

    menuToggle.classList.remove("active");
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "فتح القائمة");
    body.classList.remove("menu-open");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");

      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "إغلاق القائمة" : "فتح القائمة"
      );

      body.classList.toggle("menu-open", isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        navLinks.classList.contains("open") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }

  // Navbar shadow on scroll
  function updateNavbar() {
    if (!navbar) return;

    navbar.classList.toggle("scrolled", window.scrollY > 20);
  }

  window.addEventListener("scroll", updateNavbar, { passive: true });
  updateNavbar();

  // Highlight 3D activity cards
  const activityCards = document.querySelectorAll(".activity-card");
  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (canHover && !reducedMotion) {
    activityCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 8;
        const rotateX = (0.5 - y / rect.height) * 8;

        card.style.transform =
          `perspective(800px) rotateX(${rotateX}deg) ` +
          `rotateY(${rotateY}deg) translateY(-5px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Pause other videos when one starts playing
  const videos = document.querySelectorAll(".video-frame video");

  videos.forEach((video) => {
    video.addEventListener("play", () => {
      videos.forEach((otherVideo) => {
        if (otherVideo !== video && !otherVideo.paused) {
          otherVideo.pause();
        }
      });
    });

    video.addEventListener("error", () => {
      console.warn("تعذر تحميل الفيديو:", video.currentSrc || video.src);
    });
  });

  // Floating hero artwork follows the pointer subtly
  const hero = document.querySelector(".hero");
  const heroArt = document.querySelector(".hero-art");

  if (hero && heroArt && canHover && !reducedMotion) {
    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;

      const rect = hero.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      heroArt.style.setProperty("--mouse-x", `${x * 12}px`);
      heroArt.style.setProperty("--mouse-y", `${y * 12}px`);
    });

    hero.addEventListener("pointerleave", () => {
      heroArt.style.setProperty("--mouse-x", "0px");
      heroArt.style.setProperty("--mouse-y", "0px");
    });
  }

  // Scroll reveal animations
  const revealElements = document.querySelectorAll(".reveal");

  function setupFallbackReveal() {
    if (!("IntersectionObserver" in window)) return;

    body.classList.add("js-motion");

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  // GSAP animations
  function setupGSAP() {
    if (!window.gsap) {
      setupFallbackReveal();
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (reducedMotion) {
      gsap.set(revealElements, { clearProps: "all" });
      return;
    }

    // Hero entrance
    const heroTimeline = gsap.timeline({
      defaults: {
        ease: "power3.out"
      }
    });

    heroTimeline
      .from(".hero-eyebrow", {
        y: 20,
        opacity: 0,
        duration: 0.65
      })
      .from(".hero-title", {
        y: 35,
        opacity: 0,
        duration: 0.85
      }, "-=0.35")
      .from(".hero-description", {
        y: 20,
        opacity: 0,
        duration: 0.65
      }, "-=0.45")
      .from(".hero-actions .button", {
        y: 18,
        opacity: 0,
        stagger: 0.13,
        duration: 0.6
      }, "-=0.35")
      .from(".hero-art", {
        scale: 0.82,
        opacity: 0,
        rotation: -5,
        duration: 1.1,
        ease: "back.out(1.3)"
      }, "-=0.8");

    // Reveal sections on scroll
    if (ScrollTrigger) {
      revealElements.forEach((element) => {
        gsap.fromTo(
          element,
          {
            y: 35,
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true
            }
          }
        );
      });

      // Stagger activity cards
      gsap.from(".activity-card", {
        y: 45,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".activity-grid",
          start: "top 82%",
          once: true
        }
      });

      // Gallery entrance
      gsap.from(".video-card", {
        y: 35,
        opacity: 0,
        scale: 0.97,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".gallery-grid",
          start: "top 82%",
          once: true
        }
      });
    } else {
      setupFallbackReveal();
    }

    // Gentle floating motion for decorative elements
    gsap.to(".floating-emoji", {
      y: -12,
      stagger: 0.2,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(".art-card-back", {
      y: -10,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    gsap.to(".art-card-front", {
      y: -8,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.5
    });
  }

  // Wait until GSAP has loaded, or use fallback animations.
  if (window.gsap) {
    setupGSAP();
  } else {
    setupFallbackReveal();
  }

  // Keep navigation links working even if JavaScript animations
  // or third-party animation libraries fail.
});