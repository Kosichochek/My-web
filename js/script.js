const translations = {
    ru: {
        "nav-find": "Найти врача",
        "nav-appointments": "Мои записи",
        "nav-portal": "Портал врача",
        "home-title": "ПРОСТАЯ МЕДИЦИНСКАЯ ПОМОЩЬ",
        "home-subtitle": "Записывайтесь к лучшим специалистам легко, доступно и быстро.",
        "search-placeholder": "Поиск по специализации или имени...",
        "search-btn": "ПОИСК",
        "new-patient": "Новый пациент?",
        "filter-title": "ФИЛЬТРЫ",
        "filter-all": "Все",
        "status-available": "ДОСТУПНО СЕГОДНЯ",
        "btn-schedule": "СМОТРЕТЬ ГРАФИК",
        "slots-title": "СВОБОДНОЕ ВРЕМЯ",
        "slot-booked": "Занято",
        "btn-notify": "Уведомить меня",
        "confirm-title": "ПОДТВЕРЖДЕНИЕ ЗАПИСИ",
        "details-title": "ДЕТАЛИ ПРИЕМА",
        "label-doctor": "ВРАЧ",
        "label-time": "ВРЕМЯ",
        "label-name": "ФИО",
        "btn-confirm": "ПОДТВЕРДИТЬ ЗАПИСЬ",
        "tab-upcoming": "Предстоящие",
        "tab-records": "Мед. карта",
        "btn-reschedule": "Перенести",
        "btn-cancel": "Отменить",
        "record-cbc": "Общий анализ крови (ОАК) - Результат",
        "btn-download": "Скачать PDF",
        "notify-queue": "Вы добавлены в очередь",
        "notify-cancel": "Слот возвращен в общую очередь",
        "notify-success": "Успешно!",
        "validation-error": "Проверьте данные (ФИО, ИИН, Email или Пароль).",
        "auth-title": "АВТОРИЗАЦИЯ",
        "btn-login": "ВОЙТИ",
        "spec-cardiology": "Кардиология",
        "spec-pediatrics": "Педиатрия",
        "spec-neurology": "Неврология",
        "spec-therapy": "Терапия",
        "spec-surgery": "Хирургия",
        "spec-ophthalmology": "Офтальмология",
        "spec-ent": "Отоларингология",
        "spec-dermatology": "Дерматология",
        "spec-endocrinology": "Эндокринология",
        "spec-urology": "Урология",
        "room": "Кабинет",
        "tab-results": "Результаты анализов",
        "result-biochem": "Биохимический анализ крови"
    },
    en: {
        "nav-find": "Find a Doctor",
        "nav-appointments": "My Appointments",
        "nav-portal": "Doctor Portal",
        "home-title": "SIMPLE MEDICAL CARE",
        "home-subtitle": "Book appointments with top specialists easily, accessible and fast.",
        "search-placeholder": "Search by specialty or name...",
        "search-btn": "SEARCH",
        "new-patient": "New Patient?",
        "filter-title": "FILTERS",
        "filter-all": "All",
        "status-available": "AVAILABLE TODAY",
        "btn-schedule": "VIEW SCHEDULE",
        "slots-title": "AVAILABLE SLOTS",
        "slot-booked": "Booked",
        "btn-notify": "Notify me",
        "confirm-title": "CONFIRM APPOINTMENT",
        "details-title": "APPOINTMENT DETAILS",
        "label-doctor": "DOCTOR",
        "label-time": "TIME",
        "label-name": "Full Name",
        "btn-confirm": "CONFIRM BOOKING",
        "tab-upcoming": "Upcoming",
        "tab-records": "Records",
        "btn-reschedule": "Reschedule",
        "btn-cancel": "Cancel",
        "record-cbc": "Complete Blood Count (CBC) - Result",
        "btn-download": "Download PDF",
        "notify-queue": "Added to the waiting list",
        "notify-cancel": "Slot returned to queue",
        "notify-success": "Success!",
        "validation-error": "Please check your data (Name, IIN, Email or Password).",
        "auth-title": "AUTHORIZATION",
        "btn-login": "LOGIN",
        "spec-cardiology": "Cardiology",
        "spec-pediatrics": "Pediatrics",
        "spec-neurology": "Neurology",
        "spec-therapy": "Therapy",
        "spec-surgery": "Surgery",
        "spec-ophthalmology": "Ophthalmology",
        "spec-ent": "ENT",
        "spec-dermatology": "Dermatology",
        "spec-endocrinology": "Endocrinology",
        "spec-urology": "Urology",
        "room": "Room",
        "tab-results": "Test Results",
        "result-biochem": "Biochemical blood test"
    }
};

let currentLang = 'ru';
let selectedTime = null;
let selectedDoctor = null;
let myAppointments = [];

// === ЛОГИКА АВТОРИЗАЦИИ И LOCALSTORAGE ===
let currentUser = JSON.parse(localStorage.getItem('clinicUser')) || null;
let isAuthenticated = !!currentUser;

const specialties = ['cardiology', 'pediatrics', 'neurology', 'therapy', 'surgery', 'ophthalmology', 'ent', 'dermatology', 'endocrinology', 'urology'];
const names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];

const generateDoctors = () => {
    let docs = [];
    let nameIndex = 0;
    specialties.forEach((spec) => {
        for(let i=1; i<=3; i++) {
            docs.push({
                id: `${spec}-${i}`,
                name: `Dr. ${names[nameIndex]}`,
                specKey: `spec-${spec}`,
                room: `${100 + nameIndex}`,
                building: ['A', 'B', 'C'][i % 3]
            });
            nameIndex++;
        }
    });
    return docs;
};

const doctors = generateDoctors();

const generateSlots = () => {
    let slots = [];
    for(let i=9; i<=17; i++) {
        slots.push(`${i < 10 ? '0'+i : i}:00`);
    }
    return slots;
};

const slots = generateSlots();

const updateAuthUI = () => {
    const authBtn = document.getElementById('auth-btn'); // Если кнопки с ID auth-btn нет, она просто проигнорируется
    if (authBtn) {
        if (isAuthenticated && currentUser) {
            authBtn.textContent = currentUser.name;
            authBtn.onclick = () => showSection('dashboard');
        } else {
            authBtn.textContent = currentLang === 'ru' ? "Войти" : "Login";
            authBtn.onclick = showAuthModal;
        }
    }
};

const showSection = (id) => {
    if ((id === 'dashboard' || id === 'booking' || id === 'confirm') && !isAuthenticated) {
        showAuthModal();
        return;
    }
    document.querySelectorAll('main > section').forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(id);
    if (target) {
        target.style.display = id === 'search' || id === 'doctorportal' ? 'flex' : 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const changeLanguage = (lang) => {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) el.placeholder = translations[lang][key];
    });
    document.documentElement.lang = lang;
    const activeFilter = document.querySelector('#search aside nav .bg-primary');
    renderDoctorsList(activeFilter ? activeFilter.getAttribute('onclick').split("'")[1] : 'filter-all');
    updateAuthUI();
};

const showNotification = (msgKey, isError = false) => {
    const container = document.getElementById('js-notification-container');
    container.textContent = translations[currentLang][msgKey] || msgKey;
    container.style.display = 'block';
    container.style.backgroundColor = isError ? 'var(--destructive)' : 'var(--success)';
    container.style.color = isError ? 'var(--destructive-foreground)' : '#ffffff';
    setTimeout(() => container.style.display = 'none', 4000);
};

const renderDoctorsList = (filterKey) => {
    const container = document.querySelector('#search .w-3\\/4');
    if (!container) return;
    container.innerHTML = '';
    
    doctors.forEach(doc => {
        if (filterKey !== 'filter-all' && doc.specKey !== filterKey.replace('spec-', 'spec-')) return;
        
        const specName = translations[currentLang][doc.specKey];
        const roomText = translations[currentLang]['room'];
        
        const article = document.createElement('article');
        article.className = 'doctor-card border border-border radius-lg p-4 flex justify-between bg-card text-card-foreground shadow-brutal mb-4';
        article.innerHTML = `
            <div>
                <h3 class="text-lg font-weight-medium">${doc.name}</h3>
                <p class="text-muted-foreground">${specName}</p>
                <p class="text-muted-foreground text-sm">${roomText} ${doc.room}, Корпус ${doc.building}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
                <span class="border border-border radius-sm p-1 text-sm">${translations[currentLang]['status-available']}</span>
                <button class="bg-secondary text-secondary-foreground font-weight-medium radius-md p-2" onclick="openDoctor('${doc.id}')">${translations[currentLang]['btn-schedule']}</button>
            </div>
        `;
        container.appendChild(article);
    });
};

const renderFilters = () => {
    const nav = document.querySelector('#search aside nav');
    if (!nav) return;
    nav.innerHTML = `<button class="bg-primary text-primary-foreground radius-sm p-2 text-left shadow-brutal" onclick="filterDocs('filter-all')" data-i18n="filter-all">${translations[currentLang]['filter-all']}</button>`;
    specialties.forEach(spec => {
        nav.innerHTML += `<button class="text-foreground radius-sm p-2 text-left hover:bg-muted" onclick="filterDocs('spec-${spec}')" data-i18n="spec-${spec}">${translations[currentLang][`spec-${spec}`]}</button>`;
    });
};

const filterDocs = (key) => {
    document.querySelectorAll('#search aside nav button').forEach(btn => {
        btn.className = 'text-foreground radius-sm p-2 text-left hover:bg-muted';
    });
    event.target.className = 'bg-primary text-primary-foreground radius-sm p-2 text-left shadow-brutal';
    renderDoctorsList(key);
};
window.filterDocs = filterDocs;

const openDoctor = (id) => {
    if(!isAuthenticated) {
        showAuthModal();
        return;
    }
    const doc = doctors.find(d => d.id === id);
    selectedDoctor = doc;
    
    document.querySelector('#booking h2').textContent = doc.name;
    document.querySelector('#booking .doctor-header p').textContent = translations[currentLang][doc.specKey];
    
    const grid = document.querySelector('.slots-grid');
    grid.innerHTML = '';
    
    slots.forEach((time) => {
        const btn = document.createElement('button');
        const isBooked = Math.random() > 0.7;
        
        btn.className = `slot border border-border radius-md p-4 text-center shadow-brutal ${isBooked ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'hover:bg-primary hover:text-primary-foreground'}`;
        btn.textContent = isBooked ? translations[currentLang]['slot-booked'] : time;
        if (isBooked) btn.disabled = true;
        else btn.onclick = () => selectSlot(time);
        
        grid.appendChild(btn);
    });
    
    showSection('booking');
};
window.openDoctor = openDoctor;

const selectSlot = (time) => {
    selectedTime = time;
    document.getElementById('confirm-doctor').textContent = selectedDoctor.name;
    document.getElementById('confirm-time').textContent = time;
    showSection('confirm');
};

const renderAppointments = () => {
    const list = document.getElementById('upcoming-visits');
    if (!list) return;
    list.innerHTML = '';
    
    myAppointments.forEach((app, index) => {
        const article = document.createElement('article');
        article.className = 'visit-card border border-border radius-lg p-4 flex justify-between items-center bg-card text-card-foreground shadow-brutal mb-4';
        article.innerHTML = `
            <div>
                <h3 class="text-lg font-weight-medium">${app.doctor}</h3>
                <p class="text-sm">${app.date} | ${app.time}</p>
                <p class="text-xs text-muted-foreground">${app.patientName}</p>
            </div>
            <div class="flex flex-col gap-2">
                <button class="bg-background text-foreground border border-border radius-sm p-2 w-32">${translations[currentLang]['btn-reschedule']}</button>
                <button class="bg-background text-destructive border border-destructive radius-sm p-2 w-32" onclick="cancelApp(${index})">${translations[currentLang]['btn-cancel']}</button>
            </div>
        `;
        list.appendChild(article);
    });
};

const cancelApp = (idx) => {
    myAppointments.splice(idx, 1);
    renderAppointments();
    showNotification('notify-cancel');
};
window.cancelApp = cancelApp;

// === ПРОДВИНУТОЕ ОКНО РЕГИСТРАЦИИ ===
const showAuthModal = () => {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.style.position = 'fixed'; modal.style.top = '0'; modal.style.left = '0'; 
        modal.style.width = '100%'; modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
        modal.style.display = 'flex'; modal.style.justifyContent = 'center'; modal.style.alignItems = 'center'; 
        modal.style.zIndex = '1000';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="bg-card text-card-foreground p-8 radius-lg border border-border shadow-brutal flex flex-col gap-4 w-96 relative" style="min-width: 320px;">
            <button onclick="closeAuthModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: inherit;">&times;</button>
            
            <h2 class="text-xl font-weight-medium text-center mb-2 text-primary">${currentLang === 'ru' ? 'РЕГИСТРАЦИЯ / ВХОД' : 'REGISTER / LOGIN'}</h2>
            
            <input type="text" id="auth-name" placeholder="${currentLang === 'ru' ? 'Ваше ФИО' : 'Full Name'}" class="bg-input-background p-3 radius-sm border border-border focus-ring" style="width: 100%;">
            <input type="email" id="auth-email" placeholder="Email" class="bg-input-background p-3 radius-sm border border-border focus-ring" style="width: 100%;">
            <input type="password" id="auth-pass" placeholder="${currentLang === 'ru' ? 'Пароль' : 'Password'}" class="bg-input-background p-3 radius-sm border border-border focus-ring" style="width: 100%;">
            
            <button class="bg-primary text-primary-foreground p-3 radius-sm font-weight-medium mt-2 shadow-brutal" onclick="registerOrLogin()" style="width: 100%;">${currentLang === 'ru' ? 'ПРОДОЛЖИТЬ' : 'CONTINUE'}</button>
        </div>
    `;
    modal.style.display = 'flex';
};
window.showAuthModal = showAuthModal;

const registerOrLogin = () => {
    const name = document.getElementById('auth-name').value;
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;

    if (!email || !pass) {
        showNotification('validation-error', true);
        return;
    }

    currentUser = { name: name || 'Пациент', email: email };
    localStorage.setItem('clinicUser', JSON.stringify(currentUser));
    
    isAuthenticated = true;
    updateAuthUI();
    closeAuthModal();
    
    showNotification('notify-success');
    
    // Если пользователь регается из формы подтверждения - оставляем его там, иначе в Кабинет
    if (document.getElementById('confirm').style.display === 'flex' || document.getElementById('booking').style.display === 'block') {
        // Ничего не делаем, он продолжает запись
    } else {
        renderAppointments();
        showSection('dashboard');
    }
};
window.registerOrLogin = registerOrLogin;

const closeAuthModal = () => {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
};
window.closeAuthModal = closeAuthModal;

document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI(); // Обновляем шапку сразу при загрузке страницы
    renderFilters();
    renderDoctorsList('filter-all');
    
    document.querySelector('[data-i18n="nav-find"]')?.addEventListener('click', () => showSection('search'));
    document.querySelector('[data-i18n="nav-appointments"]')?.addEventListener('click', () => {
        renderAppointments();
        showSection('dashboard');
    });
    document.querySelector('[data-i18n="nav-portal"]')?.addEventListener('click', () => showSection('doctorportal'));
    
    document.querySelector('#home .quick-actions button:first-child')?.addEventListener('click', () => {
        renderAppointments();
        showSection('dashboard');
    });
    document.querySelector('#home .search-container button')?.addEventListener('click', () => showSection('search'));

    document.querySelector('[data-i18n="btn-notify"]')?.addEventListener('click', () => showNotification('notify-queue'));

    const profileSelect = document.getElementById('family-profile');
    const nameInput = document.getElementById('full-name');
    const iinInput = document.getElementById('iin-number');
    const phoneInput = document.getElementById('phone-number');

    const familyProfiles = {
        anna: { name: 'Анна Иванова', iin: '920101450123', phone: '87771234567' },
        maxim: { name: 'Максим Иванов', iin: '150505123456', phone: '87771234567' }
    };

    profileSelect?.addEventListener('change', (e) => {
        const profile = familyProfiles[e.target.value];
        if (profile && nameInput && iinInput && phoneInput) {
            nameInput.value = profile.name;
            iinInput.value = profile.iin;
            phoneInput.value = profile.phone;
        }
    });

    document.querySelector('.booking-form button')?.addEventListener('click', () => {
        const name = nameInput?.value;
        const iin = iinInput?.value;
        const phone = phoneInput?.value;

        if (!/^\d{12}$/.test(iin) || (phone?.length || 0) < 10 || (name?.trim().length || 0) < 2) {
            showNotification('validation-error', true);
            return;
        }

        myAppointments.push({
            doctor: selectedDoctor.name,
            date: 'Сегодня',
            time: selectedTime,
            patientName: name
        });

        showNotification('notify-success');
        renderAppointments();
        showSection('dashboard');
    });
    
    const tabButtons = document.querySelectorAll('.tabs button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active', 'border-primary');
                b.classList.add('text-muted-foreground', 'border-transparent');
            });
            
            btn.classList.add('active', 'border-primary');
            btn.classList.remove('text-muted-foreground', 'border-transparent');
            
            document.getElementById('upcoming-visits').style.display = 'none';
            document.getElementById('medical-records').style.display = 'none';
            document.getElementById('test-results').style.display = 'none';
            
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).style.display = targetId === 'upcoming-visits' ? 'flex' : 'block';
        });
    });
});