// Charger les bookings au chargement
window.addEventListener("DOMContentLoaded", () => {
  loadBookings();
});

function loadBookings() {
  fetch("http://localhost:3000/bookingTrip")
    .then((response) => response.json())
    .then((data) => {
      console.log("Bookings reçus:", data);

      if (data.result && data.books.length > 0) {
        displayBookings(data.books);
      } else {
        displayNoBookings();
      }
    })
    .catch((error) => {
      console.error("Erreur:", error);
    });
}

function displayBookings(books) {
  const container = document.getElementById("booking-trips-container");

  container.innerHTML = books
    .map((book) => {
      const departureTime = new Date(book.date);
      const now = new Date();
      const diffMs = departureTime - now;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      let departureText;
      if (diffHours > 0) {
        departureText = `Departure in ${diffHours} hours`;
      } else {
        departureText = "Departed";
      }

      return `
        <div class="booking-trips-elements">
          <p>
            <strong>${book.departure}</strong> →
            <strong>${book.arrival}</strong>
          </p>
          <p>${new Date(book.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
          <p>${book.price} €</p>
          <p>${departureText}</p>
        </div>
      `;
    })
    .join("");
}

function displayNoBookings() {
  const container = document.getElementById("booking-trips-container");
  container.innerHTML = `
    <p class="empty-booking">Aucune réservation</p>
  `;
}
