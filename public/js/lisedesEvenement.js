document.addEventListener("DOMContentLoaded", async () => {
    const eventsContainer = document.getElementById("events-container");
    const userId = localStorage.getItem("user_id"); // Vérifier si l'utilisateur est connecté

    // Récupérer le rôle de l'utilisateur depuis le localStorage
    let userRole = localStorage.getItem("user_role"); // Si déjà présent dans le localStorage
    if (!userRole) {
        // Si le rôle n'est pas dans le localStorage, effectuer la requête pour le récupérer
        console.log("Récupération du rôle via l'API...");
        try {
            const response = await fetch("/api/get-user-role");
            if (response.ok) {
                const data = await response.json();
                userRole = data.role; // Mettre à jour le rôle
                // Sauvegarder dans le localStorage pour une utilisation future
                localStorage.setItem("user_role", userRole);
                console.log("Rôle mis à jour dans le localStorage :", userRole);
            } else {
                console.error("Erreur lors de la récupération du rôle");
            }
        } catch (error) {
            console.error(
                "Erreur lors de la récupération du rôle de l'utilisateur :",
                error
            );
        }
    }

    try {
        const response = await fetch("/events");
        if (!response.ok)
            throw new Error("Erreur lors du chargement des événements");

        const evenements = await response.json();

        // Grouper les événements par catégorie
        const categories = {};
        evenements.forEach((event) => {
            if (!categories[event.category]) {
                categories[event.category] = [];
            }
            categories[event.category].push(event);
        });

        // Générer le HTML classé par catégorie
        eventsContainer.innerHTML = Object.entries(categories)
            .map(
                ([category, events]) => `
                <div class="categorie">
                    <h2>${
                        category.charAt(0).toUpperCase() + category.slice(1)
                    }</h2>
                    <div class="events-list">
                        ${events
                            .map(
                                (event) => `
                            <div class="blockevenement" data-event-id="${
                                event.id
                            }">
                                <img src="${event.image_url}" alt="${
                                    event.title
                                }" width="400px" height="300px" />
                                <h3>${event.title}</h3>
                                <p>Description : ${event.description}</p>
                                <p>Date : ${event.date}</p>
                                <p>Lieu : ${event.location}</p>
                                <p class="message-erreur" style="color: red; display: none;"></p>
                                <div class="blockbutton">
                                    ${
                                        userRole &&
                                        userRole !== "administrateur"
                                            ? `<button class="inscriptionEvenement" data-id="${event.id}">S'inscrire</button>`
                                            : ""
                                    }

                                    ${
                                        !userId
                                            ? `<button class="redirectConnexion">S'inscrire</button>`
                                            : ""
                                    }
                                    <button class="voirevenement" data-id="${
                                        event.id
                                    }">Voir</button>
                                </div>
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                </div>
            `
            )
            .join("");

        // Redirection vers la page de connexion
        document.querySelectorAll(".redirectConnexion").forEach((button) => {
            button.addEventListener("click", () => {
                window.location.href = "/connexion";
            });
        });

        // Redirection vers les détails de l'événement
        document.querySelectorAll(".voirevenement").forEach((button) => {
            button.addEventListener("click", (event) => {
                const eventId = event.target.getAttribute("data-id");
                window.location.href = `/evenement/${eventId}`;
            });
        });

        // Gestion des inscriptions
        document.querySelectorAll(".inscriptionEvenement").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const eventId = event.target.getAttribute("data-id");

                try {
                    const response = await fetch("/inscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            user_id: userId,
                            event_id: eventId,
                        }),
                    });

                    const responseData = await response.json();
                    const eventCard = document.querySelector(
                        `.blockevenement[data-event-id="${eventId}"]`
                    );
                    const errorMessage =
                        eventCard.querySelector(".message-erreur");

                    if (!response.ok) {
                        errorMessage.textContent =
                            responseData.message || "Vous êtes déjà inscrit.";
                        errorMessage.style.display = "block";
                        return;
                    }

                    event.target.disabled = true;
                    event.target.textContent = "Déjà inscrit";
                    errorMessage.style.display = "none";
                } catch (error) {
                    console.error("Erreur :", error);
                }
            });
        });
    } catch (error) {
        console.error("Erreur :", error);
        eventsContainer.innerHTML =
            "<p>Impossible de charger les événements.</p>";
    }
});
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.querySelectorAll(".icon-item").forEach((item, index) => {
            setTimeout(() => {
                item.classList.add("show");
            }, index * 200); // Décalage progressif entre les icônes
        });
    }, 300); // Petite pause avant de lancer l'effet
});
document.addEventListener("DOMContentLoaded", () => {
    const temoignages = document.getElementById("temoignages");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    temoignages.classList.add("show"); // Ajoute la classe quand l'élément est visible
                    observer.unobserve(temoignages); // Stoppe l'observation après l'animation
                }
            });
        },
        { threshold: 0.3 }
    ); // Déclenche quand 30% de l'élément est visible

    observer.observe(temoignages);
});
