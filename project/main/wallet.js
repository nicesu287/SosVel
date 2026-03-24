document.addEventListener("DOMContentLoaded", function () {
    if (!requireLogin()) return;

    const balanceEl = document.getElementById("walletBalance");
    const form = document.getElementById("walletForm");
    const amountInput = document.getElementById("topupAmount");
    const message = document.getElementById("walletMessage");

    function safeRead(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch {
            return fallback;
        }
    }

    function renderBalance() {
        const user = getCurrentUser();
        if (!user) return;
        balanceEl.textContent = `${(user.balance || 0).toLocaleString("vi-VN")} VNĐ`;
    }

    function addPlatformTopup(amount) {
        const totalTopup = safeRead("sosvel_platform_topup", 0);
        localStorage.setItem("sosvel_platform_topup", JSON.stringify(totalTopup + amount));
    }

    renderBalance();

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const amount = Number(amountInput.value);
        message.style.color = "#d92d20";

        if (!Number.isFinite(amount) || amount <= 0) {
            message.textContent = "Số tiền nạp không hợp lệ.";
            return;
        }

        const success = addBalance(amount);

        if (!success) {
            message.textContent = "Không thể nạp tiền vào ví.";
            return;
        }

        addPlatformTopup(amount);

        message.style.color = "#1b5edb";
        message.textContent = `Nạp ${amount.toLocaleString("vi-VN")} VNĐ thành công.`;

        amountInput.value = "";
        renderBalance();
    });

    document.querySelectorAll(".quick-topup").forEach(btn => {
        btn.addEventListener("click", function () {
            amountInput.value = this.dataset.amount;
        });
    });
});
