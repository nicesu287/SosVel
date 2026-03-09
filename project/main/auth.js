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
    return JSON.parse(localStorage.getItem("sosvel_current_user"));
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
            const password = document.getElementById("registerPassword").value;
            const confirmPassword = document.getElementById("registerConfirmPassword").value;
            const message = document.getElementById("registerMessage");

            if (password !== confirmPassword) {
                message.textContent = "Mật khẩu xác nhận không khớp.";
                return;
            }

            const users = getUsers();
            const existingUser = users.find(user => user.email === email);

            if (existingUser) {
                message.textContent = "Email này đã được đăng ký.";
                return;
            }

            users.push({
                name,
                dob,
                cccd,
                phone,
                email,
                password
            });

            saveUsers(users);
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

            setCurrentUser(user);
            message.textContent = "Đăng nhập thành công. Đang chuyển về trang chủ...";

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);
        });
    }
});
