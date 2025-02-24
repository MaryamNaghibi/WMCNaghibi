function istPrimzahl(num) {
  let button = document.getElementById("pruefenButton");
  let inputField = document.getElementById("zahlInput");
  let resultDisplay = document.getElementById("resultDisplay");

  if (!resultDisplay) {
    resultDisplay = document.createElement("div");
    resultDisplay.id = "resultDisplay";
    resultDisplay.style.marginTop = "10px";
    resultDisplay.style.padding = "10px";
    resultDisplay.style.borderRadius = "5px";
    resultDisplay.style.textAlign = "center";
    document.body.appendChild(resultDisplay);
  }

  if (num === "" || isNaN(num)) {
    resultDisplay.textContent = "Bitte geben Sie Ihre Zahl ein.";
    resultDisplay.style.color = "orange";
    resultDisplay.style.backgroundColor = "#ffe0b2";
    inputBlink(inputField, "orange");
    buttonBlink(button, "orange");
    return;
  }

  num = parseInt(num);
  if (num < 2) {
    resultDisplay.textContent = num + " ist keine Primzahl.";
    resultDisplay.style.color = "red";
    resultDisplay.style.backgroundColor = "#ffcccb";
    button.style.backgroundColor = "red";
    buttonBlink(button, "red");
    return;
  }

  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      resultDisplay.textContent = num + " ist keine Primzahl.";
      resultDisplay.style.color = "red";
      resultDisplay.style.backgroundColor = "#ffcccb";
      button.style.backgroundColor = "red";
      buttonBlink(button, "red");
      return;
    }
  }

  resultDisplay.textContent = num + " ist eine Primzahl!";
  resultDisplay.style.color = "green";
  resultDisplay.style.backgroundColor = "#c8e6c9";
  button.style.backgroundColor = "green";
  buttonBlink(button, "green");
}

document.addEventListener("DOMContentLoaded", function () {
  let button = document.getElementById("pruefenButton");
  button.addEventListener("click", function () {
    let zahl = document.getElementById("zahlInput").value;
    istPrimzahl(zahl);
  });
});

function buttonBlink(button, color) {
  let count = 0;
  let interval = setInterval(() => {
    button.style.backgroundColor =
      button.style.backgroundColor === color ? "white" : color;
    count++;
    if (count > 5) clearInterval(interval);
  }, 300);
}

function inputBlink(inputField, color) {
  let count = 0;
  let interval = setInterval(() => {
    inputField.style.backgroundColor =
      inputField.style.backgroundColor === color ? "white" : color;
    count++;
    if (count > 5) clearInterval(interval);
  }, 300);
}
