document.addEventListener("DOMContentLoaded", function () {
    if (!requireLogin()) return;

    const authNav = document.getElementById("authNav");
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const profileTier = document.getElementById("profileTier");
    const profilePoints = document.getElementById("profilePoints");
    const profileBalance = document.getElementById("profileBalance");
    const profileStatus = document.getElementById("profileStatus");
    const avatar = document.getElementById("profileAvatar");
    const form = document.getElementById("profileForm");
    const message = document.getElementById("profileMessage");
    const currentRentalBox = document.getElementById("currentRentalBox");
    const rentalHistoryList = document.getElementById("rentalHistoryList");

    function getRoleLabel(role) {
        if (role === "landlord") return "Chủ trọ";
        if (role === "admin") return "Quản trị viên";
        return "Người thuê";
    }

    function renderAuthNav() {
        const current = getCurrentUser();

        authNav.innerHTML = `
            <span class="user-greeting">Xin chào, ${current.name}</span>
            <span class="user-balance">Số dư: ${(current.balance || 0).toLocaleString("vi-VN")} VNĐ</span>
            <a href="wallet.html">Ví tài khoản</a>
            <a href="transactions.html">Lịch sử</a>
            <a href="index.html">Trang chủ</a>
            <a href="#" id="logoutBtn">Đăng xuất</a>
        `;

        document.getElementById("logoutBtn").addEventListener("click", function (e) {
            e.preventDefault();
            logout();
        });
    }

    function renderProfile() {
        const current = getCurrentUser();

        profileName.textContent = current.name || "Chưa cập nhật";
        profileRole.textContent = `Vai trò: ${getRoleLabel(current.role)}`;
        profileTier.textContent = current.loyaltyTier || "Đồng";
        profilePoints.textContent = current.points || 0;
        profileBalance.textContent = `${(current.balance || 0).toLocaleString("vi-VN")} VNĐ`;
        profileStatus.textContent = current.isLocked ? "Đã khóa" : "Đang hoạt động";

        const initials = (current.name || "SV")
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map(x => x[0] || "")
            .join("")
            .toUpperCase();

        avatar.textContent = initials || "SV";

        document.getElementById("profileNameInput").value = current.name || "";
        document.getElementById("profilePhoneInput").value = current.phone || "";
        document.getElementById("profileBioInput").value = current.bio || "";
    }

    function renderCurrentRental() {
        const currentRental = typeof getCurrentRental === "function" ? getCurrentRental() : null;

        if (!currentRentalBox) return;

        if (!currentRental) {
            currentRentalBox.innerHTML = `
                <div class="info-strip">
                    Bạn hiện chưa có phòng nào đang thuê.
                </div>
            `;
            return;
        }

        currentRentalBox.innerHTML = `
            <div>
                <strong>${currentRental.title}</strong>
                <p>📍 ${currentRental.address}</p>
                <p>🏷️ ${currentRental.type} • ${currentRental.area}</p>
                <p>💰 ${Number(currentRental.price).toLocaleString("vi-VN")} VNĐ / tháng</p>
                <p>💳 Tiền cọc đã thanh toán: ${Number(currentRental.depositAmount).toLocaleString("vi-VN")} VNĐ</p>
                <p>🕒 Ngày bắt đầu thuê: ${new Date(currentRental.startedAt).toLocaleDateString("vi-VN")}</p>
                <p><strong>Trạng thái:</strong> ${currentRental.status}</p>
            </div>
        `;
    }

    function renderRentalHistory() {
        const history = typeof getRentalHistory === "function" ? getRentalHistory() : [];

        if (!rentalHistoryList) return;

        if (!history.length) {
            rentalHistoryList.innerHTML = `
                <div class="empty-state">
                    <h3>Chưa có lịch sử thuê phòng</h3>
                    <p>Các phòng bạn đã thuê sẽ được hiển thị tại đây.</p>
                </div>
            `;
            return;
        }

        rentalHistoryList.innerHTML = history.map(item => `
            <div class="transaction-item">
                <div>
                    <strong>${item.title}</strong>
                    <p>📍 ${item.address}</p>
                    <p>💰 ${Number(item.price).toLocaleString("vi-VN")} VNĐ / tháng</p>
                    <p>💳 Tiền cọc: ${Number(item.depositAmount).toLocaleString("vi-VN")} VNĐ</p>
                    <p>🕒 Bắt đầu: ${new Date(item.startedAt).toLocaleString("vi-VN")}</p>
                </div>
                <div class="transaction-amount in">
                    ${item.status}
                </div>
            </div>
        `).join("");
    }

    renderAuthNav();
    renderProfile();
    renderCurrentRental();
    renderRentalHistory();

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const current = getCurrentUser();
        const newName = document.getElementById("profileNameInput").value.trim();
        const newPhone = document.getElementById("profilePhoneInput").value.trim();
        const newBio = document.getElementById("profileBioInput").value.trim();

        if (!newName) {
            message.style.color = "#d92d20";
            message.textContent = "Họ tên không được để trống.";
            return;
        }

        current.name = newName;
        current.phone = newPhone;
        current.bio = newBio;

        updateUserInStorage(current);

        message.style.color = "#1b5edb";
        message.textContent = "Cập nhật hồ sơ thành công.";

        renderAuthNav();
        renderProfile();
        renderCurrentRental();
        renderRentalHistory();
    });
});
