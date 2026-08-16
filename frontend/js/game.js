console.log("GAME JS LOADED");


const API_BASE_URL =
    "https://typing-battle-arena-pypn.vercel.app";


const token =
    localStorage.getItem(
        "access_token"
    );


const sessionId =
    localStorage.getItem(
        "session_id"
    );


let gameType = null;
let currentUserId = null;
let hostId = null;
let guestId = null;


if (!token) {

    window.location.href =
        "index.html";

}


if (!sessionId) {

    alert(
        "Game session not found."
    );

    window.location.href =
        "dashboard.html";

}

async function loadGameSession() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/rooms/sessions/${sessionId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Game session:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to load game session"
            );

        }


        /*
            Save game type
        */

        gameType =
            data.game_type;
        const raceTrack =
            document.getElementById(
                "raceTrack"
            );


        if (gameType === "race") {

            raceTrack.style.display =
                "block";

        } else {

            raceTrack.style.display =
                "none";

        }
        
        document
    .querySelectorAll(".fight-only")
    .forEach(function (element) {

        if (gameType === "fight") {

            element.style.display = "block";

        } else {

            element.style.display = "none";

        }

    });


        /*
            Update game mode
        */

        const gameMode =
            document.getElementById(
                "gameMode"
            );


        if (gameType === "fight") {

            gameMode.innerText =
                "⚔️ FIGHT";

        }

        else if (gameType === "race") {

            gameMode.innerText =
                "🏁 RACE";

        }


        /*
            Update target text
        */

        const targetTextElement =
            document.getElementById(
                "targetText"
            );


        targetTextElement.innerText =
            data.target_text;


        /*
            Player IDs
        */

        console.log(
            "Host ID:",
            data.host_id
        );

        console.log(
            "Guest ID:",
            data.guest_id
        );


        /*
            Session ID
        */

        console.log(
            "Session ID:",
            data.session_id
        );

    }

    catch (error) {

        console.error(
            "Load game session error:",
            error
        );

        alert(
            error.message
        );

    }

}

const timerElement =
    document.getElementById(
        "timer"
    );


const typingInput =
    document.getElementById(
        "typingInput"
    );
typingInput.disabled = true;
const countdownOverlay =
    document.getElementById(
        "countdownOverlay"
    );

const countdownText =
    document.getElementById(
        "countdownText"
    );
function startCountdown() {

    return new Promise(function (resolve) {

        let count = 3;

        countdownOverlay.style.display =
            "flex";

        countdownText.innerText =
            count;

        const countdownInterval =
            setInterval(function () {

                count--;

                if (count > 0) {

                    countdownText.innerText =
                        count;

                }

                else {

                    clearInterval(
                        countdownInterval
                    );

                    countdownText.innerText =
                        "GO!";

                    setTimeout(function () {

                        countdownOverlay.style.display =
                            "none";

                        typingInput.disabled =
                            false;

                        typingInput.focus();

                        resolve();

                    }, 700);

                }

            }, 1000);

    });

}

const targetTextElement =
    document.getElementById(
        "targetText"
    );


const yourProgress =
    document.getElementById(
        "yourProgress"
    );


const yourProgressText =
    document.getElementById(
        "yourProgressText"
    );


const gameMessage =
    document.getElementById(
        "gameMessage"
    );
const raceCar1 =
    document.getElementById(
                        "raceCar1"
                    );

const raceCar2 =
    document.getElementById(
                        "raceCar2"
                    );                



/*
    =========================
    GAME DATA
=========================
*/

const targetText =
    targetTextElement.innerText;


let timeLeft = 60;




loadGameSession();
/*
    =========================
    WEBSOCKET
    =========================
*/

const roomCode =
    localStorage.getItem("room_code");

const wsToken =
    localStorage.getItem("access_token");


let socket = null;


function connectWebSocket() {

    if (!roomCode || !wsToken) {

        console.error(
            "Room code or token missing."
        );

        return;
    }


    console.log(
        "Connecting WebSocket..."
    );


    socket =
        new WebSocket(
            `wss://htet-typing.onrender.com/ws/${encodeURIComponent(roomCode)}?token=${encodeURIComponent(wsToken)}`
        );


    socket.onopen =
        function () {

            console.log(
                "WebSocket connected ✅"
            );

        };
    socket.onmessage =
        async function (event) {

            const data =
                JSON.parse(event.data);


            console.log(
                "WebSocket message:",
                data
            );


            /*
                =========================
                CONNECTED
                =========================
            */

            if (data.type === "connected") {

                console.log(
                    "Connected to room:",
                    data.room_code
                );

                currentUserId =
                    data.user_id;
                localStorage.setItem(
                    "user_id",
                    currentUserId
                );
                hostId =
                    data.host_id;

                guestId =
                    data.guest_id;

                const hostUsername =
                    data.host_username;

                const guestUsername =
                    data.guest_username;

                const player1Name =
                    document.getElementById(
                        "player1Name"
                    );

                const player2Name =
                    document.getElementById(
                        "player2Name"
                    );


                if (currentUserId === hostId) {

                    // Host က ဝင်ထားတာ
                    player1Name.innerText =
                        hostUsername;

                    player2Name.innerText =
                        guestUsername;

                } else {

                    // Guest က ဝင်ထားတာ
                    player1Name.innerText =
                        guestUsername;

                    player2Name.innerText =
                        hostUsername;

                }

                

                console.log(
                    "My user ID:",
                    currentUserId
                );

                console.log(
                    "Host ID:",
                    hostId
                );

                console.log(
                    "Guest ID:",
                    guestId
                );

                console.log(
                    "Target text:",
                    data.target_text
                );

                return;
            }
            if (
                data.type ===
                "countdown_start"
            ) {

                console.log(
                    "Countdown started!"
                );

                startCountdown();

                return;
            }


            /*
                =========================
                TYPING RESULT
                =========================
            */

            if (
                data.message &&
                data.message.type ===
                "typing_result"
            ) {

                const result =
                    data.message;


                console.log(
                    "Typing result:",
                    result
                );


                /*
                    My progress
                */

                let myProgress = 0;


                /*
                    Opponent progress
                */

                let opponentProgressValue = 0;


                if (currentUserId === hostId) {

                    myProgress =
                        result.player1_progress;

                    opponentProgressValue =
                        result.player2_progress;

                } else {

                    myProgress =
                        result.player2_progress;

                    opponentProgressValue =
                        result.player1_progress;

                }


                /*
                    Convert to percentage
                */

                const myPercent =
                    (
                        myProgress /
                        targetTextElement.innerText.length
                    ) * 100;


                const opponentPercent =
                    (
                        opponentProgressValue /
                        targetTextElement.innerText.length
                    ) * 100;

                if (gameType === "race") {

                    const raceRoad =
                        document.querySelector(
                            ".race-road"
                        );

                    const roadWidth =
                        raceRoad.clientWidth;


                    const carWidth =
                        raceCar1.offsetWidth;


                    const startPosition = 20;


                    const finishPosition =
                        roadWidth -
                        carWidth -
                        45;


                    const player1Percent =
                        Math.min(
                            (
                                result.player1_progress /
                                targetTextElement.innerText.length
                            ) * 100,
                            100
                        );


                    const player2Percent =
                        Math.min(
                            (
                                result.player2_progress /
                                targetTextElement.innerText.length
                            ) * 100,
                            100
                        );


                    raceCar1.style.left =
                        `${
                            startPosition +
                            (
                                (finishPosition - startPosition) *
                                player1Percent /
                                100
                            )
                        }px`;


                    raceCar2.style.left =
                        `${
                            startPosition +
                            (
                                (finishPosition - startPosition) *
                                player2Percent /
                                100
                            )
                        }px`;

                }
                /*
                    My progress UI
                */

                yourProgress.style.width =
                    `${myPercent}%`;


                yourProgressText.innerText =
                    `${Math.floor(myPercent)}%`;


                /*
                    Opponent progress UI
                */

                const opponentProgress =
                    document.getElementById(
                        "opponentProgress"
                    );


                const opponentProgressText =
                    document.getElementById(
                        "opponentProgressText"
                    );
                

                opponentProgress.style.width =
                    `${opponentPercent}%`;


                opponentProgressText.innerText =
                    `${Math.floor(opponentPercent)}%`;


                /*
                    Correct / Wrong message
                */

                if (result.correct) {

                    gameMessage.innerText =
                        "⚡ Correct!";

                }

                else {

                    gameMessage.innerText =
                        "❌ Wrong character";

                }


                /*
                    Fight HP
                */

                if (
                    gameType ===
                    "fight"
                ) {

                    const player1Hp =
                        document.getElementById(
                            "player1Hp"
                        );

                    const player2Hp =
                        document.getElementById(
                            "player2Hp"
                        );

                    const player1HpText =
                        document.getElementById(
                            "player1HpText"
                        );

                    const player2HpText =
                        document.getElementById(
                            "player2HpText"
                        );


                    player1Hp.style.width =
                        `${result.player1_hp}%`;

                    player2Hp.style.width =
                        `${result.player2_hp}%`;


                    player1HpText.innerText =
                        `${result.player1_hp} / 100`;

                    player2HpText.innerText =
                        `${result.player2_hp} / 100`;

                }

            }

            /*
                =========================
                GAME OVER
                =========================
            */
            if (
                data.type ===
                "game_over"
            ) {

                console.log(
                    "GAME OVER:",
                    data
                );

                typingInput.disabled =
                    true;


                /*
                    Show winner / loser
                */

                if (
                    data.winner_id ===
                    currentUserId
                ) {

                    gameMessage.innerText =
                        "🏆 YOU WIN!";

                }

                else {

                    gameMessage.innerText =
                        "💀 YOU LOSE!";

                }


                /*
                    Get final game result
                */

                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/rooms/${encodeURIComponent(roomCode)}/result`,
                            {
                                method: "GET",

                                headers: {
                                    "Authorization":
                                        `Bearer ${token}`
                                }
                            }
                        );


                    const result =
                        await response.json();


                    console.log(
                        "Final game result:",
                        result
                    );


                    if (!response.ok) {

                        throw new Error(
                            result.detail ||
                            "Failed to load game result"
                        );

                    }


                    /*
                        Save final result
                    */

                    localStorage.setItem(
                        "game_result",
                        JSON.stringify(result)
                    );


                    /*
                        Go to result page
                    */

                    window.location.href =
                        "result.html";

                }

                catch (error) {

                    console.error(
                        "Result loading error:",
                        error
                    );

                    alert(
                        error.message
                    );

                }

            }
        };


    socket.onerror =
        function (error) {

            console.error(
                "WebSocket error:",
                error
            );

        };


    socket.onclose =
        function () {

            console.log(
                "WebSocket disconnected."
            );

        };

}
connectWebSocket();
/*
    =========================
    SEND TYPING
    =========================
*/

typingInput.addEventListener(
    "input",
    function () {

        if (!socket) {
            return;
        }

        if (
            socket.readyState !==
            WebSocket.OPEN
        ) {
            return;
        }

        const typedText =
            typingInput.value;

        if (!typedText) {
            return;
        }

        const lastChar =
            typedText[
                typedText.length - 1
            ];

        console.log(
            "Sending character:",
            lastChar
        );

        socket.send(
            JSON.stringify({

                type: "typing",

                char: lastChar

            })
        );

    }
);