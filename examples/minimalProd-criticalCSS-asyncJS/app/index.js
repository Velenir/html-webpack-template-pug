// index.js
console.log("index.js");
require("./main.css");

// DOMContentLoaded will fire before async script, so we use window.onload here
window.addEventListener("load", function() {
	const app = document.getElementById('app');

	app.textContent = "This element was dynamically filled by a script.";
});
