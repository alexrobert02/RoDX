function getYear(year) {
  localStorage.setItem("textvalue", year);
}

function saveOption(document) {
  localStorage.setItem("selectedDocument", document);
  console.log(document);
}


