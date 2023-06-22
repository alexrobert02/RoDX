function fetchUsers() {
  fetch(`http://localhost:3000/getAllUsers`)
    .then((response) => response.json())
    .then((users) => {
      var tableBody = document.querySelector("tbody");
      tableBody.innerHTML = "";

      if (users.length === 0) {
        console.log("Data array is empty");
        return;
      }

      users.forEach(function (user) {
        var row = document.createElement("tr");
        var emailCell = document.createElement("td");
        emailCell.textContent = user.email;
        var passwordCell = document.createElement("td");
        passwordCell.textContent = user.password;
        var actionsCell = document.createElement("td");

        var editIcon = document.createElement("i");
        editIcon.classList.add("fas", "fa-edit");
        editIcon.setAttribute("title", "Edit");
        editIcon.addEventListener("click", function () {
          editUser(user, emailCell, passwordCell, editIcon);
        });
        actionsCell.appendChild(editIcon);

        var space = document.createElement("span");
        space.classList.add("icon-space");
        actionsCell.appendChild(space);

        var deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fas", "fa-trash-alt");
        deleteIcon.setAttribute("title", "Delete");
        deleteIcon.addEventListener("click", function () {
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

document.addEventListener("DOMContentLoaded", function () {
  fetchUsers();
});

function deleteUser(email) {
  var confirmed = confirm("Are you sure you want to delete this user?");

  if (confirmed) {
    var warningPopup = document.createElement("div");
    warningPopup.classList.add("warning-popup");
    warningPopup.textContent = "Deleting user...";

    document.body.appendChild(warningPopup);

    fetch(`http://localhost:3000/deleteUser?email=${email}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        fetchUsers();
        warningPopup.remove();
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        warningPopup.remove();
      });
  }
}

function editUser(user, emailCell, passwordCell, editIcon) {
  var emailInput = document.createElement("input");
  emailInput.type = "text";
  emailInput.value = user.email;

  var passwordInput = document.createElement("input");
  passwordInput.type = "text";
  passwordInput.value = user.password;

  emailCell.textContent = "";
  emailCell.appendChild(emailInput);

  passwordCell.textContent = "";
  passwordCell.appendChild(passwordInput);

  editIcon.classList.remove("fa-edit");
  editIcon.classList.add("fa-check");
  editIcon.setAttribute("title", "Save");
  editIcon.removeEventListener("click", editUser);
  editIcon.addEventListener("click", function () {
    saveUserChanges(
      user,
      emailInput.value,
      passwordInput.value,
      emailCell,
      passwordCell,
      editIcon
    );
  });
}

function saveUserChanges(
  user,
  newEmail,
  newPassword,
  emailCell,
  passwordCell,
  editIcon
) {
  var confirmed = confirm("Are you sure you want to save the changes?");

  if (confirmed) {
    var warningPopup = document.createElement("div");
    warningPopup.classList.add("warning-popup");
    warningPopup.textContent = "Saving changes...";

    document.body.appendChild(warningPopup);

    fetch(`http://localhost:3000/updateUser?email=${user.email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: newEmail,
        password: newPassword,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        fetchUsers();
        warningPopup.remove();
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        warningPopup.remove();
      });

    emailCell.textContent = user.email;
    passwordCell.textContent = user.password;
    editIcon.classList.remove("fa-check");
    editIcon.classList.add("fa-edit");
    editIcon.setAttribute("title", "Edit");
    editIcon.removeEventListener("click", saveUserChanges);
    editIcon.addEventListener("click", function () {
      editUser(user, emailCell, passwordCell, editIcon);
    });
  }
}
