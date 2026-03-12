document.addEventListener('DOMContentLoaded', () => {
    // --- Инициализация данных и LocalStorage ---
    const defaultData = {
        profile: { name: 'Иван Петров', about: 'Люблю развиваться', birth: '10.05.1998', photo: '' },
        theme: 'dark',
        habits: [
            { id: 'water', name: 'Вода', emoji: '💧', unit: 'л', goal: 2 },
            { id: 'sport', name: 'Тренировка', emoji: '🏋️', unit: 'мин', goal: 30 },
            { id: 'reading', name: 'Чтение', emoji: '📖', unit: 'мин', goal: 20 },
            { id: 'sleep', name: 'Сон', emoji: '🌙', unit: 'ч', goal: 8 },      // НОВОЕ
            { id: 'steps', name: 'Шаги', emoji: '🚶', unit: 'шт', goal: 10000 } // НОВОЕ
        ],
        notes: [], // { id, title, text, date (DD.MM.YYYY) }
        history: {} // 'DD.MM.YYYY': { water: 1.5, sport: 15... }
    };

    let appData = JSON.parse(localStorage.getItem('mobi_data')) || defaultData;
    let selectedDateStr = getTodayStr(); // Для статистики

    function saveData() {
        localStorage.setItem('mobi_data', JSON.stringify(appData));
    }

    // --- Утилиты дат ---
    function getTodayStr() {
        return formatDate(new Date());
    }

    function formatDate(date) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }

    function getShortDayName(date) {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return days[date.getDay()];
    }

    // Инициализируем сегодняшний день в истории
    const todayStr = getTodayStr();
    if (!appData.history[todayStr]) appData.history[todayStr] = {};

    // --- DOM Элементы ---
    const body = document.body;
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');

    // --- Логика Тем ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    function applyTheme() {
        if (appData.theme === 'light') {
            body.classList.replace('dark-theme', 'light-theme');
            themeToggleBtn.innerText = '🌙 Тёмная тема';
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            themeToggleBtn.innerText = '☀️ Светлая тема';
        }
    }
    themeToggleBtn.addEventListener('click', () => {
        appData.theme = appData.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        saveData();
    });
    applyTheme();

    // --- Навигация ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screenId = item.dataset.screen;
            screens.forEach(s => s.classList.remove('active'));
            document.getElementById(`${screenId}-screen`).classList.add('active');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Обновляем данные при переходе
            if (screenId === 'notes') renderNotes();
            if (screenId === 'habits') renderHabits();
            if (screenId === 'stats') {
                selectedDateStr = getTodayStr(); // Сбрасываем на сегодня
                renderCalendar();
                renderStatsForDay(selectedDateStr);
            }
        });
    });

    // --- ПРОФИЛЬ ---
    const pPhoto = document.getElementById('profilePhoto');
    const pPhotoInput = document.getElementById('photoInput');
    
    function renderProfile() {
        document.getElementById('nameDisplay').innerText = appData.profile.name;
        document.getElementById('aboutDisplay').innerText = appData.profile.about;
        document.getElementById('birthDisplay').innerText = appData.profile.birth;
        document.getElementById('profileNameDisplay').innerText = appData.profile.name;
        
        if (appData.profile.photo) {
            pPhoto.innerHTML = `<img src="${appData.profile.photo}">`;
        }
    }

    document.getElementById('editProfileBtn').addEventListener('click', () => {
        document.getElementById('nameInput').value = appData.profile.name;
        document.getElementById('aboutInput').value = appData.profile.about;
        document.getElementById('birthInput').value = appData.profile.birth;
        
        document.querySelectorAll('.info-value').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.info-input').forEach(el => el.style.display = 'block');
        
        document.getElementById('editProfileBtn').style.display = 'none';
        document.getElementById('saveProfileBtn').style.display = 'block';
    });

    document.getElementById('saveProfileBtn').addEventListener('click', () => {
        appData.profile.name = document.getElementById('nameInput').value || 'Без имени';
        appData.profile.about = document.getElementById('aboutInput').value;
        appData.profile.birth = document.getElementById('birthInput').value;
        saveData();
        renderProfile();
        
        document.querySelectorAll('.info-value').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.info-input').forEach(el => el.style.display = 'none');
        
        document.getElementById('editProfileBtn').style.display = 'block';
        document.getElementById('saveProfileBtn').style.display = 'none';
    });

    document.getElementById('changePhotoBtn').addEventListener('click', () => pPhotoInput.click());
    pPhoto.addEventListener('click', () => pPhotoInput.click());
    
    pPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                appData.profile.photo = event.target.result;
                saveData();
                renderProfile();
            };
            reader.readAsDataURL(file);
        }
    });
    renderProfile();

    // --- ЗАМЕТКИ ---
    const notesContainer = document.getElementById('notesContainer');
    const addNoteForm = document.getElementById('addNoteForm');

    document.getElementById('showAddNoteBtn').addEventListener('click', () => addNoteForm.style.display = 'block');
    document.getElementById('cancelNoteBtn').addEventListener('click', () => addNoteForm.style.display = 'none');

    document.getElementById('saveNoteBtn').addEventListener('click', () => {
        const title = document.getElementById('noteTitle').value.trim();
        const text = document.getElementById('noteText').value.trim();
        if (!text) return alert('Введите текст заметки!');

        appData.notes.unshift({ id: Date.now(), title: title || 'Без названия', text, date: getTodayStr() });
        saveData();
        document.getElementById('noteTitle').value = '';
        document.getElementById('noteText').value = '';
        addNoteForm.style.display = 'none';
        renderNotes();
    });

    function renderNotes() {
        notesContainer.innerHTML = '';
        if(appData.notes.length === 0) {
            notesContainer.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Нет заметок</p>';
            return;
        }
        appData.notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            card.innerHTML = `
                <div class="delete-btn" data-id="${note.id}">✕</div>
                <div class="note-title">${note.title}</div>
                <div class="note-content">${note.text}</div>
                <div class="note-date">${note.date}</div>
            `;
            card.querySelector('.delete-btn').addEventListener('click', () => {
                appData.notes = appData.notes.filter(n => n.id !== note.id);
                saveData(); renderNotes();
            });
            notesContainer.appendChild(card);
        });
    }

    // --- ПРИВЫЧКИ (СЕГОДНЯ) ---
    const habitsContainer = document.getElementById('habitsContainer');
    const addHabitForm = document.getElementById('addHabitForm');
    document.getElementById('todayDateDisplay').innerText = getTodayStr();

    document.getElementById('showAddHabitBtn').addEventListener('click', () => addHabitForm.style.display = 'block');
    document.getElementById('cancelHabitBtn').addEventListener('click', () => addHabitForm.style.display = 'none');

    document.getElementById('saveHabitBtn').addEventListener('click', () => {
        const name = document.getElementById('habitName').value.trim();
        if (!name) return;
        appData.habits.push({
            id: 'h_' + Date.now(),
            name: name,
            emoji: document.getElementById('habitEmoji').value || '🎯',
            unit: document.getElementById('habitUnit').value || 'раз',
            goal: parseFloat(document.getElementById('habitGoal').value) || 1
        });
        saveData();
        addHabitForm.style.display = 'none';
        document.getElementById('habitName').value = '';
        renderHabits();
    });

    function renderHabits() {
        habitsContainer.innerHTML = '';
        const todayData = appData.history[todayStr];

        appData.habits.forEach(habit => {
            const currentValue = todayData[habit.id] || 0;
            const card = document.createElement('div');
            card.className = 'habit-item';
            card.innerHTML = `
                <div class="delete-btn" data-id="${habit.id}" style="width:24px; height:24px; font-size:12px; top:10px; right:10px;">✕</div>
                <div class="habit-title">${habit.emoji} ${habit.name}</div>
                <div class="habit-stats">
                    <span class="habit-value">${currentValue} <span class="habit-unit">${habit.unit}</span></span>
                    <span class="habit-goal">Цель: ${habit.goal}</span>
                </div>
                <div class="habit-control">
                    <input type="number" id="input_${habit.id}" step="0.5" value="1" placeholder="+">
                    <button class="habit-plus" data-id="${habit.id}">+</button>
                </div>
            `;
            
            card.querySelector('.habit-plus').addEventListener('click', () => {
                const addVal = parseFloat(document.getElementById(`input_${habit.id}`).value) || 0;
                todayData[habit.id] = (todayData[habit.id] || 0) + addVal;
                saveData();
                renderHabits(); // Перерисовка с автосохранением!
            });

            card.querySelector('.delete-btn').addEventListener('click', () => {
                if(confirm('Удалить цель?')) {
                    appData.habits = appData.habits.filter(h => h.id !== habit.id);
                    saveData(); renderHabits();
                }
            });

            habitsContainer.appendChild(card);
        });
    }

    // --- СТАТИСТИКА И ПРОГРЕСС ---
    const calendarWeek = document.getElementById('calendarWeek');
    const statsGrid = document.getElementById('statsGrid');
    const progressContainer = document.getElementById('progressContainer');
    const statsNotesContainer = document.getElementById('statsNotesContainer');

    function renderCalendar() {
        calendarWeek.innerHTML = '';
        const today = new Date();
        
        // Генерируем 7 последних дней
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateString = formatDate(d);
            
            const div = document.createElement('div');
            div.className = `cal-day ${dateString === selectedDateStr ? 'selected' : ''}`;
            div.innerHTML = `<span>${getShortDayName(d)}</span><span class="date-num">${d.getDate()}</span>`;
            
            div.addEventListener('click', () => {
                selectedDateStr = dateString;
                renderCalendar();
                renderStatsForDay(selectedDateStr);
            });
            calendarWeek.appendChild(div);
        }
    }

    function renderStatsForDay(dateStr) {
        document.getElementById('selectedDayTitle').innerText = `Прогресс за ${dateStr}`;
        const dayData = appData.history[dateStr] || {};
        
        statsGrid.innerHTML = '';
        progressContainer.innerHTML = '';

        appData.habits.forEach(habit => {
            const val = dayData[habit.id] || 0;
            const percent = Math.min((val / habit.goal) * 100, 100);
            const isSuccess = val >= habit.goal;

            // 1. Карточки сверху
            statsGrid.innerHTML += `
                <div class="stat-card card-bg">
                    <div class="stat-number">${val}</div>
                    <div class="stat-label">${habit.name}</div>
                </div>
            `;

            // 2. Визуализация прогресса барами (С начальной шириной 0%)
            progressContainer.innerHTML += `
                <div class="progress-item card-bg">
                    <div class="progress-header">
                        <span>${habit.emoji} ${habit.name}</span>
                        <span style="color: var(--text-muted)">${val} / ${habit.goal} ${habit.unit}</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill ${isSuccess ? 'success' : ''}" id="prog_${habit.id}"></div>
                    </div>
                </div>
            `;

            // Запускаем анимацию заполнения после рендера (Wow effect)
            setTimeout(() => {
                const bar = document.getElementById(`prog_${habit.id}`);
                if (bar) bar.style.width = `${percent}%`;
            }, 50);
        });

        // 3. Заметки за этот день
        const dayNotes = appData.notes.filter(n => n.date === dateStr);
        statsNotesContainer.innerHTML = dayNotes.length ? '' : '<p style="opacity:0.4; font-size: 15px; font-weight: 500; text-align:center; padding: 20px;">Пока нет записей</p>';
        
        dayNotes.forEach(note => {
            statsNotesContainer.innerHTML += `
                <div class="day-note-card">
                    <div class="delete-btn" style="top:15px; right:15px;" onclick="deleteNoteFromStats(${note.id})">✕</div>
                    <div style="font-weight:700; margin-bottom:8px; font-size: 18px;">${note.title}</div>
                    <div style="color: var(--text-muted); line-height: 1.5;">${note.text}</div>
                </div>
            `;
        });
    }

    // Чтобы крестик на заметках в статистике работал
    window.deleteNoteFromStats = function(id) {
        appData.notes = appData.notes.filter(n => n.id !== id);
        saveData();
        renderStatsForDay(selectedDateStr); // Перерисовываем день
        if(document.getElementById('notes-screen').classList.contains('active')) renderNotes();
    }

    // Быстрая заметка в статистике
    document.getElementById('addStatsNoteBtn').addEventListener('click', () => {
        const text = document.getElementById('statsNoteInput').value.trim();
        if (!text) return;
        
        appData.notes.unshift({ id: Date.now(), title: 'Быстрая запись', text, date: selectedDateStr });
        saveData();
        document.getElementById('statsNoteInput').value = '';
        renderStatsForDay(selectedDateStr);
    });

    // Первый рендер
    renderHabits();
});