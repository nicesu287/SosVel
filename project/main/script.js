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

const folderMap = {
    low: "tu1den2trieu",
    mid: "tu2den3trieu",
    high: "tren3trieu"
};

const BASE_PATH = "/SosVel/project/pictures";
const roomsPerPage = 12;

let currentPage = 1;
let filteredRooms = [];
let currentRoom = null;

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatPrice(price) {
    return price.toLocaleString("vi-VN");
}

function getPriceTag(price) {
    if (price >= 1500000 && price <= 2000000) return "1tr5 - 2tr";
    if (price > 2000000 && price <= 3000000) return "2tr - 3tr";
    return "3tr+";
}

function getRoomFolder(price) {
    if (price >= 1500000 && price <= 2000000) return folderMap.low;
    if (price > 2000000 && price <= 3000000) return folderMap.mid;
    return folderMap.high;
}

function getCoverImage(folder, coverIndex) {
    return `${BASE_PATH}/${folder}/${coverIndex}.jpg`;
}

// chỉ lấy 3 ảnh từ 12 -> 48, cố định theo id phòng
function getGalleryImages(folder, roomId) {
    const range = 37; // từ 12 đến 48 có 37 ảnh
    const offset = (roomId * 3) % range;

    const img1 = 12 + (offset % range);
    const img2 = 12 + ((offset + 1) % range);
    const img3 = 12 + ((offset + 2) % range);

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
        folder,
        coverImage: getCoverImage(folder, coverIndex),
        galleryImages: getGalleryImages(folder, id)
    };
}

const roomsData = [];
let roomId = 1;

// 120 phòng
for (let i = 1; i <= 40; i++) {
    const area = randomItem(areas);
    const coverIndex = ((i - 1) % 11) + 1;
    roomsData.push(
        createRoom(
            roomId++,
            `Phòng sinh viên giá tốt ${i}`,
            area,
            1500000 + ((i - 1) % 6) * 100000,
            `${10 + i}, ${randomItem(streets)}, ${area}`,
            `${16 + (i % 6)}m²`,
            "Phòng sạch sẽ, phù hợp sinh viên, gần trường và khu ăn uống.",
            coverIndex
        )
    );
}

for (let i = 1; i <= 40; i++) {
    const area = randomItem(areas);
    const coverIndex = ((i - 1) % 11) + 1;
    roomsData.push(
        createRoom(
            roomId++,
            `Phòng sinh viên tiện nghi ${i}`,
            area,
            2200000 + ((i - 1) % 5) * 200000,
            `${50 + i}, ${randomItem(streets)}, ${area}`,
            `${18 + (i % 7)}m²`,
            "Phòng tiện nghi, có gác hoặc nội thất cơ bản, khu vực an ninh.",
            coverIndex
        )
    );
}

for (let i = 1; i <= 40; i++) {
    const area = randomItem(areas);
    const coverIndex = ((i - 1) % 11) + 1;
    roomsData.push(
        createRoom(
            roomId++,
            `Phòng cao cấp ${i}`,
            area,
            3200000 + ((i - 1) % 6) * 400000,
            `${90 + i}, ${randomItem(streets)}, ${area}`,
            `${22 + (i % 8)}m²`,
            "Phòng rộng rãi, phù hợp ở lâu dài, gần trung tâm và giao thông thuận tiện.",
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

function displayRooms(rooms) {
    const container = document.getElementById("roomContainer");
    container.innerHTML = "";

    if (rooms.length === 0) {
        container.innerHTML = `
            <div class="no-result">
                <p>Không tìm thấy phòng phù hợp.</p>
            </div>
        `;
        return;
    }

    rooms.forEach((room) => {
        const card = document.createElement("div");
        card.className = "room-card";
        card.dataset.roomId = room.id;

        card.innerHTML = `
            <img src="${room.coverImage}" alt="${room.title}">
            <div class="room-info">
                <h3>${room.title}</h3>
                <p>💰 Giá: ${formatPrice(room.price)} VNĐ</p>
                <p>📍 ${room.address}</p>
                <p>📌 Khu vực: ${room.area}</p>
                <span class="price-badge">${getPriceTag(room.price)}</span>
            </div>
        `;

        const img = card.querySelector("img");
        img.onerror = function () {
            this.src = `${BASE_PATH}/${room.folder}/2.jpg`;
        };

        container.appendChild(card);
    });
}

function createPageButton(text, className, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = className;
    btn.type = "button";
    btn.addEventListener("click", onClick);
    return btn;
}

function createDots() {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "page-dots";
    return dots;
}

function renderPagination() {
    const pagination = document.getElementById("pagination");
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    if (currentPage > 1) {
        pagination.appendChild(
            createPageButton("Trước", "page-text-btn", function () {
                currentPage--;
                renderPage();
            })
        );
    }

    const pagesToShow = [];

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pagesToShow.push(i);
        }
    } else if (currentPage <= 3) {
        pagesToShow.push(1, 2, 3, 4, "dots", totalPages);
    } else if (currentPage >= totalPages - 2) {
        pagesToShow.push(1, "dots", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
        pagesToShow.push(1, "dots", currentPage - 1, currentPage, currentPage + 1, "dots", totalPages);
    }

    pagesToShow.forEach((item) => {
        if (item === "dots") {
            pagination.appendChild(createDots());
        } else {
            const pageBtn = document.createElement("button");
            pageBtn.textContent = item;
            pageBtn.type = "button";
            pageBtn.className = item === currentPage ? "page-number active-page" : "page-number";
            pageBtn.addEventListener("click", function () {
                currentPage = item;
                renderPage();
            });
            pagination.appendChild(pageBtn);
        }
    });

    if (currentPage < totalPages) {
        pagination.appendChild(
            createPageButton("Tiếp", "page-text-btn", function () {
                currentPage++;
                renderPage();
            })
        );
    }
}

function renderPage() {
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

    if (totalPages === 0) {
        displayRooms([]);
        document.getElementById("pagination").innerHTML = "";
        return;
    }

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = startIndex + roomsPerPage;
    const currentRooms = filteredRooms.slice(startIndex, endIndex);

    displayRooms(currentRooms);
    renderPagination();
}

function searchRoom() {
    const selectedArea = document.getElementById("areaInput").value;
    const selectedPrice = parseInt(document.getElementById("priceInput").value, 10);

    filteredRooms = roomsData.filter((room) => {
        const matchArea = selectedArea === "" || room.area === selectedArea;
        const matchPrice = room.price <= selectedPrice;
        return matchArea && matchPrice;
    });

    currentPage = 1;
    renderPage();
}

function openRoomDetail(roomId) {
    const room = roomsData.find((item) => item.id === Number(roomId));
    if (!room) return;

    currentRoom = room;

    document.getElementById("modalTitle").textContent = room.title;
    document.getElementById("modalPrice").textContent = `💰 Giá: ${formatPrice(room.price)} VNĐ`;
    document.getElementById("modalArea").textContent = `📌 Khu vực: ${room.area}`;
    document.getElementById("modalAddress").textContent = `📍 Địa chỉ: ${room.address}`;
    document.getElementById("modalSize").textContent = `📐 Diện tích: ${room.size}`;
    document.getElementById("modalDesc").textContent = `📝 Mô tả: ${room.desc}`;

    const mainPreview = document.getElementById("mainPreview");
    const thumbGrid = document.getElementById("thumbGrid");

    mainPreview.src = room.galleryImages[0];
    mainPreview.onerror = function () {
        this.src = `${BASE_PATH}/${room.folder}/12.jpg`;
    };

    thumbGrid.innerHTML = "";

    room.galleryImages.forEach((imgSrc) => {
        const thumb = document.createElement("img");
        thumb.src = imgSrc;
        thumb.className = "thumb-item";
        thumb.alt = room.title;
        thumb.onerror = function () {
            this.src = `${BASE_PATH}/${room.folder}/12.jpg`;
        };
        thumb.addEventListener("click", function () {
            mainPreview.src = imgSrc;
        });
        thumbGrid.appendChild(thumb);
    });

    document.getElementById("roomModal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeRoomDetail() {
    document.getElementById("roomModal").classList.add("hidden");
    document.body.style.overflow = "auto";
}

document.addEventListener("DOMContentLoaded", function () {
    const priceInput = document.getElementById("priceInput");
    const searchBtn = document.getElementById("searchBtn");
    const areaInput = document.getElementById("areaInput");
    const roomContainer = document.getElementById("roomContainer");

    const modalClose = document.getElementById("modalClose");
    const modalOverlay = document.getElementById("modalOverlay");
    const contactBtn = document.getElementById("contactBtn");
    const contractBtn = document.getElementById("contractBtn");

    priceInput.addEventListener("input", updatePrice);
    searchBtn.addEventListener("click", searchRoom);
    areaInput.addEventListener("change", searchRoom);

    roomContainer.addEventListener("click", function (e) {
        const card = e.target.closest(".room-card");
        if (!card) return;
        openRoomDetail(card.dataset.roomId);
    });

    modalClose.addEventListener("click", closeRoomDetail);
    modalOverlay.addEventListener("click", closeRoomDetail);

    contactBtn.addEventListener("click", function () {
        if (!currentRoom) return;
        alert(`Liên hệ phòng: ${currentRoom.title}\nSố điện thoại: 09xx xxx xxx`);
    });

    contractBtn.addEventListener("click", function () {
        if (!currentRoom) return;
        alert(`Chức năng kí hợp đồng online cho phòng: ${currentRoom.title}\nSẽ làm tiếp ở bước sau.`);
    });

    updatePrice();
    filteredRooms = [...roomsData];
    renderPage();
});
