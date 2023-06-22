function fetchUsers() {
  fetch(`http://localhost:3000/getAllUsers`)
    .then((response) => response.json())
    .then((users) => {
      if (users.length === 0) {
        console.log("Data array is empty");
        return;
      }

      var tableBody = document.querySelector('tbody');
      tableBody.innerHTML = ''; // Clear existing table rows

      users.forEach(function (user) {
      var row = document.createElement('tr');
      var emailCell = document.createElement('td');
      emailCell.textContent = user.email;
      var passwordCell = document.createElement('td');
      passwordCell.textContent = user.password;

          row.appendChild(emailCell);
          row.appendChild(passwordCell);
          tableBody.appendChild(row);
        });
    })
    .catch((error) => {
      console.error("Error fetching collection:", error);
    });
}

  // Call the fetchUsers function when the page loads
  document.addEventListener('DOMContentLoaded', function () {
    fetchUsers();
  });