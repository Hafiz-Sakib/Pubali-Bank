// Combained Functions

function getInputValue(inputId) {
  const inputField = document.getElementById(inputId);
  const inputAmountText = inputField.value;
  const amountValue = parseFloat(inputAmountText);
  //clear Input Field
  inputField.value = "";
  return amountValue;
}
function updateTotalField(totalFieldId, amount) {
  const totalMoney = document.getElementById(totalFieldId);
  const totalMoneyText = totalMoney.innerText;
  const previousTotal = parseFloat(totalMoneyText);
  const changedBalance = previousTotal + amount;
  totalMoney.innerText = changedBalance;
}
function getCurrentBalance() {
  const currentBalance = document.getElementById("total-balance");
  const balanceTotalText = currentBalance.innerText;
  const totalBalance = parseFloat(balanceTotalText);
  return totalBalance;
}
function updateMainBalance(amount, isAdd) {
  const currentBalance = document.getElementById("total-balance");
  const totalBalance = getCurrentBalance();
  if (isAdd == true) {
    currentBalance.innerText = totalBalance + amount;
  } else {
    currentBalance.innerText = totalBalance - amount;
  }
}
//Handle Deposit event handler

document
  .getElementById("deposit-button")
  .addEventListener("click", function () {
    const depositAmount = getInputValue("deposit-input");
    if (depositAmount > 0) {
      updateTotalField("deposit-total", depositAmount);
      updateMainBalance(depositAmount, true);
    }
  });

//Handle withdraw event handler

document
  .getElementById("withdraw-button")
  .addEventListener("click", function () {
    const withdrawAmount = getInputValue("withdraw-input");
    const currentTotalBalance = getCurrentBalance();
    if (withdrawAmount > 0 && withdrawAmount < currentTotalBalance) {
      updateTotalField("withdraw-total", withdrawAmount);
      updateMainBalance(withdrawAmount, false);
    }
    if (withdrawAmount > currentTotalBalance) {
      document.body.style.backgroundColor = "red";
    }
  });
