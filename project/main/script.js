const areas = ["Đông Hòa", "Dĩ An", "Thủ Đức", "Suối Tiên", "Linh Trung", "Bình Thọ"];
const streets = ["Đường số 1", "Đường số 5", "Đường số 7", "Tân Lập", "Thống Nhất", "Lê Văn Việt", "Kha Vạn Cân", "Hoàng Diệu 2"];
const ownerNames = ["Anh Minh", "Chị Hân", "Anh Phúc", "Chị Vy", "Anh Tùng", "Chị Trang"];
const roomTypes = ["Phòng trọ", "Chung cư mini", "Ở ghép"];
const folderMap = { low: "tu1den2trieu", mid: "tu2den3trieu", high: "tren3trieu" };
const BASE_PATH = "../pictures";
const roomsPerPage = 12;

let currentPage = 1;
let filteredRooms = [];
let currentRoom = null;
let chatData = {};
let askedQuestions = {};
let signatureCanvas = null;
let signatureCtx = null;
let isDrawing = false;
let hasSigned = false;

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN");
}

function getRoomFolder(price) {
    if (price <= 2000000) return folderMap.low;
    if (price <= 3000000) return folderMap.mid;
    return folderMap.high;
}

function getPriceTag(price) {
    if (price <= 2000000) return "1tr5 - 2tr";
    if (price <= 3000000) return "2tr - 3tr";
    return "3tr+";
}

function getCoverImage(folder, index) {
    return `${BASE_PATH}/${folder}/${index}.jpg`;
}

function getGalleryImages(folder, id) {
    const rangeStart = 12;
    const rangeSize = 37;
    const offset = (id * 3) % rangeSize;

    const img1 = rangeStart + (offset % rangeSize);
    const img2 = rangeStart + ((offset + 1) % rangeSize);
    const img3 = rangeStart + ((offset + 2) % rangeSize);

    return [
        `${BASE_PATH}/${folder}/${img1}.jpg`,
        `${BASE_PATH}/${folder}/${img2}.jpg`,
        `${BASE_PATH}/${folder}/${img3}.jpg`
    ];
}

function getRoleLabel(role) {
    return role === "landlord" ? "Chủ trọ" : role === "admin" ? "Quản trị viên" : "Người thuê";
}

function isAdmin(user) {
    return !!user && user.role === "admin";
}

function getSavedSearches() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`sosvel_saved_searches_${user.email}`)) || [];
}

function saveSavedSearches(data) {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem(`sosvel_saved_searches_${user.email}`, JSON.stringify(data));
}

function getRoomEngagements() {
    return JSON.parse(localStorage.getItem("sosvel_room_engagements")) || {};
}

function saveRoomEngagements(data) {
    localStorage.setItem("sosvel_room_engagements", JSON.stringify(data));
}

function getRoommateRequests() {
    return JSON.parse(localStorage.getItem("sosvel_roommate_requests")) || [];
}

function saveRoommateRequests(data) {
    localStorage.setItem("sosvel_roommate_requests", JSON.stringify(data));
}

function getShareLink(roomId) {
    return `${window.location.origin}${window.location.pathname}#room-${roomId}`;
}

function addPostChangeLog(ownerEmail, roomTitle, message) {
    const logs = JSON.parse(localStorage.getItem("sosvel_post_change_logs")) || [];
    logs.unshift({
        ownerEmail,
        roomTitle,
        message,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem("sosvel_post_change_logs", JSON.stringify(logs));
}

function getDailyCheckinKey() {
    const user = getCurrentUser();
    if (!user) return "";
    return `sosvel_daily_checkin_${user.email}`;
}

function canDailyCheckin() {
    const key = getDailyCheckinKey();
    const lastDate = localStorage.getItem(key);
    const today = new Date().toLocaleDateString("vi-VN");
    return lastDate !== today;
}

function doDailyCheckin() {
    const user = getCurrentUser();
    if (!user) return;

    const msg = document.getElementById("rewardMessage");
    const key = getDailyCheckinKey();
    const today = new Date().toLocaleDateString("vi-VN");

    if (!canDailyCheckin()) {
        msg.textContent = "Bạn đã điểm danh hôm nay rồi.";
        return;
    }

    localStorage.setItem(key, today);
    addPoints(10, "Điểm danh hằng ngày");

    const current = getCurrentUser();
    msg.style.color = "#1b5edb";
    msg.textContent = "Điểm danh thành công, bạn nhận 10 điểm.";

    if ((current.points || 0) >= 200 && (current.points || 0) % 200 < 10) {
        showNotice("Chúc mừng", "Bạn đã đạt mốc 200 điểm và có thể nhận mã khuyến mãi từ web.");
    }

    renderRewardWidget();
    updateAuthNav();
}

function renderRewardWidget() {
    const user = getCurrentUser();
    const widget = document.getElementById("rewardWidget");
    const pointText = document.getElementById("rewardUserPoints");

    if (!widget || !pointText) return;

    if (!user) {
        widget.classList.add("hidden");
        return;
    }

    widget.classList.remove("hidden");
    pointText.textContent = `Bạn hiện có ${user.points || 0} điểm`;
}

function createRoom(id, title, area, price, address, size, desc, coverIndex) {
    const folder = getRoomFolder(price);
    const type = randomItem(roomTypes);

    return {
        id,
        title,
        type,
        area,
        price,
        address,
        size,
        desc,
        ownerName: randomItem(ownerNames),
        ownerPhone: "0901 234 567",
        folder,
        coverImage: getCoverImage(folder, coverIndex),
        galleryImages: getGalleryImages(folder, id),
        packageBadge: price > 3000000 ? "Premium" : price > 2000000 ? "Nổi bật" : "Cơ bản",
        priorityScore: price > 3000000 ? 3 : price > 2000000 ? 2 : 1,
        available: true,
        postedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 86400000).toISOString(),
        views: Math.floor(Math.random() * 500) + 20,
        saves: Math.floor(Math.random() * 80),
        asks: Math.floor(Math.random() * 40),
        responseTime: `${Math.floor(Math.random() * 60) + 5} phút`
    };
}

const roomsData = [];
let roomId = 1;

for (let i = 1; i <= 120; i++) {
    const area = randomItem(areas);
    const price =
        i <= 40 ? 1800000 + ((i - 1) % 5) * 100000 :
        i <= 80 ? 2200000 + ((i - 1) % 5) * 200000 :
        3200000 + ((i - 1) % 6) * 400000;

    const coverIndex = ((i - 1) % 11) + 1;

    roomsData.push(
        createRoom(
            roomId++,
            `Phòng sinh viên ${i}`,
            area,
            price,
            `${10 + i}, ${randomItem(streets)}, ${area}`,
            `${16 + (i % 8)}m²`,
            "Phòng sạch đẹp, phù hợp sinh viên, gần trường, khu vực an ninh, tiện đi lại.",
            coverIndex
        )
    );
}

function getPostedRooms() {
    return JSON.parse(localStorage.getItem("sosvel_posted_rooms")) || [];
}

function savePostedRooms(data) {
    localStorage.setItem("sosvel_posted_rooms", JSON.stringify(data));
}

function getFavoriteRooms() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`sosvel_favorites_${user.email}`)) || [];
}

function saveFavoriteRooms(ids) {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem(`sosvel_favorites_${user.email}`, JSON.stringify(ids));
}

function toggleFavorite(roomId) {
    const user = getCurrentUser();
    if (!user) return false;

    const favorites = getFavoriteRooms();
    const index = favorites.indexOf(roomId);

    if (index === -1) {
        favorites.push(roomId);
        addPoints(5, "Lưu phòng yêu thích");
    } else {
        favorites.splice(index, 1);
    }

    saveFavoriteRooms(favorites);
    renderFavoriteBar();
    return true;
}

function getAllRooms() {
    const now = new Date();

    const postedRooms = getPostedRooms()
        .filter(room => !room.isHidden && (!room.expiredAt || new Date(room.expiredAt) >= now))
        .map((room, index) => ({
            id: 1000 + index,
            title: room.title,
            type: room.type || "Phòng trọ",
            area: room.area,
            price: Number(room.price),
            address: room.address,
            size: room.size,
            desc: room.desc,
            ownerName: room.owner,
            ownerPhone: room.phone,
            folder: getRoomFolder(Number(room.price)),
            coverImage: room.previewImage || `${BASE_PATH}/${getRoomFolder(Number(room.price))}/1.jpg`,
            galleryImages: room.previewImages || getGalleryImages(getRoomFolder(Number(room.price)), index + 1),
            packageBadge: room.packageName || "Cơ bản",
            priorityScore: room.packageName === "Premium" ? 5 : room.packageName === "Nổi bật" ? 4 : 3,
            available: room.available !== false,
            ownerEmail: room.ownerEmail,
            postedAt: room.createdAt,
            expiredAt: room.expiredAt,
            views: room.views || 0,
            saves: room.saves || 0,
            asks: room.asks || 0,
            responseTime: room.responseTime || "15 phút"
        }));

    return [...postedRooms, ...roomsData].sort((a, b) => b.priorityScore - a.priorityScore || (b.views || 0) - (a.views || 0));
}

function updateAuthNav() {
    const authNav = document.getElementById("authNav");
    if (!authNav) return;

    const user = getCurrentUser();

    if (!user) {
        authNav.innerHTML = `
            <a href="login.html">Đăng nhập</a>
            <a href="register.html">Đăng ký</a>
        `;
        return;
    }

    authNav.innerHTML = `
        <span class="user-greeting">Xin chào, ${user.name}</span>
        <span class="user-role-badge">${getRoleLabel(user.role)}</span>
        <span class="user-tier-badge">Hạng ${user.loyaltyTier || getLoyaltyTier(user.points || 0)}</span>
        <span class="user-points">${user.points || 0} điểm</span>
        <span class="user-balance">Số dư: ${formatPrice(user.balance || 0)} VNĐ</span>
        <a href="profile.html">Hồ sơ</a>
        <a href="wallet.html">Ví tài khoản</a>
        <a href="transactions.html">Lịch sử</a>
        <a href="#" id="logoutBtn">Đăng xuất</a>
    `;

    document.getElementById("logoutBtn").addEventListener("click", function (e) {
        e.preventDefault();
        logout();
    });
}

function renderDashboardStrip() {
    const strip = document.getElementById("dashboardStrip");
    if (!strip) return;

    const user = getCurrentUser();

    if (!isAdmin(user)) {
        strip.innerHTML = "";
        return;
    }

    const postedRooms = getPostedRooms();
    const platformRevenue = JSON.parse(localStorage.getItem("sosvel_platform_revenue")) || 0;
    const packageRevenue = JSON.parse(localStorage.getItem("sosvel_package_revenue")) || 0;
    const totalTopup = JSON.parse(localStorage.getItem("sosvel_platform_topup")) || 0;

    strip.innerHTML = `
        <div class="stat-card">
            <span>Tổng phòng đã đăng</span>
            <strong>${postedRooms.length}</strong>
        </div>
        <div class="stat-card">
            <span>Tổng nạp vào hệ thống</span>
            <strong>${formatPrice(totalTopup)} VNĐ</strong>
        </div>
        <div class="stat-card">
            <span>Doanh thu hoa hồng</span>
            <strong>${formatPrice(platformRevenue)} VNĐ</strong>
        </div>
        <div class="stat-card">
            <span>Doanh thu gói dịch vụ</span>
            <strong>${formatPrice(packageRevenue)} VNĐ</strong>
        </div>
    `;
}

function renderFavoriteBar() {
    const bar = document.getElementById("favoriteBar");
    if (!bar) return;

    const user = getCurrentUser();
    if (!user) {
        bar.innerHTML = "";
        return;
    }

    const favorites = getFavoriteRooms();
    bar.innerHTML = favorites.length
        ? `<div class="info-strip">Bạn đã lưu ${favorites.length} phòng yêu thích.</div>`
        : `<div class="info-strip">Bạn chưa lưu phòng yêu thích nào.</div>`;
}

function updatePrice() {
    const price = parseInt(document.getElementById("priceInput").value, 10);
    document.getElementById("priceValue").textContent = price >= 5000000 ? "5.000.000+" : formatPrice(price);
}

function getSizeNumber(sizeText) {
    return parseInt(String(sizeText).replace(/[^0-9]/g, ""), 10) || 0;
}

function filterRooms() {
    const allRooms = getAllRooms();
    const area = document.getElementById("areaInput").value;
    const type = document.getElementById("typeInput").value;
    const minSize = parseInt(document.getElementById("minSizeInput").value, 10);
    const maxPrice = parseInt(document.getElementById("priceInput").value, 10);

    filteredRooms = allRooms.filter(room => {
        const okArea = !area || room.area === area;
        const okType = !type || room.type === type;
        const okSize = getSizeNumber(room.size) >= minSize;
        const okPrice = room.price <= maxPrice;
        return okArea && okType && okSize && okPrice;
    });

    currentPage = 1;
    renderRooms();
    renderPagination();

    if (!filteredRooms.length) {
        document.getElementById("roomContainer").innerHTML = `
            <div class="empty-state">
                <h3>Không tìm thấy phòng phù hợp</h3>
                <p>Hãy thử nới rộng khu vực, loại phòng hoặc ngân sách tìm kiếm.</p>
            </div>
        `;
    }
}

function renderRooms() {
    const container = document.getElementById("roomContainer");
    container.innerHTML = "";

    const start = (currentPage - 1) * roomsPerPage;
    const end = start + roomsPerPage;
    const pageRooms = filteredRooms.slice(start, end);
    const favorites = getFavoriteRooms();

    pageRooms.forEach(room => {
        const isFavorite = favorites.includes(room.id);
        const div = document.createElement("div");
        div.className = "room-card";

        div.innerHTML = `
            <img src="${room.coverImage}" alt="Phòng trọ">
            <div class="room-info">
                <div class="room-topline">
                    <span class="room-area-badge">${room.area}</span>
                    <span class="price-badge">${getPriceTag(room.price)}</span>
                </div>

                <div class="room-meta-row">
                    <span class="package-badge">${room.packageBadge}</span>
                    <span class="type-badge">${room.type}</span>
                    <span class="status-pill ${room.available ? "active" : "expired"}">${room.available ? "Còn phòng" : "Hết phòng"}</span>
                </div>

                <h3>${room.title}</h3>
                <p class="room-price-main">${formatPrice(room.price)} VNĐ / tháng</p>
                <p>📍 ${room.address}</p>
                <p>📐 ${room.size}</p>
                <p>👁️ ${room.views || 0} lượt xem • 💾 ${room.saves || 0} lượt lưu</p>

                <div class="room-card-actions">
                    <button class="favorite-toggle ${isFavorite ? "active" : ""}" type="button">❤</button>
                    <button class="detail-btn" type="button">Xem chi tiết</button>
                </div>
            </div>
        `;

        div.querySelector("img").onerror = function () {
            this.src = `${BASE_PATH}/${room.folder}/2.jpg`;
        };

        div.querySelector(".detail-btn").addEventListener("click", function (e) {
            e.stopPropagation();
            openRoomDetail(room.id);
        });

        div.querySelector(".favorite-toggle").addEventListener("click", function (e) {
            e.stopPropagation();
            if (!requireLogin()) return;
            toggleFavorite(room.id);
            filterRooms();
        });

        div.addEventListener("click", function () {
            openRoomDetail(room.id);
        });

        container.appendChild(div);
    });
}

function renderPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const total = Math.ceil(filteredRooms.length / roomsPerPage);
    if (total <= 1) return;

    if (currentPage > 1) {
        const prev = document.createElement("button");
        prev.textContent = "Trước";
        prev.className = "page-btn";
        prev.onclick = function () {
            currentPage--;
            renderRooms();
            renderPagination();
        };
        pagination.appendChild(prev);
    }

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.className = "page-btn";
            if (i === currentPage) btn.classList.add("active");
            btn.onclick = function () {
                currentPage = i;
                renderRooms();
                renderPagination();
            };
            pagination.appendChild(btn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement("span");
            dots.className = "page-dots";
            dots.textContent = "...";
            pagination.appendChild(dots);
        }
    }

    if (currentPage < total) {
        const next = document.createElement("button");
        next.textContent = "Tiếp";
        next.className = "page-btn";
        next.onclick = function () {
            currentPage++;
            renderRooms();
            renderPagination();
        };
        pagination.appendChild(next);
    }
}

function increaseRoomView(room) {
    room.views = (room.views || 0) + 1;

    if (room.ownerEmail) {
        const postedRooms = getPostedRooms();
        const target = postedRooms.find(r => r.ownerEmail === room.ownerEmail && r.title === room.title);
        if (target) {
            target.views = room.views;
            savePostedRooms(postedRooms);
        }
    }
}

function renderListingProfile(room) {
    const box = document.getElementById("listingProfile");
    if (!box) return;

    const postedDate = room.postedAt ? new Date(room.postedAt).toLocaleDateString("vi-VN") : "N/A";
    const expiredText = room.expiredAt ? new Date(room.expiredAt).toLocaleDateString("vi-VN") : "Không giới hạn";

    box.innerHTML = `
        <div class="listing-card-grid">
            <div><strong>Ngày đăng:</strong> ${postedDate}</div>
            <div><strong>Gói hiển thị:</strong> ${room.packageBadge}</div>
            <div><strong>Lượt xem:</strong> ${room.views || 0}</div>
            <div><strong>Lượt lưu:</strong> ${room.saves || 0}</div>
            <div><strong>Lượt hỏi:</strong> ${room.asks || 0}</div>
            <div><strong>Phản hồi TB:</strong> ${room.responseTime || "15 phút"}</div>
            <div><strong>Hạn hiển thị:</strong> ${expiredText}</div>
            <div><strong>Ưu tiên:</strong> Mức ${room.priorityScore || 1}</div>
        </div>
    `;
}

function openRoomDetail(id) {
    const room = getAllRooms().find(r => r.id === id);
    if (!room) return;

    currentRoom = room;
    increaseRoomView(room);

    document.getElementById("modalTitle").textContent = room.title;
    document.getElementById("modalPrice").textContent = `💰 Giá: ${formatPrice(room.price)} VNĐ`;
    document.getElementById("modalArea").textContent = `📍 Khu vực: ${room.area}`;
    document.getElementById("modalAddress").textContent = `🏠 Địa chỉ: ${room.address}`;
    document.getElementById("modalSize").textContent = `📐 Diện tích: ${room.size}`;
    document.getElementById("modalType").textContent = `🏷️ Loại phòng: ${room.type}`;
    document.getElementById("modalDesc").textContent = `📝 ${room.desc}`;
    document.getElementById("favoriteBtn").textContent = getFavoriteRooms().includes(room.id) ? "Bỏ lưu phòng" : "Lưu phòng";

    renderListingProfile(room);

    const mainPreview = document.getElementById("mainPreview");
    const thumbGrid = document.getElementById("thumbGrid");

    mainPreview.src = room.galleryImages[0];
    mainPreview.onerror = function () {
        this.src = `${BASE_PATH}/${room.folder}/12.jpg`;
    };

    thumbGrid.innerHTML = "";
    room.galleryImages.forEach(img => {
        const el = document.createElement("img");
        el.src = img;
        el.className = "thumb-item";
        el.onerror = function () {
            this.src = `${BASE_PATH}/${room.folder}/12.jpg`;
        };
        el.onclick = function () {
            mainPreview.src = img;
        };
        thumbGrid.appendChild(el);
    });

    document.getElementById("roomModal").classList.remove("hidden");
}

function closeRoomDetail() {
    document.getElementById("roomModal").classList.add("hidden");
}

function showNotice(title, text) {
    document.getElementById("noticeTitle").textContent = title;
    document.getElementById("noticeText").textContent = text;
    document.getElementById("noticeModal").classList.remove("hidden");
}

function getAutoReply(type) {
    if (!currentRoom) return "";
    if (type === "included") return "Giá phòng hiện chưa bao gồm điện nước. Chi phí điện nước sẽ được tính minh bạch theo mức sử dụng thực tế.";
    if (type === "available") return `Phòng ${currentRoom.title} hiện ${currentRoom.available ? "vẫn còn trống" : "đã hết phòng"}.`;
    if (type === "capacity") return "Phòng này phù hợp cho 2 đến 3 người ở, tùy theo nhu cầu sinh hoạt.";
    return "SosVel sẽ phản hồi bạn sớm nhất có thể.";
}

function openChatBox() {
    if (!currentRoom) return;

    document.getElementById("chatRoomTitle").textContent = currentRoom.title;
    document.getElementById("chatOwnerName").textContent = `Chủ trọ: ${currentRoom.ownerName}`;

    if (!chatData[currentRoom.id]) {
        chatData[currentRoom.id] = [
            { sender: "owner", text: "Xin chào, bạn có thể chọn câu hỏi bên dưới để được hỗ trợ nhanh." }
        ];
    }

    if (!askedQuestions[currentRoom.id]) {
        askedQuestions[currentRoom.id] = {
            included: false,
            available: false,
            capacity: false,
            done: false
        };
    }

    renderChatMessages();

    const state = askedQuestions[currentRoom.id];
    document.getElementById("quickQuestions").classList.remove("hidden");
    document.getElementById("moreQuestionWrap").classList.toggle("hidden", !state.done);

    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.disabled = !!state[btn.dataset.question];
    });

    document.getElementById("chatBox").classList.remove("hidden");
}

function renderChatMessages() {
    if (!currentRoom) return;

    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    (chatData[currentRoom.id] || []).forEach(msg => {
        const div = document.createElement("div");
        div.className = `message ${msg.sender}`;
        div.textContent = msg.text;
        chatMessages.appendChild(div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleQuickQuestion(type, buttonEl) {
    if (!currentRoom) return;

    const roomId = currentRoom.id;
    const state = askedQuestions[roomId];
    if (!state || state[type]) return;

    const questionMap = {
        included: "Giá đã bao gồm điện nước chưa?",
        available: "Phòng này còn không?",
        capacity: "Bao nhiêu người ở được?"
    };

    chatData[roomId].push({ sender: "user", text: questionMap[type] });
    chatData[roomId].push({ sender: "owner", text: getAutoReply(type) });

    state[type] = true;
    if (buttonEl) buttonEl.disabled = true;

    renderChatMessages();

    if (state.included && state.available && state.capacity && !state.done) {
        state.done = true;
        document.getElementById("moreQuestionWrap").classList.remove("hidden");
    }
}

function handleMoreQuestion() {
    if (!currentRoom) return;

    const roomId = currentRoom.id;
    chatData[roomId].push({ sender: "user", text: "Tôi muốn được tư vấn thêm." });
    chatData[roomId].push({ sender: "owner", text: "Cảm ơn bạn. Yêu cầu của bạn đã được ghi nhận, chủ trọ sẽ phản hồi sớm." });

    renderChatMessages();
    document.getElementById("moreQuestionWrap").classList.add("hidden");
    document.getElementById("quickQuestions").classList.add("hidden");
}

function formatContractDate(date = new Date()) {
    return date.toLocaleDateString("vi-VN");
}

function renderContractTemplate() {
    const type = document.getElementById("contractTemplateSelect").value;
    const title = document.querySelector(".contract-header h2");

    if (type === "deposit") title.textContent = "HỢP ĐỒNG ĐẶT CỌC CHO THUÊ NHÀ";
    if (type === "rent") title.textContent = "HỢP ĐỒNG THUÊ PHÒNG";
    if (type === "receipt") title.textContent = "BIÊN NHẬN THANH TOÁN";
}

function renderPaymentSchedule() {
    if (!currentRoom) return;

    const monthly = currentRoom.price;
    const box = document.getElementById("paymentScheduleBox");

    box.innerHTML = `
        <h3>Lịch thanh toán tiền thuê</h3>
        <div class="payment-schedule-grid">
            <div>Tháng 1: ${formatPrice(monthly)} VNĐ • Chưa thanh toán</div>
            <div>Tháng 2: ${formatPrice(monthly)} VNĐ • Chưa thanh toán</div>
            <div>Tháng 3: ${formatPrice(monthly)} VNĐ • Chưa thanh toán</div>
        </div>
    `;
}

function initSignaturePad() {
    signatureCanvas = document.getElementById("signaturePad");
    if (!signatureCanvas) return;

    signatureCtx = signatureCanvas.getContext("2d");
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = "round";
    signatureCtx.strokeStyle = "#111827";

    function getPos(e) {
        const rect = signatureCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: (clientX - rect.left) * (signatureCanvas.width / rect.width),
            y: (clientY - rect.top) * (signatureCanvas.height / rect.height)
        };
    }

    function startDraw(e) {
        isDrawing = true;
        const pos = getPos(e);
        signatureCtx.beginPath();
        signatureCtx.moveTo(pos.x, pos.y);
        hasSigned = true;
        e.preventDefault();
    }

    function draw(e) {
        if (!isDrawing) return;
        const pos = getPos(e);
        signatureCtx.lineTo(pos.x, pos.y);
        signatureCtx.stroke();
        e.preventDefault();
    }

    function endDraw() {
        isDrawing = false;
    }

    signatureCanvas.addEventListener("mousedown", startDraw);
    signatureCanvas.addEventListener("mousemove", draw);
    signatureCanvas.addEventListener("mouseup", endDraw);
    signatureCanvas.addEventListener("mouseleave", endDraw);
    signatureCanvas.addEventListener("touchstart", startDraw, { passive: false });
    signatureCanvas.addEventListener("touchmove", draw, { passive: false });
    signatureCanvas.addEventListener("touchend", endDraw);

    document.getElementById("clearSignature").addEventListener("click", function () {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        hasSigned = false;
    });
}

function fillContractData() {
    if (!currentRoom) return;

    const user = getCurrentUser();
    if (!user) return;

    document.getElementById("contractDate").textContent = formatContractDate();
    document.getElementById("tenantName").textContent = user.name;
    document.getElementById("tenantDob").textContent = user.dob || "-";
    document.getElementById("tenantCccd").textContent = user.cccd || "-";
    document.getElementById("tenantPhone").textContent = user.phone || "-";
    document.getElementById("ownerName").textContent = currentRoom.ownerName;
    document.getElementById("ownerPhone").textContent = currentRoom.ownerPhone;
    document.getElementById("contractRoomName").textContent = currentRoom.title;
    document.getElementById("contractRoomAddress").textContent = currentRoom.address;
    document.getElementById("depositAmount").textContent = `${formatPrice(Math.round(currentRoom.price / 2))} VNĐ`;

    renderPaymentSchedule();
    renderContractTemplate();
}

function openContractModal() {
    if (!currentRoom) return;
    const user = getCurrentUser();
    if (!user) return;

    fillContractData();
    document.getElementById("contractMessage").textContent = "";
    document.querySelectorAll(".deposit-check").forEach(cb => cb.checked = false);
    document.getElementById("contractModal").classList.remove("hidden");

    if (signatureCtx) {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        hasSigned = false;
    }
}

function closeContractModal() {
    document.getElementById("contractModal").classList.add("hidden");
}

function downloadContractPdf() {
    const user = getCurrentUser();
    if (!user || !currentRoom) return;

    const printWindow = window.open("", "_blank");
    const contractHtml = document.getElementById("contractDocument").innerHTML;

    printWindow.document.write(`
        <html>
        <head>
            <title>Hop dong</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.6; }
                h2, h3, p { margin: 6px 0; }
                .contract-header { text-align:center; margin-bottom:20px; }
                .signature-section { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:28px; }
                .signature-actions, .contract-toolbar { display:none; }
                .owner-sign-placeholder{ height:160px; border:1px dashed #999; display:flex; align-items:center; justify-content:center; }
            </style>
        </head>
        <body>${contractHtml}</body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function validatePreDepositChecklist() {
    return Array.from(document.querySelectorAll(".deposit-check")).every(cb => cb.checked);
}

function cancelMockBooking() {
    document.getElementById("contractMessage").textContent = "Giao dịch mô phỏng đã được hủy.";

    if (typeof addTransaction === "function") {
        addTransaction({
            type: "cancel",
            amount: 0,
            direction: "out",
            description: `Hủy giao dịch mô phỏng cho ${currentRoom.title}`
        });
    }

    showNotice("Đã hủy giao dịch", "Giao dịch đặt cọc mô phỏng đã được hủy thành công.");
}

function openEngagementModal() {
    if (!currentRoom) return;

    const data = getRoomEngagements();
    const roomData = data[currentRoom.id] || {
        reactions: { like: 0, love: 0, wow: 0 },
        comments: []
    };

    document.getElementById("reactionSummary").innerHTML =
        `👍 ${roomData.reactions.like} • ❤️ ${roomData.reactions.love} • 😮 ${roomData.reactions.wow}`;

    document.getElementById("commentList").innerHTML = roomData.comments.length
        ? roomData.comments.map(item => `
            <div class="comment-item">
                <strong>${item.author}</strong>
                <p>${item.text}</p>
            </div>
        `).join("")
        : `<div class="info-strip">Chưa có bình luận nào.</div>`;

    document.getElementById("engagementModal").classList.remove("hidden");
}

function submitReaction(type) {
    if (!requireLogin()) return;

    const data = getRoomEngagements();
    if (!data[currentRoom.id]) {
        data[currentRoom.id] = {
            reactions: { like: 0, love: 0, wow: 0 },
            comments: []
        };
    }

    data[currentRoom.id].reactions[type] += 1;
    saveRoomEngagements(data);
    addPoints(2, "Tương tác bài viết");
    openEngagementModal();
}

function submitComment() {
    if (!requireLogin()) return;

    const text = document.getElementById("commentInput").value.trim();
    if (!text) return;

    const user = getCurrentUser();
    const data = getRoomEngagements();

    if (!data[currentRoom.id]) {
        data[currentRoom.id] = {
            reactions: { like: 0, love: 0, wow: 0 },
            comments: []
        };
    }

    data[currentRoom.id].comments.unshift({
        author: user.name,
        text,
        createdAt: new Date().toISOString()
    });

    saveRoomEngagements(data);
    addPoints(3, "Bình luận bài viết");
    document.getElementById("commentInput").value = "";
    openEngagementModal();
}

function saveCurrentSearch(name) {
    const data = getSavedSearches();

    data.unshift({
        id: Date.now(),
        name,
        filters: {
            area: document.getElementById("areaInput").value,
            type: document.getElementById("typeInput").value,
            minSize: document.getElementById("minSizeInput").value,
            price: document.getElementById("priceInput").value
        }
    });

    saveSavedSearches(data);
    renderSavedSearches();
    addPoints(5, "Lưu tìm kiếm yêu thích");
}

function applySavedSearch(item) {
    document.getElementById("areaInput").value = item.filters.area;
    document.getElementById("typeInput").value = item.filters.type;
    document.getElementById("minSizeInput").value = item.filters.minSize;
    document.getElementById("priceInput").value = item.filters.price;
    updatePrice();
    filterRooms();
    document.getElementById("savedSearchModal").classList.add("hidden");
}

function renderSavedSearches() {
    const list = document.getElementById("savedSearchList");
    const data = getSavedSearches();

    if (!list) return;

    if (!data.length) {
        list.innerHTML = `<div class="info-strip">Chưa có bộ lọc nào được lưu.</div>`;
        return;
    }

    list.innerHTML = data.map(item => `
        <div class="transaction-item">
            <div>
                <strong>${item.name}</strong>
                <p>
                    Khu vực: ${item.filters.area || "Tất cả"} |
                    Loại: ${item.filters.type || "Tất cả"} |
                    Diện tích tối thiểu: ${item.filters.minSize || 0}m² |
                    Giá tối đa: ${Number(item.filters.price || 5000000).toLocaleString("vi-VN")} VNĐ
                </p>
            </div>
            <div class="room-card-actions">
                <button class="secondary-btn apply-saved-search" data-id="${item.id}">Áp dụng</button>
                <button class="secondary-btn delete-saved-search" data-id="${item.id}">Xóa</button>
            </div>
        </div>
    `).join("");

    list.querySelectorAll(".apply-saved-search").forEach(btn => {
        btn.addEventListener("click", function () {
            const item = data.find(x => String(x.id) === this.dataset.id);
            if (item) applySavedSearch(item);
        });
    });

    list.querySelectorAll(".delete-saved-search").forEach(btn => {
        btn.addEventListener("click", function () {
            const newData = data.filter(x => String(x.id) !== this.dataset.id);
            saveSavedSearches(newData);
            renderSavedSearches();
        });
    });
}

function renderSharedCostEstimate() {
    const people = parseInt(document.getElementById("roommatePeople").value || 2, 10);
    const basePrice = currentRoom ? currentRoom.price : 3000000;
    const monthly = Math.round(basePrice / Math.max(people, 1));

    document.getElementById("sharedCostEstimate").innerHTML = `
        <p><strong>Tính tiền ở ghép:</strong> ${people} người</p>
        <p>Mỗi người dự kiến khoảng <strong>${formatPrice(monthly)} VNĐ / tháng</strong> chưa gồm điện nước.</p>
    `;
}

function submitRoommateRequest() {
    if (!requireLogin()) return;

    const user = getCurrentUser();
    const requests = getRoommateRequests();

    requests.unshift({
        roomId: currentRoom ? currentRoom.id : null,
        roomTitle: currentRoom ? currentRoom.title : "Nhu cầu chung",
        userEmail: user.email,
        name: document.getElementById("roommateName").value.trim(),
        gender: document.getElementById("roommateGender").value,
        budget: Number(document.getElementById("roommateBudget").value),
        people: Number(document.getElementById("roommatePeople").value),
        note: document.getElementById("roommateNote").value.trim(),
        createdAt: new Date().toISOString()
    });

    saveRoommateRequests(requests);
    addPoints(10, "Tạo nhu cầu ghép người ở");

    document.getElementById("roommateMessage").style.color = "#1b5edb";
    document.getElementById("roommateMessage").textContent = "Đã lưu nhu cầu ghép người ở thành công.";
}

document.addEventListener("DOMContentLoaded", function () {
    filteredRooms = [...getAllRooms()];

    updateAuthNav();
    updatePrice();
    renderDashboardStrip();
    renderFavoriteBar();
    renderRooms();
    renderPagination();
    initSignaturePad();
    renderSavedSearches();
    renderRewardWidget();

    document.getElementById("priceInput").addEventListener("input", updatePrice);
    document.getElementById("searchBtn").addEventListener("click", filterRooms);
    document.getElementById("areaInput").addEventListener("change", filterRooms);
    document.getElementById("typeInput").addEventListener("change", filterRooms);
    document.getElementById("minSizeInput").addEventListener("change", filterRooms);

    document.getElementById("modalClose").addEventListener("click", closeRoomDetail);
    document.getElementById("modalOverlay").addEventListener("click", closeRoomDetail);

    document.getElementById("favoriteBtn").addEventListener("click", function () {
        if (!requireLogin()) return;
        toggleFavorite(currentRoom.id);
        openRoomDetail(currentRoom.id);
        filterRooms();
    });

    document.getElementById("shareBtn").addEventListener("click", function () {
        if (!currentRoom) return;
        navigator.clipboard.writeText(getShareLink(currentRoom.id));
        addPoints(2, "Chia sẻ phòng");
        showNotice("Đã sao chép liên kết", "Liên kết chia sẻ phòng đã được sao chép vào clipboard.");
    });

    document.getElementById("engagementBtn").addEventListener("click", function () {
        if (!currentRoom) return;
        openEngagementModal();
    });

    document.getElementById("contactBtn").addEventListener("click", function () {
        if (!requireLogin()) return;
        closeRoomDetail();
        openChatBox();
    });

    document.getElementById("contractBtn").addEventListener("click", function () {
        if (!requireLogin()) return;
        closeRoomDetail();
        openContractModal();
    });

    document.getElementById("contractTemplateSelect").addEventListener("change", renderContractTemplate);
    document.getElementById("contractClose").addEventListener("click", closeContractModal);
    document.getElementById("contractOverlay").addEventListener("click", closeContractModal);
    document.getElementById("downloadPdfBtn").addEventListener("click", downloadContractPdf);
    document.getElementById("cancelBookingBtn").addEventListener("click", cancelMockBooking);

    document.getElementById("confirmContract").addEventListener("click", function () {
        if (!requireLogin()) return;

        if (!validatePreDepositChecklist()) {
            document.getElementById("contractMessage").textContent = "Bạn cần hoàn tất checklist tư vấn trước khi cọc.";
            return;
        }

        if (!hasSigned) {
            document.getElementById("contractMessage").textContent = "Bạn cần ký tên điện tử trước khi xác nhận hợp đồng.";
            return;
        }

        const platformRevenue = JSON.parse(localStorage.getItem("sosvel_platform_revenue")) || 0;
        const commission = Math.round((currentRoom.price / 2) * 0.05);
        localStorage.setItem("sosvel_platform_revenue", JSON.stringify(platformRevenue + commission));

        if (typeof addTransaction === "function") {
            addTransaction({
                type: "booking",
                amount: Math.round(currentRoom.price / 2),
                direction: "out",
                description: `Đặt cọc phòng ${currentRoom.title}`
            });
        }

        addPoints(20, "Hoàn tất đặt cọc mô phỏng");
        document.getElementById("contractMessage").textContent =
            "Hợp đồng cọc online đã được xác nhận thành công. Chủ trọ sẽ liên hệ lại với bạn sớm.";
        renderDashboardStrip();
        showNotice("Ký hợp đồng thành công", "Giao dịch đặt cọc đã được ghi nhận. Nền tảng đã cộng hoa hồng mô phỏng vào hệ thống.");
    });

    document.getElementById("chatClose").addEventListener("click", function () {
        document.getElementById("chatBox").classList.add("hidden");
    });

    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            handleQuickQuestion(this.dataset.question, this);
        });
    });

    document.getElementById("moreQuestionBtn").addEventListener("click", handleMoreQuestion);

    document.getElementById("contactNavBtn").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("contactModal").classList.remove("hidden");
    });

    document.getElementById("contactOverlay").addEventListener("click", function () {
        document.getElementById("contactModal").classList.add("hidden");
    });

    document.getElementById("contactClose").addEventListener("click", function () {
        document.getElementById("contactModal").classList.add("hidden");
    });

    document.getElementById("noticeOverlay").addEventListener("click", function () {
        document.getElementById("noticeModal").classList.add("hidden");
    });

    document.getElementById("noticeClose").addEventListener("click", function () {
        document.getElementById("noticeModal").classList.add("hidden");
    });

    document.getElementById("savedSearchBtn").addEventListener("click", function (e) {
        e.preventDefault();
        if (!requireLogin()) return;
        renderSavedSearches();
        document.getElementById("savedSearchModal").classList.remove("hidden");
    });

    document.getElementById("savedSearchOverlay").addEventListener("click", function () {
        document.getElementById("savedSearchModal").classList.add("hidden");
    });

    document.getElementById("savedSearchClose").addEventListener("click", function () {
        document.getElementById("savedSearchModal").classList.add("hidden");
    });

    document.getElementById("savedSearchForm").addEventListener("submit", function (e) {
        e.preventDefault();
        saveCurrentSearch(document.getElementById("savedSearchName").value.trim());
        document.getElementById("savedSearchName").value = "";
    });

    document.getElementById("roommateNavBtn").addEventListener("click", function (e) {
        e.preventDefault();
        if (!requireLogin()) return;
        renderSharedCostEstimate();
        document.getElementById("roommateModal").classList.remove("hidden");
    });

    document.getElementById("roommateOverlay").addEventListener("click", function () {
        document.getElementById("roommateModal").classList.add("hidden");
    });

    document.getElementById("roommateClose").addEventListener("click", function () {
        document.getElementById("roommateModal").classList.add("hidden");
    });

    document.getElementById("roommatePeople").addEventListener("input", renderSharedCostEstimate);
    document.getElementById("roommateForm").addEventListener("submit", function (e) {
        e.preventDefault();
        submitRoommateRequest();
    });

    document.getElementById("engagementOverlay").addEventListener("click", function () {
        document.getElementById("engagementModal").classList.add("hidden");
    });

    document.getElementById("engagementClose").addEventListener("click", function () {
        document.getElementById("engagementModal").classList.add("hidden");
    });

    document.querySelectorAll(".react-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            submitReaction(this.dataset.react);
        });
    });

    document.getElementById("commentForm").addEventListener("submit", function (e) {
        e.preventDefault();
        submitComment();
    });

    const rewardToggle = document.getElementById("rewardToggle");
    const rewardPanel = document.getElementById("rewardPanel");
    const dailyCheckinBtn = document.getElementById("dailyCheckinBtn");

    if (rewardToggle && rewardPanel) {
        rewardToggle.addEventListener("click", function () {
            rewardPanel.classList.toggle("hidden");
        });
    }

    if (dailyCheckinBtn) {
        dailyCheckinBtn.addEventListener("click", doDailyCheckin);
    }
});
