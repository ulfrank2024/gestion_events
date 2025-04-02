document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const emailInput = form.querySelector("input[name='email']");
    const passwordInput = form.querySelector("input[name='password']");
    const rememberCheckbox = form.querySelector("input[name='remember']");
    const errorMessage = document.createElement("p"); // Élément pour afficher l'erreur
    errorMessage.classList.add("error-message");
    form.appendChild(errorMessage); // Ajoute le message d'erreur sous le formulaire

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Empêche le rechargement automatique de la page

        // Réinitialiser les erreurs précédentes
        errorMessage.textContent = "";
        errorMessage.style.display = "none";

        // Vérifications côté client
        let errors = [];
        if (!validateEmail(emailInput.value)) {
            errors.push("Veuillez entrer un email valide.");
        }
        if (passwordInput.value.trim() === "") {
            errors.push("Le mot de passe est obligatoire.");
        }

        if (errors.length > 0) {
            errorMessage.textContent = errors.join("\n");
            errorMessage.style.display = "block";
            return;
        }

        // Construire les données pour l'envoi au serveur
        const loginData = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
            remember: rememberCheckbox.checked,
        };

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (response.ok) {
                // 🔥 Correction ici : Stocke l'ID utilisateur dans localStorage
                localStorage.setItem("user_id", data.user.id);
                console.log("Utilisateur connecté avec ID :", data.user.id);

                // Redirige vers la page d'accueil
                window.location.href = "/";
            } else {
                errorMessage.textContent = `Erreur: ${data.message}`;
                errorMessage.style.display = "block";
            }
        } catch (error) {
            errorMessage.textContent =
                "Erreur de connexion au serveur. Veuillez réessayer.";
            errorMessage.style.display = "block";
        }
    });

    // Fonction pour valider l'email avec une expression régulière
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
