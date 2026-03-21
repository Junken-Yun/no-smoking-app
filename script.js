const data = JSON.parse(localStorage.getItem("app")) || {
    history:{},
    streak:0,
    lastSuccessDate:null,
    goal:10,
    unitMoney:300,
    goalAchievedToday:false
};

let nextAvailableTime = Number(localStorage.getItem("timer")) || 0;

function today(){
    return new Date().toISOString().slice(0,10);
}

function save(){
    localStorage.setItem("app",JSON.stringify(data));
    localStorage.setItem("timer",nextAvailableTime);
}

function checkStreak(){
    if(!data.lastSuccessDate) return;

    const diff=(new Date(today())-new Date(data.lastSuccessDate))/(1000*60*60*24);
    if(diff>1) data.streak=0;
}

function streakLabel(s){
    if(s===0) return "😢 연속 끊김\n다시 시작!";
    if(s<3) return "🌱 시작";
    if(s<7) return "💪 유지중";
    if(s<30) return "🔥 강력";
    return "🏆 성공단계";
}

function addCount(){
    if(Date.now()<nextAvailableTime) return;

    const t=today();
    data.history[t]=(data.history[t]||0)+1;

    if(!data.lastSuccessDate){
        data.streak=1;
    } else {
        const diff=(new Date(t)-new Date(data.lastSuccessDate))/(1000*60*60*24);
        if(diff===1) data.streak++;
        else if(diff>1) data.streak=1;
    }

    data.lastSuccessDate=t;

    if(!data.goalAchievedToday && data.history[t]>=data.goal){
        data.goalAchievedToday=true;
        alert("🎉 목표 달성! 정말 잘하고 있어요!");
    }

    nextAvailableTime=Date.now()+1000;

    save();
    updateUI();
    timer();
}

function timer(){
    const btn=document.querySelector(".cta-main");

    function run(){
        const diff=nextAvailableTime-Date.now();

        if(diff<=0){
            btn.disabled=false;
            btn.classList.remove("disabled");
            btn.innerText="🚭 참기 성공";
            return;
        }

        btn.disabled=true;
        btn.classList.add("disabled");

        const sec=Math.floor(diff/1000);
        const m=Math.floor(sec/60);
        const s=sec%60;

        btn.innerText=`다음 참기까지 ${m}분 ${String(s).padStart(2,'0')}초 남았습니다. 화이팅!`;

        requestAnimationFrame(run);
    }
    run();
}

function updateUI(){
    const total=Object.values(data.history).reduce((a,b)=>a+b,0);
    const t=data.history[today()]||0;

    document.getElementById("total").innerText=total;
    document.getElementById("today").innerText=t;
    document.getElementById("money").innerText=(total*data.unitMoney).toLocaleString();

    document.getElementById("streak").innerText=
        `${data.streak}일째\n${streakLabel(data.streak)}`;

    const percent=Math.min((t/data.goal)*100,100);
    document.getElementById("progress-fill").style.width=percent+"%";
    document.getElementById("progress-text").innerText=`${t}/${data.goal}`;
}

function resetToday(){
    delete data.history[today()];
    data.goalAchievedToday=false;
    alert("오늘 데이터가 초기화 되었습니다.");
    save();
    updateUI();
}

function sendMoney(){
    const total=Object.values(data.history).reduce((a,b)=>a+b,0);
    const amount=total*data.unitMoney;

    if(confirm(`${amount.toLocaleString()}원 송금 후 초기화`)){
        resetToday();
    }
}

function openStats(){
    document.getElementById("statsModal").classList.remove("hidden");
    drawChart();
}

function openCalendar(){
    document.getElementById("calendarModal").classList.remove("hidden");
    drawCalendar();
}

function closeModal(){
    document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"));
}

function formatLabel(d){
    const days=["일","월","화","수","목","금","토"];
    return `${d.getMonth()+1}/${d.getDate()}(${days[d.getDay()]})`;
}

function drawChart(){
    const canvas=document.getElementById("chart");
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,320,220);

    const keys=Object.keys(data.history).slice(-30);
    const values=keys.map(k=>data.history[k]);
    if(values.length===0) return;

    const max=Math.max(...values,1);

    // Y축
    for(let i=0;i<=5;i++){
        const y=200-(i*30);
        ctx.fillText(Math.round(max/5*i),0,y);
    }

    keys.forEach((k,i)=>{
        const d=new Date(k);
        const h=(values[i]/max)*150;
        ctx.fillRect(i*10+20,200-h,8,h);
        ctx.fillText(formatLabel(d),i*10+20,210);
    });
}

function drawCalendar(){
    const cal=document.getElementById("calendar");
    cal.innerHTML="";

    const days=["일","월","화","수","목","금","토"];
    days.forEach(d=>{
        cal.innerHTML+=`<div class="day-header">${d}</div>`;
    });

    const now=new Date();
    const y=now.getFullYear();
    const m=now.getMonth();

    const first=new Date(y,m,1).getDay();
    const last=new Date(y,m+1,0).getDate();

    for(let i=0;i<first;i++) cal.innerHTML+="<div></div>";

    for(let d=1;d<=last;d++){
        const date=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const c=data.history[date]||0;

        cal.innerHTML+=`<div class="day-box">${d}<br>${c}</div>`;
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    checkStreak();
    updateUI();
    timer();
});