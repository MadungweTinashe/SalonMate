let appointments = JSON.parse(localStorage.getItem("salonMateAppointments")) || [];
let customers = JSON.parse(localStorage.getItem("salonMateCustomers")) || [];
let services = JSON.parse(localStorage.getItem("salonMateServices")) || [];

function saveData() {
localStorage.setItem(
"salonMateAppointments",
JSON.stringify(appointments)
);

localStorage.setItem(
    "salonMateCustomers",
    JSON.stringify(customers)
);

localStorage.setItem(
    "salonMateServices",
    JSON.stringify(services)
);

}

function updateDashboard() {
document.getElementById("appointmentCount").textContent =
appointments.length;

document.getElementById("customerCount").textContent =
    customers.length;

document.getElementById("serviceCount").textContent =
    services.length;

}

function addAppointment() {
const name = prompt("Enter customer name:");

if (!name) {
    return;
}

const service = prompt("Enter the service:");

if (!service) {
    return;
}

const time = prompt("Enter appointment time:");

if (!time) {
    return;
}

appointments.push({
    name: name,
    service: service,
    time: time
});

if (!customers.includes(name)) {
    customers.push(name);
}

if (!services.includes(service)) {
    services.push(service);
}

saveData();
displayAppointments();
updateDashboard();

alert("Appointment added successfully! 🎉");

}

function displayAppointments() {
const container = document.getElementById("appointments");

if (!container) {
    return;
}

if (appointments.length === 0) {
    container.innerHTML = `
        <div style="font-size:40px;">📅</div>
        <p>No appointments yet.</p>
        <p>Add your first appointment to get started.</p>
    `;

    return;
}

container.innerHTML = "";

appointments.forEach(function(appointment) {
    const item = document.createElement("div");

    item.style.textAlign = "left";
    item.style.padding = "15px";
    item.style.marginBottom = "10px";
    item.style.background = "#f7f5fb";
    item.style.borderRadius = "12px";

    item.innerHTML = `
        <strong>👩🏽 ${appointment.name}</strong><br>
        💇🏽‍♀️ ${appointment.service}<br>
        🕐 ${appointment.time}
    `;

    container.appendChild(item);
});

}

function showMessage(section) {
alert(section + " section is coming next! 🚀");
}

updateDashboard();
displayAppointments();
