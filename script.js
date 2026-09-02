document.addEventListener("DOMContentLoaded", function () {

let appointments = JSON.parse(
    localStorage.getItem("salonMateAppointments")
) || [];

let customers = JSON.parse(
    localStorage.getItem("salonMateCustomers")
) || [];

let services = JSON.parse(
    localStorage.getItem("salonMateServices")
) || [];

const addAppointmentBtn =
    document.getElementById("addAppointmentBtn");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const appointmentModal =
    document.getElementById("appointmentModal");

const appointmentForm =
    document.getElementById("appointmentForm");

const appointmentsList =
    document.getElementById("appointmentsList");

const clearAppointmentsBtn =
    document.getElementById("clearAppointmentsBtn");


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

    document.getElementById("totalAppointments").textContent =
        appointments.length;

    document.getElementById("totalCustomers").textContent =
        customers.length;

    document.getElementById("totalServices").textContent =
        services.length;
}


function displayAppointments() {

    appointmentsList.innerHTML = "";

    if (appointments.length === 0) {

        appointmentsList.innerHTML =
            '<p class="empty-message">No appointments yet.</p>';

        return;
    }

    appointments.forEach(function (appointment, index) {

        const card =
            document.createElement("div");

        card.className = "appointment-card";

        card.innerHTML = `
            <h3>${escapeHTML(appointment.customerName)}</h3>
            <p><strong>Service:</strong> ${escapeHTML(appointment.serviceName)}</p>
            <p><strong>Date:</strong> ${escapeHTML(appointment.date)}</p>
            <p><strong>Time:</strong> ${escapeHTML(appointment.time)}</p>
            <button class="delete-btn" data-index="${index}">
                Delete
            </button>
        `;

        appointmentsList.appendChild(card);
    });

    document
        .querySelectorAll(".delete-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                const index =
                    Number(button.dataset.index);

                appointments.splice(index, 1);

                saveData();
                updateDashboard();
                displayAppointments();
            });
        });
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


addAppointmentBtn.addEventListener(
    "click",
    function () {

        appointmentModal.classList.remove("hidden");

        document
            .getElementById("appointmentDate")
            .valueAsDate = new Date();
    }
);


closeModalBtn.addEventListener(
    "click",
    function () {

        appointmentModal.classList.add("hidden");

        appointmentForm.reset();
    }
);


appointmentModal.addEventListener(
    "click",
    function (event) {

        if (event.target === appointmentModal) {

            appointmentModal.classList.add("hidden");

            appointmentForm.reset();
        }
    }
);


appointmentForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const customerName =
            document
                .getElementById("customerName")
                .value
                .trim();

        const serviceName =
            document
                .getElementById("serviceName")
                .value
                .trim();

        const date =
            document
                .getElementById("appointmentDate")
                .value;

        const time =
            document
                .getElementById("appointmentTime")
                .value;


        if (
            !customerName ||
            !serviceName ||
            !date ||
            !time
        ) {
            alert("Please complete all fields.");
            return;
        }


        const appointment = {

            id: Date.now(),

            customerName:
                customerName,

            serviceName:
                serviceName,

            date:
                date,

            time:
                time
        };


        appointments.push(appointment);


        if (
            !customers.some(
                function (customer) {
                    return customer === customerName;
                }
            )
        ) {
            customers.push(customerName);
        }


        if (
            !services.some(
                function (service) {
                    return service === serviceName;
                }
            )
        ) {
            services.push(serviceName);
        }


        saveData();

        updateDashboard();

        displayAppointments();


        appointmentForm.reset();

        appointmentModal.classList.add("hidden");


        alert("Appointment saved successfully!");
    }
);


clearAppointmentsBtn.addEventListener(
    "click",
    function () {

        if (appointments.length === 0) {
            alert("There are no appointments to clear.");
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete all appointments?"
            );


        if (!confirmed) {
            return;
        }


        appointments = [];

        saveData();

        updateDashboard();

        displayAppointments();
    }
);


updateDashboard();
displayAppointments();

}); 
