<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ví tài khoản - SosVel</title>
    <link rel="stylesheet" href="../stylist/style.css">
</head>
<body class="auth-page">
<div class="auth-container wallet-page-wrap">
    <div class="auth-card">
        <h1>Ví SosVel</h1>
        <p class="auth-subtitle">Nạp tiền và theo dõi số dư tài khoản</p>

        <div class="wallet-balance-box">
            <p><strong>Số dư hiện tại:</strong></p>
            <h2 id="walletBalance">0 VNĐ</h2>
        </div>

        <form id="walletForm" class="auth-form">
            <label for="topupAmount">Số tiền nạp</label>
            <input type="number" id="topupAmount" placeholder="Nhập số tiền muốn nạp" required>
            <button type="submit" class="auth-btn">Nạp tiền</button>
        </form>

        <div class="quick-topup-grid">
            <button type="button" class="secondary-btn quick-topup" data-amount="50000">+50.000</button>
            <button type="button" class="secondary-btn quick-topup" data-amount="100000">+100.000</button>
            <button type="button" class="secondary-btn quick-topup" data-amount="200000">+200.000</button>
            <button type="button" class="secondary-btn quick-topup" data-amount="500000">+500.000</button>
        </div>

        <p id="walletMessage" class="auth-message"></p>

        <p class="auth-switch"><a href="transactions.html">Xem lịch sử giao dịch</a></p>
        <p class="auth-switch"><a href="index.html">← Quay lại trang chủ</a></p>
    </div>
</div>

<script src="auth.js"></script>
<script src="wallet.js"></script>
</body>
</html>
