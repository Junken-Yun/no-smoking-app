const DEFAULT_DATA = {
    unitMoney: 300,
    goal: 10,
    streak: 0,
    lastSuccessDate: null,
    history: {},
    goalAchievedToday: false
};

let data = JSON.parse(localStorage.getItem("noSmokingV8")) || DEFAULT_DATA;

// 🔥 타이머 종료 시간
let nextAvailableTime = localStorage.getItem("nextAvailableTime") || 0;

// 날짜
function today() {
    const d = new Date();
    return d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,'0') + "-" +
        String(d.getDate()).padStart(2,'0');
}

function save() {
    localStorage.setItem("noSmokingV8", JSON.stringify(data));
    localStorage.setItem("nextAvailableTime", nextAvailableTime);
}

// 총합
function getTotalCount() {
    return Object.values(data.history)
        .reduce((sum, v) => sum + v, 0);
}

function getTodayCount() {
    return data.history[today()] || 0;
}

// 🔥 streak 끊김 체크 (앱 실행 시)
function checkStreakReset() {
    const t = today();

    if (data.lastSuccessDate) {
        const last = new Date(data.lastSuccessDate);
        const now = new Date(t);
        const diff = (now - last) / (1000*60*60*24);

        if (diff > 1) {
            data.streak = 0;
        }
    }
}

// streak 업데이트
function updateStreak() {
    const t = today();

    if (!data.lastSuccessDate) {
        data.streak = 1;
    } else {
        const last = new Date(data.lastSuccessDate);
        const now = new Date(t);
        const diff = (now - last) / (1000*60*60*24);

        if (diff === 1) data.streak++;
        else if (diff > 1) data.streak = 1;
    }

    data.lastSuccessDate = t;
}

// 🔥 streak 상태 텍스트
function getStreakLabel(streak) {
    if (streak === 0) return "😢 연속 끊김\n다시 시작!";
    if (streak < 3) return "🌱 시작";
    if (streak < 7) return "💪 유지중";
    if (streak < 30) return "🔥 강력";
    return "🏆 성공단계";
}

// 🔥 참기 버튼 클릭
function addCount() {
    const now = Date.now();

    if (now < nextAvailableTime) return;

    const t = today();

    data.history[t] = (data.history[t] || 0) + 1;

    updateStreak();

    // 목표 달성 체크
    const todayCount = getTodayCount();
    if (!data.goalAchievedToday && todayCount >= data.goal) {
        data.goalAchievedToday = true;
        alert("🎉 목표 달성!\n오늘 목표를 달성했습니다!\n정말 잘하고 있어요 👏");
    }

    // 🔥 타이머 시작 (현재 1초 / 나중에 5분으로 변경 가능)
    nextAvailableTime = Date.now() + 1000;

    save();
    updateUI();
    startTimer();
}

// 🔥 타이머
function startTimer() {
    const btn = document.querySelector(".cta-main");

    function updateTimer() {
        const now = Date.now();
        const diff = nextAvailableTime - now;

        if (diff <= 0) {
            btn.disabled = false;
            btn.classList.remove("disabled");
            btn.innerText = "🚭 참기 성공";
            return;
        }

        btn.disabled = true;
        btn.classList.add("disabled");

        const sec = Math.floor(diff / 1000);
        const m = Math.floor(sec / 60);
        const s = sec % 60;

        btn.innerText = `다음 참기까지 ${m}분 ${String(s).padStart(2,'0')}초 남았습니다. 화이팅!`;

        requestAnimationFrame(updateTimer);
    }

    updateTimer();
}

// 초기화
function resetToday() {
    const t = today();

    delete data.history[t];
    data.goalAchievedToday = false;

    alert("오늘 데이터가 초기화 되었습니다.");

    save();
    updateUI();
}

// 송금
function sendMoney() {
    const total = getTotalCount();
    const amount = total * data.unitMoney;

    if (amount === 0) return alert("보낼 금액 없음");

    if (confirm(`${amount.toLocaleString()}원 송금 후 오늘 데이터 초기화됩니다`)) {
        resetToday();
    }
}

// UI 업데이트
function updateUI() {
    const total = getTotalCount();
    const todayCount = getTodayCount();

    document.getElementById("total").innerText = total;
    document.getElementById("today").innerText = todayCount;
    document.getElementById("money").innerText =
        (total * data.unitMoney).toLocaleString();

    // 🔥 streak 표시 업그레이드
    document.getElementById("streak").innerText =
        `${data.streak}일째\n${getStreakLabel(data.streak)}`;

    let percent = Math.min((todayCount / data.goal) * 100, 100);
    document.getElementById("progress-fill").style.width = percent + "%";
    document.getElementById("progress-text").innerText =
        `${todayCount} / ${data.goal}`;
}

// 모달
function openStats() {
    document.getElementById("statsModal").classList.remove("hidden");
    drawChart();
}

function openCalendar() {
    document.getElementById("calendarModal").classList.remove("hidden");
    drawCalendar();
}

function closeModal() {
    document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
}

// 🔥 앱 시작 시
document.addEventListener("DOMContentLoaded", () => {
    checkStreakReset();
    updateUI();
    startTimer();
});