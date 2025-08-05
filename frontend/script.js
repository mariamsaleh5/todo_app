const apiURL = "http://localhost:8000/todos";
const form = document.getElementById("todo-form");
const todoList = document.getElementById("todo-list");
const todoInput = document.getElementById("todo-input");
const darkmodebutton=document.getElementById("toggle-dark-mode");
// 1. تحميل الوضع من localStorage لما الصفحة تفتح
window.addEventListener("DOMContentLoaded", () => {
  const mode = localStorage.getItem("mode");
  if (mode === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
});

// 2. تبديل الوضع عند الضغط على الزر


darkmodebutton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("mode", "dark");
  } else {
    localStorage.setItem("mode", "light");
  }
});

function fetchTodos() {
    fetch(apiURL)
        .then(res => res.json())
        .then(data => {
            todoList.innerHTML = "";
            data.forEach(todo => {
                const li = document.createElement("li");

                li.innerHTML = `
    <span 
        style="text-decoration:${todo.completed ? 'line-through' : 'none'}" 
        id="todo-title-${todo.id}"
        data-completed="${todo.completed}"
    >
        ${todo.title}
    </span>
    <div>
        <button onclick='toggleTodo(${JSON.stringify(todo)})'>✔</button>
        <button onclick="deleteTodo(${todo.id})">🗑️</button>
        <button onclick='editTodo(${JSON.stringify(todo)})'>✏️</button>
        <button onclick="saveTodo(${todo.id})" style="display: none;" id="save-button-${todo.id}">💾</button>
    </div>
`;

                todoList.appendChild(li);
            });
        });
}

form.addEventListener("submit", e => {
    e.preventDefault();
    const title = todoInput.value.trim();
    if (!title) return;

    fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    }).then(() => {
        todoInput.value = "";
        fetchTodos();
    });
});

function deleteTodo(id) {
    fetch(`${apiURL}/${id}`, {
        method: "DELETE"
    }).then(() => {
        fetchTodos();
    });
}

function toggleTodo(todo) {
    fetch(`${apiURL}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: todo.title,
            completed: !todo.completed
        })
    }).then(() => {
        fetchTodos();
    });
}

function editTodo(todo) {
    const { id, title, completed } = todo;
    const todotext = document.getElementById(`todo-title-${id}`);
    todotext.innerHTML = `
        <input type="text" id="edit-input-${id}" value="${title.replace(/"/g, '&quot;')}">
    `;
    todotext.setAttribute("data-completed", completed);
    document.getElementById(`save-button-${id}`).style.display = "inline";
}

function saveTodo(id) {
    const input = document.getElementById(`edit-input-${id}`);
    const newtitle = input.value.trim();
    if (!newtitle) return;

    const span = document.getElementById(`todo-title-${id}`);
    const completed = span.getAttribute("data-completed") === "true";

    fetch(`${apiURL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: newtitle,
            completed: completed
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to update task");
        return res.json();
    })
    .then(() => {
        fetchTodos();
    })
    .catch(err => {
        console.error("Error saving todo:", err);
    });
}

fetchTodos();
