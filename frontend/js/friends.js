console.log("FRIENDS JS LOADED");

const API_BASE_URL = "https://typing-battle-arena-pypn.vercel.app";

const token = localStorage.getItem("access_token");

console.log("Token:", token);

const searchForm =
    document.getElementById("searchForm");

console.log("Search form:", searchForm);
let searchedUser = null;

searchForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const gameId =
        document.getElementById("gameIdInput").value.trim();

    console.log("Searching Game ID:", gameId);

    if (!gameId) {
        alert("Please enter Game ID");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/friends/search/${encodeURIComponent(gameId)}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        console.log(
            "Search status:",
            response.status
        );

        const responseText =
            await response.text();

        console.log(
            "Search response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                `Search failed: ${response.status}`
            );
        }


        const user =
            JSON.parse(responseText);
        searchedUser = user;

        console.log(
            "Found user:",
            user
        );


        document.getElementById(
            "foundUsername"
        ).innerText =
            user.username;


        document.getElementById(
            "foundGameId"
        ).innerText =
            user.game_id;


        document.getElementById(
            "searchResult"
        ).classList.remove(
            "hidden"
        );

    }

    catch (error) {

        console.error(
            "Search error:",
            error
        );

        alert(
            error.message
        );

    }

});

addFriendBtn.addEventListener(
    "click",
    async function () {

        if (!searchedUser) {

            alert("Please search a player first.");

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/friends/add`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            friend_game_id:
                                searchedUser.game_id

                        })
                    }
                );


            console.log(
                "Add friend status:",
                response.status
            );


            const responseText =
                await response.text();


            console.log(
                "Add friend response:",
                responseText
            );


            if (!response.ok) {

                let message =
                    "Failed to add friend.";

                try {

                    const error =
                        JSON.parse(
                            responseText
                        );

                    message =
                        error.detail ||
                        message;

                } catch {

                    // Response wasn't JSON
                }

                throw new Error(message);
            }


            alert(
                "🎉 Friend added successfully!"
            );


            /*
                Clear search result
            */

            searchResult.classList.add(
                "hidden"
            );

            gameIdInput.value = "";

            searchedUser = null;


            /*
                Load friend list
            */

            loadFriends();

        }

        catch (error) {

            console.error(
                "Add friend error:",
                error
            );

            alert(
                error.message
            );

        }

    }
);
async function loadFriends() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/friends/list`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        console.log(
            "Friend list status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "Friend list response:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                `Failed to load friends: ${response.status}`
            );

        }


        const friends =
            JSON.parse(responseText);


        console.log(
            "Friends:",
            friends
        );


        renderFriends(friends);

    }

    catch (error) {

        console.error(
            "Friend list error:",
            error
        );

    }

}
function renderFriends(friends) {

    const friendsList =
        document.getElementById(
            "friendsList"
        );

    const friendCount =
        document.getElementById(
            "friendCount"
        );


    friendCount.innerText =
        friends.length;


    if (friends.length === 0) {

        friendsList.innerHTML =`
            <div class="empty-state">

                <div>👥</div>

                <p>
                    No friends yet.
                </p>

                <span>
                    Search a player by Game ID
                    to add them.
                </span>

            </div>
        `;

        return;
    }


    friendsList.innerHTML = "";


    friends.forEach(function (friend) {

        const card =
            document.createElement("div");


        card.className =
            "friend-card";


        card.innerHTML =` 

            <div class="player-info">

                <div class="avatar">
                    👤
                </div>

                <div>

                    <h3>
                        ${friend.username}
                    </h3>

                    <p>
                        Game ID:
                        ${friend.game_id}
                    </p>

                </div>

            </div>

        `;


        friendsList.appendChild(card);

    });

}
loadFriends();