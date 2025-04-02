document.addEventListener("DOMContentLoaded", async function () {
    const category = document
        .querySelector("h1")
        .textContent.replace("Événements de la catégorie : ", "")
        .trim();

    try {
        // Récupérer les événements via l'API
        const response = await fetch(`/api/categories/${category}`);
        const data = await response.json();

        // Si des événements sont trouvés, on met à jour l'HTML
        if (data.length > 0) {
            const eventsList = document.querySelector(".events-list"); // Cible la classe 'events-list'
            eventsList.innerHTML = ""; // Réinitialiser la liste d'événements

            data.forEach((event) => {
                // Créer un élément pour chaque événement
                const eventCard = document.createElement("div");
                eventCard.classList.add("event-card"); // Cible la classe 'event-card'

                const eventTitle = document.createElement("h2");
                eventTitle.textContent = event.title;
                eventCard.appendChild(eventTitle);

                const eventDate = document.createElement("p");
                eventDate.innerHTML = `<strong>Date :</strong> ${event.date}`;
                eventCard.appendChild(eventDate);

                const eventLocation = document.createElement("p");
                eventLocation.innerHTML = `<strong>Lieu :</strong> ${event.location}`;
                eventCard.appendChild(eventLocation);

                const eventDescription = document.createElement("p");
                eventDescription.innerHTML = `<strong >Description :</strong> ${event.description}`;
                eventCard.appendChild(eventDescription);

                if (event.image_url) {
                    const eventImage = document.createElement("img");
                    eventImage.src = event.image_url;
                    eventImage.alt = "Image de l'événement";
                    eventCard.appendChild(eventImage);
                }

                eventsList.appendChild(eventCard); // Ajoute chaque carte d'événement
            });
        } else {
            const message = document.querySelector(".message");
            message.textContent =
                "Aucun événement trouvé pour cette catégorie.";
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
    }
});
