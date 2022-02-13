function getInputValue(inputId) {
  const inputField = document.getElementById(inputId);
  const inputAmountText = inputField.value;
  const amountValue = parseFloat(inputAmountText);
  //clear Deposit Input Field
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

//get the amount of Deposit
document
  .getElementById("deposit-button")
  .addEventListener("click", function () {
    const depositAmount = getInputValue("deposit-input");
    updateTotalField("deposit-total", depositAmount);

    //update Total Balance
    const currentBalance = document.getElementById("total-balance");
    const balanceTotalText = currentBalance.innerText;
    const balancetotalAmount = parseFloat(balanceTotalText);
    const newTotalBalance = balancetotalAmount + depositAmount;
    currentBalance.innerText = newTotalBalance;
  });

//Handle withdraw event handler
document
  .getElementById("withdraw-button")
  .addEventListener("click", function () {
    const withdrawAmount = getInputValue("withdraw-input");
    updateTotalField("withdraw-total", withdrawAmount);

    //New Total Balance
    const totalBalance = document.getElementById("total-balance");
    const totalBalanceText = totalBalance.innerText;
    previoustotalBalance = parseFloat(totalBalanceText);
    newTotalBalance = previoustotalBalance - withdrawAmount;
    totalBalance.innerText = newTotalBalance;
  });
