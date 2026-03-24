function addBalance(amount) {
    const user = getCurrentUser();
    if (!user) return false;
    if (!Number.isFinite(amount) || amount <= 0) return false;

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
