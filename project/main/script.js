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

// ✅ SỬA ĐƯỜNG DẪN
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

function getGalleryImages(folder, roomId) {

    const range = 37;
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
            "Phòng sạch sẽ, phù hợp sinh viên",
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
            `Phòng tiện nghi ${i}`,
            area,
            2200000 + ((i - 1) % 5) * 200000,
            `${50 + i}, ${randomItem(streets)}, ${area}`,
            `${18 + (i % 7)}m²`,
            "Phòng tiện nghi",
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
            "Phòng rộng",
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
        parseInt(priceInput.value, 10);

    if (price >= 5000000) {

        priceValue.textContent =
            "5.000.000+";

    } else {

        priceValue.textContent =
            formatPrice(price);

    }

}

function openRoomDetail(roomId) {

    const room =
        roomsData.find(
            r => r.id == roomId
        );

    if (!room) return;

    currentRoom = room;

    document.getElementById(
        "modalTitle"
    ).textContent = room.title;

    document.getElementById(
        "modalPrice"
    ).textContent =
        formatPrice(room.price);

    document.getElementById(
        "mainPreview"
    ).src =
        room.galleryImages[0];

    const thumbGrid =
        document.getElementById(
            "thumbGrid"
        );

    thumbGrid.innerHTML = "";

    room.galleryImages.forEach(
        img => {

            const el =
                document.createElement(
                    "img"
                );

            el.src = img;

            el.onclick = () => {

                document.getElementById(
                    "mainPreview"
                ).src = img;

            };

            thumbGrid.appendChild(
                el
            );

        }
    );

    document
        .getElementById(
            "roomModal"
        )
        .classList
        .remove("hidden");

}

function closeRoomDetail() {

    document
        .getElementById(
            "roomModal"
        )
        .classList
        .add("hidden");

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const contactBtn =
            document.getElementById(
                "contactBtn"
            );

        const chatBox =
            document.getElementById(
                "chatBox"
            );

        const chatMessages =
            document.getElementById(
                "chatMessages"
            );

        const chatInput =
            document.getElementById(
                "chatInput"
            );

        const sendChat =
            document.getElementById(
                "sendChat"
            );

        const chatClose =
            document.getElementById(
                "chatClose"
            );

        window.openChatBox =
            function () {

                chatBox
                    .classList
                    .remove(
                        "hidden"
                    );

                addMessage(
                    "Bot",
                    "Vui lòng chờ môi giới"
                );

            };

        function addMessage(
            sender,
            text
        ) {

            const div =
                document.createElement(
                    "div"
                );

            div.textContent =
                sender +
                ": " +
                text;

            chatMessages
                .appendChild(
                    div
                );

        }

        sendChat.onclick =
            function () {

                const text =
                    chatInput.value;

                if (!text) return;

                addMessage(
                    "Bạn",
                    text
                );

                chatInput.value =
                    "";

            };

        chatClose.onclick =
            function () {

                chatBox
                    .classList
                    .add(
                        "hidden"
                    );

            };

        contactBtn.onclick =
            function () {

                alert(
                    "SĐT: 0901234567"
                );

                openChatBox();

            };

    }
);
