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
      
        // Edit button
        var editIcon = document.createElement('i');
        editIcon.classList.add('fas', 'fa-edit');
        editIcon.setAttribute('title', 'Edit');
        editIcon.addEventListener('click', function () {
          editUser(user, emailCell, passwordCell, editIcon);
        });
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
    // Display a confirmation dialog
    var confirmed = confirm("Are you sure you want to delete this user?");
  
    if (confirmed) {
      // User confirmed deletion
      // Show the cool warning popup
      var warningPopup = document.createElement('div');
      warningPopup.classList.add('warning-popup');
      warningPopup.textContent = 'Deleting user...';
  
      document.body.appendChild(warningPopup);
  
      fetch(`http://localhost:3000/deleteUser?email=${email}`, {
        method: 'DELETE'
      })
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          fetchUsers();
          // Remove the warning popup
          warningPopup.remove();
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          // Remove the warning popup
          warningPopup.remove();
        });
    }
  }

  function editUser(user, emailCell, passwordCell, editIcon) {
    // Create input fields for email and password
    var emailInput = document.createElement('input');
    emailInput.type = 'text';
    emailInput.value = user.email;
    
    var passwordInput = document.createElement('input');
    passwordInput.type = 'text';
    passwordInput.value = user.password;
    
    // Replace email and password cells with input fields
    emailCell.textContent = '';
    emailCell.appendChild(emailInput);
    
    passwordCell.textContent = '';
    passwordCell.appendChild(passwordInput);
    
    // Update the edit button to save changes
    editIcon.classList.remove('fa-edit');
    editIcon.classList.add('fa-check');
    editIcon.setAttribute('title', 'Save');
    editIcon.removeEventListener('click', editUser);
    editIcon.addEventListener('click', function () {
        saveUserChanges(user, emailInput.value, passwordInput.value, emailCell, passwordCell, editIcon);
    });
    }

  function saveUserChanges(user, newEmail, newPassword, emailCell, passwordCell, editIcon) {
    var confirmed = confirm("Are you sure you want to save the changes?");
    
    if (confirmed) {
      // Show the cool warning popup
      var warningPopup = document.createElement('div');
      warningPopup.classList.add('warning-popup');
      warningPopup.textContent = 'Saving changes...';
    
      document.body.appendChild(warningPopup);
    
      // Send the updated data to the server
      fetch(`http://localhost:3000/updateUser?email=${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword
        })
      })
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          fetchUsers();
          // Remove the warning popup
          warningPopup.remove();
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          // Remove the warning popup
          warningPopup.remove();
        });
      
      // Restore the original cells' content and edit button
      emailCell.textContent = user.email;
      passwordCell.textContent = user.password;
      editIcon.classList.remove('fa-check');
      editIcon.classList.add('fa-edit');
      editIcon.setAttribute('title', 'Edit');
      editIcon.removeEventListener('click', saveUserChanges);
      editIcon.addEventListener('click', function () {
        editUser(user, emailCell, passwordCell, editIcon);
      });
    }
  }