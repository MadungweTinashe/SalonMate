document.addEventListener("DOMContentLoaded", function () {

    let appointments =
        JSON.parse(localStorage.getItem("salonMateAppointments")) || [];

    let customers =
        JSON.parse(localStorage.getItem("salonMateCustomers")) || [];

    let services =
        JSON.parse(localStorage.getItem("salonMateServices")) || [];


    // ELEMENTS

    const addAppointmentBtn =
        document.getElementById("addAppointmentBtn");

    const appointmentModal =
        document.getElementById("appointmentModal");

    const closeModalBtn =
        document.getElementById("closeModalBtn");

    const appointmentForm =
        document.getElementById("appointmentForm");


    const addCustomerBtn =
        document.getElementById("addCustomerBtn");

    const customerModal =
        document.getElementById("customerModal");

    const closeCustomerModalBtn =
        document.getElementById("closeCustomerModalBtn");

    const customerForm =
        document.getElementById("customerForm");


    const addServiceBtn =
        document.getElementById("addServiceBtn");

    const serviceModal =
        document.getElementById("serviceModal");

    const closeServiceModalBtn =
        document.getElementById("closeServiceModalBtn");

    const serviceForm =
        document.getElementById("serviceForm");


    const appointmentsList =
        document.getElementById("appointmentsList");

    const customersList =
        document.getElementById("customersList");

    const servicesList =
        document.getElementById("servicesList");

    const clearAppointmentsBtn =
        document.getElementById("clearAppointmentsBtn");


    const customerSelect =
        document.getElementById("customerName");

    const serviceSelect =
        document.getElementById("serviceName");


    // SAVE DATA

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


    // ESCAPE HTML

    function escapeHTML(value) {

        const div = document.createElement("div");

        div.textContent = value;

        return div.innerHTML;
    }


    // DASHBOARD

    function updateDashboard() {

        document.getElementById("totalAppointments").textContent =
            appointments.length;

        document.getElementById("totalCustomers").textContent =
            customers.length;

        document.getElementById("totalServices").textContent =
            services.length;
    }


    // CUSTOMER DROPDOWN

    function updateCustomerSelect() {

        customerSelect.innerHTML =
            '<option value="">Select customer</option>';

        customers.forEach(function (customer) {

            const name =
                typeof customer === "string"
                    ? customer
                    : customer.name;

            const option =
                document.createElement("option");

            option.value = name;

            option.textContent = name;

            customerSelect.appendChild(option);
        });
    }


    // SERVICE DROPDOWN

    function updateServiceSelect() {

        serviceSelect.innerHTML =
            '<option value="">Select service</option>';

        services.forEach(function (service) {

            const name =
                typeof service === "string"
                    ? service
                    : service.name;

            const option =
                document.createElement("option");

            option.value = name;

            option.textContent = name;

            serviceSelect.appendChild(option);
        });
    }


    // DISPLAY CUSTOMERS

    function displayCustomers() {

        customersList.innerHTML = "";

        if (customers.length === 0) {

            customersList.innerHTML =
                '<p class="empty-message">No customers yet.</p>';

            return;
        }

        customers.forEach(function (customer, index) {

            const card =
                document.createElement("div");

            card.className = "customer-card";

            const name =
                typeof customer === "string"
                    ? customer
                    : customer.name;

            const phone =
                typeof customer === "string"
                    ? ""
                    : customer.phone;

            card.innerHTML = `
                <h3>${escapeHTML(name)}</h3>

                ${phone
                    ? `<p>📞 ${escapeHTML(phone)}</p>`
                    : ""
                }

                <button
                    class="delete-btn"
                    data-customer="${index}">
                    Delete
                </button>
            `;

            customersList.appendChild(card);
        });


        document
            .querySelectorAll("[data-customer]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(button.dataset.customer);

                        customers.splice(index, 1);

                        saveData();

                        updateDashboard();

                        displayCustomers();

                        updateCustomerSelect();
                    }
                );
            });
    }


    // DISPLAY SERVICES

    function displayServices() {

        servicesList.innerHTML = "";

        if (services.length === 0) {

            servicesList.innerHTML =
                '<p class="empty-message">No services yet.</p>';

            return;
        }

        services.forEach(function (service, index) {

            const card =
                document.createElement("div");

            card.className = "service-card";

            const name =
                typeof service === "string"
                    ? service
                    : service.name;

            const price =
                typeof service === "string"
                    ? ""
                    : service.price;

            const duration =
                typeof service === "string"
                    ? ""
                    : service.duration;

            card.innerHTML = `
                <h3>${escapeHTML(name)}</h3>

                ${price
                    ? `<p>💰 R${escapeHTML(String(price))}</p>`
                    : ""
                }

                ${duration
                    ? `<p>⏱️ ${escapeHTML(String(duration))} minutes</p>`
                    : ""
                }

                <button
                    class="delete-btn"
                    data-service="${index}">
                    Delete
                </button>
            `;

            servicesList.appendChild(card);
        });


        document
            .querySelectorAll("[data-service]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(button.dataset.service);

                        services.splice(index, 1);

                        saveData();

                        updateDashboard();

                        displayServices();

                        updateServiceSelect();
                    }
                );
            });
    }


    // DISPLAY APPOINTMENTS

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
                <h3>
                    ${escapeHTML(appointment.customerName)}
                </h3>

                <p>
                    <strong>Service:</strong>
                    ${escapeHTML(appointment.serviceName)}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${escapeHTML(appointment.date)}
                </p>

                <p>
                    <strong>Time:</strong>
                    ${escapeHTML(appointment.time)}
                </p>

                <button
                    class="delete-btn"
                    data-appointment="${index}">
                    Delete
                </button>
            `;

            appointmentsList.appendChild(card);
        });


        document
            .querySelectorAll("[data-appointment]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(button.dataset.appointment);

                        appointments.splice(index, 1);

                        saveData();

                        updateDashboard();

                        displayAppointments();
                    }
                );
            });
    }


    // OPEN APPOINTMENT

    addAppointmentBtn.addEventListener(
        "click",
        function () {

            updateCustomerSelect();

            updateServiceSelect();

            appointmentModal.classList.remove("hidden");

            document.getElementById(
                "appointmentDate"
            ).valueAsDate = new Date();
        }
    );


    // CLOSE APPOINTMENT

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
// SAVE APPOINTMENT

appointmentForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const customerName =
            customerSelect.value;

        const serviceName =
            serviceSelect.value;

        const date =
            document.getElementById("appointmentDate").value;

        const time =
            document.getElementById("appointmentTime").value;

const status =
    document.getElementById("appointmentStatus").value;
        if (
            !customerName ||
            !serviceName ||
            !date ||
            !time
        ) {
            alert(
                "Please select a customer, select a service, and complete the date and time."
            );
            return;
        }


        const alreadyBooked = appointments.some(
            function (appointment) {

                return (
                    appointment.date === date &&
                    appointment.time === time
                );
            }
        );


        if (alreadyBooked) {

            alert(
                "This time is already booked. Please choose another time."
            );

            return;
        }


        appointments.push({

            id: Date.now(),

            customerName: customerName,

            serviceName: serviceName,

            date: date,
            time; time,
            status: status
        });


        saveData();

        updateDashboard();

        displayAppointments();

        appointmentForm.reset();

        appointmentModal.classList.add("hidden");

        alert(
            "Appointment saved successfully!"
        );
    }
); 

    

    // OPEN CUSTOMER

    addCustomerBtn.addEventListener(
        "click",
        function () {

            customerModal.classList.remove("hidden");
        }
    );


    // CLOSE CUSTOMER

    closeCustomerModalBtn.addEventListener(
        "click",
        function () {

            customerModal.classList.add("hidden");

            customerForm.reset();
        }
    );


    customerModal.addEventListener(
        "click",
        function (event) {

            if (event.target === customerModal) {

                customerModal.classList.add("hidden");

                customerForm.reset();
            }
        }
    );


    // SAVE CUSTOMER

    customerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "newCustomerName"
                ).value.trim();

            const phone =
                document.getElementById(
                    "customerPhone"
                ).value.trim();


            if (!name) {

                alert(
                    "Please enter the customer's name."
                );

                return;
            }


            const alreadyExists =
                customers.some(
                    function (customer) {

                        const customerName =
                            typeof customer === "string"
                                ? customer
                                : customer.name;

                        return (
                            customerName.toLowerCase() ===
                            name.toLowerCase()
                        );
                    }
                );


            if (alreadyExists) {

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

            updateDashboard();

            displayCustomers();

            updateCustomerSelect();

            customerForm.reset();

            customerModal.classList.add("hidden");

            alert(
                "Customer saved successfully!"
            );
        }
    );


    // OPEN SERVICE

    addServiceBtn.addEventListener(
        "click",
        function () {

            serviceModal.classList.remove("hidden");
        }
    );


    // CLOSE SERVICE

    closeServiceModalBtn.addEventListener(
        "click",
        function () {

            serviceModal.classList.add("hidden");

            serviceForm.reset();
        }
    );


    serviceModal.addEventListener(
        "click",
        function (event) {

            if (event.target === serviceModal) {

                serviceModal.classList.add("hidden");

                serviceForm.reset();
            }
        }
    );


    // SAVE SERVICE

    serviceForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "newServiceName"
                ).value.trim();

            const price =
                document.getElementById(
                    "servicePrice"
                ).value;

            const duration =
                document.getElementById(
                    "serviceDuration"
                ).value;


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


            const alreadyExists =
                services.some(
                    function (service) {

                        const serviceName =
                            typeof service === "string"
                                ? service
                                : service.name;

                        return (
                            serviceName.toLowerCase() ===
                            name.toLowerCase()
                        );
                    }
                );


            if (alreadyExists) {

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

            updateDashboard();

            displayServices();

            updateServiceSelect();

            serviceForm.reset();

            serviceModal.classList.add("hidden");

            alert(
                "Service saved successfully!"
            );
        }
    );


    // CLEAR APPOINTMENTS

    clearAppointmentsBtn.addEventListener(
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
                    "Are you sure you want to delete all appointments?"
                )
            ) {

                return;
            }


            appointments = [];

            saveData();

            updateDashboard();

            displayAppointments();
        }
    );


    // START APP

    updateDashboard();

    displayCustomers();

    displayServices();

    displayAppointments();

    updateCustomerSelect();

    updateServiceSelect();

});
