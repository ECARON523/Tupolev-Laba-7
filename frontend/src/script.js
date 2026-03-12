(function() {
    // ----- Элементы -----
    const screens = document.querySelectorAll('.screen');
    const navItems = document.querySelectorAll('.nav-item');
    const body = document.body;

    const themeToggle = document.getElementById('themeToggleBtn');
    const photoInput = document.getElementById('photoInput');
    const profilePhoto = document.getElementById('profilePhoto');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    
    const nameDisplay = document.getElementById('nameDisplay');
    const aboutDisplay = document.getElementById('aboutDisplay');
    const birthDisplay = document.getElementById('birthDisplay');
    const profileNameDisplay = document.getElementById('profileNameDisplay');
    const nameInput = document.getElementById('nameInput');
    const aboutInput = document.getElementById('aboutInput');
    const birthInput = document.getElementById('birthInput');
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');

    const notesContainer = document.getElementById('notesContainer');
    const showAddNoteBtn = document.getElementById('showAddNoteBtn');
    const addNoteForm = document.getElementById('addNoteForm');
    const noteTitle = document.getElementById('noteTitle');
    const noteText = document.getElementById('noteText');
    const saveNoteBtn = document.getElementById('saveNoteBtn');

    const habitsContainer = document.getElementById('habitsContainer');
    const showAddHabitBtn = document.getElementById('showAddHabitBtn');
    const addHabitForm = document.getElementById('addHabitForm');
    const habitName = document.getElementById('habitName');
    const habitUnit = document.getElementById('habitUnit');
    const habitDefaultValue = document.getElementById('habitDefaultValue');
    const saveHabitBtn = document.getElementById('saveHabitBtn');
    const saveProgressBtn = document.getElementById('saveProgressBtn');

    const statStreak = document.getElementById('statStreak');
    const statWater = document.getElementById('statWater');
    const statNotes = document.getElementById('statNotes');
    const statSport = document.getElementById('statSport');
    const statReading = document.getElementById('statReading');
    const statActions = document.getElementById('statActions');
    const statsNotesContainer = document.getElementById('statsNotesContainer');
    const calendarDays = document.querySelectorAll('.cal-day');
    const selectedDayTitle = document.getElementById('selectedDayTitle');
    const statsNoteInput = document.getElementById('statsNoteInput');
    const addStatsNoteBtn = document.getElementById('addStatsNoteBtn');

    // ----- Данные -----
    let profile = { name: 'Иван Петров', about: 'Типа программист', birth: '30.03.1933' };
    let notes = [
        { id: Date.now() - 2000, title: 'Заголовок', text: 'Текст заметки...\n• Маркированный список', date: '18.02.2026' },
        { id: Date.now() - 1000, title: 'Тест 1', text: '• пункт 1\n• пункт 2', date: '18.02.2026' }
    ];
    let habits = [
        { id: 'water', name: '💧 Вода', unit: 'л', value: 0.5, emoji: '💧' },
        { id: 'sport', name: '🏋️ Спорт', unit: 'мин', value: 10, emoji: '🏋️' },
        { id: 'reading', name: '📖 Чтение', unit: 'мин', value: 1, emoji: '📖' }
    ];

    const dayStats = {
        'Пн': { water: 1.2, sport: 25, reading: 15, notesCount: 2 },
        'Вт': { water: 0.8, sport: 40, reading: 10, notesCount: 1 },
        'Ср': { water: 1.5, sport: 30, reading: 20, notesCount: 3 },
        'Чт': { water: 0.6, sport: 15, reading: 5, notesCount: 0 },
        'Пт': { water: 2.0, sport: 45, reading: 25, notesCount: 4 },
        'Сб': { water: 1.0, sport: 20, reading: 12, notesCount: 2 },
        'Вс': { water: 0.7, sport: 10, reading: 8, notesCount: 1 }
    };

    let selectedDay = '16.02.2026';
    let selectedDayName = 'Пн';

    // ----- Тема -----
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            themeToggle.innerHTML = '☀️ Светлая тема';
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            themeToggle.innerHTML = '🌙 Тёмная тема';
        }
    });

    // ----- Фото -----
    function triggerPhotoUpload() { photoInput.click(); }
    changePhotoBtn.addEventListener('click', triggerPhotoUpload);
    profilePhoto.addEventListener('click', triggerPhotoUpload);
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePhoto.innerHTML = `<img src="${event.target.result}">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // ----- Профиль -----
    function updateProfileDisplay() {
        nameDisplay.innerText = profile.name;
        aboutDisplay.innerText = profile.about;
        birthDisplay.innerText = profile.birth;
        profileNameDisplay.innerText = profile.name;
    }

    editBtn.addEventListener('click', () => {
        [nameDisplay, aboutDisplay, birthDisplay, editBtn].forEach(el => el.style.display = 'none');
        [nameInput, aboutInput, birthInput, saveBtn].forEach(el => el.style.display = 'block');
    });

    saveBtn.addEventListener('click', () => {
        profile.name = nameInput.value.trim() || profile.name;
        profile.about = aboutInput.value.trim() || profile.about;
        profile.birth = birthInput.value.trim() || profile.birth;
        updateProfileDisplay();
        [nameDisplay, aboutDisplay, birthDisplay, editBtn].forEach(el => el.style.display = 'block');
        [nameInput, aboutInput, birthInput, saveBtn].forEach(el => el.style.display = 'none');
    });

    // ----- Заметки -----
    function renderNotes() {
        notesContainer.innerHTML = notes.map(note => `
            <div class="note-card">
                <div class="delete-note" onclick="deleteNote(${note.id})">✕</div>
                <div class="note-title">${note.title}</div>
                <div class="note-content">${note.text.replace(/\n/g, '<br>')}</div>
                <div class="note-date">${note.date}</div>
            </div>
        `).join('');
    }

    window.deleteNote = function(id) {
        notes = notes.filter(n => n.id !== id);
        renderNotes();
        renderStatsNotes();
        updateStatsForSelectedDay();
    };

    showAddNoteBtn.addEventListener('click', () => addNoteForm.style.display = 'flex');

    saveNoteBtn.addEventListener('click', () => {
        notes.push({
            id: Date.now(),
            title: noteTitle.value.trim() || 'Без названия',
            text: noteText.value.trim() || 'Пусто',
            date: '18.02.2026'
        });
        renderNotes();
        addNoteForm.style.display = 'none';
        noteTitle.value = ''; noteText.value = '';
    });

    // ----- Привычки -----
    function renderHabits() {
        habitsContainer.innerHTML = habits.map(habit => `
            <div class="habit-item">
                <div class="habit-title">${habit.emoji} ${habit.name}</div>
                <div class="habit-stats">
                    <span class="habit-value" id="habit-${habit.id}-value">${habit.value.toFixed(1)}</span>
                    <span class="habit-unit">${habit.unit}</span>
                </div>
                <div class="habit-control">
                    <input type="number" id="habit-${habit.id}-input" step="0.1" value="1">
                    <button class="habit-plus" onclick="addHabitValue('${habit.id}')">+</button>
                </div>
                <div class="delete-note" style="top:16px; right:16px;" onclick="deleteHabit('${habit.id}')">✕</div>
            </div>
        `).join('');
    }

    window.addHabitValue = function(id) {
        const habit = habits.find(h => h.id === id);
        const input = document.getElementById(`habit-${id}-input`);
        habit.value += parseFloat(input.value) || 0;
        renderHabits();
        updateStatsForSelectedDay();
    };

    window.deleteHabit = function(id) {
        habits = habits.filter(h => h.id !== id);
        renderHabits();
    };

    showAddHabitBtn.addEventListener('click', () => addHabitForm.style.display = 'flex');
    saveHabitBtn.addEventListener('click', () => {
        habits.push({
            id: 'h' + Date.now(),
            name: habitName.value,
            unit: habitUnit.value,
            value: parseFloat(habitDefaultValue.value),
            emoji: '📌'
        });
        renderHabits();
        addHabitForm.style.display = 'none';
    });

    // ----- Статистика -----
    function updateStatsForSelectedDay() {
        if (selectedDay === '18.02.2026') {
            statWater.innerText = (habits.find(h => h.id === 'water')?.value || 0).toFixed(1);
            statNotes.innerText = notes.filter(n => n.date === '18.02.2026').length;
        } else {
            const s = dayStats[selectedDayName] || { water: 0, notesCount: 0, sport: 0, reading: 0 };
            statWater.innerText = s.water.toFixed(1);
            statNotes.innerText = s.notesCount;
            statSport.innerText = s.sport;
            statReading.innerText = s.reading;
        }
    }

    function renderStatsNotes() {
        const filtered = notes.filter(n => n.date === selectedDay);
        statsNotesContainer.innerHTML = filtered.map(n => `
            <div class="day-note-card">
                <div class="delete-note" style="top:8px; right:8px;" onclick="deleteNote(${n.id})">✕</div>
                <div>${n.text}</div>
            </div>
        `).join('');
    }

    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            calendarDays.forEach(d => d.classList.remove('selected'));
            day.classList.add('selected');
            selectedDayName = day.dataset.day;
            selectedDay = (16 + parseInt(day.dataset.index)) + '.02.2026';
            selectedDayTitle.innerText = `Заметки за день ${selectedDay}`;
            renderStatsNotes();
            updateStatsForSelectedDay();
        });
    });

    addStatsNoteBtn.addEventListener('click', () => {
        if (!statsNoteInput.value) return;
        notes.push({ id: Date.now(), title: 'Заметка', text: statsNoteInput.value, date: selectedDay });
        statsNoteInput.value = '';
        renderStatsNotes();
        updateStatsForSelectedDay();
    });

    // ----- Навигация -----
    function showScreen(id) {
        screens.forEach(s => s.classList.remove('active'));
        document.getElementById(id + '-screen').classList.add('active');
        navItems.forEach(nav => nav.classList.toggle('active', nav.dataset.screen === id));
        if (id === 'notes') renderNotes();
        if (id === 'habits') renderHabits();
        if (id === 'stats') { renderStatsNotes(); updateStatsForSelectedDay(); }
    }

    navItems.forEach(item => item.addEventListener('click', () => showScreen(item.dataset.screen)));

    // Init
    updateProfileDisplay();
    renderNotes();
    renderHabits();
    calendarDays[0].click();
})();