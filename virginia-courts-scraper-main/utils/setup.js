const fs = require('fs').promises;
const readline = require('readline');
const { saveFile } = require('../utils/fileSaver.js');

/**
 * Prints text to the console with a specified color.
 * 
 * @param {string} text - The text to print.
 */
const printColorText = (text) => {
    const colorCode = '\x1b[33m'; // Yellow color code
    const resetCode = '\x1b[0m'; // Reset to default console color
    console.log(`${colorCode}%s${resetCode}`, text);
};

/**
 * Sets up configuration by prompting the user with a question and saving their response.
 * 
 * If a config.json file already exists in the current directory, it is first deleted.
 * The user is then prompted to input their configuration data, which is expected to be a comma-separated list of items.
 * The function resolves with an array of trimmed configuration items.
 * 
 * @param {string} question - The question to prompt the user with.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of configuration data items.
 */
const setup = async (question) => {
    try {
        await fs.unlink('./config.json');
    } catch (error) {
        if (error.code !== 'ENOENT') throw error; // Ignore error if file doesn't exist, rethrow otherwise
    }

    return new Promise((resolve) => {
        const rl = readline.createInterface({input: process.stdin, output: process.stdout});
        printColorText(question);
        rl.prompt();

        rl.on('line', (answer) => {
            const configData = answer.split(',').map(item => item.trim());
            resolve(configData);
            rl.close();
        })
    })
}

module.exports = setup;
