var markers = [];

const addContact = async () => {
    const firstName = document.querySelector("#firstName").value;
    const lastName = document.querySelector("#lastName").value;
    const phoneNumber = document.querySelector("#phoneNumber").value;
    const emailAddress = document.querySelector("#emailAddress").value;
    const street = document.querySelector("#street").value;
    const city = document.querySelector("#city").value;
    const state = document.querySelector("#state").value;
    const zip = document.querySelector("#zip").value;
    const country = document.querySelector("#country").value;
    const contactByEmail = document.querySelector("#contactByEmail").checked;
    const contactByPhone = document.querySelector("#contactByPhone").checked;
    const contactByMail = document.querySelector("#contactByMail").checked;

    const address = `${street}, ${city}, ${state} ${zip}, ${country}`;

    console.log('Adding contact with data:', {firstName, lastName, phoneNumber, emailAddress, address, contactByEmail, contactByPhone, contactByMail});

    try {
        await axios.post('/create', {
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            emailAddress: emailAddress,
            street: street,
            city: city,
            state: state,
            zip: zip,
            country: country,
            contactByEmail: contactByEmail,
            contactByPhone: contactByPhone,
            contactByMail: contactByMail
        });
        await loadContacts();
    } catch (error) {
        console.error('Error adding contact:', error);
        // Handle error
    }
}

const deleteContact = async (id) => {
    try {
        await axios.delete(`/contacts/${id}`);
        await loadContacts();
    } catch (error) {
        console.error('Error deleting contact:', error);
        // Handle error
    }
}

const loadContacts = async () => {
    console.log('Loading contacts...');
    try {
        const response = await axios.get('/contacts');
        const tbody = document.querySelector('tbody');
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        markers.forEach(marker => marker.remove());
        markers = [];

        const contacts = response.data.contacts;
        contacts.forEach(contact => {
            const tr = document.createElement('tr');
            tr.dataset.lat = contact.lat; // Make sure these names match your data properties
            tr.dataset.lng = contact.lng;

            tr.innerHTML = `
                <td>${contact.firstName} ${contact.lastName}</td>
                <td>${contact.phoneNumber}</td>
                <td>${contact.emailAddress}</td>
                <td>${contact.address}</td>
                <td>
                    Phone: ${contact.contactByPhone ? 'Yes' : 'No'}<br>
                    Email: ${contact.contactByEmail ? 'Yes' : 'No'}<br>
                    Mail: ${contact.contactByMail ? 'Yes' : 'No'}
                </td>
            `;
            tr.addEventListener('click', () => {
                map.flyTo([contact.lat, contact.lng], 13);
                markers.find(marker => marker._latlng.lat === contact.lat && marker._latlng.lng === contact.lng)?.openPopup();
            });
            tbody.appendChild(tr);

            const marker = L.marker([contact.lat, contact.lng]).addTo(map)
                .bindPopup(`<b>${contact.firstName} ${contact.lastName}</b><br>${contact.address}`);
            markers.push(marker);
        });
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}



function onRowClick(e) {
    let row = e.target;
    if (row.tagName.toUpperCase() === 'TD') {
        row = row.parentNode;
    }
    if (row) {
        const lat = row.dataset.lat;
        const lng = row.dataset.lng;
        if (lat && lng) {
            map.flyTo(new L.LatLng(lat, lng), 13); 
        }
    }
}
