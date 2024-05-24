/**
 * Asynchronously formats an input date into two different string formats.
 * 
 * Currently performs synchronous date formatting operations but is designed to
 * support future asynchronous actions, such as fetching time zone information.
 * 
 * @param {string|Date} inputDate - The date to be formatted, either as a string or Date object.
 * @returns {Promise<{ formattedUserDate: string, formattedOutputDate: string }>} A promise that resolves with an object containing the formatted date strings.
 */
const dateFormat = async (inputDate) => {
    // Placeholder for potential asynchronous operations
    // await someAsynchronousOperationIfNeeded();

    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedUserDate = `${month}/${day}/${year}`;
    const formattedOutputDate = `${year}_${month}_${day}`;

    return { formattedUserDate, formattedOutputDate };
}

module.exports = dateFormat;