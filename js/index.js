const nav = document.querySelector('.navbar');
const downArrow = document.querySelector('.down-arrow');

window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        nav.classList.add('bg-dark');
    } else {
        nav.classList.remove('bg-dark');
    }
    downArrow.style.opacity = 1 - window.scrollY / 200;
});