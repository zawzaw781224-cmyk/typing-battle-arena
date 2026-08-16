console.log("RESULT JS LOADED");


const token =
    localStorage.getItem("access_token");


const currentUserId =
    Number(
        localStorage.getItem("user_id")
    );


const savedResult =
    localStorage.getItem("game_result");


/*
    =========================
    CHECK AUTH / RESULT
    =========================
*/

if (!token) {

    window.location.href =
        "index.html";

}


if (!savedResult) {

    alert(
        "Game result not found."
    );

    window.location.href =
        "dashboard.html";

}


/*
    =========================
    LOAD RESULT
    =========================
*/

const result =
    JSON.parse(savedResult);


console.log(
    "Result data:",
    result
);


/*
    =========================
    ELEMENTS
    =========================
*/

const resultTitle =
    document.getElementById(
        "resultTitle"
    );


const resultMessage =
    document.getElementById(
        "resultMessage"
    );


const gameType =
    document.getElementById(
        "gameType"
    );


const roomCode =
    document.getElementById(
        "roomCode"
    );


const yourProgress =
    document.getElementById(
        "yourProgress"
    );


const opponentProgress =
    document.getElementById(
        "opponentProgress"
    );


const yourHp =
    document.getElementById(
        "yourHp"
    );


const opponentHp =
    document.getElementById(
        "opponentHp"
    );


const dashboardBtn =
    document.getElementById(
        "dashboardBtn"
    );
const yourHpRow =
    document.getElementById("yourHpRow");

const opponentHpRow =
    document.getElementById("opponentHpRow");

/*
    =========================
    GAME TYPE
    =========================
*/

if (
    result.game_type ===
    "fight"
) {

    gameType.innerText =
        "⚔️ Fight";
    yourHpRow.style.display = "block";
    opponentHpRow.style.display = "block";

}

else if (
    result.game_type ===
    "race"
) {

    gameType.innerText =
        "🏁 Race";
    yourHpRow.style.display = "none";
    opponentHpRow.style.display = "none";

}


/*
    =========================
    ROOM
    =========================
*/

roomCode.innerText =
    result.room_code;


/*
    =========================
    FIND PLAYER
    =========================
*/

let myProgress = 0;
let enemyProgress = 0;

let myHp = 100;
let enemyHp = 100;


if (
    currentUserId ===
    result.host_id
) {

    myProgress =
        result.player1_progress;

    enemyProgress =
        result.player2_progress;

    myHp =
        result.player1_hp;

    enemyHp =
        result.player2_hp;

}

else {

    myProgress =
        result.player2_progress;

    enemyProgress =
        result.player1_progress;

    myHp =
        result.player2_hp;

    enemyHp =
        result.player1_hp;

}


/*
    =========================
    PERCENTAGE
    =========================
*/

const targetLength =
    result.player1_progress >=
    result.player2_progress
        ? result.player1_progress
        : result.player2_progress;


/*
    Progress values
    */

yourProgress.innerText =
    `${myProgress} characters`;


opponentProgress.innerText =
    `${enemyProgress} characters`;


yourHp.innerText =
    `${myHp} / 100`;


opponentHp.innerText =
    `${enemyHp} / 100`;


/*
    =========================
    WIN / LOSE
    =========================
*/

if (
    result.winner_id ===
    currentUserId
) {

    resultTitle.innerText =
        "🏆 YOU WIN!";

    resultMessage.innerText =
        "Congratulations! You won the match.";

}

else {

    resultTitle.innerText =
        "💀 YOU LOSE";

    resultMessage.innerText =
        "Better luck next time!";

}


/*
    =========================
    BACK TO DASHBOARD
    =========================
*/

dashboardBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "game_result"
        );

        localStorage.removeItem(
            "session_id"
        );

        localStorage.removeItem(
            "room_code"
        );

        localStorage.removeItem(
            "game_type"
        );


        window.location.href =
            "dashboard.html";

    }
);