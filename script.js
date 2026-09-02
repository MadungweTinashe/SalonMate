// ========================================
// SALONMATE
// ========================================

// Load saved data
let appointments =
    JSON.parse(localStorage.getItem("salonMateAppointments")) || [];

let customers =
    JSON.parse(localStorage.getItem("salonMateCustomers")) || [];

let services =
    JSON.parse(localStorage.getItem("salonMateServices")) || [];


// ========================================
// SAVE DATA
// ========================================

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


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    const appointmentCount =
        document.getElementById("appointmentCount");

    const customerCount =
        document.getElementById("customerCount");

    const serviceCount =
        document.getElementById("serviceCount");


    if (appointmentCount) {
        appointmentCount.textContent =
            appointments.length;
    }

    if (customerCount) {
        customerCount.textContent =
            customers.length;
    }

    if (serviceCount) {
        serviceCount.textContent =
            services.length;
    }
}


// ========================================
// ADD APPOINTMENT
// ========================================

function addAppointment() {

    const name = prompt(
        "Enter customer name:"
    );

    if (!name || name.trim() === "") {
        return;
    }


    const service = prompt(
        "Enter the service:"
    );

    if (!service || service.trim() === "") {
        return;
    }


    const time = prompt(
        "Enter appointment time:"
    );

    if (!time || time.trim() === "") {
        return;
    }


    const cleanName = name.trim();
    const cleanService = service.trim();
    const cleanTime = time.trim();


    // Create appointment
    appointments.push({
        name: cleanName,
        service: cleanService,
        time: cleanTime
    });


    // Add customer if new
    if (!customers.includes(cleanName)) {
        customers.push(cleanName);
    }


    // Add service if new
    if (!services.includes(cleanService)) {
        services.push(cleanService);
    }


    // Save everything
    saveData();


    // Refresh screen
    updateDashboard();
    displayAppointments();


    alert(
        "Appointment added successfully! 🎉"
    );
}


// ========================================
// DISPLAY APPOINTMENTS
// ========================================

function displayAppointments() {

    const container =
        document.getElementById("appointments");


    if (!container) {
        return;
    }


    // No appointments
    if (appointments.length === 0) {

        container.innerHTML = `
            <div style="font-size:40px;">📅</div>
            <p>No appointments yet.</p>
            <p>Add your first appointment to get started.</p>
        `;

        return;
    }


    // Clear old appointments
    container.innerHTML = "";


    // Display appointments
    appointments.forEach(function(appointment) {

        const item =
            document.createElement("div");


        item.style.textAlign = "left";
        item.style.padding = "15px";
        item.style.marginBottom = "10px";
        item.style.background = "#f7f5fb";
        item.style.borderRadius = "12px";


        item.innerHTML = `
            <strong>👩🏽 ${escapeHTML(appointment.name)}</strong><br>
            💇🏽‍♀️ ${escapeHTML(appointment.service)}<br>
            🕐 ${escapeHTML(appointment.time)}
        `;


        container.appendChild(item);
    });
}


// ========================================
// SECURITY
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ========================================
// ACTION CARDS
// ========================================

function showMessage(section) {

    alert(
        section +
        " section is coming next! 🚀"
    );
}


// ========================================
// START SALONMATE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateDashboard();
        displayAppointments();

    }
);
