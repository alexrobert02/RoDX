function getYear(year) {
  localStorage.setItem("textvalue", year);
  document.getElementById("year").textContent = year;
}

function saveOption(doc) {
  localStorage.setItem("selectedDocument", doc);
  document.getElementById("doc").textContent = doc;
  console.log(doc);
}


