
function displayPassword () {
    let passwordField = document.getElementById("password-icon");
    let passwordSource = passwordField.getAttribute("src");

    if (passwordSource === '../static/images/hidden-pass.png') {
        document.getElementById("password-icon").src='../static/images/show-pass.png';
        document.getElementById("password").type="text";
    } else {
        document.getElementById("password-icon").src='../static/images/hidden-pass.png';
        document.getElementById("password").type="password";
    }
}