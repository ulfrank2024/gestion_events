// Variables
let selectedRating = null; // Pour stocker la note sélectionnée

// Ajouter un gestionnaire d'événement pour les cercles de notation
document.querySelectorAll(".rating-circle").forEach((button) => {
    button.addEventListener("click", function () {
        // Désélectionner tous les cercles
        document.querySelectorAll(".rating-circle").forEach((circle) => {
            circle.classList.remove("selected");
        });

        // Sélectionner le cercle cliqué
        button.classList.add("selected");

        // Mettre à jour la note sélectionnée
        selectedRating = button.getAttribute("data-rating");
    });
});

// Gérer l'envoi du formulaire
document
    .getElementById("satisfactionForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault(); // Empêche le rechargement de la page

        // Vérifier que l'utilisateur a sélectionné une note
        if (selectedRating !== null) {
            try {
                // Envoi de la satisfaction via une requête POST
                const response = await fetch("/rate-site", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: 1, // Utiliser l'ID de l'utilisateur actuel ici
                        rating: selectedRating,
                    }),
                });

                // Vérifier la réponse du serveur
                const result = await response.json();
                if (response.ok) {
                    // Si l'évaluation est réussie, afficher un message de confirmation
                    document.getElementById(
                        "confirmationMessage"
                    ).style.display = "block";
                    // Réinitialiser le formulaire
                    document.getElementById("satisfactionForm").reset();
                    selectedRating = null; // Réinitialiser la sélection
                    document
                        .querySelectorAll(".rating-circle")
                        .forEach((circle) => {
                            circle.classList.remove("selected");
                        });
                } else {
                    alert(
                        "Erreur lors de l'enregistrement de votre évaluation."
                    );
                }
            } catch (error) {
                console.error("Erreur:", error);
                alert(
                    "Une erreur est survenue lors de l'envoi de votre évaluation."
                );
            }
        } else {
            alert("Veuillez sélectionner une note.");
        }
    });
