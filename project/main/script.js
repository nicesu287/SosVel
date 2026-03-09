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

const roomsPerPage = 12;
let currentPage = 1;
let filteredRooms = [];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatPrice(price) {
    return price.toLocaleString("vi-VN");
}

function createRoom(title, area, price, address) {
    return {
        title,
        area,
        price,
        address
    };
}

const roomsData = [];

// Tạo 10 trang, mỗi trang 12 phòng:
// 4 phòng 1tr5-2tr
// 4 phòng 2tr-3tr
// 4 phòng 3tr+
for (let page = 1; page <= 10; page++) {
    for (let i = 1; i <= 4; i++) {
        const area = randomItem(areas);
        roomsData.push(
            createRoom(
                `Phòng sinh viên ${page}-A${i}`,
                area,
                1500000 + (i - 1) * 100000,
                `${10 + i}/${page} ${randomItem(streets)}, ${area}`
            )
        );
    }

    for (let i = 1; i <= 4; i++) {
        const area = randomItem(areas);
        roomsData.push(
            createRoom(
                `Phòng sinh viên ${page}-B${i}`,
                area,
                2200000 + (i - 1) * 200000,
                `${20 + i}/${page} ${randomItem(streets)}, ${area}`
            )
        );
    }

    for (let i = 1; i <= 4; i++) {
        const area = randomItem(areas);
        roomsData.push(
            createRoom(
                `Phòng sinh viên ${page}-C${i}`,
                area,
                3200000 + (i - 1) * 500000,
                `${30 + i}/${page} ${randomItem(streets)}, ${area}`
            )
        );
    }
}

function getPriceTag(price) {
    if (price >= 1500000 && price <= 2000000) {
        return "1tr5 - 2tr";
    }
    if (price > 2000000 && price <= 3000000) {
        return "2tr - 3tr";
    }
    return "3tr+";
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
        container.innerHTML += `
            <div class="room-card">
                <img src="../pictures/room.jpg" alt="Phòng trọ">
                <div class="room-info">
                    <h3>${room.title}</h3>
                    <p>💰 Giá: ${formatPrice(room.price)} VNĐ</p>
                    <p>📍 ${room.address}</p>
                    <p>📌 Khu vực: ${room.area}</p>
                    <span class="price-badge">${getPriceTag(room.price)}</span>
                </div>
            </div>
        `;
    });
}

function renderPagination() {
    const pagination = document.getElementById("pagination");
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    if (currentPage > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Trước";
        prevBtn.className = "page-text-btn";
        prevBtn.type = "button";
        prevBtn.addEventListener("click", function () {
            currentPage--;
            renderPage();
        });
        pagination.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.type = "button";
        pageBtn.className = i === currentPage ? "page-number active-page" : "page-number";
        pageBtn.addEventListener("click", function () {
            currentPage = i;
            renderPage();
        });
        pagination.appendChild(pageBtn);
    }

    if (currentPage < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Tiếp";
        nextBtn.className = "page-text-btn";
        nextBtn.type = "button";
        nextBtn.addEventListener("click", function () {
            currentPage++;
            renderPage();
        });
        pagination.appendChild(nextBtn);
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

    filteredRooms = roomsData.filter(function (room) {
        const matchArea = selectedArea === "" || room.area === selectedArea;
        const matchPrice = room.price <= selectedPrice;
        return matchArea && matchPrice;
    });

    currentPage = 1;
    renderPage();
}

document.addEventListener("DOMContentLoaded", function () {
    const priceInput = document.getElementById("priceInput");
    const searchBtn = document.getElementById("searchBtn");
    const areaInput = document.getElementById("areaInput");

    priceInput.addEventListener("input", updatePrice);
    searchBtn.addEventListener("click", searchRoom);

    // Muốn đổi khu vực là tự lọc luôn
    areaInput.addEventListener("change", searchRoom);

    updatePrice();
    filteredRooms = [...roomsData];
    renderPage();
});
