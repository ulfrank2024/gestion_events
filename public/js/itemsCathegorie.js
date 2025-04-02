document.addEventListener("DOMContentLoaded", function () {
    // Sélectionner tous les éléments avec la classe "icon-item"
    const iconItems = document.querySelectorAll(".icon-item");

    // Ajouter un événement de clic à chaque élément
    iconItems.forEach((item) => {
        item.addEventListener("click", function () {
            const category = item.getAttribute("data-category"); // Récupérer la catégorie de l'élément cliqué

            // Rediriger vers la page de la catégorie correspondante
            window.location.href = `/categories/${category}`;
        });
    });
});
