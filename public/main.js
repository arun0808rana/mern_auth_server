const email = document.querySelector(".email");
const password = document.querySelector(".password");
const loginBtn = document.querySelector(".login");
const signupBtn = document.querySelector(".signup");
const privateBox = document.querySelector(".private-box");
let hasUsedRefreshToken = false;

function handleSubmit(event) {
  event.preventDefault();
}

async function signup(){
  const payload = {
    email: email.value,
    password: password.value,
  };

  try {
    const response = await fetch(`http://localhost:8998/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Success:", result);
    localStorage.setItem('refreshToken', result.refreshToken);
  } catch (error) {
    console.error("Error:", error);
  }
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
    localStorage.setItem('refreshToken', result.refreshToken);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function makePrivateRequest() {
  try {
    const response = await fetch(`http://localhost:8998/test/private`);

    const result = await response.json();
    console.log("Success:", result);
    privateBox.innerText = result.data.msg;
  } catch (error) {
    console.error("Error:", error);
    privateBox.innerText = 'Authorization Failed';
  }
}

async function makePrivateRequestUsingRefreshToken() {
   if(!hasUsedRefreshToken){
      refreshToken();
    }
}

async function refreshToken(){
  try {
    hasUsedRefreshToken = true;
    const token = localStorage.getItem('refreshToken');
    const payload={refreshToken:token}
    const response = await fetch(`http://localhost:8998/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    hasUsedRefreshToken = false;
    console.log("Success:", result);
    if(result.success){
      makePrivateRequest();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function logout(){
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch(`http://localhost:8998/auth/logout`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({refreshToken}),
    });

    const result = await response.json();
    console.log('Logged out succesfully');
  } catch (error) {
    console.error(error);
  }
}