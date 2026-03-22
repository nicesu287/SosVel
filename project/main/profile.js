document.addEventListener("DOMContentLoaded", function () {
    if (!requireLogin()) return;

    const user = getCurrentUser();
    const authNav = document.getElementById("authNav");
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");
    const profileTier = document.getElementById("profileTier");
    const profilePoints = document.getElementById("profilePoints");
    const profileBalance = document.getElementById("profileBalance");
    const avatar = document.getElementById("profileAvatar");
    const form = document.getElementById("profileForm");
    const message = document.getElementById("profileMessage");

    authNav.innerHTML = `
        <span class="user-greeting">Xin chào, ${user.name}</span>
        <span class="user-balance">Số dư: ${(user.balance || 0).toLocaleString("vi-VN")} VNĐ</span>
        <a href="index.html">Trang chủ</a>
    `;

    function renderProfile() {
        const current = getCurrentUser();

        profileName.textContent = current.name;
        profileRole.textContent = `Vai trò: ${current.role === "landlord" ? "Chủ trọ" : current.role === "admin" ? "Quản trị viên" : "Người thuê"}`;
        profileTier.textContent = current.loyaltyTier || "Đồng";
        profilePoints.textContent = current.points || 0;
        profileBalance.textContent = `${(current.balance || 0).toLocaleString("vi-VN")} VNĐ`;

        avatar.textContent = current.name
            .split(" ")
            .slice(-2)
            .map(x => x[0])
            .join("")
            .toUpperCase();

        document.getElementById("profileNameInput").value = current.name || "";
        document.getElementById("profilePhoneInput").value = current.phone || "";
        document.getElementById("profileBioInput").value = current.bio || "";
    }

    renderProfile();

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const current = getCurrentUser();
        current.name = document.getElementById("profileNameInput").value.trim();
        current.phone = document.getElementById("profilePhoneInput").value.trim();
        current.bio = document.getElementById("profileBioInput").value.trim();

        updateUserInStorage(current);

        message.style.color = "#1b5edb";
        message.textContent = "Cập nhật hồ sơ thành công.";

        renderProfile();
    });
});
