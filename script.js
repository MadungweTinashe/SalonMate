// ==================================================
// SALONMATE - FIREBASE VERSION
// ==================================================

let appointments = [];
let customers = [];
let services = [];

let editingAppointmentId = null;

let db = null;
let currentUser = null;


// ==================================================
// FIREBASE SETUP
// ==================================================

async function startFirebase() {

    try {

        const firestore =
            await import(
                "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
            );


        db = firestore.getFirestore(
            window.firebaseApp
        );


        window.firestoreFunctions = firestore;


        waitForUser();


    } catch (error) {

        console.error(
            "Firebase setup error:",
            error
        );

    }
}


// ==================================================
// WAIT FOR LOGIN
// ==================================================

function waitForUser() {

    const auth =
        window.firebaseAuth;


    if (!auth) {

        setTimeout(
            waitForUser,
            200
        );

        return;
    }


    auth.onAuthStateChanged(
        async function (user) {

            if (!user) {

                currentUser = null;

                return;
            }


            currentUser = user;


            await loadUserData();


            displayCustomers();

            displayServices();

            populateCustomerDropdown();

            populateServiceDropdown();

            displayAppointments();

            updateDashboard();

        }
    );
}


// ==================================================
// FIRESTORE PATHS
// ==================================================

function userCollection(
    collectionName
) {

    return window.firestoreFunctions.collection(
        db,
        "users",
        currentUser.uid,
        collectionName
    );

}


// ==================================================
// LOAD USER DATA
// ==================================================

async function loadUserData() {

    if (!currentUser || !db) {
        return;
    }


    const {
        getDocs,
        query,
        orderBy
    } = window.firestoreFunctions;


    try {

        const customerSnapshot =
            await getDocs(
                userCollection("customers")
            );


        customers =
            customerSnapshot.docs.map(
                function (doc) {

                    return {
                        id: doc.id,
                        ...doc.data()
                    };

                }
            );


        const serviceSnapshot =
            await getDocs(
                userCollection("services")
            );


        services =
            serviceSnapshot.docs.map(
                function (doc) {

                    return {
                        id: doc.id,
                        ...doc.data()
                    };

                }
            );


        const appointmentSnapshot =
            await getDocs(
                userCollection("appointments")
            );


        appointments =
            appointmentSnapshot.docs.map(
                function (doc) {

                    return {
                        id: doc.id,
                        ...doc.data()
                    };

                }
            );


        // If the cloud account is empty,
        // move the old local data to the account.

        if (
            customers.length === 0 &&
            services.length === 0 &&
            appointments.length === 0
        ) {

            await migrateOldLocalData();

        }


    } catch (error) {

        console.error(
            "Could not load SalonMate data:",
            error
        );

        alert(
            "SalonMate could not load your cloud data. Please check your internet connection."
        );

    }

}


// ==================================================
// MIGRATE OLD LOCAL DATA
// ==================================================

async function migrateOldLocalData() {

    const oldAppointments =
        JSON.parse(
            localStorage.getItem(
                "salonMateAppointments"
            )
        ) || [];


    const oldCustomers =
        JSON.parse(
            localStorage.getItem(
                "salonMateCustomers"
            )
        ) || [];


    const oldServices =
        JSON.parse(
            localStorage.getItem(
                "salonMateServices"
            )
        ) || [];


    if (
        oldAppointments.length === 0 &&
        oldCustomers.length === 0 &&
        oldServices.length === 0
    ) {

        return;

    }


    const {
        addDoc
    } = window.firestoreFunctions;


    try {

        for (
            const customer of oldCustomers
        ) {

            const customerData =
                typeof customer === "string"
                    ? {
                        name: customer,
                        phone: ""
                    }
                    : customer;


            await addDoc(
                userCollection("customers"),
                {
                    name:
                        customerData.name || "",
                    phone:
                        customerData.phone || ""
                }
            );

        }


        for (
            const service of oldServices
        ) {

            const serviceData =
                typeof service === "string"
                    ? {
                        name: service,
                        price: "",
                        duration: ""
                    }
                    : service;


            await addDoc(
                userCollection("services"),
                {
                    name:
                        serviceData.name || "",
                    price:
                        serviceData.price || "",
                    duration:
                        serviceData.duration || ""
                }
            );

        }


        for (
            const appointment
            of oldAppointments
        ) {

            await addDoc(
                userCollection("appointments"),
                {
                    customer:
                        appointment.customer || "",

                    service:
                        appointment.service || "",

                    date:
                        appointment.date || "",

                    time:
                        appointment.time || "",

                    status:
                        appointment.status || "Booked",

                    payment:
                        Number(
                            appointment.payment
                        ) || 0
                }
            );

        }


        // Reload from Firebase

        await loadUserData();


        // Old local data is no longer needed

        localStorage.removeItem(
            "salonMateAppointments"
        );

        localStorage.removeItem(
            "salonMateCustomers"
        );

        localStorage.removeItem(
            "salonMateServices"
        );


        alert(
            "Your existing SalonMate data has been moved to your account."
        );


    } catch (error) {

        console.error(
            "Data migration failed:",
            error
        );

    }

}


// ==================================================
// HELPERS
// ==================================================

function getCustomerName(
    customer
) {

    return typeof customer === "string"
        ? customer
        : customer.name || "";

}


function getCustomerPhone(
    customer
) {

    return typeof customer === "string"
        ? ""
        : customer.phone || "";

}


function getServiceName(
    service
) {

    return typeof service === "string"
        ? service
        : service.name || "";

}


function getServicePrice(
    service
) {

    return typeof service === "string"
        ? ""
        : service.price || "";

}


function getServiceDuration(
    service
) {

    return typeof service === "string"
        ? ""
        : service.duration || "";

}


function getAppointmentStatus(
    appointment
) {

    return appointment.status || "Booked";

}


function getPayment(
    appointment
) {

    return Number(
        appointment.payment
    ) || 0;

}


function getToday() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==================================================
// DASHBOARD
// ==================================================

function updateDashboard() {

    document.getElementById(
        "totalAppointments"
    ).textContent =
        appointments.length;


    document.getElementById(
        "totalCustomers"
    ).textContent =
        customers.length;


    document.getElementById(
        "totalServices"
    ).textContent =
        services.length;


    const today =
        getToday();


    const todayAppointments =
        appointments.filter(
            function (appointment) {

                return (
                    appointment.date === today &&
                    getAppointmentStatus(
                        appointment
                    ) !== "Cancelled"
                );

            }
        ).length;


    document.getElementById(
        "todayAppointments"
    ).textContent =
        todayAppointments;


    const totalRevenue =
        appointments.reduce(
            function (
                total,
                appointment
            ) {

                if (
                    getAppointmentStatus(
                        appointment
                    ) === "Cancelled"
                ) {

                    return total;

                }


                return (
                    total +
                    getPayment(
                        appointment
                    )
                );

            },
            0
        );


    const todayRevenue =
        appointments.reduce(
            function (
                total,
                appointment
            ) {

                if (
                    appointment.date === today &&
                    getAppointmentStatus(
                        appointment
                    ) !== "Cancelled"
                ) {

                    return (
                        total +
                        getPayment(
                            appointment
                        )
                    );

                }


                return total;

            },
            0
        );


    document.getElementById(
        "totalRevenue"
    ).textContent =
        `R${totalRevenue.toFixed(2)}`;


    document.getElementById(
        "todayRevenue"
    ).textContent =
        `R${todayRevenue.toFixed(2)}`;

}


// ==================================================
// CUSTOMERS
// ==================================================

function displayCustomers() {

    const list =
        document.getElementById(
            "customersList"
        );


    if (!list) {
        return;
    }


    if (
        customers.length === 0
    ) {

        list.innerHTML =
            `
            <div class="empty-message">
                No customers yet.
                Add your first customer.
            </div>
            `;

        return;

    }


    list.innerHTML =
        customers.map(
            function (
                customer
            ) {

                const name =
                    getCustomerName(
                        customer
                    );


                const phone =
                    getCustomerPhone(
                        customer
                    );


                return `
                    <div class="customer-card">

                        <div class="customer-info">

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <span>
                                ${
                                    phone
                                        ? escapeHTML(phone)
                                        : "No phone number"
                                }
                            </span>

                        </div>


                        <button
                            class="delete-btn"
                            onclick="
                                deleteCustomer(
                                    '${customer.id}'
                                )
                            "
                        >
                            Delete
                        </button>

                    </div>
                `;

            }
        ).join("");

}


// ==================================================
// DELETE CUSTOMER
// ==================================================

async function deleteCustomer(
    id
) {

    const customer =
        customers.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!customer) {
        return;
    }


    if (
        !confirm(
            `Delete customer "${getCustomerName(customer)}"?`
        )
    ) {

        return;

    }


    const {
        deleteDoc,
        doc
    } = window.firestoreFunctions;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "customers",
                id
            )
        );


        customers =
            customers.filter(
                function (item) {

                    return item.id !== id;

                }
            );


        displayCustomers();

        populateCustomerDropdown();

        updateDashboard();


    } catch (error) {

        alert(
            "Could not delete customer."
        );

    }

}


// ==================================================
// SERVICES
// ==================================================

function displayServices() {

    const list =
        document.getElementById(
            "servicesList"
        );


    if (!list) {
        return;
    }


    if (
        services.length === 0
    ) {

        list.innerHTML =
            `
            <div class="empty-message">
                No services yet.
                Add your first service.
            </div>
            `;

        return;

    }


    list.innerHTML =
        services.map(
            function (
                service
            ) {

                const name =
                    getServiceName(
                        service
                    );


                const price =
                    getServicePrice(
                        service
                    );


                const duration =
                    getServiceDuration(
                        service
                    );


                let details = "";


                if (price !== "") {

                    details +=
                        `R${escapeHTML(price)}`;

                }


                if (
                    duration !== ""
                ) {

                    if (details !== "") {
                        details += " • ";
                    }


                    details +=
                        `${escapeHTML(duration)} min`;

                }


                if (!details) {

                    details =
                        "No price or duration";

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
                            onclick="
                                deleteService(
                                    '${service.id}'
                                )
                            "
                        >
                            Delete
                        </button>

                    </div>
                `;

            }
        ).join("");

}


// ==================================================
// DELETE SERVICE
// ==================================================

async function deleteService(
    id
) {

    const service =
        services.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!service) {
        return;
    }


    if (
        !confirm(
            `Delete service "${getServiceName(service)}"?`
        )
    ) {

        return;

    }


    const {
        deleteDoc,
        doc
    } = window.firestoreFunctions;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "services",
                id
            )
        );


        services =
            services.filter(
                function (item) {

                    return item.id !== id;

                }
            );


        displayServices();

        populateServiceDropdown();

        updateDashboard();


    } catch (error) {

        alert(
            "Could not delete service."
        );

    }

}


// ==================================================
// DROPDOWNS
// ==================================================

function populateCustomerDropdown() {

    const select =
        document.getElementById(
            "customerName"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        `
        <option value="">
            Select customer
        </option>
        `;


    customers.forEach(
        function (
            customer
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                getCustomerName(
                    customer
                );


            option.textContent =
                getCustomerName(
                    customer
                );


            select.appendChild(
                option
            );

        }
    );

}


function populateServiceDropdown() {

    const select =
        document.getElementById(
            "serviceName"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        `
        <option value="">
            Select service
        </option>
        `;


    services.forEach(
        function (
            service
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                getServiceName(
                    service
                );


            option.textContent =
                getServiceName(
                    service
                );


            select.appendChild(
                option
            );

        }
    );

}


// ==================================================
// APPOINTMENTS
// ==================================================

function displayAppointments() {

    const list =
        document.getElementById(
            "appointmentsList"
        );


    if (!list) {
        return;
    }


    const search =
        document
            .getElementById(
                "searchAppointments"
            )
            .value
            .toLowerCase()
            .trim();


    const statusFilter =
        document
            .getElementById(
                "statusFilter"
            )
            .value;


    let filtered =
        appointments.filter(
            function (
                appointment
            ) {

                const customer =
                    String(
                        appointment.customer || ""
                    ).toLowerCase();


                const service =
                    String(
                        appointment.service || ""
                    ).toLowerCase();


                const date =
                    String(
                        appointment.date || ""
                    ).toLowerCase();


                const time =
                    String(
                        appointment.time || ""
                    ).toLowerCase();


                const status =
                    getAppointmentStatus(
                        appointment
                    );


                const matchesSearch =
                    !search ||
                    customer.includes(search) ||
                    service.includes(search) ||
                    date.includes(search) ||
                    time.includes(search) ||
                    status
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    statusFilter === "All" ||
                    status === statusFilter;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    filtered.sort(
        function (
            a,
            b
        ) {

            const first =
                `${a.date || ""} ${a.time || ""}`;


            const second =
                `${b.date || ""} ${b.time || ""}`;


            return first.localeCompare(
                second
            );

        }
    );


    if (
        filtered.length === 0
    ) {

        list.innerHTML =
            `
            <div class="empty-message">
                No appointments found.
            </div>
            `;

        return;

    }


    list.innerHTML =
        filtered.map(
            function (
                appointment
            ) {

                const status =
                    getAppointmentStatus(
                        appointment
                    );


                let statusClass =
                    "status-booked";


                if (
                    status === "Completed"
                ) {

                    statusClass =
                        "status-completed";

                }


                if (
                    status === "Cancelled"
                ) {

                    statusClass =
                        "status-cancelled";

                }


                if (
                    status === "No-show"
                ) {

                    statusClass =
                        "status-no-show";

                }


                const payment =
                    getPayment(
                        appointment
                    );


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

                                📅
                                ${escapeHTML(
                                    appointment.date
                                )}

                                &nbsp;

                                🕐
                                ${escapeHTML(
                                    appointment.time
                                )}

                            </div>


                            <span
                                class="
                                    status-badge
                                    ${statusClass}
                                "
                            >

                                ${escapeHTML(
                                    status
                                )}

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
                                        '${appointment.id}',
                                        this.value
                                    )
                                "
                            >

                                <option
                                    value="Booked"
                                    ${
                                        status === "Booked"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Booked
                                </option>


                                <option
                                    value="Completed"
                                    ${
                                        status === "Completed"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Completed
                                </option>


                                <option
                                    value="Cancelled"
                                    ${
                                        status === "Cancelled"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Cancelled
                                </option>


                                <option
                                    value="No-show"
                                    ${
                                        status === "No-show"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    No-show
                                </option>

                            </select>


                            <button
                                class="edit-btn"
                                onclick="
                                    editAppointment(
                                        '${appointment.id}'
                                    )
                                "
                            >
                                Edit
                            </button>


                            <button
                                class="delete-btn"
                                onclick="
                                    deleteAppointment(
                                        '${appointment.id}'
                                    )
                                "
                            >
                                Delete
                            </button>


                        </div>

                    </div>
                `;

            }
        ).join("");

}


// ==================================================
// CHANGE STATUS
// ==================================================

async function changeAppointmentStatus(
    id,
    newStatus
) {

    const appointment =
        appointments.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!appointment) {
        return;
    }


    const {
        updateDoc,
        doc
    } = window.firestoreFunctions;


    try {

        await updateDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "appointments",
                id
            ),
            {
                status: newStatus
            }
        );


        appointment.status =
            newStatus;


        displayAppointments();

        updateDashboard();


    } catch (error) {

        alert(
            "Could not update appointment."
        );

    }

}


// ==================================================
// DELETE APPOINTMENT
// ==================================================

async function deleteAppointment(
    id
) {

    if (
        !confirm(
            "Delete this appointment?"
        )
    ) {

        return;

    }


    const {
        deleteDoc,
        doc
    } = window.firestoreFunctions;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "appointments",
                id
            )
        );


        appointments =
            appointments.filter(
                function (item) {

                    return item.id !== id;

                }
            );


        displayAppointments();

        updateDashboard();


    } catch (error) {

        alert(
            "Could not delete appointment."
        );

    }

}


// ==================================================
// APPOINTMENT MODAL
// ==================================================

const appointmentModal =
    document.getElementById(
        "appointmentModal"
    );


const customerModal =
    document.getElementById(
        "customerModal"
    );


const serviceModal =
    document.getElementById(
        "serviceModal"
    );


document
    .getElementById(
        "addAppointmentBtn"
    )
    .addEventListener(
        "click",
        function () {

            editingAppointmentId =
                null;


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

        }
    );


document
    .getElementById(
        "closeModalBtn"
    )
    .addEventListener(
        "click",
        closeAppointmentModal
    );


function closeAppointmentModal() {

    appointmentModal.classList.add(
        "hidden"
    );


    editingAppointmentId =
        null;

}


appointmentModal.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            event.target ===
            appointmentModal
        ) {

            closeAppointmentModal();

        }

    }
);


// ==================================================
// ADD / EDIT APPOINTMENT
// ==================================================

document
    .getElementById(
        "appointmentForm"
    )
    .addEventListener(
        "submit",
        async function (
            event
        ) {

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
                    function (
                        appointment
                    ) {

                        if (
                            editingAppointmentId &&
                            appointment.id ===
                            editingAppointmentId
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


            const {
                addDoc,
                updateDoc,
                doc
            } = window.firestoreFunctions;


            try {

                if (
                    editingAppointmentId
                ) {

                    await updateDoc(
                        doc(
                            db,
                            "users",
                            currentUser.uid,
                            "appointments",
                            editingAppointmentId
                        ),
                        appointmentData
                    );


                    const index =
                        appointments.findIndex(
                            function (
                                appointment
                            ) {

                                return (
                                    appointment.id ===
                                    editingAppointmentId
                                );

                            }
                        );


                    if (index !== -1) {

                        appointments[index] = {

                            id:
                                editingAppointmentId,

                            ...appointmentData

                        };

                    }


                    alert(
                        "Appointment updated successfully!"
                    );


                } else {

                    const newAppointment =
                        await addDoc(
                            userCollection(
                                "appointments"
                            ),
                            appointmentData
                        );


                    appointments.push({

                        id:
                            newAppointment.id,

                        ...appointmentData

                    });


                    alert(
                        "Appointment saved successfully!"
                    );

                }


                displayAppointments();

                updateDashboard();

                closeAppointmentModal();


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "Could not save the appointment. Please check your internet connection."
                );

            }

        }
    );


// ==================================================
// EDIT APPOINTMENT
// ==================================================

function editAppointment(
    id
) {

    const appointment =
        appointments.find(
            function (
                item
            ) {

                return item.id === id;

            }
        );


    if (!appointment) {
        return;
    }


    editingAppointmentId =
        id;


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
        getPayment(
            appointment
        );


    appointmentModal.classList.remove(
        "hidden"
    );

}


// ==================================================
// CUSTOMER MODAL
// ==================================================

document
    .getElementById(
        "addCustomerBtn"
    )
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "customerForm"
                )
                .reset();


            customerModal.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById(
        "closeCustomerModalBtn"
    )
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
    function (
        event
    ) {

        if (
            event.target ===
            customerModal
        ) {

            customerModal.classList.add(
                "hidden"
            );

        }

    }
);


// ==================================================
// ADD CUSTOMER
// ==================================================

document
    .getElementById(
        "customerForm"
    )
    .addEventListener(
        "submit",
        async function (
            event
        ) {

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
                    function (
                        customer
                    ) {

                        return (
                            getCustomerName(
                                customer
                            )
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


            const {
                addDoc
            } = window.firestoreFunctions;


            try {

                const newCustomer =
                    await addDoc(
                        userCollection(
                            "customers"
                        ),
                        {
                            name: name,
                            phone: phone
                        }
                    );


                customers.push({

                    id:
                        newCustomer.id,

                    name: name,

                    phone: phone

                });


                displayCustomers();

                populateCustomerDropdown();

                updateDashboard();


                document
                    .getElementById(
                        "customerForm"
                    )
                    .reset();


                customerModal.classList.add(
                    "hidden"
                );


                alert(
                    "Customer saved successfully!"
                );


            } catch (error) {

                alert(
                    "Could not save customer."
                );

            }

        }
    );


// ==================================================
// SERVICE MODAL
// ==================================================

document
    .getElementById(
        "addServiceBtn"
    )
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "serviceForm"
                )
                .reset();


            serviceModal.classList.remove(
                "hidden"
            );

        }
    );


document
    .getElementById(
        "closeServiceModalBtn"
    )
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
    function (
        event
    ) {

        if (
            event.target ===
            serviceModal
        ) {

            serviceModal.classList.add(
                "hidden"
            );

        }

    }
);


// ==================================================
// ADD SERVICE
// ==================================================

document
    .getElementById(
        "serviceForm"
    )
    .addEventListener(
        "submit",
        async function (
            event
        ) {

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
                    function (
                        service
                    ) {

                        return (
                            getServiceName(
                                service
                            )
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


            const {
                addDoc
            } = window.firestoreFunctions;


            try {

                const newService =
                    await addDoc(
                        userCollection(
                            "services"
                        ),
                        {
                            name: name,
                            price: price,
                            duration: duration
                        }
                    );


                services.push({

                    id:
                        newService.id,

                    name: name,

                    price: price,

                    duration: duration

                });


                displayServices();

                populateServiceDropdown();

                updateDashboard();


                document
                    .getElementById(
                        "serviceForm"
                    )
                    .reset();


                serviceModal.classList.add(
                    "hidden"
                );


                alert(
                    "Service saved successfully!"
                );


            } catch (error) {

                alert(
                    "Could not save service."
                );

            }

        }
    );


// ==================================================
// SEARCH & FILTER
// ==================================================

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


// ==================================================
// CLEAR APPOINTMENTS
// ==================================================

document
    .getElementById(
        "clearAppointmentsBtn"
    )
    .addEventListener(
        "click",
        async function () {

            if (
                appointments.length === 0
            ) {

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


            const {
                deleteDoc,
                doc
            } = window.firestoreFunctions;


            try {

                for (
                    const appointment
                    of appointments
                ) {

                    await deleteDoc(
                        doc(
                            db,
                            "users",
                            currentUser.uid,
                            "appointments",
                            appointment.id
                        )
                    );

                }


                appointments = [];


                displayAppointments();

                updateDashboard();


                alert(
                    "All appointments have been deleted."
                );


            } catch (error) {

                alert(
                    "Could not clear appointments."
                );

            }

        }
    );


// ==================================================
// START
// ==================================================

startFirebase(); 
