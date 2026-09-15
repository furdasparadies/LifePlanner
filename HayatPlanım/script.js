const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");
const clearAllButton = document.getElementById("clearAllButton");
const errorMessage = document.getElementById("errorMessage");
const taskCounter = document.getElementById("taskCounter");


// =====================================
// GÖREVLER
// =====================================

let tasks = JSON.parse(
    localStorage.getItem("hayatPlanımTasks")
) || [];

let activeTaskId = null;


// =====================================
// ZAMANLAYICI AYARLARI
// =====================================

let workDuration = Number(
    localStorage.getItem("workDuration")
) || 45;

let breakDuration = Number(
    localStorage.getItem("breakDuration")
) || 15;

let timerMode = "work";

let timeLeft = workDuration * 60;

let timerInterval = null;

let isRunning = false;

let sessionStartTime = null;

let elapsedSessionSeconds = 0;


// =====================================
// ÇALIŞMA SÜRELERİ
// =====================================

let workSessions = JSON.parse(
    localStorage.getItem("hayatPlanımWorkSessions")
) || [];


// =====================================
// ELEMENTLER
// =====================================

const timerDisplay = document.getElementById("timerDisplay");
const timerModeText = document.getElementById("timerMode");
const timerStatus = document.getElementById("timerStatus");

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resetButton = document.getElementById("resetButton");

const pauseOptions = document.getElementById("pauseOptions");
const continueButton = document.getElementById("continueButton");
const finishButton = document.getElementById("finishButton");

const workDurationInput = document.getElementById("workDuration");
const breakDurationInput = document.getElementById("breakDuration");
const saveSettingsButton = document.getElementById("saveSettingsButton");

const weeklyTotal = document.getElementById("weeklyTotal");
const weeklyDetails = document.getElementById("weeklyDetails");

const timerPanel = document.getElementById("timerPanel");
const timerHeader = document.getElementById("timerHeader");
const fullscreenButton = document.getElementById("fullscreenButton");


// =====================================
// LOCAL STORAGE
// =====================================

function saveTasks() {
    localStorage.setItem(
        "hayatPlanımTasks",
        JSON.stringify(tasks)
    );
}

function saveWorkSessions() {
    localStorage.setItem(
        "hayatPlanımWorkSessions",
        JSON.stringify(workSessions)
    );
}


// =====================================
// GÖREVLERİ GÖSTER
// =====================================

function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach(function(task) {

        const taskElement = document.createElement("div");

        taskElement.className = "task";

        if (task.completed) {
            taskElement.classList.add("completed");
        }

        if (task.id === activeTaskId) {
            taskElement.classList.add("active-task");
        }


        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;


        const text = document.createElement("span");

        text.className = "task-text";
        text.textContent = task.text;


        const startTaskButton = document.createElement("button");

        startTaskButton.className = "start-task-button";

        startTaskButton.textContent =
            task.id === activeTaskId ? "Seçildi" : "Çalış";


        const editButton = document.createElement("button");

        editButton.className = "editButton";
        editButton.textContent = "Düzenle";


        const deleteButton = document.createElement("button");

        deleteButton.className = "deleteButton";
        deleteButton.textContent = "Sil";


        // TAMAMLAMA

        checkbox.addEventListener("change", function() {

            task.completed = checkbox.checked;

            taskElement.classList.toggle(
                "completed",
                checkbox.checked
            );

            saveTasks();

        });


        // GÖREV SEÇME

        startTaskButton.addEventListener("click", function() {

            activeTaskId = task.id;

            renderTasks();

            timerStatus.textContent =
                `"${task.text}" görevi seçildi`;

        });


        // DÜZENLEME

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


        // TEKİL SİLME

        deleteButton.addEventListener("click", function() {

            tasks = tasks.filter(function(item) {

                return item.id !== task.id;

            });

            if (activeTaskId === task.id) {
                activeTaskId = null;
            }

            saveTasks();

            renderTasks();

        });


        taskElement.appendChild(checkbox);
        taskElement.appendChild(text);
        taskElement.appendChild(startTaskButton);
        taskElement.appendChild(editButton);
        taskElement.appendChild(deleteButton);

        taskList.appendChild(taskElement);

    });

    taskCounter.textContent =
        `Toplam görev: ${tasks.length}`;

}


// =====================================
// GÖREV EKLEME
// =====================================

function addTask() {

    const taskText = taskInput.value.trim();

    if (taskText === "") {

        errorMessage.textContent =
            "Eklemek istediğine emin misin? Lütfen bir görev yaz.";

        errorMessage.style.display = "block";

        taskInput.focus();

        return;

    }

    errorMessage.style.display = "none";

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

addButton.addEventListener("click", addTask);

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

        activeTaskId = null;

        saveTasks();

        renderTasks();

    }

});


// =====================================
// ZAMANLAYICI GÖRÜNÜMÜ
// =====================================

function updateTimerDisplay() {

    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    timerModeText.textContent =
        timerMode === "work" ? "Çalışma" : "Mola";

}


// =====================================
// ZAMANLAYICIYI BAŞLAT
// =====================================

function startTimer() {

    if (isRunning) {
        return;
    }

    isRunning = true;

    sessionStartTime = Date.now();

    timerStatus.textContent =
        timerMode === "work"
            ? "Çalışıyorsun..."
            : "Mola başladı";

    pauseOptions.style.display = "none";

    timerInterval = setInterval(function() {

        timeLeft--;

        elapsedSessionSeconds++;

        updateTimerDisplay();

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            isRunning = false;

            finishSession();

        }

    }, 1000);

}


// =====================================
// ZAMANLAYICIYI DURDUR
// =====================================

function stopTimer() {

    if (!isRunning) {
        return;
    }

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    timerStatus.textContent = "Durduruldu";

    pauseOptions.style.display = "flex";

}


// =====================================
// DEVAM ET
// =====================================

continueButton.addEventListener("click", function() {

    pauseOptions.style.display = "none";

    startTimer();

});


// =====================================
// BİTİR
// =====================================

finishButton.addEventListener("click", function() {

    finishSession();

});


// =====================================
// OTURUMU TAMAMLA
// =====================================

function finishSession() {

    if (timerMode === "work" && elapsedSessionSeconds > 0) {

        const today = new Date();

        workSessions.push({

            date: today.toISOString().split("T")[0],

            seconds: elapsedSessionSeconds,

            taskId: activeTaskId

        });

        saveWorkSessions();

        updateWeeklyStats();

    }

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    elapsedSessionSeconds = 0;

    sessionStartTime = null;

    pauseOptions.style.display = "none";

    if (timerMode === "work") {

        timerMode = "break";

        timeLeft = breakDuration * 60;

        timerStatus.textContent =
            "Çalışma tamamlandı. Mola zamanı!";

    } else {

        timerMode = "work";

        timeLeft = workDuration * 60;

        timerStatus.textContent =
            "Mola bitti. Yeni çalışma başlayabilir.";

    }

    updateTimerDisplay();

}


// =====================================
// SIFIRLA
// =====================================

resetButton.addEventListener("click", function() {

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    elapsedSessionSeconds = 0;

    sessionStartTime = null;

    timeLeft = (
        timerMode === "work"
            ? workDuration
            : breakDuration
    ) * 60;

    pauseOptions.style.display = "none";

    timerStatus.textContent = "Hazır";

    updateTimerDisplay();

});


// =====================================
// BUTONLAR
// =====================================

startButton.addEventListener("click", startTimer);

stopButton.addEventListener("click", stopTimer);


// =====================================
// SÜRE AYARLARI
// =====================================

workDurationInput.value = workDuration;

breakDurationInput.value = breakDuration;

saveSettingsButton.addEventListener("click", function() {

    const newWorkDuration = Number(
        workDurationInput.value
    );

    const newBreakDuration = Number(
        breakDurationInput.value
    );

    if (
        newWorkDuration < 1 ||
        newBreakDuration < 1
    ) {

        alert("Süreler en az 1 dakika olmalıdır.");

        return;

    }

    workDuration = newWorkDuration;

    breakDuration = newBreakDuration;

    localStorage.setItem(
        "workDuration",
        workDuration
    );

    localStorage.setItem(
        "breakDuration",
        breakDuration
    );

    resetButton.click();

    timerStatus.textContent =
        "Yeni süreler kaydedildi.";

});


// =====================================
// HAZIR SÜRELER
// =====================================

document.querySelectorAll(".preset-buttons button")
    .forEach(function(button) {

        button.addEventListener("click", function() {

            workDuration = Number(button.dataset.work);

            breakDuration = Number(button.dataset.break);

            workDurationInput.value = workDuration;

            breakDurationInput.value = breakDuration;

            localStorage.setItem(
                "workDuration",
                workDuration
            );

            localStorage.setItem(
                "breakDuration",
                breakDuration
            );

            resetButton.click();

        });

    });


// =====================================
// HAFTALIK İSTATİSTİK
// =====================================

function updateWeeklyStats() {

    const now = new Date();

    const day = now.getDay();

    const monday = new Date(now);

    monday.setDate(
        now.getDate() - (day === 0 ? 6 : day - 1)
    );

    monday.setHours(0, 0, 0, 0);

    const mondayString =
        monday.toISOString().split("T")[0];

    const thisWeekSessions = workSessions.filter(function(session) {

        return session.date >= mondayString;

    });

    const totalSeconds = thisWeekSessions.reduce(
        function(total, session) {

            return total + session.seconds;

        },
        0
    );

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    weeklyTotal.textContent =
        `${hours} saat ${minutes} dakika`;

    weeklyDetails.innerHTML = "";

    const groupedByDate = {};

    thisWeekSessions.forEach(function(session) {

        if (!groupedByDate[session.date]) {
            groupedByDate[session.date] = 0;
        }

        groupedByDate[session.date] += session.seconds;

    });

    Object.keys(groupedByDate)
        .sort()
        .forEach(function(date) {

            const seconds = groupedByDate[date];

            const h = Math.floor(seconds / 3600);

            const m = Math.floor(
                (seconds % 3600) / 60
            );

            const row = document.createElement("div");

            row.textContent =
                `${date}: ${h} saat ${m} dakika`;

            weeklyDetails.appendChild(row);

        });

}


// =====================================
// TAM EKRAN
// =====================================

fullscreenButton.addEventListener("click", function(event) {

    event.stopPropagation();

    timerPanel.classList.toggle("fullscreen");

    fullscreenButton.textContent =
        timerPanel.classList.contains("fullscreen")
            ? "✕"
            : "⛶";

});


// =====================================
// BAŞLIKLA TAM EKRAN
// =====================================

timerHeader.addEventListener("dblclick", function() {

    timerPanel.classList.toggle("fullscreen");

    fullscreenButton.textContent =
        timerPanel.classList.contains("fullscreen")
            ? "✕"
            : "⛶";

});


// =====================================
// BAŞLANGIÇ
// =====================================

renderTasks();

updateTimerDisplay();

updateWeeklyStats();