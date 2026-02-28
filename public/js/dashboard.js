async function loadDashboard() {
  const res = await fetch("/api/events?city=Sydney");
  const events = await res.json();

  const table = document.getElementById("dashboardTable");
  table.innerHTML = "";

  events.forEach(e => {
    table.innerHTML += `
      <tr>
        <td>${e.title}</td>
        <td>${new Date(e.dateTime).toLocaleDateString()}</td>
        
        <td><span class="badge bg-info">${e.status}</span></td>
        <td>
          <button class="btn btn-sm btn-success"
            onclick="importEvent('${e._id}')">
            Import
          </button>
        </td>
      </tr>
    `;
  });
}