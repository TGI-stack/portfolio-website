// Portfolio interactions. Load once, immediately before </body>.
// Intended contact fields: text inputs, email inputs, and a textarea.
// This is a front-end demonstration: form data is NOT sent to a server.

// 1. Project filtering: one data-category value per project.
function filterProjects(category) {
    const projects = document.querySelectorAll("#projects > article[data-category]");

    projects.forEach((project) => {
        project.hidden = category !== "all" && project.dataset.category !== category;
    });
}

const projectFilter = document.querySelector("#project-filter");

if (projectFilter) {
    projectFilter.addEventListener("change", () => filterProjects(projectFilter.value));
    // Also respect a category that is already selected when the page loads.
    filterProjects(projectFilter.value);
}

// 2. Contact form: field-level feedback and a demo-only submit handler.
const contactForm = document.querySelector("#contact form");
const contactFields = Array.from(
    contactForm?.querySelectorAll(
        'input[type="text"], input[type="email"], input:not([type]), textarea'
    ) ?? []
);
const contactStatus = document.querySelector("#contact-status");

function getContactFieldError(field) {
    const label = field.labels?.[0]?.textContent?.trim() || "This field";

    if (field.required && !field.value.trim()) {
        return `${label} is required.`;
    }

    if (field.type === "email" && field.validity.typeMismatch) {
        return "Enter a valid email address.";
    }

    // Preserve other HTML constraints, such as minlength and pattern.
    if (!field.validity.valid) {
        return field.validationMessage || `Check ${label.toLowerCase()}.`;
    }

    return "";
}

function validateContactField(field) {
    const error = getContactFieldError(field);
    const message = document.getElementById(`${field.id}-error`);

    if (error) {
        field.setAttribute("aria-invalid", "true");
    } else {
        field.removeAttribute("aria-invalid");
    }

    if (message) {
        message.textContent = error;
    }

    return !error;
}

contactFields.forEach((field) => {
    field.addEventListener("blur", () => {
        field.dataset.touched = "true";
        validateContactField(field);
    });

    field.addEventListener("input", () => {
        if (contactStatus) {
            contactStatus.textContent = "";
        }

        if (field.dataset.touched === "true") {
            validateContactField(field);
        }
    });
});

if (contactForm) {
    // Use our inline error messages instead of the browser's popup messages.
    // JavaScript still reads each field's validity properties.
    contactForm.noValidate = true;

    contactForm.addEventListener("submit", (event) => {
        // Always prevent navigation: this portfolio has no sending backend yet.
        event.preventDefault();

        if (contactStatus) {
            contactStatus.textContent = "";
        }

        let firstInvalidField = null;

        // Unlike find(), this visits ALL fields and updates every error message.
        contactFields.forEach((field) => {
            field.dataset.touched = "true";
            const isValid = validateContactField(field);

            if (!isValid && firstInvalidField === null) {
                firstInvalidField = field;
            }
        });

        if (firstInvalidField) {
            firstInvalidField.focus();
            return;
        }

        if (contactStatus) {
            contactStatus.textContent =
                "The fields are valid. This demo does not send messages.";
        }
    });

    // The HTML button is disabled without JavaScript: this demo has no backend.
    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
    }
}

// 3. Project lightbox. #project-lightbox must be a <dialog>.
const projectLightbox = document.querySelector("#project-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxClose = projectLightbox?.querySelector(".lightbox-close");
let activeLightboxTrigger = null;

function openProjectLightbox(trigger) {
    const image = trigger.querySelector("img");
    const caption = trigger.closest("figure")?.querySelector("figcaption");

    if (
        !image ||
        !projectLightbox ||
        !lightboxImage ||
        !lightboxCaption ||
        typeof projectLightbox.showModal !== "function" ||
        projectLightbox.open
    ) {
        return;
    }

    activeLightboxTrigger = trigger;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption?.textContent ?? image.alt;
    projectLightbox.showModal();
    lightboxClose?.focus();
}

document.querySelectorAll(".lightbox-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => openProjectLightbox(trigger));
});

lightboxClose?.addEventListener("click", () => projectLightbox?.close());

projectLightbox?.addEventListener("click", (event) => {
    if (event.target !== projectLightbox) {
        return;
    }

    const bounds = projectLightbox.getBoundingClientRect();
    const outsideDialog =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;

    // Close on the backdrop, not on the dialog's own empty padding.
    if (outsideDialog) {
        projectLightbox.close();
    }
});

// Native modal <dialog> already handles Escape. No extra keydown is needed.
projectLightbox?.addEventListener("close", () => {
    // Retain the last image while the dialog is closed.

    if (activeLightboxTrigger?.isConnected) {
        activeLightboxTrigger.focus();
    }

    activeLightboxTrigger = null;
});

// 4. Navigation menu and same-page smooth scrolling.
const navigation = document.querySelector("header nav");
const menuToggle = navigation?.querySelector(".menu-toggle");
const navigationLinks = navigation?.querySelector(".nav-links");
const mobileNavigation = window.matchMedia("(max-width: 768px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function toggleMenu() {
    if (!navigation || !menuToggle) {
        return;
    }

    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    navigation.classList.toggle("is-open", !isExpanded);
}

function closeMenu() {
    if (!navigation || !menuToggle) {
        return;
    }

    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
}

if (navigation && menuToggle && navigationLinks) {
    navigation.classList.add("menu-enhanced");
    closeMenu();
    menuToggle.addEventListener("click", toggleMenu);

    // Scope Escape to the navigation so it does not interfere with the lightbox.
    navigation.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navigation.classList.contains("is-open")) {
            event.preventDefault();
            closeMenu();
            menuToggle.focus();
        }
    });

    // A browser can blur a control as soon as a responsive CSS rule hides it,
    // before the media-query change handler runs. Remember only that case.
    let hiddenNavigationFocus = null;

    navigation.addEventListener("focusout", (event) => {
        if (
            event.relatedTarget === null &&
            event.target instanceof HTMLElement &&
            event.target.getClientRects().length === 0
        ) {
            hiddenNavigationFocus = event.target;
        }
    });

    document.addEventListener("focusin", () => {
        hiddenNavigationFocus = null;
    });

    // Match the CSS breakpoint exactly and do not leave focus on a hidden item.
    mobileNavigation.addEventListener("change", (event) => {
        const previousFocus = hiddenNavigationFocus ?? document.activeElement;
        hiddenNavigationFocus = null;
        const focusWasInLinks = navigationLinks.contains(previousFocus);
        const focusWasOnToggle = previousFocus === menuToggle;
        closeMenu();

        if (event.matches && focusWasInLinks) {
            menuToggle.focus();
        } else if (!event.matches && focusWasOnToggle) {
            navigationLinks.querySelector("a[href]")?.focus();
        }
    });
}

navigation?.addEventListener("click", (event) => {
    if (
        !(event.target instanceof Element) ||
        event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
    ) {
        return;
    }

    const link = event.target.closest('a[href^="#"]');
    if (
        !link ||
        !navigation.contains(link) ||
        (link.target && link.target !== "_self") ||
        link.hasAttribute("download")
    ) {
        return;
    }

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") {
        return;
    }

    let target;
    try {
        target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
        return; // Leave malformed fragment URLs to the browser.
    }

    if (!target) {
        return;
    }

    event.preventDefault();
    closeMenu();

    // Move keyboard focus out of the menu that has just been hidden.
    // Remove our temporary tabindex when the user leaves the section.
    if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
            once: true
        });
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({
        behavior: reducedMotion.matches ? "instant" : "smooth",
        block: "start"
    });

    // Keep the section address without causing a second, instant jump.
    if (window.location.hash !== hash) {
        window.history.pushState(null, "", hash);
    }
});
