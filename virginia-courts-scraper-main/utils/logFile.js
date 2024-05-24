const fs = require('fs').promises; // Use the Promise-based version of the fs module
const logFilePath = './logfile.log';

/**
 * Asynchronously appends an error message to a log file with a timestamp and log type.
 * 
 * This function creates a log message formatted with a timestamp and a specified log type
 * (e.g., ERROR, WARNING), then asynchronously appends this message to a log file. It uses the
 * Promise-based fs module to handle file operations asynchronously, improving performance by
 * not blocking the event loop.
 * 
 * @param {string} logType - The type of the log entry (e.g., 'ERROR', 'WARNING').
 * @param {string} errorMsg - The error message to log.
 * @returns {Promise<void>} A promise that resolves when the log entry has been successfully appended to the file.
 */
const logFile = async (logType, errorMsg) => {
    const now = new Date();
    const timestamp = now.toISOString();
    const logMessage = `[${timestamp}] ${logType}: ${errorMsg}\n`;

    // Append the log message to the file asynchronously
    await fs.appendFile(logFilePath, logMessage, 'utf8');
}

module.exports = logFile;