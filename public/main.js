const email = document.querySelector(".email");
const password = document.querySelector(".password");
const loginBtn = document.querySelector(".login");
const signupBtn = document.querySelector(".signup");

function handleSubmit(event) {
  event.preventDefault();
}

async function login() {
  const payload = {
    email: email.value,
    password: password.value,
  };

  try {
    const response = await fetch(`http://localhost:8998/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function makePrivateRequest() {
  try {
    const response = await fetch(`http://localhost:8998/test/private`);

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}
