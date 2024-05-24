const fs = require('fs');
const JSONStream = require('JSONStream');
const path = require('path');

/**
 * Asynchronously adds court names to data entries in a JSON file based on a lookup from another JSON file.
 * 
 * This function reads a JSON file stream and enriches each data entry with a court name by matching
 * a 'fipsCode4' property from a preloaded JSON object containing court details. It ensures the entire
 * process is handled asynchronously, allowing calling functions to await its completion.
 * 
 * @returns {Promise<void>} A promise that resolves once the file has been processed.
 */
const addMetaData = () => {
    return new Promise((resolve, reject) => {
        // Load court details for lookup
        const lookupCodeDetailsPath = path.join(__dirname, '../staticList/getLookupCodeDetails.json');
        const lookupCodeDetails = fs.readFileSync(lookupCodeDetailsPath, 'utf8');
        const jsonCodeDetails = JSON.parse(lookupCodeDetails);

        // Create a read stream for the input JSON file
        const fileStream = fs.createReadStream(path.join(__dirname, '../data/2024_01_16.json'));

        fileStream
            .pipe(JSONStream.parse('*'))
            .on('data', (data) => {
                // Find the court detail for the current entry
                const courtDetail = jsonCodeDetails.find(codeDetail => codeDetail.fipsCode4 === data.qualifiedFips);
                if (courtDetail) {
                    data.courtName = courtDetail.courtName;
                    console.log(data); // Or process the data as needed
                }
            })
            .on('error', (error) => {
                console.error('Error:', error);
                reject(error); // Reject the promise on error
            })
            .on('end', () => {
                resolve(); // Resolve the promise once the stream ends
            })
    })
}

module.exports = addMetaData;
