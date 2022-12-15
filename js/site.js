const navEl = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        navEl.classList.add('bg-dark');
    } else {
        navEl.classList.remove('bg-dark');
    }
});