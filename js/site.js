// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

const navigation = document.querySelector("header nav");
const menuToggle = navigation?.querySelector(".menu-toggle");
const navigationLinks = navigation?.querySelector(".nav-links");

if (navigation && menuToggle && navigationLinks) {
	const closeMenu = () => {
		menuToggle.setAttribute("aria-expanded", "false");
		navigation.classList.remove("is-open");
	};

	navigation.classList.add("menu-enhanced");

	menuToggle.addEventListener("click", () => {
		const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
		menuToggle.setAttribute("aria-expanded", String(!isExpanded));
		navigation.classList.toggle("is-open", !isExpanded);
	});

	navigationLinks.addEventListener("click", (event) => {
		if (event.target instanceof Element && event.target.closest("a")) {
			closeMenu();
		}
	});

	navigation.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && navigation.classList.contains("is-open")) {
			closeMenu();
			menuToggle.focus();
		}
	});

	window.matchMedia("(min-width: 769px)").addEventListener("change", closeMenu);
}
