document.addEventListener("DOMContentLoaded", function () {
    if (!requireLogin()) return;

    const balanceEl = document.getElementById("walletBalance");
    const form = document.getElementById("walletForm");
    const message = document.getElementById("walletMessage");
    const topupInput = document.getElementById("topupAmount");

    function renderBalance() {
        const currentUser = getCurrentUser();
        balanceEl.textContent = `${(currentUser.balance || 0).toLocaleString("vi-VN")} VNĐ`;
    }

    renderBalance();

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const amount = parseInt(topupInput.value, 10);
        if (!amount || amount <= 0) {
            message.textContent = "Vui lòng nhập số tiền hợp lệ.";
            return;
        }

        addBalance(amount);

        const topup = JSON.parse(localStorage.getItem("sosvel_platform_topup")) || 0;
        localStorage.setItem("sosvel_platform_topup", JSON.stringify(topup + amount));

        addPoints(10, "Nạp tiền vào ví");
        renderBalance();
        message.style.color = "#1b5edb";
        message.textContent = "Nạp tiền thành công.";
        form.reset();
    });

    document.querySelectorAll(".quick-topup").forEach(btn => {
        btn.addEventListener("click", function () {
            topupInput.value = this.dataset.amount;
        });
    });
});
