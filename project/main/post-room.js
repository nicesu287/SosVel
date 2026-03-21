document.addEventListener("DOMContentLoaded", function () {
    if (!requireLogin()) return;

    const user = getCurrentUser();
    const authNav = document.getElementById("authNav");
    const balanceText = document.getElementById("postPageBalance");
    const form = document.getElementById("postRoomForm");
    const message = document.getElementById("postRoomMessage");
    const promoCodeInput = document.getElementById("promoCodeInput");

    if (user.role !== "landlord") {
        message.textContent = "Chỉ tài khoản chủ trọ mới được đăng phòng.";
        form.style.display = "none";
        return;
    }

    function renderBalance() {
        const currentUser = getCurrentUser();
        balanceText.textContent = (currentUser.balance || 0).toLocaleString("vi-VN");
    }

    authNav.innerHTML = `
        <span class="user-greeting">Xin chào, ${user.name}</span>
        <span class="user-role-badge">Chủ trọ</span>
        <span class="user-tier-badge">Hạng ${user.loyaltyTier || "Đồng"}</span>
        <span class="user-balance">Số dư: ${(user.balance || 0).toLocaleString("vi-VN")} VNĐ</span>
        <a href="wallet.html">Ví tài khoản</a>
        <a href="transactions.html">Lịch sử</a>
        <a href="my-posts.html">Phòng đã đăng</a>
        <a href="index.html">Về trang chủ</a>
    `;

    renderBalance();

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectedPackage = document.querySelector('input[name="servicePackage"]:checked');
        let packagePrice = parseInt(selectedPackage.value, 10);

        const packageInfo =
            packagePrice === 50000 ? { name: "Cơ bản", days: 7, priority: 3 } :
            packagePrice === 120000 ? { name: "Nổi bật", days: 15, priority: 4 } :
            { name: "Premium", days: 30, priority: 5 };

        const promoCode = promoCodeInput.value.trim().toUpperCase();
        let discount = 0;

        if (promoCode === "PREMIUM20" && packageInfo.name === "Premium") {
            discount = Math.round(packagePrice * 0.2);
            packagePrice -= discount;
        }

        if (!spendBalance(packagePrice, `Mua gói ${packageInfo.name} để đăng phòng`)) {
            message.textContent = "Số dư không đủ để mua gói dịch vụ. Vui lòng nạp thêm tiền.";
            return;
        }

        const postedRooms = JSON.parse(localStorage.getItem("sosvel_posted_rooms")) || [];
        const createdAt = new Date();
        const expiredAt = new Date(createdAt);
        expiredAt.setDate(expiredAt.getDate() + packageInfo.days);

        const rawPrice = Number(document.getElementById("roomPriceInput").value);
        const folder =
            rawPrice <= 2000000 ? "tu1den2trieu" :
            rawPrice <= 3000000 ? "tu2den3trieu" :
            "tren3trieu";

        const roomRecord = {
            owner: document.getElementById("ownerFullName").value.trim(),
            phone: document.getElementById("ownerPhoneInput").value.trim(),
            title: document.getElementById("roomTitleInput").value.trim(),
            area: document.getElementById("roomAreaInput").value,
            type: document.getElementById("roomTypeInput").value,
            price: rawPrice,
            size: document.getElementById("roomSizeInput").value.trim(),
            address: document.getElementById("roomAddressInput").value.trim(),
            desc: document.getElementById("roomDescInput").value.trim(),
            packageName: packageInfo.name,
            packagePrice,
            discount,
            priorityScore: packageInfo.priority,
            createdAt: createdAt.toISOString(),
            expiredAt: expiredAt.toISOString(),
            ownerEmail: user.email,
            available: true,
            isHidden: false,
            previewImage: `../pictures/${folder}/1.jpg`,
            previewImages: [
                `../pictures/${folder}/12.jpg`,
                `../pictures/${folder}/13.jpg`,
                `../pictures/${folder}/14.jpg`
            ],
            views: 0,
            saves: 0,
            asks: 0,
            responseTime: "15 phút"
        };

        postedRooms.unshift(roomRecord);
        localStorage.setItem("sosvel_posted_rooms", JSON.stringify(postedRooms));

        addPostChangeLog(user.email, roomRecord.title, `Tạo bài đăng mới với gói ${packageInfo.name}`);

        const packageRevenue = JSON.parse(localStorage.getItem("sosvel_package_revenue")) || 0;
        localStorage.setItem("sosvel_package_revenue", JSON.stringify(packageRevenue + packagePrice));

        addPoints(25, "Đăng phòng thành công");
        renderBalance();

        message.style.color = "#1b5edb";
        message.textContent =
            `Đăng phòng thành công. Gói ${packageInfo.name} có hiệu lực đến ${expiredAt.toLocaleDateString("vi-VN")}. ` +
            `${discount ? `Bạn đã được giảm ${discount.toLocaleString("vi-VN")} VNĐ.` : ""}`;

        form.reset();
    });
});
