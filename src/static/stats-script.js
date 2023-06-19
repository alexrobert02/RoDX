// console.log("year: " + year.innerHTML);
const year = document.getElementById("year");
if (localStorage.getItem("textvalue")) {
  year.innerHTML = localStorage.getItem("textvalue");
}
//console.log("text " + text);
// afisare grafic/tabel/pie chart
function displayImage(collectionName) {
  let selectedOption = document.getElementById("select-options").value;
  let content = document.querySelector(".content");

  if (selectedOption === "Bar Chart") {
    const encodedCollectionName = encodeURIComponent(collectionName);
    fetch(
      `http://localhost:3000/getData?collectionName=${encodedCollectionName}&&itemName=TOTAL`
    )
      .then((response) => response.json())
      .then((data) => {
        const labels = Object.keys(data).filter(
          (key) => key !== "_id" && key !== "name" && key !== " Total"
        ); // Extract labels from the data object
        const dataValues = labels.map((key) => data[key]); // Extract corresponding values for the labels

        const colors = generateRandomColors(dataValues.length); // Generate random colors

        drawCustomGrafic(dataValues, labels, colors);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else if (selectedOption === "Bubble Chart") {
    const encodedCollectionName = encodeURIComponent(collectionName);
    fetch(
      `http://localhost:3000/getData?collectionName=${encodedCollectionName}&&itemName=TOTAL`
    )
      .then((response) => response.json())
      .then((data) => {
        const labels = Object.keys(data).filter(
          (key) => key !== "_id" && key !== "name" && key !== " Total"
        ); // Extract labels from the data object
        const dataValues = labels.map((key) => data[key]); // Extract corresponding values for the labels
        const sizes = dataValues.map((value) => value / dataValues.length);

        const colors = generateRandomColors(dataValues.length); // Generate random colors

        drawBubbleChart(dataValues, labels, sizes, colors);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else if (selectedOption === "Pie Chart") {
    const encodedCollectionName = encodeURIComponent(collectionName);
    fetch(
      `http://localhost:3000/getData?collectionName=${encodedCollectionName}&&itemName=TOTAL`
    )
      .then((response) => response.json())
      .then((data) => {
        const labels = Object.keys(data).filter(
          (key) => key !== "_id" && key !== "name" && key !== " Total"
        ); // Extract labels from the data object
        const dataValues = labels.map((key) => data[key]); // Extract corresponding values for the labels

        const colors = generateRandomColors(dataValues.length); // Generate random colors
        const totalValue = data.Total;
        drawPieChart(dataValues, colors, totalValue, labels);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
}

function drawPieChart(dataValues, colors, totalValue, labels) {
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
    type: "bar",
    data: data,
    options: {
      plugins: {
        legend: {
          display: false, // Ascunde legenda
        },
      },
    },
  });
}

function drawBubbleChart(dataValues, labels, sizes, colors) {
  document.querySelector(".content").innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "chartCanvas";
  document.querySelector(".content").innerHTML = "";
  document.querySelector(".content").appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const data = {
    datasets: [
      {
        label: "Data",
        data: dataValues.map((value, index) => ({
          x: value,
          y: index + 1,
          r: sizes[index],
        })),
        backgroundColor: colors,
      },
    ],
  };

  new Chart(ctx, {
    type: "bubble",
    data: data,
    options: {
      plugins: {
        legend: {
          display: false, // Ascunde legenda
        },
      },
      scales: {
        y: {
          ticks: {
            stepSize: 1,
            callback: function (value, index) {
              return labels[index];
            },
          },
        },
      },
    },
  });
}

function generateRandomColors(count) {
  const colors = [];
  const baseColors = [
    "#f44336",
    "#e81e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#4caf50",
    "#00bcd4",
    "#009688",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#03a9f4",
    "#ff9800",
    "#795548",
    "#9e9e9e",
    "#607d8b",
    "#000000",
    "#ff5722",
  ];

  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i]);
  }

  return colors;
}