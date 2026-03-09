const roomsData = [
    { area: "Đông Hòa", price: 2000000, address: "15/30 Đường 7 KP Đông Tác" },
    { area: "Đông Hòa", price: 1800000, address: "10/9 KP Tân Lập Đông Hòa" },
    { area: "Đông Hòa", price: 2500000, address: "10/9 KP Tân Lập Đông Hòa" },
    { area: "Đông Hòa", price: 3200000, address: "49 Tân Lập Đông Hòa" },
    { area: "Dĩ An", price: 2000000, address: "Trung tâm Dĩ An" },
    { area: "Dĩ An", price: 2700000, address: "Gần ngã tư 550, Dĩ An" },
    { area: "Thủ Đức", price: 3000000, address: "Linh Trung, Thủ Đức" },
    { area: "Thủ Đức", price: 2800000, address: "Gần KTX khu A" },
    { area: "Suối Tiên", price: 2200000, address: "Gần Khu du lịch Suối Tiên" },
    { area: "Linh Trung", price: 3500000, address: "58 Đường số 5 Linh Trung" },
    { area: "Bình Thọ", price: 5200000, address: "Gần Đại học Sư phạm Kỹ thuật" },
    { area: "Đông Hòa", price: 2500000, address: "Gần làng đại học" }
];

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

    const result = roomsData.filter(room => {
        const matchArea = area === "" || room.area === area;

        let matchPrice;
        if (price >= 5000000) {
            matchPrice = room.price >= 5000000;
        } else {
            matchPrice = room.price <= price;
        }

        return matchArea && matchPrice;
    });

    displayRooms(result);
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
                    <h3>Phòng trọ sinh viên</h3>
                    <p>💰 Giá: ${room.price.toLocaleString("vi-VN")} VNĐ</p>
                    <p>📍 ${room.address}</p>
                    <p>📌 Khu vực: ${room.area}</p>
                </div>
            </div>
        `;
    });
}

updatePrice();
displayRooms(roomsData);
