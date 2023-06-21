// console.log("year: " + year.innerHTML);
const year = document.getElementById("year");
if (localStorage.getItem("textvalue")) {
  year.innerHTML = localStorage.getItem("textvalue");
}

const myDocument = document.getElementById("doc");
if (localStorage.getItem("selectedDocument")) {
  myDocument.innerHTML = localStorage.getItem("selectedDocument");
}

let documentName = "";
if (
  myDocument.innerHTML ===
  "Admiterea la tratament ca urmare a consumului de droguri"
) {
  documentName = "tdi-date-guvern";
} else if (
  myDocument.innerHTML ===
  "Bolile infecţioase asociate consumului de droguri injectabile"
) {
  documentName = "boli-infectioase";
} else if (
  myDocument.innerHTML === "Urgenţe medicale datorate consumului de droguri"
) {
  documentName = "urgente-medicale";
}

function hideSelectDrug() {
  const selectOptions = document.getElementById("select-options");
  const selectDrug = document.getElementById("select-drug");
  const selectDrugLabel = document.querySelector(
    "label[for='select-options2']"
  );

  selectOptions.onchange = function () {
    if (selectOptions.value === "CSV Table") {
      selectDrug.style.display = "none";
      selectDrugLabel.style.display = "none";
    } else {
      selectDrug.style.display = "inline-block";
      selectDrugLabel.style.display = "inline-block";
    }
  };
}

// Event listener to the select-table element
document
  .getElementById("select-table")
  .addEventListener("change", fetchDrugOptions);

function fetchTableOptions() {
  const year = localStorage.getItem("textvalue");
  const documentNameWithYear = `${documentName}-${year}`;
  console.log(documentNameWithYear);
  fetch(
    `http://localhost:3000/getCollections?documentName=${documentNameWithYear}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        console.log("Collection array is empty");
        return;
      }

      const selectTableElement = document.getElementById("select-table");
      selectTableElement.innerHTML = "";

      for (const option of data) {
        const optionElement = document.createElement("option");
        optionElement.value = option.trim(); // Trim whitespace from the options
        optionElement.textContent = option.trim(); // Trim whitespace from the options
        selectTableElement.appendChild(optionElement);
      }
      fetchDrugOptions();
    });
}
fetchTableOptions();

// Function to fetch drug options based on selected collection
function fetchDrugOptions() {
  const year = localStorage.getItem("textvalue");
  const selectedTable = document.getElementById("select-table").value;
  const collectionNameWithYear = `${documentName}-${year}_${selectedTable}`;
  console.log(year);
  console.log(selectedTable);
  const encodedCollectionName = encodeURIComponent(collectionNameWithYear);
  console.log(
    `http://localhost:3000/getOptions?collectionName=${encodedCollectionName}`
  );

  fetch(
    `http://localhost:3000/getOptions?collectionName=${encodedCollectionName}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) {
        console.log("Data array is empty");
        return;
      }

      const selectDrugElement = document.getElementById("select-drug");

      // Clear existing options
      selectDrugElement.innerHTML = "";

      console.log("nu sunt in for");
      // Add options based on the fetched data
      for (const option of data) {
        console.log("sunt in for");
        const optionElement = document.createElement("option");
        optionElement.value = option.trim(); // Trim whitespace from the options
        optionElement.textContent = option.trim(); // Trim whitespace from the options
        selectDrugElement.appendChild(optionElement);
      }
    })
    .catch((error) => {
      console.error("Error fetching drug options:", error);
    });
}

function displayImage() {
  const year = localStorage.getItem("textvalue");
  console.log("am intrat aici");
  let selectedOption = document.getElementById("select-options").value;
  let selectedDrug = document.getElementById("select-drug").value;
  let selectedTable = document.getElementById("select-table").value;
  let content = document.querySelector(".content");

  const collectionNameWithYear = `${documentName}-${year}_${selectedTable}`;
  const encodedCollectionName = encodeURIComponent(collectionNameWithYear);
  const encodedSelectedDrug = encodeURIComponent(selectedDrug);

  if (selectedOption === "Bar Chart") {
    fetch(
      `http://localhost:3000/getData?collectionName=${encodedCollectionName}&&itemName=${encodedSelectedDrug}`
    )
      .then((response) => response.json())
      .then((data) => {
        const labels = Object.keys(data).filter((key) => {
          const trimmedKey = key.trim(); // Remove leading and trailing spaces from the key
          return (
            trimmedKey !== "_id" &&
            trimmedKey !== "name" &&
            trimmedKey.replace(/\s/g, "") !== "Total"
          );
        }); // Extract labels from the data object
        const dataValues = labels.map((key) => data[key]); // Extract corresponding values for the labels

        const colors = generateRandomColors(dataValues.length); // Generate random colors

        drawCustomGrafic(dataValues, labels, colors);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else if (selectedOption === "Bubble Chart") {
    fetch(
      `http://localhost:3000/getData?collectionName=${encodedCollectionName}&&itemName=${encodedSelectedDrug}`
    )
      .then((response) => response.json())
      .then((data) => {
        const labels = Object.keys(data).filter((key) => {
          const trimmedKey = key.trim(); // Remove leading and trailing spaces from the key
          return (
            trimmedKey !== "_id" &&
            trimmedKey !== "name" &&
            trimmedKey.replace(/\s/g, "") !== "Total"
          );
        }); // Extract labels from the data object
        const dataValues = labels.map((key) => data[key]); // Extract corresponding values for the labels
        const sizes = dataValues.map((value) => value / dataValues.length);

        const colors = generateRandomColors(dataValues.length); // Generate random colors

        drawBubbleChart(dataValues, labels, sizes, colors);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else if (selectedOption === "Pie Chart") {
    console.log(encodedSelectedDrug);
    fetch(
      `http://localhost:3000/getData?collectionName=${encodedCollectionName}&&itemName=${encodedSelectedDrug}`
    )
      .then((response) => response.json())
      .then((data) => {
        const labels = Object.keys(data).filter((key) => {
          const trimmedKey = key.trim(); // Remove leading and trailing spaces from the key
          return (
            trimmedKey !== "_id" &&
            trimmedKey !== "name" &&
            trimmedKey.replace(/\s/g, "") !== "Total"
          );
        }); // Extract labels from the data object
        const dataValues = labels.map((key) => data[key]); // Extract corresponding values for the labels

        const colors = generateRandomColors(dataValues.length); // Generate random colors
        const totalValue = data.Total;
        drawPieChart(dataValues, colors, totalValue, labels);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else if (selectedOption === "CSV Table") {
    fetch(
      `http://localhost:3000/getCollection?collectionName=${encodedCollectionName}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          console.log("Data array is empty");
          return;
        }

        const tableElement = document.createElement("table");
        tableElement.className = "csv-table";

        // Create the table headers
        const tableHeaders = Object.keys(data[0]).filter(
          (header) => header !== "_id"
        );
        const headerRow = document.createElement("tr");
        for (const header of tableHeaders) {
          const th = document.createElement("th");
          th.textContent = header;
          headerRow.appendChild(th);
        }
        tableElement.appendChild(headerRow);

        // Create the table rows
        for (const item of data) {
          const row = document.createElement("tr");
          for (const header of tableHeaders) {
            const td = document.createElement("td");
            td.textContent = item[header];
            row.appendChild(td);
          }
          tableElement.appendChild(row);
        }

        const content = document.querySelector(".content");
        content.innerHTML = "";
        content.appendChild(tableElement);
      })
      .catch((error) => {
        console.error("Error fetching collection:", error);
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

/***********export to png */
function exportChartToPng() {
  var canvas = document.getElementById("chartCanvas");
  var collectionNameWithYear = `${documentName}-${localStorage.getItem(
    "textvalue"
  )}_${document.getElementById("select-table").value}`;
  var url = canvas.toDataURL("image/png");
  var link = document.createElement("a");
  link.href = url;
  link.download = collectionNameWithYear + ".png";
  link.click();
}

/***********************export to svg */
