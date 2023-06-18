// console.log("year: " + year.innerHTML);
const year = document.getElementById("year");
if (localStorage.getItem("textvalue")) {
  year.innerHTML = localStorage.getItem("textvalue");
}
console.log("text " + text);
// afisare grafic/tabel/pie chart
function displayImage() {
  let selectedOption = document.getElementById("select-options").value;
  let content = document.querySelector(".content");

  if (selectedOption === "Grafic") {
    const dataValues = [10, 20, 30, 40, 50];
    const labels = ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5"];
    const colors = ["#ff0000", "#36a2eb", "#ffce56", "#ff0080", "#676266"];
    drawCustomGrafic(dataValues, labels, colors);
  } else if (selectedOption === "Tabel") {
    content.innerHTML =
      '<img id="display-image" src="../static/info/tabel.png" alt="info" />';
  } else if (selectedOption === "Pie Chart") {
    // Exemplu de utilizare
    const dataValues = [15, 20, 30, 17, 8, 7];
    const colors = [
      "#ff0000",
      "#36a2eb",
      "#ffce56",
      "#ff0080",
      "#676266",
      "#709430",
    ];
    const totalValue = 100;
    drawPieChart(dataValues, colors, totalValue);
  }
}

function drawPieChart(dataValues, colors, totalValue) {
  document.querySelector(".content").innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "chartCanvas";
  document.querySelector(".content").innerHTML = "";
  document.querySelector(".content").appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const data = {
    labels: ["Red", "Blue", "Yellow", "Pink", "Gray", "Green"],
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
      },
    ],
  };

  new Chart(ctx, {
    type: "pie",
    data: data,
  });
}

function drawCustomGrafic(dataValues, labels, colors) {
  document.querySelector(".content").innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "chartCanvas";
  document.querySelector(".content").innerHTML = "";
  document.querySelector(".content").appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const data = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: colors,
      },
    ],
  };

  new Chart(ctx, {
    type: "bar", // Aici poți schimba tipul de grafic: bar, line, etc.
    data: data,
  });
}
