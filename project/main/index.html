const areas = ["Đông Hòa", "Dĩ An", "Thủ Đức", "Suối Tiên", "Linh Trung", "Bình Thọ"];
const streets = [
    "Đường số 1", "Đường số 5", "Đường số 7", "Tân Lập",
    "Thống Nhất", "Lê Văn Việt", "Kha Vạn Cân", "Hoàng Diệu 2"
];

const roomsPerPage = 12;
let currentPage = 1;
let filteredRooms = [];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function createRoom(title, area, price, address) {
    return { title, area, price, address };
}

const roomsData = [];

// 10 trang, mỗi trang 12 phòng:
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

function formatPrice(price) {
    return price.toLocaleString("vi-VN");
}

function updatePrice() {
    const price = parseInt(document.getElementById("priceInput").value, 10);
    const priceValue = document.getElementById("priceValue");

    if (price >= 5000000) {
        priceValue.textContent = "5.000.000+";
    } else {
        priceValue.textContent = formatPrice(price);
    }
}

function getPriceTag(price) {
    if (price >= 1500000 && price <= 2000000) return "1tr5 - 2tr";
    if (price > 2000000 && price <= 3000000) return "2tr - 3tr";
    return "3tr+";
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

    rooms.forEach(room => {
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
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
    if (totalPages <= 1) return;

    if (currentPage > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Trước";
        prevBtn.className = "page-text-btn";
        prevBtn.onclick = function () {
            currentPage--;
            renderPage();
        };
        pagination.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? "page-number active-page" : "page-number";
        pageBtn.onclick = function () {
            currentPage = i;
            renderPage();
        };
        pagination.appendChild(pageBtn);
    }

    if (currentPage < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Tiếp";
        nextBtn.className = "page-text-btn";
        nextBtn.onclick = function () {
            currentPage++;
            renderPage();
        };
        pagination.appendChild(nextBtn);
    }
}

function renderPage() {
    const start = (currentPage - 1) * roomsPerPage;
    const end = start + roomsPerPage;
    const pageRooms = filteredRooms.slice(start, end);

    displayRooms(pageRooms);
    renderPagination();
}

function searchRoom() {
    const selectedArea = document.getElementById("areaInput").value;
    const selectedPrice = parseInt(document.getElementById("priceInput").value, 10);

    filteredRooms = roomsData.filter(room => {
        const matchArea = selectedArea === "" || room.area === selectedArea;
        const matchPrice = room.price <= selectedPrice;
        return matchArea && matchPrice;
    });

    currentPage = 1;
    renderPage();
}

updatePrice();
filteredRooms = [...roomsData];
renderPage();
