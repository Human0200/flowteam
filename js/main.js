const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const toggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobile-nav");

if (toggle && mobileNav) {
  toggle.addEventListener("click", () => {
    const open = mobileNav.hasAttribute("hidden") === false;
    if (open) {
      mobileNav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Открыть меню");
    } else {
      mobileNav.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Закрыть меню");
    }
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Открыть меню");
    });
  });
}

const revealTargets = document.querySelectorAll(
  ".section-head, .service, .trust-card, .uptime-inner, .contact-panel"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

const workItems = document.querySelectorAll(".work-item, .work-cta");
workItems.forEach((el, i) => {
  el.classList.add("reveal", i % 2 === 0 ? "reveal-right" : "reveal-left");
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const termBody = document.getElementById("terminal-body");
const termOptions = document.getElementById("terminal-options");
let termName = "";
let termContact = "";
let termTask = "";
let termCaptcha = null;

const UNITS = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];

function termNewCaptcha() {
  const op = Math.random() < 0.5 ? "+" : "−";
  const digit = 1 + Math.floor(Math.random() * 9);
  const wordNum = 1 + Math.floor(Math.random() * (op === "−" ? digit : 9));
  termCaptcha = {
    answer: op === "+" ? digit + wordNum : digit - wordNum,
    text: `${digit} ${op} ${UNITS[wordNum]}`,
  };
}

function termCaptchaPrompt() {
  termPrompt(
    `<span class="prompt">$</span> <span class="captcha-q">${termCaptcha.text} = ?</span> <input class="terminal-input" type="number" min="0" placeholder="ответ" autocomplete="off" />`
  );
}

function termMsg(cls, meta, text) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  if (meta) {
    const m = document.createElement("span");
    m.className = "msg-meta";
    m.textContent = meta;
    div.appendChild(m);
  }
  div.appendChild(document.createTextNode(text));
  termBody.appendChild(div);
  div.scrollIntoView({ block: "nearest" });
  return div;
}

function termPrompt(html) {
  const old = document.getElementById("terminal-line");
  if (old) old.remove();
  const el = document.createElement("div");
  el.id = "terminal-line";
  el.className = "terminal-line";
  el.innerHTML = html;
  termBody.appendChild(el);
  const input = el.querySelector("input");
  if (input) input.focus();
  el.scrollIntoView({ block: "nearest" });
}

if (termBody && termOptions) {
  termOptions.querySelectorAll(".terminal-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.choice;
      termOptions.remove();
      termMsg("msg-in", "client · вы", choice);
      setTimeout(() => {
        termMsg("msg-out", "flowteam · agent", `Отличный выбор — ${choice}. Как вас зовут?`);
        termPrompt(
          '<span class="prompt">$</span> <input class="terminal-input" type="text" placeholder="имя" autocomplete="off" />'
        );
      }, 700);
    });
  });

  termBody.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !e.target.classList.contains("terminal-input")) return;
    e.preventDefault();
    const value = e.target.value.trim();
    if (!value) return;

    if (!termName) {
      termName = value;
      termMsg("msg-in", "client · вы", value);
      setTimeout(() => {
        termMsg(
          "msg-out",
          "flowteam · agent",
          `Приятно познакомиться, ${termName}. Куда ответить — Telegram, WhatsApp или другой способ связи? Просто напишите его в наш терминал.`
        );
        termPrompt(
          '<span class="prompt">$</span> <input class="terminal-input" type="text" placeholder="способ связи" autocomplete="off" />'
        );
      }, 700);
    } else if (!termContact) {
      termContact = value;
      termMsg("msg-in", "client · вы", value);
      setTimeout(() => {
        termMsg(
          "msg-out",
          "flowteam · agent",
          "Опишите кратко задачу — что нужно собрать или автоматизировать."
        );
        termPrompt(
          '<span class="prompt">$</span> <input class="terminal-input" type="text" placeholder="задача в паре слов" autocomplete="off" />'
        );
      }, 700);
    } else if (!termTask) {
      termTask = value;
      termMsg("msg-in", "client · вы", value);
      setTimeout(() => {
        termMsg(
          "msg-out",
          "flowteam · agent",
          "Мне нужно удостовериться, что вы не бот. Решите простой пример:"
        );
        termNewCaptcha();
        termCaptchaPrompt();
      }, 700);
    } else {
      const answer = Number.parseInt(value, 10);
      if (!Number.isNaN(answer) && termCaptcha && answer === termCaptcha.answer) {
        termMsg("msg-in", "client · вы", value);
        setTimeout(() => {
          termMsg(
            "msg-out",
            "flowteam · agent",
            `Готово, ${termName}! Ответим в ${termContact} в течение дня.`
          );
          termPrompt(
            '<span class="cursor-line"><span class="prompt">$</span> заявка принята · <a href="#contact">обсудить проект →</a></span>'
          );
        }, 700);
      } else {
        termMsg("msg-error", null, "Неверный ответ. Ещё раз:");
        termNewCaptcha();
        termCaptchaPrompt();
      }
    }
  });
}

let works = [];

const modal = document.getElementById("work-modal");
const modalTag = document.getElementById("modal-tag");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalShots = document.getElementById("modal-shots");
const portfolioGrid = document.getElementById("portfolio-grid");
let lastFocused = null;

function renderCards() {
  if (!portfolioGrid) return;
  portfolioGrid.textContent = "";
  works.forEach((w, i) => {
    const card = document.createElement("article");
    card.className = "portfolio-card";
    card.dataset.work = String(i);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-haspopup", "dialog");

    const tag = document.createElement("span");
    tag.className = "portfolio-tag";
    tag.textContent = w.tag || "";

    const h3 = document.createElement("h3");
    h3.textContent = w.title || "";

    const p = document.createElement("p");
    p.textContent = w.summary || "";

    const view = document.createElement("span");
    view.className = "portfolio-view";
    view.textContent = "смотреть →";

    card.append(tag, h3, p, view);

    const open = () => openWork(i);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });

    portfolioGrid.appendChild(card);
    card.classList.add("reveal");
    observer.observe(card);
  });
}

fetch("works.json")
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then((data) => {
    works = Array.isArray(data.works) ? data.works : [];
    renderCards();
  })
  .catch(() => {
    if (!portfolioGrid) return;
    const p = document.createElement("p");
    p.className = "portfolio-empty";
    p.textContent = "Не удалось загрузить работы — проверьте файл works.json.";
    portfolioGrid.appendChild(p);
  });

function openWork(index) {
  const work = works[index];
  if (!work || !modal) return;
  modalTag.textContent = work.tag || "";
  modalTitle.textContent = work.title || "";
  modalBody.textContent = "";
  (work.desc || []).forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    modalBody.appendChild(p);
  });
  modalShots.textContent = "";
  (work.shots || []).forEach((shot, i) => {
    const label =
      typeof shot === "string" ? shot : (shot && shot.label) || `Скриншот ${i + 1}`;
    const src = typeof shot === "string" ? "" : (shot && shot.src) || "";
    const el = document.createElement("div");
    el.className = "shot";
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = label;
      img.loading = "lazy";
      el.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.textContent = `скриншот ${i + 1} · ${label}`;
      el.appendChild(span);
    }
    modalShots.appendChild(el);
  });
  lastFocused = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close").focus();
}

function closeWork() {
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

const lightbox = document.getElementById("shot-lightbox");
const lightboxImg = document.getElementById("lightbox-img");

function openShot(src, alt) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.hidden = false;
}

function closeShot() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  if (modal && modal.hidden) document.body.style.overflow = "";
}

if (modal) {
  modal.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", closeWork)
  );

  modalShots.addEventListener("click", (e) => {
    const img = e.target.closest(".shot img");
    if (img) openShot(img.src, img.alt);
  });
}

if (lightbox) {
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeShot);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeShot();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (lightbox && !lightbox.hidden) closeShot();
  else closeWork();
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const counters = document.querySelectorAll(".trust-num[data-count]");

if (!reduceMotion && counters.length) {
  counters.forEach((el) => {
    const from = el.hasAttribute("data-from") ? parseInt(el.dataset.from, 10) : 0;
    el.textContent = String(from) + (el.dataset.suffix || "");
  });

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countObserver.unobserve(el);
        const target = parseInt(el.dataset.count, 10);
        const from = el.hasAttribute("data-from") ? parseInt(el.dataset.from, 10) : 0;
        const suffix = el.dataset.suffix || "";
        const duration = 1000;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent =
            String(Math.round(from + (target - from) * eased)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((el) => countObserver.observe(el));
}

const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");

const CRM_API = "/api/leads";

function parseContact(raw) {
  const c = { name: "", email: "", phone: "", telegram: "", max_id: "", whatsapp: "" };
  const s = raw.trim();
  const email = s.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/);
  if (email) c.email = email[0];
  const tg = s.match(/t\.me\/([\w]{4,})/i) || s.match(/@([\w]{4,})/);
  if (tg) c.telegram = tg[1];
  const digits = s.replace(/[^\d+]/g, "");
  if (digits.length >= 7) c.phone = digits;
  if (/whatsapp/i.test(s) && c.phone) c.whatsapp = c.phone;
  if (/\bmax\b/i.test(s)) c.max_id = c.phone || c.telegram;
  return c;
}

if (form && note) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const contactRaw = String(data.get("contact") || "").trim();
    const message = String(data.get("message") || "").trim();

    const payload = {
      title: `Сайт: ${name} — ${message.slice(0, 80)}`,
      description: `Имя: ${name}\nКонтакт: ${contactRaw}\n\n${message}`,
      contact: { name, ...parseContact(contactRaw) },
    };

    note.classList.remove("error");
    note.textContent = "Отправляем...";

    try {
      const r = await fetch(CRM_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      note.textContent = "Спасибо — заявка отправлена. Ответим в ближайшее время.";
      form.reset();
    } catch (err) {
      note.classList.add("error");
      note.textContent =
        "Не удалось отправить заявку. Попробуйте ещё раз или напишите hello@flowteam.ru.";
    }
  });
}
