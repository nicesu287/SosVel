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
// 4 phòng giá 1tr5-2tr
// 4 phòng giá 2tr-3tr
// 4 phòng giá 3tr+
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

    if (totalPages <= 1) {
        return;
    }

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
    } else {
        if (currentPage <= 3) {
            pagesToShow.push(1, 2, 3, 4, "dots", totalPages);
        } else if (currentPage >= totalPages - 2) {
            pagesToShow.push(1, "dots", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pagesToShow.push(1, "dots", currentPage - 1, currentPage, currentPage + 1, "dots", totalPages);
        }
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
    areaInput.addEventListener("change", searchRoom);

    updatePrice();
    filteredRooms = [...roomsData];
    renderPage();
});
