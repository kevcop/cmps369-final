//necessary modules
const express = require('express');
const router = express.Router();
const geo = require('node-geocoder'); 
const geocoder = geo({ provider: 'openstreetmap' });
var markers =[];
//handles the home page
/*  router.get('/', async (req, res) => {
  try {
    const contacts = await req.db.read('Contacts', []);
    res.render('home', { contacts }); 
  } catch (error) {
    console.log(error);
  }
});  */

router.get('/', async (req, res) => {
  try {
      const contacts = await req.db.findContacts(); // Use findContacts here
      res.render('home', { contacts });
  } catch (error) {
      console.error("Failed to load contacts:", error);
      res.status(500).send("Error loading contacts");
  }
});


//handle routes for the different pages we will accomodate in website
router.get('/create', (req, res) => {
  res.render('create'); 
});

router.get('/login', (req, res) => {
    res.render('login'); 
  });

  router.get('/signup', (req, res) => {
    res.render('signup'); 
  });

//handling post route when creating a new contact
router.post('/create', async (req, res) => {
  // Extract information entered
  const { firstName, lastName, phoneNumber, emailAddress, street, city, state, zip, country, contactByEmail, contactByPhone, contactByMail } = req.body;
  
  // Convert checkbox value to a 1 or 0
  const contactByEmailInt = contactByEmail ? 1 : 0;
  const contactByPhoneInt = contactByPhone ? 1 : 0;
  const contactByMailInt = contactByMail ? 1 : 0; 

  // Concatenate address components with appropriate separators
  const address = `${street}, ${city}, ${state} ${zip}, ${country}`;

  try {
    // Geocode the address
    const result = await geocoder.geocode(address);
    
    // Initialize variables for geocoded address and coordinates
    let addressResult = address;
    let lat = 0;
    let lng = 0;

    // Check if geocoding was successful
    if (result.length > 0) {
      // Extract necessary attributes from the geocoding result
      const { formattedAddress, latitude, longitude } = result[0];
      
      // Assign variables with appropriate values
      addressResult = formattedAddress;
      lat = latitude;
      lng = longitude;
    } else {
      console.log('No return results');
    }

    // Attempt to add newly created contact to database
    const id = await req.db.createContact(
      firstName, lastName, phoneNumber, emailAddress, addressResult, lat, lng, contactByEmailInt, contactByPhoneInt, contactByMailInt
    );

    // Redirect to home page 
    res.redirect('/');
    
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).send("Error creating contact");
  }
});


//router get to handle logout
router.get('/logout', async (req, res) => {
    //clear session
    req.session.user = undefined;
    // redirect to the home page
    res.redirect('/');
});


//route to handle a accessing a specific persons information 
router.get('/:id', async (req, res) => {
  try {
      const id = req.params.id;
      const contact = await req.db.findContactById(id);  // Use a correctly defined method
      if (contact) {
          res.render('contactDetails', { contact });
      } else {
          res.status(404).send('Contact not found');
      }
  } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).send("Internal Server Error");
  }
});

//handles the aspect of a user being logged in, will be passed to other functions to ensure a user is logged in
const logged_in = (req, res, next) => {
    //grant access to a logged in user
    if (req.session.user) {
        next();
    } else {
        //display a page for unauthorized users
        res.status(404).render('authorized');
    }
};

//route to handle a logged in user attempting to edit a contact
router.get('/:id/edit', logged_in, async (req, res) => {
    //extract id
    const contactId = req.params.id;
    try {
        //try to retrieve contact information from the database
      const contact = await req.db.read('Contacts', [{ column: 'ID', value: contactId }]);
      //if contact exists displays its information using the editContact pug file
      if (contact.length > 0) {
        res.render('editContact', { contact: contact[0] }); 
      } 
      //more error handling for a contact not being found, mainly used for testing purposes
    } catch (error) {
      console.error("Error fetching contact for edit:", error);
    }
  });
  
  //handle GET route for deleting
router.get('/:id/delete', logged_in, async (req, res) => {
    //extract id
    const contactId = req.params.id;
    try {
        //try to find contact in the database based on the ID
      const contact = await req.db.read('Contacts', [{ column: 'ID', value: contactId }]);
      if (contact.length > 0) {
        //display a page asking if the user is sure they want to delete the contact
        res.render('confirmation', { contact: contact[0] });
      }
      //additional error handling 
    } catch (error) {
      console.error("Error in deletion:", error);
    }
  });
  
  //post route for when a contact is deleted
  router.post('/:id/delete', logged_in, async (req, res) => {
    const contactId = req.params.id;
    try {
      //find the contact by searching for id in the database and delete it
      await req.db.delete('Contacts', [{ column: 'ID', value: contactId }]);
      //once deleted, redirect user to the home page
      res.redirect('/');
    } catch (error) {
        //error handling for when deleting a contact fails, testing purposes
      console.error("Error deleting contact:", error);
    }
  });
  
  // post router to handle the result of editing a contact
  router.post('/:id/edit', logged_in, async (req, res) => {
    //extract id
    const contactId = req.params.id;
    // extract necessary information from the form 
    const { firstName, lastName, phoneNumber, emailAddress, street, city, state, zip, country, contactByEmail, contactByPhone, contactByMail } = req.body;
    
    //convert checkbox values to 1 or 0 
    const contactByEmailInt = contactByEmail ? 1 : 0;
    const contactByPhoneInt = contactByPhone ? 1 : 0;
    const contactByMailInt = contactByMail ? 1 : 0;
    
    //attempt to update the contact
    try {
        // update
        await req.db.update('Contacts', [
            { column: 'FirstName', value: firstName },
            { column: 'LastName', value: lastName },
            { column: 'PhoneNumber', value: phoneNumber },
            { column: 'EmailAddress', value: emailAddress },
            { column: 'Street', value: street },
            { column: 'City', value: city },
            { column: 'State', value: state },
            { column: 'Zip', value: zip },
            { column: 'Country', value: country },
            { column: 'Contact_By_Email', value: contactByEmailInt },
            { column: 'Contact_By_Phone', value: contactByPhoneInt },
            { column: 'Contact_By_Mail', value: contactByMailInt }
        ], [{ column: 'ID', value: contactId }]);
        //redirect to contacts page
        res.redirect(`/${contactId}`); 
    } catch (error) {
        //error handling
        console.error("Error updating contact:", error);
    }
});

/* const loadPlaces = async () => {
  const response = await axios.get('/places');
  const tbody = document.querySelector('tbody');
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  // Clear markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  const places = response.data.places;

  if (response && response.data && response.data.places) {
    for (const place of response.data.places) {
      const tr = document.createElement('tr');
      tr.dataset.lat = place.lat;
      tr.dataset.lng = place.lng;

      tr.innerHTML = `
        <td>${place.label}</td>
        <td>${place.address}</td>
        <td>
          <button class='btn btn-danger' onclick='deletePlace(${place.id})'>Delete</button>
        </td>
      `;

      // Enable row functionality
      tr.onclick = onRowClick;
      tbody.appendChild(tr);

      // Add markers to the map
      if (place.lat && place.lng && place.lat !== 0 && place.lng !== 0) {
        const marker = L.marker([place.lat, place.lng]).addTo(map)
          .bindPopup(`<b>${place.label}</b><br>${place.address}`);
        markers.push(marker);
      }
    }
  }
};

// Function to handle row click events
function onRowClick(e) {
  // Determine what row was clicked
  let row = e.target;
  // Use reference
  if (row.tagName.toUpperCase() === 'TD') {
    row = row.parentNode;
  }
  // Extract necessary information from clicked row
  if (row) {
    const lat = row.dataset.lat;
    const lng = row.dataset.lng;
    // If valid coordinates fly to the desired location
    if (lat && lng) {
      map.flyTo(new L.LatLng(lat, lng), 13);
    }
  }
} */

//export
module.exports = router;
