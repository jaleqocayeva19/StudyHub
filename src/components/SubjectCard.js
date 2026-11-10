// 12-ci Gün: Fənn Kartı Komponenti
export function createSubjectCard(subject) {
    return `
        <div class="subject-card" data-id="${subject.id}">
            <div class="subject-icon-box" style="background: ${subject.gradient};">
                <i class="${subject.icon}"></i>
            </div>
            <div class="subject-info">
                <h3>${subject.name}</h3>
                <p>${subject.description}</p>
            </div>
            <div class="subject-meta">
                <span><i class="fa-solid fa-book-open"></i> ${subject.topicsCount} Mövzu</span>
                <span>${subject.grade}</span>
            </div>
        </div>
    `;
}