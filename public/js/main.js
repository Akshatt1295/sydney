const container = document.getElementById("eventsContainer");

async function loadEvents() {
  const res = await fetch("http://localhost:8080/api/events");
  const events = await res.json();

  container.innerHTML = "";

  events.forEach(event => {
    container.innerHTML += `
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">

          <img src="${event.imageUrl || ''}" 
               class="card-img-top"
               style="height:200px;object-fit:cover">

          <div class="card-body d-flex flex-column">
          <span class="badge bg-info mb-2">${event.status}</span>
            <h5 class="card-title">${event.title}</h5>

            <p class="text-muted mb-1">
              📅 ${new Date(event.dateTime).toLocaleString()}
            </p>

            <p class="text-muted">
              📍 ${event.venueName || "Sydney"}
            </p>

            <p class="card-text small">
              ${(event.description || "").slice(0, 100)}...
            </p>

            <p class="small text-secondary">
              Source: ${event.sourceWebsite}
            </p>

            <button
              class="btn btn-dark mt-auto"
              onclick="handleTickets('${event._id}', '${event.originalUrl}')"
            >
              GET TICKETS
            </button>
          </div>

        </div>
      </div>
    `;
  });
}

loadEvents();
let selectedEventId = null;
let redirectUrl = null;

function handleTickets(eventId, url) {
  selectedEventId = eventId;
  redirectUrl = url;

  const modal = new bootstrap.Modal(
    document.getElementById("emailModal")
  );
  modal.show();
}

async function submitEmail() {
  const email = document.getElementById("userEmail").value;
  const consent = document.getElementById("consentCheck").checked;

  if (!email || !consent) {
    alert("Email and consent required");
    return;
  }

  await fetch("http://localhost:8080/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      consent,
      eventId: selectedEventId
    })
  });

  window.open(redirectUrl, "_blank");
}