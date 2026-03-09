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

const BASE_PATH = "../pictures";

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

function getRoomFolder(price) {

    if (price <= 2000000) return folderMap.low;
    if (price <= 3000000) return folderMap.mid;
    return folderMap.high;

}

function getCoverImage(folder, index) {

    return `${BASE_PATH}/${folder}/${index}.jpg`;

}

function getGalleryImages(folder, id) {

    const range = 30;

    const a = (id * 2) % range;
    const b = (id * 3) % range;
    const c = (id * 5) % range;

    return [
        `${BASE_PATH}/${folder}/${a + 1}.jpg`,
        `${BASE_PATH}/${folder}/${b + 1}.jpg`,
        `${BASE_PATH}/${folder}/${c + 1}.jpg`
    ];

}

function createRoom(
    id,
    title,
    area,
    price,
    address,
    size,
    desc,
    coverIndex
) {

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

for (let i = 1; i <= 120; i++) {

    const area = randomItem(areas);

    const price =
        i < 40
            ? 1800000
            : i < 80
            ? 2500000
            : 3500000;

    const coverIndex = ((i - 1) % 10) + 1;

    roomsData.push(
        createRoom(
            roomId++,
            "Phòng sinh viên",
            area,
            price,
            `${10 + i}, ${randomItem(streets)}, ${area}`,
            `${16 + (i % 6)}m²`,
            "Phòng sạch đẹp",
            coverIndex
        )
    );

}

function updatePrice() {

    const priceInput =
        document.getElementById("priceInput");

    const priceValue =
        document.getElementById("priceValue");

    const price =
        parseInt(priceInput.value);

    if (price >= 5000000) {

        priceValue.textContent = "5.000.000+";

    } else {

        priceValue.textContent =
            formatPrice(price);

    }

}

function filterRooms() {

    const area =
        document.getElementById("areaInput").value;

    const maxPrice =
        parseInt(
            document.getElementById("priceInput").value
        );

    filteredRooms =
        roomsData.filter(room => {

            const okArea =
                !area || room.area === area;

            const okPrice =
                room.price <= maxPrice;

            return okArea && okPrice;

        });

    currentPage = 1;

    renderRooms();

    renderPagination();

}

function renderRooms() {

    const container =
        document.getElementById("roomContainer");

    container.innerHTML = "";

    const start =
        (currentPage - 1) * roomsPerPage;

    const end =
        start + roomsPerPage;

    const pageRooms =
        filteredRooms.slice(start, end);

    pageRooms.forEach(room => {

        const div =
            document.createElement("div");

        div.className = "room-card";

        div.innerHTML = `
            <img src="${room.coverImage}">
            <h3>${room.title}</h3>
            <p>${room.area}</p>
            <p>${formatPrice(room.price)} VNĐ</p>
            <button onclick="openRoomDetail(${room.id})">
                Xem chi tiết
            </button>
        `;

        container.appendChild(div);

    });

}

function renderPagination() {

    const pagination =
        document.getElementById("pagination");

    pagination.innerHTML = "";

    const total =
        Math.ceil(
            filteredRooms.length /
            roomsPerPage
        );

    for (let i = 1; i <= total; i++) {

        const btn =
            document.createElement("button");

        btn.textContent = i;

        if (i === currentPage)
            btn.classList.add("active");

        btn.onclick = () => {

            currentPage = i;

            renderRooms();

            renderPagination();

        };

        pagination.appendChild(btn);

    }

}

function openRoomDetail(id) {

    const room =
        roomsData.find(r => r.id == id);

    if (!room) return;

    currentRoom = room;

    document.getElementById("modalTitle").textContent = room.title;
    document.getElementById("modalPrice").textContent = formatPrice(room.price);
    document.getElementById("modalArea").textContent = room.area;
    document.getElementById("modalAddress").textContent = room.address;
    document.getElementById("modalSize").textContent = room.size;
    document.getElementById("modalDesc").textContent = room.desc;

    document.getElementById("mainPreview").src =
        room.galleryImages[0];

    const thumb =
        document.getElementById("thumbGrid");

    thumb.innerHTML = "";

    room.galleryImages.forEach(img => {

        const el = document.createElement("img");

        el.src = img;

        el.onclick = () => {

            document.getElementById(
                "mainPreview"
            ).src = img;

        };

        thumb.appendChild(el);

    });

    document
        .getElementById("roomModal")
        .classList.remove("hidden");

    // FIX CHAT

    const contactBtn =
        document.getElementById("contactBtn");

    contactBtn.onclick = function () {

        alert("SĐT: 0901234567");

        document
            .getElementById("chatBox")
            .classList.remove("hidden");

    };

}

function closeRoomDetail() {

    document
        .getElementById("roomModal")
        .classList.add("hidden");

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        filteredRooms = roomsData;

        updatePrice();

        renderRooms();

        renderPagination();

        document
            .getElementById("priceInput")
            .oninput = updatePrice;

        document
            .getElementById("searchBtn")
            .onclick = filterRooms;

        document
            .getElementById("modalClose")
            .onclick = closeRoomDetail;

        document
            .getElementById("modalOverlay")
            .onclick = closeRoomDetail;

        document
            .getElementById("chatClose")
            .onclick = function () {

                document
                    .getElementById("chatBox")
                    .classList.add("hidden");

            };

    }
);
