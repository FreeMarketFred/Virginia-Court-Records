const fs = require('fs');

/**
 * Processes an array of case objects to adjust their codeSection to a standard format,
 * summarizes the occurrences of each codeSection, and sorts the summary by occurrence count.
 * 
 * @param {Object[]} cases - Array of case objects with a codeSection property.
 * @returns {Promise<Object>} A promise that resolves to an object summarizing and sorting codeSections by their count.
 */
const summarizeCodeSections = async (cases) => {
  const adjustedCases = cases.map(caseItem => {
    // Ensure codeSection matches the format NN.N-NNN or NN.N-NN
    const match = caseItem.codeSection.match(/\b\d{2}\.\d-\d{1,3}\b/);
    const adjustedCodeSection = match ? match[0] : caseItem.codeSection;

    return { ...caseItem, codeSection: adjustedCodeSection };
  });

  try {
    // Generate a summary of codeSection occurrences
    const summary = adjustedCases.reduce((acc, record) => {
      const codeSection = record.codeSection;
      acc[codeSection] = (acc[codeSection] || 0) + 1;
      return acc;
    }, {});

    // Convert the summary to an array, sort it, and convert it back to an object
    const sortedSummaryArray = Object.entries(summary).sort((a, b) => b[1] - a[1]);
    const sortedSummary = sortedSummaryArray.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    const columns = 8; // Number of columns
    const rows = Math.ceil(sortedSummaryArray.length / columns);

    console.log('Code Section Summary:');
    for (let i = 0; i < rows; i++) {
      let row = '';
      for (let j = 0; j < columns; j++) {
        const index = i + j * rows;
        if (index < sortedSummaryArray.length) {
          const [codeSection, count] = sortedSummaryArray[index];
          const column = `${codeSection}: ${count}`.padEnd(20, ' '); // Adjust padding as needed
          row += column;
        }
      }
      console.log(row);
    }
    return sortedSummary;
  } catch (error) {
    console.error('Error processing cases:', error);
    throw error; // Rethrow the error to handle it further up the call stack
  }
};

module.exports = summarizeCodeSections;
