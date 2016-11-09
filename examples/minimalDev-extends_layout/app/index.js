// index.js
console.log("index.js");
require("./main.css");

const app = document.getElementById('app');

app.textContent = "This element was dynamically filled by a script.";
