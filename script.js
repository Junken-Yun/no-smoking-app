let count = localStorage.getItem("noSmokingCount");

if (count === null) {

    count = 0;

} else {

    count = parseInt(count);

}

document.addEventListener("DOMContentLoaded", function () {

    updateUI();

});


function addCount() {

    count++;

    localStorage.setItem("noSmokingCount", count);

    updateUI();

}

function updateUI() {

    document.getElementById("count").innerText = count;

    let money = count * 300;

    document.getElementById("money").innerText = money.toLocaleString() + " 원";

}

function resetCount() {

    if (confirm("기록을 초기화할까요?")) {

        count = 0;

        localStorage.setItem("noSmokingCount", count);

        updateUI();

    }

}

function sendMoney() {

    alert("토스 앱에서 적립금을 송금하세요.");

    location.href = "https://toss.im";

}


/* Toss Mini App 환경 감지 */

if (window.TossApp) {

    TossApp.ready(() => {

        console.log("Running inside Toss Mini App");

    });

}