const API_BASE_URL =
    "https://typing-battle-arena-pypn.vercel.app";


const token =
    localStorage.getItem("access_token");


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
    GET CURRENT USER
    =========================
*/

async function loadCurrentUser() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        /*
            Token invalid / expired
        */

        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "index.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load user"
            );

        }


        const user =
            await response.json();


        console.log(
            "Current user:",
            user
        );


        /*
            =========================
            UPDATE UI
            =========================
        */

        document.getElementById(
            "usernameDisplay"
        ).innerText =
            user.username;


        document.getElementById(
            "welcomeUsername"
        ).innerText =
            user.username;


        document.getElementById(
            "profileUsername"
        ).innerText =
            user.username;


        document.getElementById(
            "gameId"
        ).innerText =
            user.game_id;


        /*
            Format account creation time
        */

        const createdDate =
            new Date(
                user.created_at
            );


        document.getElementById(
            "createdAt"
        ).innerText =
            createdDate.toLocaleString();

    }

    catch (error) {

        console.error(
            "Get Me error:",
            error
        );

        alert(
            "Unable to load your profile."
        );

    }

}


/*
    =========================
    LOGOUT
    =========================
*/

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "access_token"
        );

        window.location.href =
            "index.html";

    }
);


/*
    Start
*/

loadCurrentUser();

const friendListBtn =
    document.getElementById(
        "friendListBtn"
    );

const searchFriendBtn =
    document.getElementById(
        "searchFriendBtn"
    );


friendListBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "friends.html";

    }
);


searchFriendBtn.addEventListener(
    "click",
    function () {

        window.location.href =
            "friends.html";

    }
);
const gameButtons =
    document.querySelectorAll(".game-btn");


gameButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            const gameType =
                button.dataset.gameType;

            console.log(
                "Selected game:",
                gameType
            );


            window.location.href =
                `lobby.html?mode=${gameType}`;

        }
    );

});