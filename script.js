const body = document.body;
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const themeToggle = document.getElementById("theme-toggle");
const preloader = document.getElementById("preloader");
const scrollProgress = document.getElementById("scroll-progress");
const header = document.getElementById("header");
const yearEl = document.getElementById("year");
const scrollTopBtn = document.getElementById("scroll-top");
const typingEl = document.querySelector(".typing");
const form = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setTheme = (theme) => {
  body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  themeToggle?.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
};

const initTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved) {
    setTheme(saved);
    return;
  }
  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(systemPrefersLight ? "light" : "dark");
};

const toggleNav = () => {
  navMenu?.classList.toggle("open");
  const isOpen = navMenu?.classList.contains("open") ?? false;
  navToggle?.setAttribute("aria-expanded", isOpen.toString());
  body.classList.toggle("nav-open", isOpen);
};

const closeNav = () => {
  navMenu?.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");
  body.classList.remove("nav-open");
};

const handleScroll = () => {
  const scrollTop = window.scrollY;
  header?.classList.toggle("scrolled", scrollTop > 10);

  if (scrollProgress) {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? (scrollTop / height) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;
  }

  if (scrollTopBtn) {
    scrollTopBtn.style.opacity = scrollTop > 400 ? "1" : "0";
    scrollTopBtn.style.pointerEvents = scrollTop > 400 ? "auto" : "none";
  }
};

const initSmoothLinks = () => {
  document.querySelectorAll("a[href^=\"#\"]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") {
        return;
      }
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNav();
      }
    });
  });
};

const initActiveNav = () => {
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const id = entry.target.getAttribute("id");
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0.15 }
  );

  sections.forEach((section) => observer.observe(section));
};

const initReveal = () => {
  const revealItems = document.querySelectorAll(".reveal");
  if (!revealItems.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
};

const initTyping = () => {
  if (!typingEl) {
    return;
  }
  const words = typingEl.dataset.words
    ? typingEl.dataset.words.split(",").map((word) => word.trim()).filter(Boolean)
    : [];

  if (!words.length) {
    return;
  }

  if (prefersReducedMotion) {
    typingEl.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeLoop = () => {
    const current = words[wordIndex % words.length];
    const visibleText = current.slice(0, charIndex);
    typingEl.textContent = visibleText;

    if (!isDeleting && charIndex < current.length) {
      charIndex += 1;
      setTimeout(typeLoop, 90);
    } else if (isDeleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(typeLoop, 60);
    } else {
      isDeleting = !isDeleting;
      if (!isDeleting) {
        wordIndex += 1;
      }
      setTimeout(typeLoop, 900);
    }
  };

  typeLoop();
};

const initCounters = () => {
  const counters = document.querySelectorAll(".stat-number");
  if (!counters.length) {
    return;
  }

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || 0);
    let value = 0;
    const step = Math.max(1, Math.ceil(target / 60));

    const tick = () => {
      value += step;
      if (value >= target) {
        counter.textContent = target;
        return;
      }
      counter.textContent = value;
      requestAnimationFrame(tick);
    };

    tick();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = "true";
          animateCounter(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
};

const initFilters = () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projects = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      projects.forEach((card) => {
        const category = card.dataset.category;
        const shouldShow = filter === "all" || filter === category;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
};

const initForm = () => {
  if (!form || !formStatus) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.querySelector("#name");
    const email = form.querySelector("#email");
    const message = form.querySelector("#message");

    const errors = [];

    if (!name.value.trim()) {
      errors.push("Please enter your name.");
      name.setAttribute("aria-invalid", "true");
      name.classList.add("invalid");
    } else {
      name.removeAttribute("aria-invalid");
      name.classList.remove("invalid");
    }

    const emailValue = email.value.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    if (!emailValue || !emailValid) {
      errors.push("Please enter a valid email address.");
      email.setAttribute("aria-invalid", "true");
      email.classList.add("invalid");
    } else {
      email.removeAttribute("aria-invalid");
      email.classList.remove("invalid");
    }

    if (!message.value.trim()) {
      errors.push("Please add a short message.");
      message.setAttribute("aria-invalid", "true");
      message.classList.add("invalid");
    } else {
      message.removeAttribute("aria-invalid");
      message.classList.remove("invalid");
    }

    if (errors.length) {
      formStatus.textContent = errors[0];
      formStatus.classList.remove("success");
      formStatus.classList.add("error");
      return;
    }

    if (window.location.protocol === "file:") {
      formStatus.textContent = "Please open this site with a local server to send messages.";
      formStatus.classList.remove("success");
      formStatus.classList.add("error");
      return;
    }

    formStatus.textContent = "Sending message...";
    formStatus.classList.remove("success", "error");

    const templateParams = {
      from_name: name.value,
      from_email: email.value,
      message: message.value,
      to_email: "rohulkuddusrobi@gmail.com",
      reply_to: email.value,
    };

    emailjs.send(
      'service_ysp5l7w',
      'template_usiijqq',
      templateParams,
      { publicKey: 'WSY8AzBqkEjYt_6tB' }
    )
    .then(() => {
      formStatus.textContent = "Message sent. I will reply within 24 hours.";
      formStatus.classList.add("success");
      form.reset();
    })
    .catch((error) => {
      const detail = error && (error.text || error.message || error);
      console.error("EmailJS Error:", detail);
      formStatus.textContent = "Failed to send message.";
      formStatus.classList.add("error");
    });
  });
};

const initScrollTop = () => {
  if (!scrollTopBtn) {
    return;
  }
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const initRipple = () => {
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
};

const initPreloader = () => {
  if (!preloader) {
    return;
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("is-hidden");
    }, 500);
  });
};

navToggle?.addEventListener("click", toggleNav);
const navMenuLinks = navMenu ? navMenu.querySelectorAll("a") : [];
navMenuLinks.forEach((link) => link.addEventListener("click", closeNav));

themeToggle?.addEventListener("click", () => {
  const current = body.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

window.addEventListener("scroll", handleScroll);

initTheme();
initSmoothLinks();
initActiveNav();
initReveal();
initTyping();
initCounters();
initFilters();
initForm();
initScrollTop();
initPreloader();
initRipple();
handleScroll();

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
