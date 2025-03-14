document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Récupération des données du profil
        const response = await fetch("/api/profil");
        if (!response.ok)
            throw new Error("Erreur lors du chargement du profil");

        const { user, events } = await response.json();

        // Affichage des événements
        const eventsContainer = document.getElementById("events-container");
        if (eventsContainer) {
            eventsContainer.innerHTML = ""; // Réinitialiser le contenu

            (events || []).forEach((event) => {
                const eventElement = document.createElement("div");
                eventElement.classList.add("blockevenement");
                eventElement.setAttribute("data-id", event.id);
                eventElement.innerHTML = `
                    <img src="${event.image_url}" alt="${event.title}" width="400px" height="300px" />
                    <h3>${event.title}</h3>
                    <p class="evementDescrip">Description : ${event.description}</p>
                    <p>Date : ${event.date}</p>
                    <p>Lieu : ${event.location}</p>
                    <div class="blockbutton">
                        <button class="creerevenementbloc" data-id="${event.id}" data-action="voir">Voir</button>
                        <button class="creerevenementbloc" data-id="${event.id}" data-action="supprimer">Supprimer</button>
                        <button class="creerevenementbloc" data-id="${event.id}" data-action="modifier">Modifier</button>
                    </div>
                `;
                eventsContainer.appendChild(eventElement);
            });

            // Ajout des événements sur les boutons
            document
                .querySelectorAll(".creerevenementbloc")
                .forEach((button) => {
                    button.addEventListener("click", function () {
                        const eventId = this.getAttribute("data-id");
                        const action = this.getAttribute("data-action");

                        if (action === "voir") {
                            voirEvenement(eventId);
                        } else if (action === "supprimer") {
                            supprimerEvenement(eventId);
                        } else if (action === "modifier") {
                            modifierEvenement(eventId);
                        }
                    });
                });
        }
    } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
    }
});

// Fonction pour rediriger vers la page de détails
const voirEvenement = (id) => {
    window.location.href = `/evenement/${id}`;
};

// Fonction pour supprimer un événement
const supprimerEvenement = (eventId) => {
    if (confirm("Voulez-vous vraiment supprimer cet événement ?")) {
        fetch(`/events/${eventId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                alert(data.message);
                // Rafraîchir la page pour mettre à jour la liste des événements
                window.location.reload();
            })
            .catch((error) => {
                console.error("Erreur :", error);
                alert(
                    "Une erreur est survenue lors de la suppression de l'événement."
                );
            });
    }
};

// ✅ Fonction pour rediriger vers la page de création avec l'ID de l'événement
const modifierEvenement = (eventId) => {
    window.location.href = `/creer_evenement?id=${eventId}`;
};
