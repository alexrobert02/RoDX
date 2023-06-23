const header = document.getElementById("header");

const myScrollFunc = function () {
    let y = window.scrollY;
    if (y >= 30) {
        header.className = "show"
    } else {
        header.className = "hide"
    }
};

window.addEventListener("scroll", myScrollFunc);