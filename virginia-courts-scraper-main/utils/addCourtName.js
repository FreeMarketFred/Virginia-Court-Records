const fs = require('fs').promises;

/**
 * Asynchronously adds court names to items in a list based on a lookup from a JSON file.
 * 
 * This function reads a JSON file containing court details and enriches each item in the provided
 * mainList with a court name, converting it to uppercase. The enrichment is based on matching
 * the 'fipsCode4' property from the item with the court details.
 * 
 * @param {Array<Object>} mainList - The list of items to be enriched with court names.
 * @returns {Promise<Array<Object>>} A promise that resolves with the enriched list.
 */
const addCourtName = async (mainList) => {
    const lookupCodeDetails = await fs.readFile('./staticList/getLookupCodeDetails.json', 'utf8');
    const jsonCodeDetails = JSON.parse(lookupCodeDetails);

    return mainList.map(item => {
        const courtDetail = jsonCodeDetails.find(codeDetail => codeDetail.fipsCode4 === item.qualifiedFips);
        if (courtDetail) {
            item.courtName = courtDetail.courtName.toUpperCase();
        }
        return item;
    })
}

module.exports = addCourtName;
