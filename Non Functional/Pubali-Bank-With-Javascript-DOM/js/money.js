//get the amount of Deposit
document
  .getElementById("deposit-button")
  .addEventListener("click", function () {
    const depositInput = document.getElementById("deposit-input");
    const newdepositedText = depositInput.value;
    const newdepositedAmount = parseFloat(newdepositedText);
    //update total deposit
    const depositTotal = document.getElementById("deposit-total");
    const previousDepositText = depositTotal.innerText;
    const previousDepositAmount = parseFloat(previousDepositText);
    const newDepositTotal = previousDepositAmount + newdepositedAmount;
    depositTotal.innerText = newDepositTotal;

    //update total account balance

    const currentBalance = document.getElementById("total-balance");
    const balanceTotalText = currentBalance.innerText;
    const balancetotalAmount = parseFloat(balanceTotalText);
    const newTotalBalance = balancetotalAmount + newdepositedAmount;
    currentBalance.innerText = newTotalBalance;
    //clear Deposit Input Field
    depositInput.value = "";
  });

//Handle withdraw event handler

document
  .getElementById("withdraw-button")
  .addEventListener("click", function () {
    const withdrawInput = document.getElementById("withdraw-input");
    withdrawAmountText = withdrawInput.value;
    withdrawAmount = parseFloat(withdrawAmountText);

    //set withdraw Total
    const withdrawTotal = document.getElementById("total-withdraw");
    previousWithdrawText = withdrawTotal.innerText;
    previousWithdrawTotal = parseFloat(previousWithdrawText);

    //new Withdraw Total
    const newWithDrawTotal = withdrawAmount + previousWithdrawTotal;
    withdrawTotal.innerText = newWithDrawTotal;

    //clear Input Box
    withdrawInput.value = "";

    //Reduce from Total account when Deposited
    const totalBalance = document.getElementById("total-balance");
    const totalBalanceText = totalBalance.innerText;
    previoustotalBalance = parseFloat(totalBalanceText);
    newTotalBalance = previoustotalBalance - withdrawAmount;
    totalBalance.innerText = newTotalBalance;
  });
