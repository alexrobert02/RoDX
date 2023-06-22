const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", () => {
    window.location.href = "/logout";
});


// Get the email and password elements from the edit page
var emailElement = document.querySelector('.label-email');
var passwordElement = document.querySelector('.label-password');
var emailValueElement = document.getElementById('emailValue');
var passwordValueElement = document.getElementById('passwordValue');

// Add event listeners to the edit and delete buttons on the edit page
var editButton = document.querySelector('.edit-button');
editButton.addEventListener('click', editUser);
var deleteButton = document.querySelector('.delete-button');
deleteButton.addEventListener('click', deleteUser);

const email = localStorage.getItem("email");

// Function to fetch and display user data on the edit page
function fetchUser() {
  fetch(`http://localhost:3000/getUser?email=${email}`, {
    method: 'GET'
  })
    .then((response) => response.json())
    .then((user) => {
      // Display user data on the edit page
      emailValueElement.textContent = user.email;
      passwordValueElement.textContent = '********';
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
    });
}

// Call the fetchUser function when the edit page loads
document.addEventListener('DOMContentLoaded', function () {
  fetchUser();
});

function deleteUser() {
  var confirmed = confirm('Are you sure you want to delete your account?');

  if (confirmed) {
    var warningPopup = document.createElement('div');
    warningPopup.classList.add('warning-popup');
    warningPopup.textContent = 'Deleting account...';

    document.body.appendChild(warningPopup);

    fetch(`http://localhost:3000/deleteUser?email=${email}`, {
      method: 'DELETE'
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        // Redirect the user to the admin page after successful deletion
        window.location.href = '/logout';
        // Remove the warning popup
        warningPopup.remove();
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        // Remove the warning popup
        warningPopup.remove();
      });
  }
}

function editUser() {
  // Replace the email and password elements with input fields
  var emailInput = document.createElement('input');
  emailInput.type = 'text';
  emailInput.value = emailValueElement.textContent;
  emailValueElement.textContent = '';
  emailValueElement.appendChild(emailInput);

  var passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.value = passwordValueElement.textContent;
  passwordValueElement.textContent = '';
  passwordValueElement.appendChild(passwordInput);

  // Update the edit button to save changes
  editButton.innerHTML = '<i class="fas fa-check"></i> Save';
  editButton.removeEventListener('click', editUser);
  editButton.addEventListener('click', saveUserChanges);
}

function saveUserChanges() {
  var confirmed = confirm('Are you sure you want to save the changes?');

  if (confirmed) {
    var warningPopup = document.createElement('div');
    warningPopup.classList.add('warning-popup');
    warningPopup.textContent = 'Saving changes...';

    document.body.appendChild(warningPopup);

    // Send the updated data to the server
    fetch(`http://localhost:3000/updateUser?email=${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: emailValueElement.querySelector('input').value,
        password: passwordValueElement.querySelector('input').value
      })
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        // Redirect the user to the admin page after successful update
        window.location.href = '/';
        // Remove the warning popup
        warningPopup.remove();
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        // Remove the warning popup
        warningPopup.remove();
      });
  }
}
