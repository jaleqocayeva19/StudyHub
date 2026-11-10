/* ==========================================
   OFLAYN / ONLAYN İNDİKATORU KONTROLU
   ==========================================
*/
document.addEventListener("DOMContentLoaded", () => {
    const statusBadge = document.getElementById("network-status");
    
    if (!statusBadge) return;

    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        const statusDot = statusBadge.querySelector(".status-dot");
        const statusText = statusBadge.querySelector(".status-text");

        if (isOnline) {
            // Onlayn olduqda görünüş
            statusBadge.style.background = "rgba(34, 197, 94, 0.1)";
            statusBadge.style.borderColor = "rgba(34, 197, 94, 0.3)";
            statusBadge.style.color = "var(--success-green)";
            statusDot.style.backgroundColor = "var(--success-green)";
            statusDot.style.boxShadow = "0 0 8px var(--success-green)";
            statusText.textContent = "Onlayn rejim";
        } else {
            // Oflayn olduqda görünüş
            statusBadge.style.background = "rgba(139, 92, 246, 0.15)";
            statusBadge.style.borderColor = "rgba(139, 92, 246, 0.4)";
            statusBadge.style.color = "var(--primary-purple)";
            statusDot.style.backgroundColor = "var(--primary-purple)";
            statusDot.style.boxShadow = "0 0 8px var(--primary-purple)";
            statusText.textContent = "Oflayn rejim aktivdir";
        }
    }

    // İnternet var/yox hadisələrini dinləyirik
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Səhifə ilk açılanda vəziyyəti yoxlayırıq
    updateOnlineStatus();
});

/* ==========================================
   9-CU GÜN: PWA VƏ OFLAYN HANDLER MƏNTİQİ
   ==========================================
*/
document.addEventListener("DOMContentLoaded", () => {
    const statusBadge = document.getElementById("network-status");

    // Bildiriş pop-up elementini yaradırıq
    const toastContainer = document.createElement("div");
    toastContainer.className = "offline-toast";
    toastContainer.id = "offline-toast";
    toastContainer.innerHTML = `
        <i class="fa-solid fa-wifi-slash"></i>
        <div class="offline-toast-text">
            <strong>Oflayn rejimdəsiniz:</strong> Dərslər və simulyasiyalar cihaz yaddaşından açılır.
        </div>
    `;
    document.body.appendChild(toastContainer);

    function showOfflineToast(show) {
        const toast = document.getElementById("offline-toast");
        if (!toast) return;
        if (show) {
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 4000);
        } else {
            toast.classList.remove("show");
        }
    }

    function updateOnlineStatus() {
        const isOnline = navigator.onLine;
        
        if (statusBadge) {
            const statusDot = statusBadge.querySelector(".status-dot");
            const statusText = statusBadge.querySelector(".status-text");

            if (isOnline) {
                statusBadge.style.background = "rgba(34, 197, 94, 0.1)";
                statusBadge.style.borderColor = "rgba(34, 197, 94, 0.3)";
                statusBadge.style.color = "var(--success-green)";
                if (statusDot) {
                    statusDot.style.backgroundColor = "var(--success-green)";
                    statusDot.style.boxShadow = "0 0 8px var(--success-green)";
                }
                if (statusText) statusText.textContent = "Onlayn rejim";
            } else {
                statusBadge.style.background = "rgba(139, 92, 246, 0.15)";
                statusBadge.style.borderColor = "rgba(139, 92, 246, 0.4)";
                statusBadge.style.color = "var(--primary-purple)";
                if (statusDot) {
                    statusDot.style.backgroundColor = "var(--primary-purple)";
                    statusDot.style.boxShadow = "0 0 8px var(--primary-purple)";
                }
                if (statusText) statusText.textContent = "Oflayn rejim aktivdir";
                showOfflineToast(true);
            }
        }
    }

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", () => {
        updateOnlineStatus();
    });

    updateOnlineStatus();
});