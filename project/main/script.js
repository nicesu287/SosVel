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

// Chỉ lấy 3 ảnh chi tiết từ 12 -> 48
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

// 120 phòng
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

function openChatBox() {
    if (!currentRoom) return;

    const chatBox = document.getElementById("chatBox");
    const chatMessages = document.getElementById("chatMessages");
    const chatRoomTitle = document.getElementById("chatRoomTitle");
    const chatOwnerName = document.getElementById("chatOwnerName");

    chatRoomTitle.textContent = currentRoom.title;
    chatOwnerName.textContent = `${currentRoom.ownerName} • Chủ trọ`;

    if (!chatData[currentRoom.id]) {
        chatData[currentRoom.id] = [
            {
                sender: "owner",
                text: "Tôi có thể trao đổi gì thêm với bạn?"
            }
        ];
    }

    renderChatMessages();
    chatBox.classList.remove("hidden");
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderChatMessages() {
    if (!currentRoom) return;

    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";

    chatData[currentRoom.id].forEach(msg => {
        const div = document.createElement("div");
        div.className = `message ${msg.sender}`;
        div.textContent = msg.text;
        chatMessages.appendChild(div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    if (!currentRoom) return;

    const input = document.getElementById("chatInput");
    const text = input.value.trim();

    if (!text) return;

    chatData[currentRoom.id].push({
        sender: "user",
        text: text
    });

    input.value = "";
    renderChatMessages();

    setTimeout(() => {
        const replies = [
            "Dạ bạn có thể hỏi thêm về giá hoặc hợp đồng nhé.",
            "Phòng này hiện vẫn còn trống nhé bạn.",
            "Bạn muốn mình gửi thêm thông tin điện nước không?",
            "Nếu cần, mình có thể hẹn bạn qua xem phòng."
        ];

        chatData[currentRoom.id].push({
            sender: "owner",
            text: randomItem(replies)
        });

        renderChatMessages();
    }, 700);
}

function openContractModal() {
    if (!currentRoom) return;

    document.getElementById("contractRoomName").textContent = `Phòng: ${currentRoom.title}`;
    document.getElementById("contractRoomPrice").textContent = `Giá phòng: ${formatPrice(currentRoom.price)} VNĐ`;
    document.getElementById("depositAmount").value = `${formatPrice(Math.round(currentRoom.price / 2))} VNĐ`;
    document.getElementById("contractMessage").textContent = "";

    document.getElementById("contractModal").classList.remove("hidden");
}

function closeContractModal() {
    document.getElementById("contractModal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", function () {
    filteredRooms = [...roomsData];

    updatePrice();
    renderRooms();
    renderPagination();

    document.getElementById("priceInput").addEventListener("input", updatePrice);
    document.getElementById("searchBtn").addEventListener("click", filterRooms);

    document.getElementById("modalClose").addEventListener("click", closeRoomDetail);
    document.getElementById("modalOverlay").addEventListener("click", closeRoomDetail);

    document.getElementById("contactBtn").addEventListener("click", function () {
        closeRoomDetail();
        openChatBox();
    });

    document.getElementById("contractBtn").addEventListener("click", function () {
        openContractModal();
    });

    document.getElementById("contractClose").addEventListener("click", closeContractModal);
    document.getElementById("contractOverlay").addEventListener("click", closeContractModal);

    document.getElementById("contractForm").addEventListener("submit", function (e) {
        e.preventDefault();

        document.getElementById("contractMessage").textContent =
            "Yêu cầu cọc online đã được gửi thành công. Chủ trọ sẽ liên hệ lại với bạn sớm.";
    });

    document.getElementById("chatClose").addEventListener("click", function () {
        document.getElementById("chatBox").classList.add("hidden");
    });

    document.getElementById("sendChat").addEventListener("click", sendMessage);

    document.getElementById("chatInput").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});
