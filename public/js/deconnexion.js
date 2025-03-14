document
    .getElementById("logoutBtn")
    .addEventListener("click", function (event) {
        event.preventDefault(); // Empêche la redirection immédiate

        // Supprime toutes les informations utilisateur stockées
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user_id"); // Si tu stockes l'ID ici
        localStorage.clear(); // Supprime tout le contenu du localStorage

        // Redirige vers la route de déconnexion du serveur
        window.location.href = "/logout";
    });
