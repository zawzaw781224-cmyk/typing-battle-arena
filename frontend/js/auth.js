const signupForm =
    document.getElementById("signupForm");

const API_BASE_URL =
    "http://127.0.0.1:8000";


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;


            if (!username || !password) {

                alert("Please enter username and password.");

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username: username,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.detail ||
                        "Registration failed."
                    );

                    return;
                }


                console.log(
                    "Registration success:",
                    data
                );


                alert(
                    "Account created successfully!"
                );


                // Go to Login page

                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Register error:",
                    error
                );


                alert(
                    "Cannot connect to server."
                );

            }

        }
    );

}
const loginForm =
    document.getElementById("loginForm");





if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;


            if (!username || !password) {

                alert(
                    "Please enter username and password."
                );

                return;
            }


            try {

                const formData =
                    new URLSearchParams();

                formData.append(
                    "username",
                    username
                );

                formData.append(
                    "password",
                    password
                );


                const response =
                    await fetch(
                        `${API_BASE_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded"
                            },

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.detail ||
                        "Login failed."
                    );

                    return;
                }


                console.log(
                    "Login success:",
                    data
                );


                /*
                    Save JWT
                */

                localStorage.setItem(
                    "access_token",
                    data.access_token
                );


                /*
                    Go to Dashboard
                */

                window.location.href =
                    "dashboard.html";

            }

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                alert(
                    "Cannot connect to server."
                );

            }

        }
    );

}