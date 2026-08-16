console.log("LOBBY JS LOADED");


const API_BASE_URL =
    "http://127.0.0.1:8000";


const token =
    localStorage.getItem("access_token");

    let currentUser = null;


/*
    =========================
    AUTH CHECK
    =========================
*/

if (!token) {

    window.location.href =
        "index.html";

}


/*
    =========================
    ELEMENTS
    =========================
*/



const createRoomBtn =
    document.getElementById(
        "createRoomBtn"
    );

const lobbyMessage =
    document.getElementById(
        "lobbyMessage"
    );

const joinForm =
    document.getElementById(
        "joinForm"
    );

const roomCodeInput =
    document.getElementById(
        "roomCodeInput"
    );


/*
    Selected game mode
*/
const params =
    new URLSearchParams(
        window.location.search
    );

const selectedGameType =
    params.get("mode");

console.log(
    "Selected game type:",
    selectedGameType
);
if (
    selectedGameType !== "fight" &&
    selectedGameType !== "race"
) {

    alert(
        "Game type not selected."
    );

    window.location.href =
        "dashboard.html";
}
const lobbyTitle =
    document.getElementById(
        "lobbyTitle"
    );


if (selectedGameType === "fight") {

    lobbyTitle.innerText =
        "⚔️ Fight Lobby";

}

else if (selectedGameType === "race") {

    lobbyTitle.innerText =
        "🏁 Race Lobby";

}
/*
    =========================
    CREATE ROOM
    =========================
*/

createRoomBtn.addEventListener(
    "click",
    async function () {

        if (
            selectedGameType !== "fight" &&
            selectedGameType !== "race"
        ) {

            alert(
                "Invalid game type."
            );

            return;
        }


        createRoomBtn.disabled =
            true;


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/rooms/create`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            game_type:
                                selectedGameType

                        })

                    }
                );


            console.log(
                "Create room status:",
                response.status
            );


            const responseText =
                await response.text();


            console.log(
                "Create room response:",
                responseText
            );


            if (!response.ok) {

                let message =
                    "Failed to create room.";

                try {

                    const error =
                        JSON.parse(
                            responseText
                        );

                    message =
                        error.detail ||
                        message;

                }

                catch {

                    // Response wasn't JSON

                }


                throw new Error(
                    message
                );

            }


            const room =
                JSON.parse(
                    responseText
                );


            console.log(
                "Created room:",
                room
            );
            /*
                Save room information
            */

            localStorage.setItem(
                "room_code",
                room.room_code
            );


            localStorage.setItem(
                "game_type",
                room.game_type
            );


            /*
                Go to Lobby Room
            */

            window.location.href =
           `lobby.html?room=${encodeURIComponent(room.room_code)}&mode=${encodeURIComponent(room.game_type)}`;

        }

        catch (error) {

            console.error(
                "Create room error:",
                error
            );

            alert(
                error.message
            );

        }

        finally {

            createRoomBtn.disabled =
                false;

        }

    }
);


/*
    =========================
    JOIN ROOM
    =========================
*/

joinForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const roomCode =
            roomCodeInput.value
                .trim()
                .toUpperCase();


        if (!roomCode) {

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/rooms/join`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            room_code:
                                roomCode

                        })

                    }
                );


            const responseText =
                await response.text();


            console.log(
                "Join response:",
                response.status,
                responseText
            );


            if (!response.ok) {

                let message =
                    "Failed to join room.";

                try {

                    const error =
                        JSON.parse(
                            responseText
                        );

                    message =
                        error.detail ||
                        message;

                }

                catch {

                    // Response wasn't JSON

                }


                throw new Error(
                    message
                );

            }


            const room =
                JSON.parse(
                    responseText
                );


            localStorage.setItem(
                "room_code",
                room.room_code
            );


            localStorage.setItem(
                "game_type",
                room.game_type
            );


            alert(
                "Joined room successfully! 🎮"
            );


            window.location.href =
           `lobby.html?room=${encodeURIComponent(room.room_code)}&mode=${encodeURIComponent(room.game_type)}`;

        }

        catch (error) {

            console.error(
                "Join room error:",
                error
            );

            alert(
                error.message
            );

        }

    }
);
const urlParams =
    new URLSearchParams(
        window.location.search
    );


const roomCode =
    urlParams.get("room");


const roomCodeDisplay =
    document.getElementById(
        "roomCodeDisplay"
    );


if (roomCode) {

    roomCodeDisplay.innerText =
        roomCode;

}
const copyRoomBtn =
    document.getElementById(
        "copyRoomBtn"
    );


copyRoomBtn.addEventListener(
    "click",
    async function () {

        if (!roomCode) {

            return;

        }


        try {

            await navigator.clipboard.writeText(
                roomCode
            );


            copyRoomBtn.innerText =
                "✅ Copied!";


            setTimeout(
                function () {

                    copyRoomBtn.innerText =
                        "📋 Copy Room Code";

                },
                1500
            );

        }

        catch (error) {

            console.error(
                "Copy error:",
                error
            );

        }

    }
);
const readyBtn =
    document.getElementById("readyBtn");

const readyMessage =
    document.getElementById("readyMessage");


readyBtn.addEventListener(
    "click",
    async function (event) {
        event.preventDefault();

        if (!roomCode) {

            alert("Room code not found.");

            return;
        }


        readyBtn.disabled = true;


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/rooms/${encodeURIComponent(roomCode)}/ready`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            console.log(
                "Ready response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to ready"
                );

            }


            readyBtn.innerText =
                "✅ READY";


            readyMessage.innerText =
                "You are ready. Waiting for the other player...";


            /*
                Update status
            */

            document.getElementById(
                "hostStatus"
            ).innerText =
                data.host_ready
                    ? "🟢 Ready"
                    : "Waiting";


            document.getElementById(
                "guestStatus"
            ).innerText =
                data.guest_ready
                    ? "🟢 Ready"
                    : "Waiting";


            /*
                Both ready
            */

            if (
                data.host_ready &&
                data.guest_ready
            ) {

                readyMessage.innerText =
                    "🔥 Both players are ready!";


                

            }

        }

        catch (error) {

            console.error(
                "Ready error:",
                error
            );


            alert(
                error.message
            );


            readyBtn.disabled =
                false;

        }

    }
);

const startGameBtn =
    document.getElementById(
        "startGameBtn"
    );
async function loadCurrentUser() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {

            window.location.href =
                "index.html";

            return;

        }

        currentUser =
            await response.json();

        console.log(
            "Current user:",
            currentUser
        );

    }

    catch (error) {

        console.error(
            "Auth error:",
            error
        );

    }

}
loadCurrentUser();
startGameBtn.addEventListener(
    "click",
    async function (event) {

        event.preventDefault();

        if (!roomCode) {

            alert(
                "Room code not found."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/rooms/${encodeURIComponent(roomCode)}/start`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            console.log(
                "Start game response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to start game"
                );

            }


            /*
                Save session ID
            */

            localStorage.setItem(
                "session_id",
                data.session_id
            );


            localStorage.setItem(
                "room_code",
                data.room_code
            );


            localStorage.setItem(
                "game_type",
                data.game_type
            );


            /*
                Go to game
            */

            window.location.href =
                "game.html";

        }

        catch (error) {

            console.error(
                "Start game error:",
                error
            );

            alert(
                error.message
            );

        }

    }
);
function updateStartButton(room) {

    if (!startGameBtn) {
        return;
    }

    const isHost =
        currentUser &&
        room.host_id === currentUser.id;

    const canStart =
        isHost &&
        room.status === "ready";

    if (canStart) {

        startGameBtn.style.display =
            "inline-block";

    } else {

        startGameBtn.style.display =
            "none";
    }
}
async function checkGameStatus() {

    if (!roomCode) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/rooms/${encodeURIComponent(roomCode)}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {
            return;
        }

        const room =
            await response.json();

        console.log(
            "Room status:",
            room.status
        );

        updateStartButton(room);


        if (room.status === "playing") {

            console.log(
                "Game started!"
            );


            if (!room.session_id) {

                console.error(
                    "Session ID not found."
                );

                return;
            }


            /*
                Save session information
            */

            localStorage.setItem(
                "session_id",
                room.session_id
            );


            localStorage.setItem(
                "room_code",
                room.room_code
            );


            localStorage.setItem(
                "game_type",
                room.game_type
            );


            console.log(
                "Session ID:",
                room.session_id
            );


            window.location.href =
                "game.html";
        }

    }

    catch (error) {

        console.error(
            "Check game status error:",
            error
        );

    }
}
async function initializeLobby() {

    await loadCurrentUser();

    checkGameStatus();

    setInterval(
        checkGameStatus,
        1000
    );
}

initializeLobby();