import { createSubjectCard } from '../components/SubjectCard.js';



// Service Worker Qeydiyyatı (PWA & Offline Dəstəyi)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker uğurla qeydə alındı:', reg.scope))
            .catch(err => console.error('Service Worker qeydiyyat xətası:', err));
    });
}




let selectedGrade = 'all';

// XP və İstifadəçi Tərəqqisi Sisteminin Qurulması
let userProgress = JSON.parse(localStorage.getItem('studyhub_progress')) || {
    xp: 2450,
    level: 12,
    completedTopics: []
};

// UI-da XP və Səviyyəni Yeniləyən Funksiya
function updateProgressUI() {
    const xpDisplays = document.querySelectorAll('.user-xp-val'); // XP göstərilən sahələr
    xpDisplays.forEach(el => {
        el.textContent = `${userProgress.xp.toLocaleString()} XP`;
    });

    localStorage.setItem('studyhub_progress', JSON.stringify(userProgress));
}

// XP Əlavə Etmə Funksiyası
function addXP(amount) {
    userProgress.xp += amount;
    // Hər 500 XP-dən bir Səviyyə (Level) artır
    userProgress.level = Math.floor(userProgress.xp / 500) + 1;
    updateProgressUI();
}

document.addEventListener("DOMContentLoaded", () => {
    loadSubjects();
    initModalEvents();
    initGradeFilterEvents();
});

// 1. Sinif Filtrləmə Düymələri
function initGradeFilterEvents() {
    const filterBox = document.getElementById("grade-filter-box");
    if (!filterBox) return;

    const buttons = filterBox.querySelectorAll(".grade-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            selectedGrade = btn.getAttribute("data-grade");
        });
    });
}

// 2. Fənləri JSON-dan Yükləmək
async function loadSubjects() {
    const container = document.getElementById("subjects-container");
    if (!container) return;

    try {
        const response = await fetch('./src/data/subjects.json');
        if (!response.ok) throw new Error("subjects.json tapılmadı");
        
        const subjects = await response.json();
        container.innerHTML = subjects.map(subject => createSubjectCard(subject)).join('');
        
        attachSubjectClickEvents();
    } catch (error) {
        console.error("Fənlər yüklənərkən xəta baş verdi:", error);
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Fənlər yüklənərkən xəta yarandı.</p>`;
    }
}

// 3. Fənn Kartına Klik Hadisəsi
function attachSubjectClickEvents() {
    const cards = document.querySelectorAll('.subject-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const targetCard = e.currentTarget;
            const subjectId = targetCard.getAttribute('data-id');
            const subjectName = targetCard.querySelector('h3').textContent;
            openTopicsModal(subjectId, subjectName);
        });
    });
}

// 4. Mövzular Modalını Açmaq (Bölmə/Unit İyerarxiyası və Sinif Filtri)
async function openTopicsModal(subjectId, subjectName) {
    const modal = document.getElementById("topics-modal");
    const modalTitle = document.getElementById("modal-subject-title");
    const listContainer = document.getElementById("topics-list-container");

    modalTitle.textContent = `${subjectName} — Dərs Mövzuları`;
    listContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Mövzular yüklənir...</p>`;
    
    modal.classList.add("active");

    try {
        const response = await fetch(`./src/data/topics/${subjectId}-topics.json`);
        if (!response.ok) throw new Error("Mövzu faylı tapılmadı");
        
        const data = await response.json();

        if (!data || data.length === 0) {
            listContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Bu fənn üzrə hələ ki mövzu əlavə edilməyib.</p>`;
            return;
        }

        listContainer.innerHTML = data.map(unit => {
            let filteredTopics = unit.topics || [];
            if (typeof selectedGrade !== 'undefined' && selectedGrade !== 'all') {
                filteredTopics = filteredTopics.filter(t => t.grade == selectedGrade);
            }

            if (filteredTopics.length === 0) return '';

            return `
                <div class="unit-block" style="margin-bottom: 20px;">
                    <h4 style="color: var(--neon-blue); font-size: 0.92rem; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
                        ${unit.unitTitle}
                    </h4>
                    <div class="unit-topics">
                        ${filteredTopics.map(topic => `
                            <div class="topic-item" data-id="${topic.id}" data-type="${topic.type}" data-url="${topic.phetUrl || ''}" data-title="${topic.title}">
                                <div class="topic-info">
                                    <div class="topic-icon">
                                        <i class="${topic.type === 'simulation' ? 'fa-solid fa-atom' : (topic.type === 'desmos' ? 'fa-solid fa-calculator' : 'fa-solid fa-book')}"></i>
                                    </div>
                                    <div>
                                        <h5 style="color: var(--text-white); font-size: 0.88rem; margin-bottom: 2px;">${topic.title}</h5>
                                        <span style="font-size: 0.75rem; color: var(--text-muted);">${topic.duration}</span>
                                    </div>
                                </div>
                                <div class="topic-meta">
                                    <span>+${topic.xp} XP</span>
                                    <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 0.75rem;"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        attachTopicClickEvents();

    } catch (error) {
        console.error("Mövzular yüklənərkən xəta:", error);
        listContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Mövzuları yükləmək mümkün olmadı.</p>`;
    }
}

// 5. Mövzulara Kliklədikdə Uyğun Modalı Açmaq
function attachTopicClickEvents() {
    const topicItems = document.querySelectorAll('.topic-item');
    topicItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.getAttribute('data-type');
            const url = item.getAttribute('data-url');
            const title = item.getAttribute('data-title');
            const topicId = item.getAttribute('data-id');

            if (type === 'simulation' && url) {
                openSimulationModal(url, title);
            } else if (type === 'desmos') {
                openDesmosModal(title);
            } else if (type === 'theory') {
                openLessonModal(topicId);
            } else if (type === 'interactive') {
                openQuizModal(topicId);
            }
        });
    });
}

// 6. PhET Simulyasiya Modalı
function openSimulationModal(url, title) {
    const simModal = document.getElementById("sim-modal");
    const simIframe = document.getElementById("sim-iframe");
    const simTitle = document.getElementById("sim-modal-title");

    if (simModal && simIframe && simTitle) {
        simTitle.textContent = `Laboratoriya: ${title}`;
        simIframe.src = url;
        simModal.classList.add("active");
    }
}

// 7. Desmos Qrafik Modalı
function openDesmosModal(title) {
    const desmosModal = document.getElementById("desmos-modal");
    const desmosIframe = document.getElementById("desmos-iframe");
    const desmosTitle = document.getElementById("desmos-modal-title");

    if (desmosModal && desmosIframe && desmosTitle) {
        desmosTitle.textContent = `Riyazi Analiz: ${title}`;
        desmosIframe.src = "https://www.desmos.com/calculator";
        desmosModal.classList.add("active");
    }
}

// 8. Dərs Mətni Modalı (Fizika dərsliyi mətnləri, cədvəllər və məsələlər)
async function openLessonModal(topicId) {
    const lessonModal = document.getElementById("lesson-modal");
    const lessonTitle = document.getElementById("lesson-modal-title");
    const lessonBody = document.getElementById("lesson-modal-body");

    lessonBody.innerHTML = `<p style="color: var(--text-muted); padding: 20px 0;">Dərs mətni yüklənir...</p>`;
    lessonModal.classList.add("active");

    try {
        const response = await fetch(`./src/data/lessons/physics/${topicId}.json`);
        if (!response.ok) throw new Error("Dərs faylı tapılmadı");
        
        const lesson = await response.json();
        lessonTitle.textContent = lesson.title;
        
        let htmlContent = '';

        if (lesson.content && Array.isArray(lesson.content)) {
            lesson.content.forEach(sec => {
                if (sec.type === 'text') {
                    htmlContent += `
                        <div class="lesson-card-box" style="margin-bottom: 16px;">
                            <h4 style="color: var(--neon-blue); font-size: 0.95rem; margin-bottom: 6px;">${sec.heading}</h4>
                            <p style="color: var(--text-white); font-size: 0.88rem; line-height: 1.6;">${sec.body}</p>
                        </div>
                    `;
                } else if (sec.type === 'table') {
                    htmlContent += `
                        <div class="lesson-card-box" style="margin-bottom: 16px; overflow-x: auto;">
                            <h4 style="color: var(--primary-purple); font-size: 0.9rem; margin-bottom: 10px;">${sec.title}</h4>
                            <table style="width: 100%; border-collapse: collapse; color: var(--text-white); font-size: 0.82rem; text-align: left;">
                                <thead>
                                    <tr style="background: rgba(255,255,255,0.05); border-bottom: 1px solid var(--card-border);">
                                        ${sec.headers.map(h => `<th style="padding: 8px;">${h}</th>`).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sec.rows.map(r => `
                                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                            ${r.map(cell => `<td style="padding: 8px;">${cell}</td>`).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                } else if (sec.type === 'example') {
                    htmlContent += `
                        <div class="lesson-card-box" style="margin-bottom: 16px; border-left: 3px solid var(--accent-orange);">
                            <h4 style="color: var(--accent-orange); font-size: 0.9rem; margin-bottom: 6px;">💡 ${sec.title}</h4>
                            <p style="color: var(--text-white); font-size: 0.85rem; margin-bottom: 8px;"><strong>Məsələ:</strong> ${sec.problem}</p>
                            <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">
                                <div><strong>Verilir:</strong> ${sec.given}</div>
                                <div><strong>Düstur:</strong> ${sec.formula}</div>
                                <div><strong>Həlli:</strong> ${sec.solution}</div>
                                <div style="color: var(--neon-blue); margin-top: 4px;"><strong>Cavab:</strong> ${sec.answer}</div>
                            </div>
                        </div>
                    `;
                }
            });
        }

        if (lesson.quiz && lesson.quiz.length > 0) {
            htmlContent += `
                <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="color: var(--text-white); margin-bottom: 12px; font-size: 0.95rem;">✍️ Öyrəndiklərinizi yoxlayın</h4>
                    ${lesson.quiz.map((q, idx) => `
                        <div style="margin-bottom: 12px;">
                            <p style="color: var(--text-white); font-size: 0.85rem; margin-bottom: 8px;">${idx + 1}. ${q.question}</p>
                            <div class="quiz-options-box">
                                ${q.options.map(opt => `
                                    <div style="background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 4px;">
                                        ${opt}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        lessonBody.innerHTML = htmlContent;

    } catch (err) {
        console.error("Dərs yüklənmədi:", err);
        lessonBody.innerHTML = `<p style="color: var(--text-muted); padding: 20px 0;">Bu dərs üzrə hələ ki mətn daxil edilməyib.</p>`;
    }
}

// 9. Quiz Modalı
async function openQuizModal(topicId) {
    const quizModal = document.getElementById("quiz-modal");
    const quizTitle = document.getElementById("quiz-modal-title");
    const quizBody = document.getElementById("quiz-modal-body");

    quizBody.innerHTML = `<p style="color: var(--text-muted);">Sınaq sualları yüklənir...</p>`;
    quizModal.classList.add("active");

    try {
        const response = await fetch(`./src/data/lessons/physics/${topicId}.json`);
        if (!response.ok) throw new Error("Fayl tapılmadı");
        
        const lesson = await response.json();

        if (lesson && lesson.quiz && lesson.quiz.length > 0) {
            const q = lesson.quiz[0];
            quizTitle.textContent = `Sınaq: ${lesson.title}`;
            
            quizBody.innerHTML = `
                <div style="margin-bottom: 18px;">
                    <h4 style="color: var(--text-white); font-size: 1rem; line-height: 1.5; margin-bottom: 14px;">1. ${q.question}</h4>
                    <div id="quiz-options-container">
                        ${q.options.map((opt, index) => `
                            <button class="quiz-option-btn" data-index="${index}">${opt}</button>
                        `).join('')}
                    </div>
                </div>
                <div id="quiz-feedback" style="margin-top: 10px; font-weight: 600; font-size: 0.9rem;"></div>
            `;

            const optionBtns = quizBody.querySelectorAll(".quiz-option-btn");
            optionBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    const selectedIndex = parseInt(btn.getAttribute("data-index"));
                    const feedback = document.getElementById("quiz-feedback");

                    optionBtns.forEach(b => b.disabled = true);

                    if (selectedIndex === q.answer) {
                        btn.classList.add("correct");
                        feedback.style.color = "#10b981";
                        feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Doğru cavab! +50 XP Qazandınız! 🏆`;
                        
                        // 23-CÜ GÜN: Real XP əlavə edilir!
                        addXP(50);
                    } else {
                        btn.classList.add("wrong");
                        optionBtns[q.answer].classList.add("correct");
                        feedback.style.color = "#ef4444";
                        feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Yanlış cavab. Doğru cavab yaşıl rənglə göstərildi.`;
                    }
                });
            });
        } else {
            quizBody.innerHTML = `<p style="color: var(--text-muted);">Bu dərs üzrə sınaq sualı tapılmadı.</p>`;
        }
    } catch (err) {
        console.error("Quiz yüklənmədi:", err);
        quizBody.innerHTML = `<p style="color: var(--text-muted);">Sınaq suallarını yükləmək mümkün olmadı.</p>`;
    }
}
// 10. Bütün Modalları Bağlamaq
function initModalEvents() {
    const bindClose = (modalId, btnId, callback) => {
        const modal = document.getElementById(modalId);
        const btn = document.getElementById(btnId);

        if (btn) {
            btn.addEventListener("click", () => {
                modal.classList.remove("active");
                if (callback) callback();
            });
        }

        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    modal.classList.remove("active");
                    if (callback) callback();
                }
            });
        }
    };

    bindClose("topics-modal", "close-modal-btn");
    bindClose("sim-modal", "close-sim-btn", () => {
        document.getElementById("sim-iframe").src = "";
    });
    bindClose("desmos-modal", "close-desmos-btn", () => {
        document.getElementById("desmos-iframe").src = "";
    });
    bindClose("lesson-modal", "close-lesson-btn");
    bindClose("quiz-modal", "close-quiz-btn");
}