const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    const task = document.createElement("div");
    task.className = "task";

    task.innerHTML = `
        <span>${taskText}</span>
        <button class="deleteButton">Sil</button>
    `;

    task.querySelector(".deleteButton").addEventListener("click", function () {
        task.remove();
    });

    taskList.appendChild(task);

    taskInput.value = "";
    taskInput.focus();
}

addButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});