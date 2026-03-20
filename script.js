const DEFAULT_DATA = {
    totalCount: 0,
    unitMoney: 300,
    goal: 10,
    streak: 0,
    lastSuccessDate: null,
    history: {},
    transfers: []
};

let data = JSON.parse(localStorage.getItem("noSmokingV3")) || DEFAULT_DATA;

// 날짜
function today() {
    return new Date().toISOString().slice(0, 10);
}

// 저장
function save() {
    localStorage.setItem("noSmokingV3", JSON.stringify(data));
}

// 오늘 횟수
function getTodayCount() {
    return data.history[today()] || 0;
}

// 어제 체크
function isYesterday(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10) === today();
}

// 카운트 증가
function addCount() {
    const t = today();

    data.totalCount++;
    data.history[t] = (data.history[t] || 0) + 1;

    if (data.lastSuccessDate !== t) {
        if (isYesterday(data.lastSuccessDate)) {
            data.streak++;
        } else {
            data.streak = 1;
        }
        data.lastSuccessDate = t;
    }

    save();
    updateUI();
    checkGoal();
}

// 목표 체크
function checkGoal() {
    if (getTodayCount() === data.goal) {
        alert("🎯 오늘 목표 달성!");
    }
}

// 송금 유도
function sendMoney() {
    const money = data.totalCount * data.unitMoney;

    if (money === 0) {
        alert("적립된 금액이 없습니다.");
        return;
    }

    if (confirm(`${money.toLocaleString()}원을 이체하시겠습니까?\n이체 후 초기화됩니다.`)) {

        alert("금융 앱을 열어 직접 이체해주세요.");

        data.transfers.push({
            date: today(),
            amount: money
        });

        data.totalCount = 0;

        save();
        updateUI();
    }
}

// 초기화
function resetCount() {
    if (confirm("정말 초기화할까요?")) {
        data = { ...DEFAULT_DATA };
        save();
        updateUI();
    }
}

// 금액 설정
function setMoney() {
    const val = prompt("1회 금액 입력", data.unitMoney);
    if (val) {
        data.unitMoney = parseInt(val);
        save();
        updateUI();
    }
}

// UI 업데이트
function updateUI() {
    document.getElementById("total").innerText = data.totalCount;
    document.getElementById("today").innerText = getTodayCount();
    document.getElementById("money").innerText =
        (data.totalCount * data.unitMoney).toLocaleString() + " 원";
    document.getElementById("streak").innerText = data.streak;
    document.getElementById("goal").innerText = data.goal;

    // 진행도
    const todayCount = getTodayCount();
    const percent = Math.min((todayCount / data.goal) * 100, 100);

    document.getElementById("progress-fill").style.width = percent + "%";
    document.getElementById("progress-text").innerText =
        `${todayCount} / ${data.goal}`;
}

// 초기 실행
document.addEventListener("DOMContentLoaded", updateUI);
