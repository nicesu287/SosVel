document.addEventListener("DOMContentLoaded", function () {
    if (!requireLogin()) return;

    const user = getCurrentUser();
    const authNav = document.getElementById("authNav");
    const list = document.getElementById("transactionList");
    const transactions = getTransactions();

    authNav.innerHTML = `
        <span class="user-greeting">Xin chào, ${user.name}</span>
        <span class="user-balance">Số dư: ${(user.balance || 0).toLocaleString("vi-VN")} VNĐ</span>
        <a href="wallet.html">Ví tài khoản</a>
        <a href="index.html">Trang chủ</a>
    `;

    if (!transactions.length) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>Chưa có giao dịch nào</h3>
                <p>Hãy nạp tiền hoặc sử dụng dịch vụ để tạo lịch sử giao dịch.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = transactions.map(item => `
        <div class="transaction-item ${item.direction}">
            <div>
                <strong>${item.description}</strong>
                <p>${new Date(item.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            <div class="transaction-amount ${item.direction}">
                ${item.direction === "in" ? "+" : "-"}${Number(item.amount).toLocaleString("vi-VN")}
                ${item.type === "point" ? " điểm" : " VNĐ"}
            </div>
        </div>
    `).join("");
});
