const roomsData = [

{area:"Đông Hòa",price:2000000,address:"15/30 Đường 7 KP Đông Tác"},
{area:"Đông Hòa",price:1800000,address:"10/9 KP Tân Lập Đông Hòa"},
{area:"Đông Hòa",price:2500000,address:"10/9 KP Tân Lập Đông Hòa"},
{area:"Đông Hòa",price:3200000,address:"49 Tân Lập Đông Hòa"},
{area:"Dĩ An",price:2000000,address:"Trung tâm Dĩ An"},
{area:"Thủ Đức",price:3000000,address:"Linh Trung"},
{area:"Suối Tiên",price:2200000,address:"Gần Khu du lịch Suối Tiên"},
{area:"Linh Trung",price:3500000,address:"58 Đường số 5 Linh Trung"},
{area:"Đông Hòa",price:2500000,address:"Gần làng đại học"},
{area:"Thủ Đức",price:2800000,address:"Gần KTX khu A"}

];

displayRooms(roomsData);

function updatePrice(){

let price = document.getElementById("priceInput").value;

document.getElementById("priceValue").innerText =
Number(price).toLocaleString();

}

function searchRoom(){

let area = document.getElementById("areaInput").value.toLowerCase();
let price = parseInt(document.getElementById("priceInput").value);

let result = roomsData.filter(room=>{

let matchArea = room.area.toLowerCase().includes(area);
let matchPrice = room.price <= price;

return matchArea && matchPrice;

});

displayRooms(result);

}

function displayRooms(rooms){

let container = document.getElementById("roomContainer");

container.innerHTML="";

rooms.forEach(room=>{

container.innerHTML += `

<div class="room-card">

<img src="../pictures/room.jpg">

<div class="room-info">

<h3>Phòng trọ sinh viên</h3>

<p>💰 Giá: ${room.price.toLocaleString()} VNĐ</p>

<p>📍 ${room.address}</p>

</div>

</div>

`;

});

}
