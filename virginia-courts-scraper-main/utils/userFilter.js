const fs = require('fs').promises;

/**
 * Reads configuration from a JSON file asynchronously.
 * 
 * @param {string} filePath - The path to the configuration file.
 * @returns {Promise<Object>} A promise that resolves with the configuration object.
 */
async function readConfig(filePath) {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
}

/**
 * Determines if the given item's codeSection matches any of the specified filters.
 * 
 * @param {Object} item - The item to check.
 * @param {Array<string>} filters - The filters to apply.
 * @returns {boolean} True if the item matches any of the filters, otherwise false.
 */
function matchesFilter(item, filters) {
    return filters.some(filter => item.codeSection.includes(filter));
}

/**
 * Filters items based on their 'codeSection' property, according to the filters specified in a configuration file.
 * 
 * @param {Array<Object>} items - The items to filter.
 * @param {string} configPath - The path to the configuration file.
 * @returns {Promise<Array<Object>>} A promise that resolves with the filtered items.
 */
async function userFilter(items, configPath = './utils/config.json') {
    try {
        const { codeSections: filters } = await readConfig(configPath);
        return items.filter(item => matchesFilter(item, filters));
    } catch (error) {
        console.error(`Failed to filter items: ${error.message}`);
        throw error; // Re-throw the error to allow caller to handle it
    }
}

module.exports = userFilter;
