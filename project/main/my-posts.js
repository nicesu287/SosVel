document.addEventListener("DOMContentLoaded", function () {
    if (!requireLogin()) return;

    const user = getCurrentUser();
    const authNav = document.getElementById("authNav");
    const list = document.getElementById("myPostsList");
    const changeLogList = document.getElementById("changeLogList");

    authNav.innerHTML = `
        <span class="user-greeting">Xin chào, ${user.name}</span>
        <span class="user-balance">Số dư: ${(user.balance || 0).toLocaleString("vi-VN")} VNĐ</span>
        <a href="wallet.html">Ví tài khoản</a>
        <a href="transactions.html">Lịch sử</a>
        <a href="index.html">Trang chủ</a>
    `;

    if (user.role !== "landlord") {
        list.innerHTML = `
            <div class="empty-state">
                <h3>Tài khoản hiện tại không phải chủ trọ</h3>
                <p>Chỉ tài khoản chủ trọ mới quản lý bài đăng phòng.</p>
            </div>
        `;
        return;
    }

    function getUserRooms() {
        return (JSON.parse(localStorage.getItem("sosvel_posted_rooms")) || [])
            .filter(room => room.ownerEmail === user.email);
    }

    function saveRooms(rooms) {
        localStorage.setItem("sosvel_posted_rooms", JSON.stringify(rooms));
    }

    function renderLogs() {
        const logs = (JSON.parse(localStorage.getItem("sosvel_post_change_logs")) || [])
            .filter(item => item.ownerEmail === user.email);

        changeLogList.innerHTML = logs.length
            ? logs.map(item => `
                <div class="transaction-item">
                    <div>
                        <strong>${item.roomTitle}</strong>
                        <p>${item.message}</p>
                    </div>
                    <div>${new Date(item.createdAt).toLocaleString("vi-VN")}</div>
                </div>
            `).join("")
            : `<div class="info-strip">Chưa có thay đổi nào được ghi nhận.</div>`;
    }

    function renderRooms() {
        const postedRooms = getUserRooms();

        if (!postedRooms.length) {
            list.innerHTML = `
                <div class="empty-state">
                    <h3>Bạn chưa đăng phòng nào</h3>
                    <p>Hãy tạo bài đăng đầu tiên để bắt đầu tiếp cận người thuê.</p>
                </div>
            `;
            renderLogs();
            return;
        }

        list.innerHTML = postedRooms.map((room, index) => {
            const expired = new Date(room.expiredAt) < new Date();
            const needUpgrade = room.packageName === "Cơ bản" || room.packageName === "Nổi bật";

            return `
                <div class="my-post-card">
                    <div>
                        <h3>${room.title}</h3>
                        <p>📍 ${room.address}</p>
                        <p>💰 ${Number(room.price).toLocaleString("vi-VN")} VNĐ / tháng</p>
                        <p>🏷️ Gói: ${room.packageName}</p>
                        <p>👁️ ${room.views || 0} • 💾 ${room.saves || 0} • 💬 ${room.asks || 0}</p>
                        ${needUpgrade ? `<div class="helper-text">Gợi ý: nâng cấp lên Premium để tăng ưu tiên hiển thị.</div>` : ""}
                    </div>
                    <div class="post-status-box">
                        <span class="status-pill ${expired ? "expired" : room.available === false ? "expired" : "active"}">
                            ${expired ? "Hết hạn" : room.available === false ? "Hết phòng" : "Đang hiển thị"}
                        </span>
                        <p>Ngày đăng: ${new Date(room.createdAt).toLocaleDateString("vi-VN")}</p>
                        <p>Ngày hết hạn: ${new Date(room.expiredAt).toLocaleDateString("vi-VN")}</p>

                        <div class="room-card-actions">
                            <button class="secondary-btn sold-out-btn" data-index="${index}">
                                ${room.available === false ? "Mở lại phòng" : "Báo hết phòng"}
                            </button>
                            <button class="secondary-btn hide-post-btn" data-index="${index}">
                                ${room.isHidden ? "Hiện bài" : "Ẩn bài"}
                            </button>
                            ${needUpgrade ? `<button class="secondary-btn upgrade-btn" data-index="${index}">Nâng cấp gói</button>` : ""}
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        const rooms = getUserRooms();

        document.querySelectorAll(".sold-out-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const room = rooms[Number(this.dataset.index)];
                const all = JSON.parse(localStorage.getItem("sosvel_posted_rooms")) || [];
                const target = all.find(x =>
                    x.ownerEmail === room.ownerEmail &&
                    x.title === room.title &&
                    x.createdAt === room.createdAt
                );

                if (target) {
                    target.available = !target.available;
                    saveRooms(all);
                    addPostChangeLog(user.email, target.title, target.available ? "Mở lại trạng thái còn phòng" : "Báo hết phòng");
                    renderRooms();
                    renderLogs();
                }
            });
        });

        document.querySelectorAll(".hide-post-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const room = rooms[Number(this.dataset.index)];
                const all = JSON.parse(localStorage.getItem("sosvel_posted_rooms")) || [];
                const target = all.find(x =>
                    x.ownerEmail === room.ownerEmail &&
                    x.title === room.title &&
                    x.createdAt === room.createdAt
                );

                if (target) {
                    target.isHidden = !target.isHidden;
                    saveRooms(all);
                    addPostChangeLog(user.email, target.title, target.isHidden ? "Ẩn bài đăng" : "Hiện lại bài đăng");
                    renderRooms();
                    renderLogs();
                }
            });
        });

        document.querySelectorAll(".upgrade-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const room = rooms[Number(this.dataset.index)];
                const upgradeCost = room.packageName === "Cơ bản" ? 200000 : 130000;

                if (!spendBalance(upgradeCost, `Nâng cấp bài đăng ${room.title} lên Premium`)) {
                    alert("Số dư không đủ để nâng cấp gói.");
                    return;
                }

                const all = JSON.parse(localStorage.getItem("sosvel_posted_rooms")) || [];
                const target = all.find(x =>
                    x.ownerEmail === room.ownerEmail &&
                    x.title === room.title &&
                    x.createdAt === room.createdAt
                );

                if (target) {
                    target.packageName = "Premium";
                    target.priorityScore = 5;
                    const expiredAt = new Date(target.expiredAt);
                    expiredAt.setDate(expiredAt.getDate() + 15);
                    target.expiredAt = expiredAt.toISOString();

                    saveRooms(all);
                    addPostChangeLog(user.email, target.title, "Nâng cấp gói lên Premium và gia hạn thêm 15 ngày");
                    renderRooms();
                    renderLogs();
                }
            });
        });
    }

    renderRooms();
    renderLogs();
});
