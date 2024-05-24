const readline = require('readline');

/**
 * Prompts the user with a question and returns their response.
 * 
 * This function creates a readline interface to prompt the user with a specified question
 * and awaits their input. Once the user provides an input, the promise is resolved with
 * the input as its value.
 * 
 * @param {string} question - The question to prompt the user with.
 * @returns {Promise<string>} A promise that resolves with the user's response.
 */
const userPrompt = async (question) => {
    return new Promise((res, rej) => {
        const rl = readline.createInterface({input: process.stdin, output: process.stdout});
        rl.question(question, (answer) => {
            res(answer);
            rl.close();
        })
    })
}

module.exports = userPrompt;
