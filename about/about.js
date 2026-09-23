const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownMenu = document.querySelector('.dropdown-menu');
const preferencesButton = document.querySelector('.preferences-button');
const learnMoreButton = document.querySelector('.learn-more-button');

dropdownToggle.addEventListener('click', () => {
	const isOpen = dropdownToggle.getAttribute('aria-expanded') === 'true';
	dropdownToggle.setAttribute('aria-expanded', String(!isOpen));
	dropdownMenu.hidden = isOpen;
});

preferencesButton.addEventListener('click', () => {
	window.location.href = '../onboarding/onboarding.html';
});

learnMoreButton.addEventListener('click', () => {
	window.location.href = '../home/home.html';
});
