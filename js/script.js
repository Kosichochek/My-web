const translations = {
    ru: {
        "nav-find": "Найти врача", "nav-appointments": "Мои записи", "nav-portal": "Портал врача",
        "home-title": "ПРОСТАЯ ПОМОЩЬ", "home-subtitle": "Записывайтесь быстро и удобно.",
        "search-btn": "ПОИСК", "filter-title": "СПЕЦИАЛИСТЫ", "label-date": "ДАТА:",
        "tab-upcoming": "Предстоящие", "tab-results": "Результаты", "btn-confirm": "ЗАПИСАТЬСЯ",
        "notify-blocked": "Время успешно заблокировано!", "notify-action": "Действие ACTIONS выполнено!",
        "notify-cancel": "Запись отменена", "notify-resched": "Перенос: выберите новую дату",
        "err-email": "Ошибка: Почта должна содержать @", "err-pass": "Ошибка: Пароль 6+ знаков и спецсимвол (!@#$%^&*)",
        "err-name": "Введите ФИО", "slot-booked": "Занято"
    },
    en: {
        "nav-find": "Find Doctor", "nav-appointments": "My History", "nav-portal": "Doctor Portal",
        "home-title": "SIMPLE CARE", "home-subtitle": "Book easily and fast.",
        "search-btn": "SEARCH", "filter-title": "SPECIALISTS", "label-date": "DATE:",
        "tab-upcoming": "Upcoming", "tab-results": "Results", "btn-confirm": "BOOK NOW",
        "notify-blocked": "Time blocked successfully!", "notify-action": "Action performed!",
        "notify-cancel": "Appointment cancelled", "notify-resched": "Reschedule: pick a new date",
        "err-email": "Error: Email must have @", "err-pass": "Error: Pass 6+ chars and symbol",
        "err-name": "Enter Name", "slot-booked": "Booked"
    }
};

let currentLang = 'ru';
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let appointments = JSON.parse(localStorage.getItem('apps')) || [];
let selectedDoc = null;
let currentSpec = null;

const specs = ["Кардиолог", "Педиатр", "Невролог", "Терапевт", "Хирург", "Офтальмолог", "ЛОР", "Дерматолог", "Эндокринолог", "Уролог", "Онколог", "Гинеколог"];

// ИНИЦИАЛИЗАЦИЯ ПОИСКА
function initSearch() {
    const specCont = document.getElementById('spec-list');
    if (!specCont) return;
    specCont.innerHTML = "";
    specs.forEach(s => {
        const btn = document.createElement('button');
        btn.textContent = translations[currentLang][`spec-${s}`] || s;
        if (currentSpec === s) btn.classList.add('active-spec');
        btn.onclick = () => {
            currentSpec = s;
            document.querySelectorAll('.spec-column button').forEach(b => b.classList.remove('active-spec'));
            btn.classList.add('active-spec');
            renderDocsForSpec(s);
        };
        specCont.appendChild(btn);
    });
}

function renderDocsForSpec(specialty) {
    const docsCont = document.getElementById('docs-list');
    if (!docsCont) return;
    docsCont.innerHTML = "";
    for(let i=1; i<=3; i++) {
        const docName = `Dr. ${translations[currentLang][`spec-${specialty}`] || specialty} #${i}`;
        const div = document.createElement('div');
        div.className = "card";
        div.innerHTML = `<h3>${docName}</h3><p>Room ${100 + i}</p><button onclick="startBook('${docName}')">Записаться</button>`;
        docsCont.appendChild(div);
    }
}

// УМНЫЙ ГРАФИК (ИСПРАВЛЕНО: 50/50 занятых мест)
function renderSlots() {
    const grid = document.getElementById('slots-grid');
    if (!grid) return;
    grid.innerHTML = "";
    const date = document.getElementById('book-date').value;
    const times = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
    
    // Создаем сдвиг на основе даты и имени врача, чтобы график был разным каждый день
    const dateShift = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const docShift = selectedDoc ? selectedDoc.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;

    times.forEach((t, index) => {
        // Логика 50/50: используем индекс кнопки + уникальный сдвиг
        const isBooked = (index + dateShift + docShift) % 2 === 0; 
        
        const btn = document.createElement('button');
        btn.textContent = isBooked ? translations[currentLang]["slot-booked"] : t;
        
        if(isBooked) {
            btn.disabled = true;
            btn.style.opacity = "0.3";
            btn.style.cursor = "not-allowed";
            btn.style.boxShadow = "none"; // Убираем тень для стиля необрутализма
            btn.style.transform = "none";
        } else {
            btn.onclick = () => confirmBook(t, date);
        }
        grid.appendChild(btn);
    });
}

function confirmBook(time, date) {
    appointments.push({ doc: selectedDoc, time, date, patientName: currentUser ? currentUser.name : "Аноним" });
    localStorage.setItem('apps', JSON.stringify(appointments));
    notify('notify-success');
    showSection('dashboard');
}

// ПОРТАЛ (EDIT / DEL)
function renderPortal() {
    const tbody = document.getElementById('portal-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";
    appointments.forEach((app, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${app.time} (${app.date})</td>
            <td>${app.patientName}</td>
            <td>
                <button onclick="editPatient(${index})">⚙️ Edit</button>
                <button onclick="deleteApp(${index})" style="background:#ff5252;color:#fff">🗑️ Del</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

function editPatient(index) {
    const name = prompt("New patient name:", appointments[index].patientName);
    if(name) {
        appointments[index].patientName = name;
        localStorage.setItem('apps', JSON.stringify(appointments));
        renderPortal();
    }
}

function deleteApp(index) {
    if(confirm("Удалить запись?")) {
        appointments.splice(index, 1);
        localStorage.setItem('apps', JSON.stringify(appointments));
        renderPortal();
        if(document.getElementById('dashboard').style.display === 'block') renderDash();
        notify('notify-delete');
    }
}

// НАВИГАЦИЯ
function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if (target) target.style.display = 'block';
    
    if(id === 'search') initSearch();
    if(id === 'doctorportal') renderPortal();
    if(id === 'dashboard') renderDash();
}

function login() {
    const name = document.getElementById('auth-name').value;
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;

    if (name.length < 2) return notify('err-name', true);
    if (!email.includes('@')) return notify('err-email', true);
    if (pass.length < 6 || !/[!@#$%^&*]/.test(pass)) return notify('err-pass', true);

    currentUser = { name, email };
    localStorage.setItem('user', JSON.stringify(currentUser));
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('auth-btn').textContent = name;
    notify('notify-success');
}

function showAuthModal() { document.getElementById('auth-modal').style.display = 'flex'; }

function startBook(name) {
    if(!currentUser) return showAuthModal();
    selectedDoc = name;
    document.getElementById('book-doc-name').textContent = name;
    document.getElementById('book-date').valueAsDate = new Date();
    renderSlots();
    showSection('booking');
}

function renderDash() {
    const cont = document.getElementById('dash-content');
    if (!cont) return;
    cont.innerHTML = "";
    appointments.forEach((a, i) => {
        const div = document.createElement('div');
        div.className = "card";
        div.style.marginBottom = "10px";
        div.innerHTML = `<h3>${a.doc}</h3><p>${a.date} | ${a.time}</p><button onclick="deleteApp(${i})" style="background:#ff5252;color:#fff">Отменить</button>`;
        cont.appendChild(div);
    });
}

function notify(key, isErr = false) {
    const n = document.getElementById('notify');
    if (!n) return;
    n.textContent = translations[currentLang][key] || key;
    n.style.display = 'block';
    n.style.background = isErr ? '#ff5252' : '#fff';
    setTimeout(() => n.style.display = 'none', 3000);
}

function downloadPDF(name) {
    const blob = new Blob(["Medical Document: " + name], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name + ".pdf";
    link.click();
    notify('notify-success');
}

function changeLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang][key]) el.textContent = translations[lang][key];
    });
    if (document.getElementById('search').style.display === 'block') initSearch();
}

document.addEventListener('DOMContentLoaded', () => {
    if(currentUser) document.getElementById('auth-btn').textContent = currentUser.name;
    changeLanguage('ru'); // По умолчанию русский
});
