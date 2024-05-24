/**
 * Generates a random delay duration within a specified range.
 * 
 * This function calculates a random number between a minimum and maximum value
 * to simulate typing delays. The purpose is to provide a realistic delay duration
 * for typing simulations or similar applications.
 * 
 * @returns {Promise<number>} A promise that resolves with a random delay duration (in milliseconds) between the specified min and max values.
 */
const typeDelay = async () => {
    const min = 50; // Minimum delay in milliseconds
    const max = 100; // Maximum delay in milliseconds
    // Calculate a random delay duration between min and max
    const delayDuration = Math.floor(Math.random() * (max - min + 1)) + min;
    return delayDuration;
}

module.exports = typeDelay;
