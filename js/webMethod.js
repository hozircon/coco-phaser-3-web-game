// 網頁載入時，執行下列func. (左側遊玩時間總表、上方倒數計時器、右側玩家排行榜)
window.onload=function() {showTime()}


function computeTime(timeSec){
    //轉換時間： sec > 年 天 時 分 秒
    var dif_year, dif_day, dif_hour, dif_min, dif_sec = 0;

    dif_year = Math.floor(timeSec/31557600);
    var tmp = timeSec%31557600;
    dif_day = Math.floor(tmp/86400);
    tmp = tmp%86400;
    dif_hour = Math.floor(tmp/3600);
    tmp = tmp%3600;
    dif_min = Math.floor(tmp/60);
    tmp = tmp%60;
    dif_sec = Math.floor(tmp);

    var timeResult = [dif_year,dif_day,dif_hour,dif_min,dif_sec];
    return timeResult;
}

function showTime(){
    //計算距離目標時間，並扣除玩家總遊玩時間(sum of play_survival_time)後，渲染到畫面上方time_data2區塊
    var endDate = new Date("07/01/2521");
    var nowDate = new Date();
    difference = (endDate.getTime()-nowDate.getTime())/1000;

    timeNum = computeTime(difference);
    var timeWord = ['year','day','hour','min','sec'];

    for(var i = 0; i<timeWord.length; i++){
        if(timeNum[i]<10){
            timeNum[i] = "0" + timeNum[i];
            }
        document.getElementById(timeWord[i]).innerHTML =   timeNum[i];
    }

    setTimeout('showTime()',1000);
}
