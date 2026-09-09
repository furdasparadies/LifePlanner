const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const clearAllButton = document.getElementById("clearAllButton");


// =====================================
// LOCAL STORAGE
// =====================================

let tasks = JSON.parse(localStorage.getItem("hayatPlanımTasks")) || [];


// =====================================
// GÖREVLERİ LOCAL STORAGE'A KAYDET
// =====================================

function saveTasks() {
    localStorage.setItem(
        "hayatPlanımTasks",
        JSON.stringify(tasks)
    );
}


// =====================================
// GÖREVLERİ EKRANA YAZDIR
// =====================================

function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach(function(task) {

        const taskElement = document.createElement("div");
        taskElement.className = "task";

        if (task.completed) {
            taskElement.classList.add("completed");
        }


        // CHECKBOX

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;


        // GÖREV METNİ

        const text = document.createElement("span");

        text.className = "task-text";
        text.textContent = task.text;


        // DÜZENLE BUTONU

        const editButton = document.createElement("button");

        editButton.className = "editButton";
        editButton.textContent = "Düzenle";


        // SİL BUTONU

        const deleteButton = document.createElement("button");

        deleteButton.className = "deleteButton";
        deleteButton.textContent = "Sil";


        // =====================================
        // CHECKBOX DEĞİŞTİ
        // =====================================

        checkbox.addEventListener("change", function() {

            task.completed = checkbox.checked;

            if (checkbox.checked) {
                taskElement.classList.add("completed");
            } else {
                taskElement.classList.remove("completed");
            }

            saveTasks();
        });


        // =====================================
        // DÜZENLE
        // =====================================

        editButton.addEventListener("click", function() {

            const newText = prompt(
                "Görevi düzenle:",
                task.text
            );

            if (
                newText !== null &&
                newText.trim() !== ""
            ) {

                task.text = newText.trim();

                saveTasks();

                renderTasks();
            }
        });


        // =====================================
        // TEKİL SİL
        // =====================================

        deleteButton.addEventListener("click", function() {

            tasks = tasks.filter(function(item) {
                return item.id !== task.id;
            });

            saveTasks();

            renderTasks();
        });


        // =====================================
        // ELEMENTLERİ GÖREVE EKLE
        // =====================================

        taskElement.appendChild(checkbox);
        taskElement.appendChild(text);
        taskElement.appendChild(editButton);
        taskElement.appendChild(deleteButton);

        taskList.appendChild(taskElement);
    });
}


// =====================================
// YENİ GÖREV EKLE
// =====================================

function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }


    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };


    tasks.push(newTask);

    saveTasks();

    renderTasks();

    taskInput.value = "";

    taskInput.focus();
}


// =====================================
// EKLE BUTONU
// =====================================

addButton.addEventListener("click", function() {

    addTask();

});


// =====================================
// ENTER İLE EKLE
// =====================================

taskInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addTask();
    }

});


// =====================================
// TÜMÜNÜ SİL
// =====================================

clearAllButton.addEventListener("click", function() {

    if (tasks.length === 0) {
        return;
    }


    const confirmDelete = confirm(
        "Listedeki tüm görevleri silmek istediğinize emin misiniz?"
    );


    if (confirmDelete) {

        tasks = [];

        saveTasks();

        renderTasks();
    }

});


// =====================================
// SAYFA AÇILDIĞINDA GÖREVLERİ GETİR
// =====================================

renderTasks();