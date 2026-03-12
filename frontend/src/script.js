(function() {
    // Централизованное состояние приложения
    let state = {
        theme: localStorage.getItem('theme') || 'dark',
        selectedDate: new Date().toLocaleDateString('ru-RU'),
        profile: JSON.parse(localStorage.getItem('mobi_profile')) || { name: 'Иван Петров', about: 'Разработчик' },
        habits: [
            { id: 'water', name: 'Вода', unit: 'л', goal: 2.0, emoji: '💧', value: 0 },
            { id: 'sport', name: 'Спорт', unit: 'мин', goal: 60, emoji: '🏋️', value: 0 },
            { id: 'reading', name: 'Чтение', unit: 'мин', goal: 30, emoji: '📖', value: 0 },
            { id: 'sleep', name: 'Сон', unit: 'ч', goal: 8, emoji: '💤', value: 0 }, // Новая привычка [cite: 115]
            { id: 'walk', name: 'Прогулка', unit: 'км', goal: 5, emoji: '🚶', value: 0 } // Новая привычка [cite: 115]
        ],
        notes: JSON.parse(localStorage.getItem('mobi_notes')) || [],
        history: JSON.parse(localStorage.getItem('mobi_history')) || {}
    };

    // ----- Инициализация темы -----
    const body = document.body;
    const themeBtn = document.getElementById('themeToggleBtn');
    
    function applyTheme() {
        body.className = state.theme + '-theme';
        themeBtn.innerText = state.theme === 'dark' ? '🌙 Тёмная тема' : '☀️ Светлая тема';
        localStorage.setItem('theme', state.theme);
    }
    themeBtn.onclick = () => {
        state.theme = (state.theme === 'dark' ? 'light' : 'dark');
        applyTheme();
    }; // 

    // ----- Календарь (Выбор конкретного дня) -----
    const calendarDays = document.querySelectorAll('.cal-day');
    calendarDays.forEach((day, idx) => {
        day.onclick = () => {
            calendarDays.forEach(d => d.classList.remove('selected'));
            day.classList.add('selected');
            
            // Вычисляем дату для текущей недели динамически [cite: 117, 118]
            let d = new Date();
            let currentDayIdx = d.getDay() || 7; // Пн=1...Вс=7
            d.setDate(d.getDate() - (currentDayIdx - 1) + idx);
            state.selectedDate = d.toLocaleDateString('ru-RU');
            
            updateStatsView();
        };
    });

    // ----- Логика привычек (с визуализацией) -----
    window.updateHabit = (id, delta) => {
        const h = state.habits.find(i => i.id === id);
        h.value = Math.max(0, h.value + delta);
        renderHabits();
    };

    function renderHabits() {
        const container = document.getElementById('habitsContainer');
        container.innerHTML = state.habits.map(h => {
            const progress = Math.min((h.value / h.goal) * 100, 100);
            return `
                <div class="habit-item">
                    <div style="display:flex; justify-content:space-between; font-weight:700">
                        <span>${h.emoji} ${h.name}</span>
                        <span>${h.value.toFixed(1)} / ${h.goal} ${h.unit}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div style="display:flex; gap:10px">
                        <button class="action-button" style="padding:10px" onclick="updateHabit('${h.id}', 0.5)">+0.5</button>
                        <button class="action-button" style="padding:10px" onclick="updateHabit('${h.id}', 10)">+10</button>
                        <button class="action-button" style="padding:10px; background:#444" onclick="updateHabit('${h.id}', -0.5)">-</button>
                    </div>
                </div>
            `;
        }).join(''); // 
    }

    // ----- Статистика (просмотр за день) -----
    function updateStatsView() {
        const dayData = state.history[state.selectedDate] || { habits: {}, notes: [] };
        document.getElementById('selectedDayTitle').innerText = `Данные за ${state.selectedDate}`;
        
        const grid = document.getElementById('statsGrid');
        grid.innerHTML = state.habits.map(h => `
            <div class="stat-card">
                <div class="stat-number">${(dayData.habits && dayData.habits[h.id]) || 0}</div>
                <div class="stat-label">${h.name} (${h.unit})</div>
            </div>
        `).join(''); // 

        const noteCont = document.getElementById('statsNotesContainer');
        const dayNotes = state.notes.filter(n => n.date === state.selectedDate);
        noteCont.innerHTML = dayNotes.map(n => `<div class="note-card">${n.text}</div>`).join('') || '<p style="opacity:0.5; text-align:center">Нет записей</p>';
    }

    // ----- Заметки -----
    document.getElementById('showAddNoteBtn').onclick = () => {
        const form = document.getElementById('addNoteForm');
        form.style.display = (form.style.display === 'flex' ? 'none' : 'flex');
    };

    document.getElementById('saveNoteBtn').onclick = () => {
        const text = document.getElementById('noteText').value;
        if(!text) return;
        state.notes.push({ text, date: new Date().toLocaleDateString('ru-RU'), id: Date.now() });
        localStorage.setItem('mobi_notes', JSON.stringify(state.notes));
        document.getElementById('noteText').value = '';
        document.getElementById('addNoteForm').style.display = 'none';
        alert("Заметка сохранена!");
    };

    // ----- Сохранение дня -----
    document.getElementById('saveProgressBtn').onclick = () => {
        const today = new Date().toLocaleDateString('ru-RU');
        state.history[today] = {
            habits: state.habits.reduce((acc, h) => ({...acc, [h.id]: h.value}), {})
        };
        localStorage.setItem('mobi_history', JSON.stringify(state.history));
        alert("Прогресс за сегодня успешно зафиксирован! 🚀");
    };

    // ----- Навигация -----
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.nav-item, .screen').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(item.dataset.screen + '-screen').classList.add('active');
            if(item.dataset.screen === 'habits') renderHabits();
            if(item.dataset.screen === 'stats') updateStatsView();
        };
    });

    // ----- Запуск -----
    applyTheme();
    renderHabits();
    // Выбираем сегодняшний день в календаре при старте
    const todayIdx = (new Date().getDay() || 7) - 1;
    calendarDays[todayIdx].click();

    // Профиль (редактирование)
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    editBtn.onclick = () => {
        document.getElementById('nameDisplay').style.display = 'none';
        document.getElementById('nameInput').style.display = 'block';
        document.getElementById('nameInput').value = state.profile.name;
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
    };
    saveBtn.onclick = () => {
        state.profile.name = document.getElementById('nameInput').value;
        localStorage.setItem('mobi_profile', JSON.stringify(state.profile));
        document.getElementById('nameDisplay').innerText = state.profile.name;
        document.getElementById('profileNameDisplay').innerText = state.profile.name;
        document.getElementById('nameDisplay').style.display = 'block';
        document.getElementById('nameInput').style.display = 'none';
        editBtn.style.display = 'block';
        saveBtn.style.display = 'none';
    };

})();