document.addEventListener('DOMContentLoaded', () => {

    // --- Global Initializations ---
    handleActiveNavLinks();
    initScrollReveal();

    // --- Page-Specific Logic ---
    const page = document.body.id;
    switch (page) {
        case 'page-destinations':
            fetchAndDisplayDestinations();
            initBookingModal();
            break;
        case 'page-contact':
            initContactForm();
            break;
        case 'page-bookings':
            fetchAndDisplayBookings();
            initCancelButtons(); // <-- Call the new cancel handler
            break;
        case 'page-about':
            // No JS needed for static about page now
            break;
    }

    // --- Function Definitions ---

    function handleActiveNavLinks() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
    }

    async function fetchAndDisplayDestinations() {
        const grid = document.querySelector('.destination-grid');
        if (!grid) return;
        grid.innerHTML = '<p class="text-center">Loading destinations...</p>';
        try {
            const response = await fetch('backend/api.php?type=destinations');
            const destinations = await response.json();
            grid.innerHTML = '';
            if (destinations && destinations.length > 0) {
                destinations.forEach(dest => {
                    const card = document.createElement('div');
                    card.className = 'destination-card reveal';
                    card.innerHTML = `
                        <div class="card-img-wrapper">
                            <img src="${dest.image_url}" alt="${dest.name}" class="destination-card-img" onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0c3fc/333?text=Image+Not+Found';">
                        </div>
                        <div class="destination-card-content">
                            <h3>${dest.name}</h3>
                            <p>${dest.description}</p>
                            <div class="card-footer">
                                <span class="price">$${dest.price}/person</span>
                                <button class="btn book-now-btn" data-id="${dest.id}" data-name="${dest.name}">Book Now</button>
                            </div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
                initScrollReveal();
            } else {
                grid.innerHTML = '<p class="text-center">No destinations available right now.</p>';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            grid.innerHTML = '<p class="text-center">Could not load destinations.</p>';
        }
    }

    function initBookingModal() {
        const modalOverlay = document.getElementById('booking-modal-overlay');
        const destinationGrid = document.querySelector('.destination-grid');
        if (!modalOverlay || !destinationGrid) return;
        const closeModalBtn = document.querySelector('.close-modal');
        const bookingForm = document.getElementById('booking-form');

        destinationGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('book-now-btn')) {
                const destId = e.target.dataset.id;
                const destName = e.target.dataset.name;
                document.getElementById('booking-destination-id').value = destId;
                document.getElementById('modal-title').textContent = `Book a Trip to ${destName}`;
                modalOverlay.classList.add('active');
            }
        });

        closeModalBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('active');
        });

        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    async function handleBookingSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const button = form.querySelector('button');
        const messageDiv = document.getElementById('booking-form-message');
        const formData = {
            destination_id: form.destination_id.value,
            name: form.name.value,
            email: form.email.value,
            travel_date: form.travel_date.value,
            travelers: form.travelers.value
        };

        button.disabled = true;
        button.textContent = 'Confirming...';
        messageDiv.style.display = 'none';

        try {
            const response = await fetch('backend/api.php?type=booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'An unknown error occurred.');
            }
            messageDiv.className = 'success';
            messageDiv.textContent = result.message;
            form.reset();
            setTimeout(() => {
                document.getElementById('booking-modal-overlay').classList.remove('active');
                messageDiv.style.display = 'none';
            }, 3000);
        } catch (error) {
            messageDiv.className = 'error';
            messageDiv.textContent = error.message;
        } finally {
            messageDiv.style.display = 'block';
            button.disabled = false;
            button.textContent = 'Confirm Booking';
        }
    }

    function initContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const button = form.querySelector('button');
            const messageDiv = document.getElementById('form-message');
            const formData = {
                name: form.name.value,
                email: form.email.value,
                message: form.message.value
            };

            button.disabled = true;
            button.textContent = 'Sending...';
            messageDiv.style.display = 'none';

            try {
                const response = await fetch('backend/api.php?type=contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'An unknown error occurred.');
                }
                messageDiv.className = 'success';
                messageDiv.textContent = result.message;
                form.reset();
            } catch (error) {
                messageDiv.className = 'error';
                messageDiv.textContent = error.message;
            } finally {
                messageDiv.style.display = 'block';
                button.disabled = false;
                button.textContent = 'Send Message';
            }
        });
    }

    async function fetchAndDisplayBookings() {
        const container = document.getElementById('bookings-list');
        if (!container) return;
        container.innerHTML = '<p class="text-center">Loading bookings...</p>';
        try {
            const response = await fetch('backend/api.php?type=bookings');
            const bookings = await response.json();
            if (bookings.length > 0) {
                const table = document.createElement('table');
                table.className = 'bookings-table';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Destination</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Travel Date</th>
                            <th>Travelers</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bookings.map(b => `
                            <tr id="booking-row-${b.id}">
                                <td>${b.destination_name}</td>
                                <td>${b.name}</td>
                                <td>${b.email}</td>
                                <td>${new Date(b.travel_date).toLocaleDateString()}</td>
                                <td>${b.travelers}</td>
                                <td><button class="btn-cancel" data-id="${b.id}">Cancel</button></td>
                            </tr>`).join('')}
                    </tbody>`;
                container.innerHTML = '';
                container.appendChild(table);
            } else {
                container.innerHTML = '<p class="text-center">No bookings have been made yet.</p>';
            }
        } catch (error) {
            console.error('Fetch error:', error);
            container.innerHTML = '<p class="text-center">Could not load booking data.</p>';
        }
    }

    function initCancelButtons() {
        const bookingsContainer = document.getElementById('bookings-list');
        if (!bookingsContainer) return;

        bookingsContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('btn-cancel')) {
                const button = event.target;
                const bookingId = button.dataset.id;

                if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
                    button.disabled = true;
                    button.textContent = '...';

                    try {
                        const response = await fetch('backend/api.php?type=cancel_booking', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: bookingId })
                        });

                        const result = await response.json();

                        if (!response.ok) {
                            throw new Error(result.message || 'Failed to cancel.');
                        }

                        // Visually remove the row from the table on success
                        const rowToRemove = document.getElementById(`booking-row-${bookingId}`);
                        if (rowToRemove) {
                            rowToRemove.style.transition = 'opacity 0.5s ease';
                            rowToRemove.style.opacity = '0';
                            setTimeout(() => rowToRemove.remove(), 500);
                        }
                        alert(result.message); // Show success message

                    } catch (error) {
                        alert(`Error: ${error.message}`);
                        button.disabled = false;
                        button.textContent = 'Cancel';
                    }
                }
            }
        });
    }

});
