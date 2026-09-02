let appointments =
    JSON.parse(localStorage.getItem("salonMateAppointments")) || [];

let customers =
    JSON.parse(localStorage.getItem("salonMateCustomers")) || [];

let services =
    JSON.parse(localStorage.getItem("salonMateServices")) || [];

let editingAppointmentIndex = null;


// ===============================
// SAVE DATA
// ===============================

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


// ===============================
// HELPERS
// ===============================

function getCustomerName(customer) {
    return typeof customer === "string"
        ? customer
        : customer.name || "";
}

function getCustomerPhone(customer) {
    return typeof customer === "string"
        ? ""
        : customer.phone || "";
}

function getServiceName(service) {
    return typeof service === "string"
        ? service
        : service.name || "";
}

function getServicePrice(service) {
    return typeof service === "string"
        ? ""
        : service.price || "";
}

function getServiceDuration(service) {
    return typeof service === "string"
        ? ""
        : service.duration || "";
}

function getAppointmentStatus(appointment) {
    return appointment.status || "Booked";
}

function getPayment(appointment) {
    return Number(appointment.payment) || 0;
}

function getToday() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

    document.getElementById("totalAppointments").textContent =
        appointments.length;

    document.getElementById("totalCustomers").textContent =
        customers.length;

    document.getElementById("totalServices").textContent =
        services.length;


    const today = getToday();


    const todayAppointments =
        appointments.filter(function (appointment) {

            return appointment.date === today &&
                getAppointmentStatus(appointment) !== "Cancelled";

        }).length;


    document.getElementById("todayAppointments").textContent =
        todayAppointments;


    const totalRevenue =
        appointments.reduce(function (total, appointment) {

            if (getAppointmentStatus(appointment) === "Cancelled") {
                return total;
            }

            return total + getPayment(appointment);

        }, 0);


    const todayRevenue =
        appointments.reduce(function (total, appointment) {

            if (
                appointment.date === today &&
                getAppointmentStatus(appointment) !== "Cancelled"
            ) {
                return total + getPayment(appointment);
            }

            return total;

        }, 0);


    document.getElementById("totalRevenue").textContent =
        `R${totalRevenue.toFixed(2)}`;

    document.getElementById("todayRevenue").textContent =
        `R${todayRevenue.toFixed(2)}`;
}


// ===============================
// CUSTOMERS
// ===============================

function displayCustomers() {

    const list =
        document.getElementById("customersList");


    if (customers.length === 0) {

        list.innerHTML =
            `<div class="empty-message">
                No customers yet. Add your first customer.
            </div>`;

        return;
    }


    list.innerHTML =
        customers.map(function (customer, index) {

            const name = getCustomerName(customer);
            const phone = getCustomerPhone(customer);


            return `
                <div class="customer-card">

                    <div class="customer-info">

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <span>
                            ${phone
                                ? escapeHTML(phone)
                                : "No phone number"}
                        </span>

                    </div>


                    <button
                        class="delete-btn"
                        onclick="deleteCustomer(${index})">

                        Delete

                    </button>

                </div>
            `;

        }).join("");
}


function deleteCustomer(index) {

    const name =
        getCustomerName(customers[index]);


    if (!confirm(`Delete customer "${name}"?`)) {
        return;
    }


    customers.splice(index, 1);

    saveData();

    displayCustomers();
    populateCustomerDropdown();
    updateDashboard();
}


// ===============================
// SERVICES
// ===============================

function displayServices() {

    const list =
        document.getElementById("servicesList");


    if (services.length === 0) {

        list.innerHTML =
            `<div class="empty-message">
                No services yet. Add your first service.
            </div>`;

        return;
    }


    list.innerHTML =
        services.map(function (service, index) {

            const name = getServiceName(service);
            const price = getServicePrice(service);
            const duration = getServiceDuration(service);


            let details = "";


            if (price !== "") {
                details += `R${escapeHTML(price)}`;
            }


            if (duration !== "") {

                if (details !== "") {
                    details += " • ";
                }

                details +=
                    `${escapeHTML(duration)} min`;
            }


            if (!details) {
                details = "No price or duration";
            }


            return `
                <div class="service-card">

                    <div class="service-info">

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <span>
                            ${details}
                        </span>

                    </div>


                    <button
                        class="delete-btn"
                        onclick="deleteService(${index})">

                        Delete

                    </button>

                </div>
            `;

        }).join("");
}


function deleteService(index) {

    const name =
        getServiceName(services[index]);


    if (!confirm(`Delete service "${name}"?`)) {
        return;
    }


    services.splice(index, 1);

    saveData();

    displayServices();
    populateServiceDropdown();
    updateDashboard();
}


// ===============================
// DROPDOWNS
// ===============================

function populateCustomerDropdown() {

    const select =
        document.getElementById("customerName");


    select.innerHTML =
        `<option value="">Select customer</option>`;


    customers.forEach(function (customer) {

        const name =
            getCustomerName(customer);


        const option =
            document.createElement("option");


        option.value = name;
        option.textContent = name;


        select.appendChild(option);
    });
}


function populateServiceDropdown() {

    const select =
        document.getElementById("serviceName");


    select.innerHTML =
        `<option value="">Select service</option>`;


    services.forEach(function (service) {

        const name =
            getServiceName(service);


        const option =
            document.createElement("option");


        option.value = name;
        option.textContent = name;


        select.appendChild(option);
    });
}


// ===============================
// APPOINTMENTS
// ===============================

function displayAppointments() {

    const list =
        document.getElementById("appointmentsList");


    const search =
        document
            .getElementById("searchAppointments")
            .value
            .toLowerCase()
            .trim();


    const statusFilter =
        document.getElementById("statusFilter").value;


    let filtered =
        appointments.filter(function (appointment) {

            const customer =
                String(appointment.customer || "")
                    .toLowerCase();

            const service =
                String(appointment.service || "")
                    .toLowerCase();

            const date =
                String(appointment.date || "")
                    .toLowerCase();

            const time =
                String(appointment.time || "")
                    .toLowerCase();

            const status =
                getAppointmentStatus(appointment);


            const matchesSearch =
                !search ||
                customer.includes(search) ||
                service.includes(search) ||
                date.includes(search) ||
                time.includes(search) ||
                status.toLowerCase().includes(search);


            const matchesStatus =
                statusFilter === "All" ||
                status === statusFilter;


            return matchesSearch && matchesStatus;
        });


    filtered.sort(function (a, b) {

        const first =
            `${a.date || ""} ${a.time || ""}`;

        const second =
            `${b.date || ""} ${b.time || ""}`;


        return first.localeCompare(second);
    });


    if (filtered.length === 0) {

        list.innerHTML =
            `<div class="empty-message">
                No appointments found.
            </div>`;

        return;
    }


    list.innerHTML =
        filtered.map(function (appointment) {

            const realIndex =
                appointments.indexOf(appointment);


            const status =
                getAppointmentStatus(appointment);


            let statusClass =
                "status-booked";


            if (status === "Completed") {
                statusClass = "status-completed";
            }


            if (status === "Cancelled") {
                statusClass = "status-cancelled";
            }


            if (status === "No-show") {
                statusClass = "status-no-show";
            }


            const payment =
                getPayment(appointment);


            return `
                <div class="appointment-card">

                    <div class="appointment-main">

                        <h3>
                            ${escapeHTML(
                                appointment.customer
                            )}
                        </h3>


                        <div class="appointment-meta">
                            Service:
                            ${escapeHTML(
                                appointment.service
                            )}
                        </div>


                        <div class="appointment-meta">
                            📅 ${escapeHTML(
                                appointment.date
                            )}
                            &nbsp;
                            🕐 ${escapeHTML(
                                appointment.time
                            )}
                        </div>


                        <span
                            class="status-badge ${statusClass}">

                            ${escapeHTML(status)}

                        </span>


                        <div class="payment-info">

                            💰 Paid:
                            R${payment.toFixed(2)}

                        </div>

                    </div>


                    <div class="appointment-actions">

                        <select
                            onchange="
                                changeAppointmentStatus(
                                    ${realIndex},
                                    this.value
                                )
                            ">

                            <option value="Booked"
                                ${status === "Booked"
                                    ? "selected"
                                    : ""}>
                                Booked
                            </option>

                            <option value="Completed"
                                ${status === "Completed"
                                    ? "selected"
                                    : ""}>
                                Completed
                            </option>

                            <option value="Cancelled"
                                ${status === "Cancelled"
                                    ? "selected"
                                    : ""}>
                                Cancelled
                            </option>

                            <option value="No-show"
                                ${status === "No-show"
                                    ? "selected"
                                    : ""}>
                                No-show
                            </option>

                        </select>


                        <button
                            class="edit-btn"
                            onclick="
                                editAppointment(
                                    ${realIndex}
                                )
                            ">

                            Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="
                                deleteAppointment(
                                    ${realIndex}
                                )
                            ">

                            Delete

                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


// ===============================
// CHANGE STATUS
// ===============================

function changeAppointmentStatus(
    index,
    newStatus
) {

    appointments[index].status =
        newStatus;


    saveData();

    displayAppointments();

    updateDashboard();
}


// ===============================
// DELETE APPOINTMENT
// ===============================

function deleteAppointment(index) {

    if (!confirm("Delete this appointment?")) {
        return;
    }


    appointments.splice(index, 1);

    saveData();

    displayAppointments();

    updateDashboard();
}


// ===============================
// APPOINTMENT MODAL
// ===============================

const appointmentModal =
    document.getElementById("appointmentModal");

const customerModal =
    document.getElementById("customerModal");

const serviceModal =
    document.getElementById("serviceModal");


document
    .getElementById("addAppointmentBtn")
    .addEventListener("click", function () {

        editingAppointmentIndex = null;


        document.getElementById(
            "appointmentModalTitle"
        ).textContent =
            "New Appointment";


        populateCustomerDropdown();
        populateServiceDropdown();


        document.getElementById(
            "appointmentForm"
        ).reset();


        document.getElementById(
            "appointmentDate"
        ).value =
            getToday();


        document.getElementById(
            "appointmentStatus"
        ).value =
            "Booked";


        document.getElementById(
            "appointmentPayment"
        ).value =
            "";


        appointmentModal.classList.remove(
            "hidden"
        );
    });


document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeAppointmentModal);


function closeAppointmentModal() {

    appointmentModal.classList.add("hidden");

    editingAppointmentIndex = null;
}


appointmentModal.addEventListener(
    "click",
    function (event) {

        if (event.target === appointmentModal) {
            closeAppointmentModal();
        }

    }
);


// ===============================
// ADD / EDIT APPOINTMENT
// ===============================

document
    .getElementById("appointmentForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const customer =
                document.getElementById(
                    "customerName"
                ).value;


            const service =
                document.getElementById(
                    "serviceName"
                ).value;


            const date =
                document.getElementById(
                    "appointmentDate"
                ).value;


            const time =
                document.getElementById(
                    "appointmentTime"
                ).value;


            const status =
                document.getElementById(
                    "appointmentStatus"
                ).value;


            const payment =
                Number(
                    document.getElementById(
                        "appointmentPayment"
                    ).value
                ) || 0;


            if (
                !customer ||
                !service ||
                !date ||
                !time
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;
            }


            // Double booking protection

            const duplicate =
                appointments.some(
                    function (appointment, index) {

                        if (
                            editingAppointmentIndex !== null &&
                            index === editingAppointmentIndex
                        ) {
                            return false;
                        }


                        return (
                            appointment.date === date &&
                            appointment.time === time &&
                            getAppointmentStatus(
                                appointment
                            ) !== "Cancelled"
                        );

                    }
                );


            if (duplicate) {

                alert(
                    "This time slot is already booked. Please choose another time."
                );

                return;
            }


            const appointmentData = {

                customer: customer,

                service: service,

                date: date,

                time: time,

                status: status,

                payment: payment

            };


            if (
                editingAppointmentIndex !== null
            ) {

                appointments[
                    editingAppointmentIndex
                ] = appointmentData;

            } else {

                appointments.push(
                    appointmentData
                );
            }


            saveData();

            displayAppointments();

            updateDashboard();

            closeAppointmentModal();

            alert(
                editingAppointmentIndex !== null
                    ? "Appointment updated successfully!"
                    : "Appointment saved successfully!"
            );

        }
    );


// ===============================
// EDIT APPOINTMENT
// ===============================

function editAppointment(index) {

    const appointment =
        appointments[index];


    editingAppointmentIndex =
        index;


    populateCustomerDropdown();
    populateServiceDropdown();


    document.getElementById(
        "appointmentModalTitle"
    ).textContent =
        "Edit Appointment";


    document.getElementById(
        "customerName"
    ).value =
        appointment.customer;


    document.getElementById(
        "serviceName"
    ).value =
        appointment.service;


    document.getElementById(
        "appointmentDate"
    ).value =
        appointment.date;


    document.getElementById(
        "appointmentTime"
    ).value =
        appointment.time;


    document.getElementById(
        "appointmentStatus"
    ).value =
        getAppointmentStatus(
            appointment
        );


    document.getElementById(
        "appointmentPayment"
    ).value =
        getPayment(appointment);


    appointmentModal.classList.remove(
        "hidden"
    );
}


// ===============================
// CUSTOMER MODAL
// ===============================

document
    .getElementById("addCustomerBtn")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("customerForm")
                .reset();

            customerModal.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("closeCustomerModalBtn")
    .addEventListener(
        "click",
        function () {

            customerModal.classList.add(
                "hidden"
            );

        }
    );


customerModal.addEventListener(
    "click",
    function (event) {

        if (event.target === customerModal) {
            customerModal.classList.add(
                "hidden"
            );
        }

    }
);


// ===============================
// ADD CUSTOMER
// ===============================

document
    .getElementById("customerForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "newCustomerName"
                    )
                    .value
                    .trim();


            const phone =
                document
                    .getElementById(
                        "customerPhone"
                    )
                    .value
                    .trim();


            if (!name) {

                alert(
                    "Please enter the customer's name."
                );

                return;
            }


            const exists =
                customers.some(
                    function (customer) {

                        return (
                            getCustomerName(customer)
                                .toLowerCase() ===
                            name.toLowerCase()
                        );

                    }
                );


            if (exists) {

                alert(
                    "This customer already exists."
                );

                return;
            }


            customers.push({

                name: name,

                phone: phone

            });


            saveData();

            displayCustomers();

            populateCustomerDropdown();

            updateDashboard();


            document
                .getElementById("customerForm")
                .reset();


            customerModal.classList.add(
                "hidden"
            );


            alert(
                "Customer saved successfully!"
            );

        }
    );


// ===============================
// SERVICE MODAL
// ===============================

document
    .getElementById("addServiceBtn")
    .addEventListener(
        "click",
        function () {

            document
                .getElementById("serviceForm")
                .reset();

            serviceModal.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById("closeServiceModalBtn")
    .addEventListener(
        "click",
        function () {

            serviceModal.classList.add(
                "hidden"
            );

        }
    );


serviceModal.addEventListener(
    "click",
    function (event) {

        if (event.target === serviceModal) {
            serviceModal.classList.add(
                "hidden"
            );
        }

    }
);


// ===============================
// ADD SERVICE
// ===============================

document
    .getElementById("serviceForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "newServiceName"
                    )
                    .value
                    .trim();


            const price =
                document
                    .getElementById(
                        "servicePrice"
                    )
                    .value;


            const duration =
                document
                    .getElementById(
                        "serviceDuration"
                    )
                    .value;


            if (
                !name ||
                !price ||
                !duration
            ) {

                alert(
                    "Please complete all service fields."
                );

                return;
            }


            const exists =
                services.some(
                    function (service) {

                        return (
                            getServiceName(service)
                                .toLowerCase() ===
                            name.toLowerCase()
                        );

                    }
                );


            if (exists) {

                alert(
                    "This service already exists."
                );

                return;
            }


            services.push({

                name: name,

                price: price,

                duration: duration

            });


            saveData();

            displayServices();

            populateServiceDropdown();

            updateDashboard();


            document
                .getElementById("serviceForm")
                .reset();


            serviceModal.classList.add(
                "hidden"
            );


            alert(
                "Service saved successfully!"
            );

        }
    );


// ===============================
// SEARCH & FILTER
// ===============================

document
    .getElementById(
        "searchAppointments"
    )
    .addEventListener(
        "input",
        displayAppointments
    );


document
    .getElementById(
        "statusFilter"
    )
    .addEventListener(
        "change",
        displayAppointments
    );


// ===============================
// CLEAR APPOINTMENTS
// ===============================

document
    .getElementById(
        "clearAppointmentsBtn"
    )
    .addEventListener(
        "click",
        function () {

            if (appointments.length === 0) {

                alert(
                    "There are no appointments to clear."
                );

                return;
            }


            if (
                !confirm(
                    "Are you sure you want to delete ALL appointments?"
                )
            ) {
                return;
            }


            appointments = [];

            saveData();

            displayAppointments();

            updateDashboard();


            alert(
                "All appointments have been deleted."
            );

        }
    );


// ===============================
// START APP
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        displayCustomers();

        displayServices();

        populateCustomerDropdown();

        populateServiceDropdown();

        displayAppointments();

        updateDashboard();

    }
); 
