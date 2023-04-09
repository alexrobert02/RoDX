// console.log("year: " + year.innerHTML);
const year = document.getElementById("year");
if (localStorage.getItem("textvalue")) {
  year.innerHTML = localStorage.getItem("textvalue");
}
console.log("text " + text);
// afisare grafic/tabel
function displayImage() {
  let selectedOption = document.getElementById("select-options").value;
  if (selectedOption === "Grafic") {
    document.getElementById("display-image").src = "../static/info/grafic.png";
  } else {
    document.getElementById("display-image").src = "../static/info/tabel.png";
  }
}
