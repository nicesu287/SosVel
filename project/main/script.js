const areas = ["Đông Hòa", "Dĩ An", "Thủ Đức", "Suối Tiên", "Linh Trung", "Bình Thọ"];
const streetNames = [
    "Đường số 1", "Đường số 5", "Đường số 7", "Tân Lập", "Thống Nhất",
    "Lê Văn Việt", "Xa lộ Hà Nội", "Hoàng Diệu 2", "Kha Vạn Cân", "Man Thiện"
];

const roomsData = [];
let filteredRooms = [];
let currentPage = 1;
const roomsPerPage = 12;

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function createRoom(index, price, area) {
    return {
        area: area,
        price: price,
        address: `${Math.floor(Math.random() * 200) + 1} ${getRandomItem(streetNames)}, ${area}`,
        title: `Phòng trọ sinh viên ${index}`
    };
}

// Tạo 10 trang, mỗi trang 12 phòng:
// 4 phòng giá 1tr5-2tr
// 4 phòng giá 2tr-3tr
// 4 phòng giá 3tr+
for (let page = 1; page <= 10; page++) {
    for (let i = 1; i <= 4; i++) {
        roomsData.push(createRoom(
            `${page}-A${i}`,
            1500000 + (i - 1) * 100000,
            getRandomItem(areas)
        ));
    }

    for (let i = 1; i <= 4; i++) {
        roomsData.push(createRoom(
            `${page}-B${i}`,
            2200000 + (i - 1) * 200000,
            getRandomItem(areas)
        ));
    }

    for (let i = 1; i <= 4; i++) {
        roomsData.push(createRoom(
            `${page}-C${i}`,
            3200000 + (i - 1) * 400000,
            getRandomItem(areas)
        ));
    }
}

function updatePrice() {
    const price = parseInt(document.getElementById("priceInput").value, 10);

    if (price >= 5000000) {
        document.getElementById("priceValue").innerText = "5,000,000+";
    } else {
        document.getElementById("priceValue").innerText = price.toLocaleString("vi-VN");
    }
}

function searchRoom() {
    const area = document.getElementById("areaInput").value;
    const price = parseInt(document.getElementById("priceInput").value, 10);

    filteredRooms = roomsData.filter(room => {
        const matchArea = area === "" || room.area === area;

        let matchPrice;
        if (price >= 5000000) {
            matchPrice = room.price >= 5000000;
        } else {
            matchPrice = room.price <= price;
        }

        return matchArea && matchPrice;
    });

    currentPage = 1;
    renderPage();
}

function renderPage() {
    const start = (currentPage - 1) * roomsPerPage;
    const end = start + roomsPerPage;
    const pageRooms = filteredRooms.slice(start, end);

    displayRooms(pageRooms);
    renderPagination();
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
        let priceTag = "";
        if (room.price >= 1500000 && room.price <= 2000000) {
            priceTag = "1tr5 - 2tr";
        } else if (room.price > 2000000 && room.price <= 3000000) {
            priceTag = "2tr - 3tr";
        } else {
            priceTag = "3tr+";
        }

        container.innerHTML += `
            <div class="room-card">
                <img src="../pictures/room.jpg" alt="Phòng trọ">
                <div class="room-info">
                    <h3>${room.title}</h3>
                    <p>💰 Giá: ${room.price.toLocaleString("vi-VN")} VNĐ</p>
                    <p>📍 ${room.address}</p>
                    <p>📌 Khu vực: ${room.area}</p>
                    <p class="price-badge">${priceTag}</p>
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

    const prevBtn = document.createElement("button");
    prevBtn.innerText = "← Trước";
    prevBtn.className = "page-btn";
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        currentPage--;
        renderPage();
    };
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.innerText = i;
        pageBtn.className = i === currentPage ? "page-btn active-page" : "page-btn";
        pageBtn.onclick = () => {
            currentPage = i;
            renderPage();
        };
        pagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Sau →";
    nextBtn.className = "page-btn";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        currentPage++;
        renderPage();
    };
    pagination.appendChild(nextBtn);
}

updatePrice();
filteredRooms = [...roomsData];
renderPage();
