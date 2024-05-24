const fs = require('fs').promises;
const path = require('path');

/**
 * Asynchronously saves data to a file in JSON format.
 * 
 * The function takes a filename and data object, converts the data to a JSON string with
 * pretty formatting, and then writes this string to the specified file in the same directory
 * as this script. It logs the full path of the saved file to stdout upon completion.
 * 
 * @param {string} filename - The name of the file where data will be saved.
 * @param {Object} data - The data to save to the file, which will be stringified to JSON.
 * @returns {Promise<void>} A promise that resolves when the file has been successfully written.
 */
const fileSaver = async (filename, data) => {
    const fullPath = path.join(__dirname, filename);
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
    process.stdout.write(`\nFile saved @ ${fullPath}`);
}

module.exports = fileSaver;
