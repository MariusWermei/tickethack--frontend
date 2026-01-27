const buttonSearch = document.getElementById("search-button");

buttonSearch.addEventListener("click", () => {
  const departure = document.querySelector(".input-haut").value.trim();
  const arrival = document.querySelector(".input").value.trim();
  const date = document.querySelector(".calendar-input").value;

  // Vérifier que TOUS les champs sont remplis (y compris la date)
  if (!departure || !arrival || !date) {
    alert("Veuillez remplir tous les champs, y compris la date");
    return;
  }

  fetch("http://localhost:3000/trip", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      departure: departure,
      arrival: arrival,
      date: date,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.result) {
        console.log("Trajets trouvés:", data.trips);
        displayTrips(data.trips);
      } else {
        console.log(data.message);
        displayNoTrips();
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
    });
});

function displayTrips(trips) {
  const displayContainer = document.getElementById("display-trips");

  displayContainer.innerHTML = trips
    .map(
      (trip) => `
    <div class="trip-items">
      <p>
        <strong>${trip.departure}</strong> →
        <strong>${trip.arrival}</strong>
      </p>
      <p>${new Date(trip.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
      <p>Prix: ${trip.price} €</p>
      <button class="book-button">Book</button>
    </div>
  `,
    )
    .join("");
}

function displayNoTrips() {
  const displayContainer = document.getElementById("display-trips");
  displayContainer.innerHTML = `
    <img src="./images/notfound.png" alt="No trips" />
    <div id="border"></div>
    <h3>Aucun trajet trouvé pour cette recherche.</h3>
  `;
}
