const UNIT_MONEY = 300;

// 데이터 구조
let data = JSON.parse(localStorage.getItem("noSmokingData"));

if (!data) {
    data = {
        count: 0,
        lastDate: getToday(),
        todayCount: 0
    };
}

// 날짜 체크 (자정 자동 초기화)
function checkDateReset() {
    const today = getToday();

    if (data.lastDate !== today) {
        data.todayCount = 0;
        data.lastDate = today;
        saveData();
    }
}

// 오늘 날짜 문자열
function getToday() {
    return new Date().toISOString().slice(0, 10);
}

// 저장
function saveData() {
    localStorage.setItem("noSmokingData", JSON.stringify(data));
}

// UI 업데이트
function updateUI() {
    document.getElementById("count").innerText = data.count;

    let money = data.count * UNIT_MONEY;
    document.getElementById("money").innerText = money.toLocaleString() + " 원";

    document.getElementById("today").innerText = data.todayCount;
}

// 카운트 증가
function addCount() {
    checkDateReset();

    data.count++;
    data.todayCount++;

    saveData();
    updateUI();

    showPraise();
}

// 칭찬 시스템
function showPraise() {
    if (data.todayCount === 5) {
        alert("👍 오늘 벌써 5번 성공!");
    } else if (data.todayCount === 10) {
        alert("🔥 대단합니다! 10번 성공!");
    } else if (data.todayCount % 20 === 0) {
        alert("🚀 습관이 만들어지고 있어요!");
    }
}

// 초기화
function resetCount() {
    let money = data.count * UNIT_MONEY;

    if (confirm(`정말 초기화할까요?\n현재 절약 금액: ${money.toLocaleString()}원`)) {
        data.count = 0;
        data.todayCount = 0;
        saveData();
        updateUI();
    }
}

// 🔥 이체 유도 (핵심 개선)
function sendMoney() {
    let money = data.count * UNIT_MONEY;

    if (money === 0) {
        alert("적립된 금액이 없습니다.");
        return;
    }

    let confirmMsg = `현재 ${money.toLocaleString()}원이 적립되었습니다.\n\n` +
        "✔ 실제 계좌로 이체를 진행하시겠습니까?\n" +
        "✔ 이체 후 기록은 초기화됩니다.";

    if (confirm(confirmMsg)) {

        alert(
            "📌 안내\n\n" +
            "토스 또는 사용 중인 금융 앱을 열어\n" +
            `${money.toLocaleString()}원을 직접 이체해주세요.\n\n` +
            "이체 완료 후 확인 버튼을 눌러주세요."
        );

        // 초기화
        data.count = 0;
        data.todayCount = 0;
        saveData();
        updateUI();
    }
}

// 초기 실행
document.addEventListener("DOMContentLoaded", function () {
    checkDateReset();
    updateUI();
});