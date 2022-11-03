document.getElementById("login-submit").addEventListener("click", function () {
  //get email
  const emailField = document.getElementById("user-email");
  const userEmailInfo = emailField.value;
  console.log(userEmailInfo);
  //get password
  const userPass = document.getElementById("user-pass").value;
  console.log(userPass);

  //get email and get pass er System eki just pass er value er jnne extra variable Declare korlam na etotukui!

  //check Email and Password && Redirect to an another html  file if email and Password are Matched
  if (userEmailInfo == "abc@gmail.com" && userPass == "abc") {
    window.location.href = "banking.html";
  } else {
    document.body.style.backgroundColor = "red";
  }
});
//login finished
