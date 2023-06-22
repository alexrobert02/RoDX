function fetchUsers() {
  fetch(`http://localhost:3000/getAllUsers`)
    .then((response) => response.json())
    .then((users) => {
      var tableBody = document.querySelector('tbody');
      tableBody.innerHTML = ''; // Clear existing table rows

      if (users.length === 0) {
        console.log("Data array is empty");
        return;
      }

      users.forEach(function (user) {
        var row = document.createElement('tr');
        var emailCell = document.createElement('td');
        emailCell.textContent = user.email;
        var passwordCell = document.createElement('td');
        passwordCell.textContent = user.password;
        var actionsCell = document.createElement('td');
      
        // Edit icon
        var editIcon = document.createElement('i');
        editIcon.classList.add('fas', 'fa-edit');
        editIcon.setAttribute('title', 'Edit');
        actionsCell.appendChild(editIcon);

        // Add space using CSS class
        var space = document.createElement('span');
        space.classList.add('icon-space');
        actionsCell.appendChild(space);
      
        // Delete icon
        var deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash-alt');
        deleteIcon.setAttribute('title', 'Delete');
        deleteIcon.addEventListener('click', function () {
            deleteUser(user.email);
          });
        actionsCell.appendChild(deleteIcon);
      
        row.appendChild(emailCell);
        row.appendChild(passwordCell);
        row.appendChild(actionsCell);
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

  function deleteUser(email) {
    fetch(`http://localhost:3000/deleteUser?email=${email}`, {
      method: 'DELETE'
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
          fetchUsers();
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  }