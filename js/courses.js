window.addEventListener("slide.bs.carousel", function(e) {
    let child = e.relatedTarget
    let index = [].indexOf.call(child.parentNode.children, child);

    let forSlide = document.querySelector(".for-slide-" + index);

    console.log("should show collapse " + forSlide.innerText.trim())
    return;

    // check your collapse code currently doesn't work

    if (!forSlide.classList.contains("in")) {
        document.querySelector("#collapseGroup>.collapse.show").collapse("hide");
        forSlide.collapse("show");
    }
});