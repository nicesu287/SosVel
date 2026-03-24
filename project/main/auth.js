function getUsers() {
    return JSON.parse(localStorage.getItem("sosvel_users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("sosvel_users", JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem("sosvel_current_user", JSON.stringify(user));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("sosvel_current_user")) || null;
}

function updateCurrentUser(user) {
    localStorage.setItem("sosvel_current_user", JSON.stringify(user));
}

function updateUserInStorage(updatedUser) {
    const users = getUsers();
    const index = users.findIndex(u => u.email === updatedUser.email);

    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        updateCurrentUser(updatedUser);
    }
}

function logout() {
    localStorage.removeItem("sosvel_current_user");
    window.location.href = "index.html";
}

function requireLogin() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function getLoyaltyTier(points = 0) {
    if (points >= 1000) return "Vàng";
    if (points >= 200) return "Bạc";
    return "Đồng";
}

function getTransactions() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`sosvel_transactions_${user.email}`)) || [];
}

function saveTransactions(transactions) {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem(`sosvel_transactions_${user.email}`, JSON.stringify(transactions));
}

function addTransaction(transaction) {
    const transactions = getTransactions();
    transactions.unshift({
        ...transaction,
        createdAt: new Date().toISOString()
    });
    saveTransactions(transactions);
}

function addPoints(points, reason = "Tích điểm") {
    const user = getCurrentUser();
    if (!user) return;

    user.points = (user.points || 0) + points;
    user.loyaltyTier = getLoyaltyTier(user.points);
    updateUserInStorage(user);

    addTransaction({
        type: "point",
        amount: points,
        direction: "in",
        description: `${reason} (+${points} điểm)`
    });
}

function addBalance(amount) {
    const user = getCurrentUser();
    if (!user) return false;

    user.balance = (user.balance || 0) + amount;
    updateUserInStorage(user);

    addTransaction({
        type: "deposit",
        amount,
        direction: "in",
        description: "Nạp tiền vào ví SosVel"
    });

    return true;
}

function spendBalance(amount, description = "Chi tiêu dịch vụ") {
    const user = getCurrentUser();
    if (!user) return false;

    if ((user.balance || 0) < amount) {
        return false;
    }

    user.balance -= amount;
    updateUserInStorage(user);

    addTransaction({
        type: "spend",
        amount,
        direction: "out",
        description
    });

    return true;
}

function addWarningToUser(email) {
    const users = getUsers();
    const index = users.findIndex(u => u.email === email);

    if (index === -1) return false;

    users[index].warnings = (users[index].warnings || 0) + 1;

    if (users[index].warnings >= 3) {
        users[index].isLocked = true;
    }

    saveUsers(users);

    const current = getCurrentUser();
    if (current && current.email === email) {
        updateCurrentUser(users[index]);
    }

    return true;
}
function getRentalHistory() {
    const user = getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`sosvel_rental_history_${user.email}`)) || [];
}

function saveRentalHistory(history) {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem(`sosvel_rental_history_${user.email}`, JSON.stringify(history));
}

function getCurrentRental() {
    const user = getCurrentUser();
    if (!user) return null;
    return JSON.parse(localStorage.getItem(`sosvel_current_rental_${user.email}`)) || null;
}

function saveCurrentRental(rental) {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem(`sosvel_current_rental_${user.email}`, JSON.stringify(rental));
}

function addRentalRecord(room) {
    const user = getCurrentUser();
    if (!user || !room) return false;

    const history = getRentalHistory();

    const record = {
        id: `rental_${Date.now()}`,
        roomId: room.id,
        title: room.title,
        type: room.type,
        area: room.area,
        address: room.address,
        price: room.price,
        ownerName: room.ownerName,
        ownerPhone: room.ownerPhone,
        depositAmount: Math.round(room.price / 2),
        startedAt: new Date().toISOString(),
        status: "Đang thuê"
    };

    history.unshift(record);
    saveRentalHistory(history);
    saveCurrentRental(record);

    return true;
}
document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("registerName").value.trim();
            const dob = document.getElementById("registerDob").value;
            const cccd = document.getElementById("registerCccd").value.trim();
            const phone = document.getElementById("registerPhone").value.trim();
            const email = document.getElementById("registerEmail").value.trim().toLowerCase();
            const role = document.getElementById("registerRole").value;
            const password = document.getElementById("registerPassword").value;
            const confirmPassword = document.getElementById("registerConfirmPassword").value;
            const message = document.getElementById("registerMessage");

            if (password !== confirmPassword) {
                message.textContent = "Mật khẩu xác nhận không khớp.";
                return;
            }

            const users = getUsers();
            const existingEmail = users.find(user => user.email === email);
            const existingCccd = users.find(user => user.cccd === cccd);

            if (existingEmail) {
                message.textContent = "Email này đã được đăng ký.";
                return;
            }

            if (existingCccd) {
                message.textContent = "CCCD này đã tồn tại trong hệ thống.";
                return;
            }

            users.push({
                name,
                dob,
                cccd,
                phone,
                email,
                role,
                password,
                balance: 0,
                points: 0,
                loyaltyTier: "Đồng",
                bio: "",
                warnings: 0,
                isLocked: false
            });

            saveUsers(users);
            message.style.color = "#1b5edb";
            message.textContent = "Đăng ký thành công. Đang chuyển sang đăng nhập...";

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1200);
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;
            const message = document.getElementById("loginMessage");

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                message.textContent = "Email hoặc mật khẩu không đúng.";
                return;
            }

            if (user.isLocked) {
                message.textContent = "Tài khoản này đã bị khóa vĩnh viễn.";
                return;
            }

            setCurrentUser(user);
            message.style.color = "#1b5edb";
            message.textContent = "Đăng nhập thành công. Đang chuyển về trang chủ...";

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);
        });
    }
});
