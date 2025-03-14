document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const nameInput = form.querySelector("input[name='name']");
    const emailInput = form.querySelector("input[name='email']");
    const passwordInput = form.querySelector("input[name='password']");
    const confirmPasswordInput = form.querySelector(
        "input[name='confirmPassword']"
    );
    const roleSelect = form.querySelector("select[name='role']");
    const termsCheckbox = form.querySelector("input[name='terms']");
    const submitButton = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Empêche l'envoi automatique

        // Vérifications côté client
        let errors = [];

        if (!nameInput.value.trim()) {
            errors.push("Le nom est obligatoire.");
        }
        if (!validateEmail(emailInput.value)) {
            errors.push("Veuillez entrer un email valide.");
        }
        if (passwordInput.value.length < 6) {
            errors.push("Le mot de passe doit contenir au moins 6 caractères.");
        }
        if (passwordInput.value !== confirmPasswordInput.value) {
            errors.push("Les mots de passe ne correspondent pas.");
        }
        if (!termsCheckbox.checked) {
            errors.push("Vous devez accepter les termes et conditions.");
        }

        if (errors.length > 0) {
            alert(errors.join("\n"));
            return;
        }

        // Construire les données pour l'envoi au serveur
        const userData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            role: roleSelect.value,
        };

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = "/connexion"; // Redirection vers la connexion
            } else {
                alert(`Erreur: ${data.message}`);
            }
        } catch (error) {
            alert("Erreur de connexion au serveur. Veuillez réessayer.");
        }
    });

    // Fonction pour valider l'email avec une expression régulière
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
