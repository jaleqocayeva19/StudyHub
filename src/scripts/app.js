import { createSubjectCard } from '../components/SubjectCard.js';

document.addEventListener("DOMContentLoaded", () => {
    loadSubjects();
});

async function loadSubjects() {
    const container = document.getElementById("subjects-container");
    if (!container) return;

    try {
        const response = await fetch('./src/data/subjects.json');
        if (!response.ok) throw new Error("JSON faylı tapılmadı");
        
        const subjects = await response.json();
        
        // Konteyneri təmizləyirik və kartları əlavə edirik
        container.innerHTML = subjects.map(subject => createSubjectCard(subject)).join('');
    } catch (error) {
        console.error("Fənlər yüklənərkən xəta baş verdi:", error);
        container.innerHTML = `<p style="color: var(--text-muted);">Fənlər yüklənərkən xəta yarandı.</p>`;
    }
}