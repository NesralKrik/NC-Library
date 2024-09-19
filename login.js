import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOtr2mrlOSFfByUTqZQovR0KGKTzbCzfE",
    authDomain: "login-a9ada.firebaseapp.com",
    projectId: "login-a9ada",
    storageBucket: "login-a9ada.appspot.com",
    messagingSenderId: "1043146610365",
    appId: "1:1043146610365:web:b61d8859859c17febd09d4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    const signupForm = document.querySelector('.signup-form');

    // Toggle password visibility
    function togglePasswordVisibility(inputId, toggleIconId) {
        const passwordInput = document.getElementById(inputId);
        const toggleIcon = document.getElementById(toggleIconId);

        if (!passwordInput || !toggleIcon) {
            console.error(`Element with ID ${inputId} or ${toggleIconId} not found.`);
            return;
        }

        toggleIcon.addEventListener('click', function () {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.textContent = '👁️';
            } else {
                passwordInput.type = 'password';
                toggleIcon.textContent = '🙈';
            }
        });
    }

    togglePasswordVisibility('password', 'login-toggle-password');
    togglePasswordVisibility('signup-password', 'signup-toggle-password');
    togglePasswordVisibility('confirm-password', 'confirm-toggle-password');

    // Sign Up
    signupForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const signupUsername = document.getElementById('signup-username').value;
        const signupPassword = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (signupPassword !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        createUserWithEmailAndPassword(auth, signupUsername, signupPassword)
            .then(() => {
                alert('Account created successfully! You can now log in.');
                signupForm.reset();
                signupContainer.style.display = 'none';
                loginContainer.style.display = 'block';
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Login
    document.querySelector('.login-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const loginUsername = document.getElementById('username').value;
        const loginPassword = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, loginUsername, loginPassword)
            .then(() => {
                alert('Login successful! Welcome back.');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert('Invalid username or password. Please try again.');
            });
    });

    // Google Sign In
    document.getElementById('google-login').addEventListener('click', function () {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                alert('Google sign-in successful!');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert(error.message);
            });
    });

    // Sign Up Link
    document.getElementById('signup-link').addEventListener('click', function (event) {
        event.preventDefault();
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    });

    // Login Link
    document.getElementById('login-link').addEventListener('click', function (event) {
        event.preventDefault();
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });
});
