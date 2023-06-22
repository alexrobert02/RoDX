const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", () => {
  window.location.href = "/logout";
});

var emailElement = document.querySelector(".label-email");
var passwordElement = document.querySelector(".label-password");
var emailValueElement = document.getElementById("emailValue");
var passwordValueElement = document.getElementById("passwordValue");

var editButton = document.querySelector(".edit-button");
editButton.addEventListener("click", editUser);
var deleteButton = document.querySelector(".delete-button");
deleteButton.addEventListener("click", deleteUser);

const email = localStorage.getItem("email");

function fetchUser() {
  fetch(`http://localhost:3000/getUser?email=${email}`, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((user) => {
      emailValueElement.textContent = user.email;
      passwordValueElement.textContent = "********";
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  fetchUser();
});

function deleteUser() {
  var confirmed = confirm("Are you sure you want to delete your account?");

  if (confirmed) {
    var warningPopup = document.createElement("div");
    warningPopup.classList.add("warning-popup");
    warningPopup.textContent = "Deleting account...";

    document.body.appendChild(warningPopup);

    fetch(`http://localhost:3000/deleteUser?email=${email}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((result) => {
        window.location.href = "/logout";
        warningPopup.remove();
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        warningPopup.remove();
      });
  }
}

function editUser() {
  var emailInput = document.createElement("input");
  emailInput.type = "text";
  emailInput.value = emailValueElement.textContent;
  emailValueElement.textContent = "";
  emailValueElement.appendChild(emailInput);

  var passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.value = passwordValueElement.textContent;
  passwordValueElement.textContent = "";
  passwordValueElement.appendChild(passwordInput);

  editButton.innerHTML = '<i class="fas fa-check"></i> Save';
  editButton.removeEventListener("click", editUser);
  editButton.addEventListener("click", saveUserChanges);
}

function saveUserChanges() {
  var confirmed = confirm("Are you sure you want to save the changes?");

  if (confirmed) {
    var warningPopup = document.createElement("div");
    warningPopup.classList.add("warning-popup");
    warningPopup.textContent = "Saving changes...";

    document.body.appendChild(warningPopup);

    fetch(`http://localhost:3000/updateUser?email=${email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailValueElement.querySelector("input").value,
        password: passwordValueElement.querySelector("input").value,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        window.location.href = "/";
        warningPopup.remove();
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        warningPopup.remove();
      });
  }
}
