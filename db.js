require('dotenv').config();
const Database = require('dbcmps369');

class ContactsDB {
    constructor() {
        this.db = new Database();
    }
    // Initialize the database schema for contacts
    async initialize() {
        await this.db.connect();
        await this.db.schema('Contact', [
            { name: 'id', type: 'INTEGER' },
            { name: 'firstName', type: 'TEXT' },
            { name: 'lastName', type: 'TEXT' },
            { name: 'phoneNumber', type: 'TEXT' },
            { name: 'emailAddress', type: 'TEXT' },
            { name: 'address', type: 'TEXT' },
            { name: 'lat', type: 'NUMERIC' },
            { name: 'lng', type: 'NUMERIC' },
            { name: 'contactByEmail', type: 'BOOLEAN' },
            { name: 'contactByPhone', type: 'BOOLEAN' },
            { name: 'contactByMail', type: 'BOOLEAN' }
        ], 'id');
    }
    // Search for all contacts
    async findContacts() {
        const contacts = await this.db.read('Contact', []);
        return contacts;
    }
    // Create a new contact in the database
    async createContact(firstName, lastName, phoneNumber, emailAddress, address, lat, lng, contactByEmail, contactByPhone, contactByMail) {
        const id = await this.db.create('Contact', [
            { column: 'firstName', value: firstName },
            { column: 'lastName', value: lastName },
            { column: 'phoneNumber', value: phoneNumber },
            { column: 'emailAddress', value: emailAddress },
            { column: 'address', value: address },
            { column: 'lat', value: lat },
            { column: 'lng', value: lng },
            { column: 'contactByEmail', value: contactByEmail },
            { column: 'contactByPhone', value: contactByPhone },
            { column: 'contactByMail', value: contactByMail }
        ]);
        return id;
    }
    // Remove a contact from the database

    async findContactById(id) {
        try {
            const result = await this.db.read('Contact', [{ column: 'id', value: id }]);
            if (result && result.length > 0) {
                return result[0]; // Assuming `read` returns an array of results
            } else {
                return null; // No results found
            }
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }
    
    
    async deleteContact(id) {
        await this.db.delete('Contact', [{ column: 'id', value: id }]);
    }
}



module.exports = ContactsDB;
