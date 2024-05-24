/**
 * Starts a rotating indicator in the console to signify an ongoing process.
 * 
 * This function creates a visual indicator that rotates between two states to imply activity.
 * It uses `setInterval` to toggle the indicator's direction every 100 milliseconds. Calling
 * the returned function stops the indicator and clears the interval.
 * 
 * @returns {Function} A function that, when called, stops the rotating indicator and clears the console line.
 */
const rotatingIndicator = () => {
    let direction = true; // Toggle for indicator direction
    const interval = setInterval(() => {
        // Update the console with the rotating indicator
        process.stdout.write(`\r${direction ? '/' : '\\'} Searching... ${!direction ? '/' : '\\'}`);
        direction = !direction; // Toggle direction
    }, 100)

    // Return a closure to stop the indicator
    return () => {
        clearInterval(interval); // Stop the interval
        process.stdout.write('\n'); // Move to a new line in the console
    }
}

module.exports = rotatingIndicator;
