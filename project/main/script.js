const areas = ["Đông Hòa", "Dĩ An", "Thủ Đức", "Suối Tiên", "Linh Trung", "Bình Thọ"];

const streets = [
    "Đường số 1",
    "Đường số 5",
    "Đường số 7",
    "Tân Lập",
    "Thống Nhất",
    "Lê Văn Việt",
    "Kha Vạn Cân",
    "Hoàng Diệu 2"
];

const ownerNames = [
    "Anh Minh",
    "Chị Hân",
    "Anh Phúc",
    "Chị Vy",
    "Anh Tùng",
    "Chị Trang"
];

const folderMap = {
    low: "tu1den2trieu",
    mid: "tu2den3trieu",
    high: "tren3trieu"
};

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
    return price.toLocaleString("vi-VN");
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

function createRoom(id, title, area, price, address, size, desc, coverIndex) {
    const folder = getRoomFolder(price);

    return {
        id,
        title,
        area,
        price,
        address,
        size,
        desc,
        ownerName: randomItem(ownerNames),
        ownerPhone: "0901 234 567",
        folder,
        coverImage: getCoverImage(folder, coverIndex),
        galleryImages: getGalleryImages(folder, id)
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

function updateAuthNav() {
    const authNav = document.getElementById("authNav");
    if (!authNav || typeof getCurrentUser !== "function") return;

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
        <a href="#" id="logoutBtn">Đăng xuất</a>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        logout();
    });
}

function updatePrice() {
    const priceInput = document.getElementById("priceInput");
    const priceValue = document.getElementById("priceValue");
    const price = parseInt(priceInput.value, 10);

    if (price >= 5000000) {
        priceValue.textContent = "5.000.000+";
    } else {
        priceValue.textContent = formatPrice(price);
    }
}

function filterRooms() {
    const area = document.getElementById("areaInput").value;
    const maxPrice = parseInt(document.getElementById("priceInput").value, 10);

    filteredRooms = roomsData.filter(room => {
        const okArea = !area || room.area === area;
        const okPrice = room.price <= maxPrice;
        return okArea && okPrice;
    });

    currentPage = 1;
    renderRooms();
    renderPagination();
}

function renderRooms() {
    const container = document.getElementById("roomContainer");
    container.innerHTML = "";

    const start = (currentPage - 1) * roomsPerPage;
    const end = start + roomsPerPage;
    const pageRooms = filteredRooms.slice(start, end);

    pageRooms.forEach(room => {
        const div = document.createElement("div");
        div.className = "room-card";
        div.dataset.id = room.id;

        div.innerHTML = `
            <img src="${room.coverImage}" alt="Phòng trọ">
            <div class="room-info">
                <h3>${room.title}</h3>
                <p>📍 ${room.area}</p>
                <p>💰 ${formatPrice(room.price)} VNĐ</p>
                <p>📐 ${room.size}</p>
                <span class="price-badge">${getPriceTag(room.price)}</span>
                <button class="detail-btn" type="button">Xem chi tiết</button>
            </div>
        `;

        const img = div.querySelector("img");
        img.onerror = function () {
            this.src = `${BASE_PATH}/${room.folder}/2.jpg`;
        };

        div.querySelector(".detail-btn").addEventListener("click", function (e) {
            e.stopPropagation();
            openRoomDetail(room.id);
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
        if (
            i === 1 ||
            i === total ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
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
        } else if (
            i === currentPage - 2 ||
            i === currentPage + 2
        ) {
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

function openRoomDetail(id) {
    const room = roomsData.find(r => r.id === id);
    if (!room) return;

    currentRoom = room;

    document.getElementById("modalTitle").textContent = room.title;
    document.getElementById("modalPrice").textContent = `💰 Giá: ${formatPrice(room.price)} VNĐ`;
    document.getElementById("modalArea").textContent = `📍 Khu vực: ${room.area}`;
    document.getElementById("modalAddress").textContent = `🏠 Địa chỉ: ${room.address}`;
    document.getElementById("modalSize").textContent = `📐 Diện tích: ${room.size}`;
    document.getElementById("modalDesc").textContent = `📝 ${room.desc}`;

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

function getAutoReply(type) {
    if (!currentRoom) return "";

    if (type === "included") {
        return "Giá phòng hiện chưa bao gồm điện nước. Chi phí điện nước sẽ được tính minh bạch theo mức sử dụng thực tế.";
    }

    if (type === "available") {
        return `Phòng ${currentRoom.title} hiện vẫn còn trống và bạn có thể liên hệ để giữ chỗ sớm.`;
    }

    if (type === "capacity") {
        return "Phòng này phù hợp cho 2 đến 3 người ở, tùy theo nhu cầu sinh hoạt.";
    }

    return "SosVel sẽ phản hồi bạn sớm nhất có thể.";
}

function openChatBox() {
    if (!currentRoom) return;

    const chatBox = document.getElementById("chatBox");
    const chatRoomTitle = document.getElementById("chatRoomTitle");
    const chatOwnerName = document.getElementById("chatOwnerName");
    const quickQuestions = document.getElementById("quickQuestions");
    const moreQuestionWrap = document.getElementById("moreQuestionWrap");

    chatRoomTitle.textContent = currentRoom.title;
    chatOwnerName.textContent = "Hỗ trợ tư vấn phòng trọ";

    chatData[currentRoom.id] = [
        {
            sender: "owner",
            text: "Xin chào, bạn có thể chọn câu hỏi bên dưới để được hỗ trợ nhanh."
        }
    ];

    askedQuestions[currentRoom.id] = {
        included: false,
        available: false,
        capacity: false,
        done: false
    };

    renderChatMessages();

    quickQuestions.classList.remove("hidden");
    moreQuestionWrap.classList.add("hidden");

    quickQuestions.querySelectorAll(".quick-btn").forEach(btn => {
        btn.disabled = false;
    });

    chatBox.classList.remove("hidden");
}

function renderChatMessages() {
    if (!currentRoom) return;

    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    const messages = chatData[currentRoom.id] || [];

    messages.forEach(msg => {
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

    chatData[roomId].push({
        sender: "user",
        text: questionMap[type]
    });

    chatData[roomId].push({
        sender: "owner",
        text: getAutoReply(type)
    });

    state[type] = true;

    if (buttonEl) {
        buttonEl.disabled = true;
    }

    renderChatMessages();

    if (state.included && state.available && state.capacity && !state.done) {
        state.done = true;
        document.getElementById("moreQuestionWrap").classList.remove("hidden");
    }
}

function handleMoreQuestion() {
    if (!currentRoom) return;

    const roomId = currentRoom.id;

    chatData[roomId].push({
        sender: "user",
        text: "Hỏi thêm"
    });

    chatData[roomId].push({
        sender: "owner",
        text: "Cảm ơn bạn, SosVel sẽ liên hệ trong 15 phút."
    });

    renderChatMessages();

    document.getElementById("moreQuestionWrap").classList.add("hidden");
    document.getElementById("quickQuestions").classList.add("hidden");
}

function formatContractDate(date = new Date()) {
    return date.toLocaleDateString("vi-VN");
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
    document.getElementById("tenantDob").textContent = user.dob;
    document.getElementById("tenantCccd").textContent = user.cccd;
    document.getElementById("tenantPhone").textContent = user.phone;

    document.getElementById("ownerName").textContent = currentRoom.ownerName;
    document.getElementById("ownerPhone").textContent = currentRoom.ownerPhone;
    document.getElementById("contractRoomName").textContent = currentRoom.title;
    document.getElementById("contractRoomAddress").textContent = currentRoom.address;
    document.getElementById("depositAmount").textContent =
        `${formatPrice(Math.round(currentRoom.price / 2))} VNĐ`;
}

function openContractModal() {
    if (!currentRoom) return;
    const user = getCurrentUser();
    if (!user) return;

    fillContractData();
    document.getElementById("contractMessage").textContent = "";
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
            <title>Hop dong dat coc</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.6; }
                h2, h3, p { margin: 6px 0; }
                .contract-header { text-align:center; margin-bottom:20px; }
                .signature-section { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-top:28px; }
                canvas { border:1px dashed #999; }
                .signature-actions, .contract-toolbar { display:none; }
                .owner-sign-placeholder{
                    height:160px; border:1px dashed #999; display:flex;
                    align-items:center; justify-content:center;
                }
            </style>
        </head>
        <body>${contractHtml}</body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

document.addEventListener("DOMContentLoaded", function () {
    filteredRooms = [...roomsData];

    updateAuthNav();
    updatePrice();
    renderRooms();
    renderPagination();
    initSignaturePad();

    document.getElementById("priceInput").addEventListener("input", updatePrice);
    document.getElementById("searchBtn").addEventListener("click", filterRooms);

    document.getElementById("modalClose").addEventListener("click", closeRoomDetail);
    document.getElementById("modalOverlay").addEventListener("click", closeRoomDetail);

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

    document.getElementById("contractClose").addEventListener("click", closeContractModal);
    document.getElementById("contractOverlay").addEventListener("click", closeContractModal);

    document.getElementById("downloadPdfBtn").addEventListener("click", downloadContractPdf);

    document.getElementById("confirmContract").addEventListener("click", function () {
        if (!requireLogin()) return;

        if (!hasSigned) {
            document.getElementById("contractMessage").textContent =
                "Bạn cần ký tên điện tử trước khi xác nhận hợp đồng.";
            return;
        }

        document.getElementById("contractMessage").textContent =
            "Hợp đồng cọc online đã được xác nhận thành công. Chủ trọ sẽ liên hệ lại với bạn sớm.";
    });

    document.getElementById("chatClose").addEventListener("click", function () {
        document.getElementById("chatBox").classList.add("hidden");
    });

    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const type = this.dataset.question;
            handleQuickQuestion(type, this);
        });
    });

    document.getElementById("moreQuestionBtn").addEventListener("click", handleMoreQuestion);
});
