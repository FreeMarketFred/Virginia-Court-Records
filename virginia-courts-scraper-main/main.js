const fs = require('fs');
const { userPrompt, setup, rotatingIndicator, dateFormat, userFilter, addCourtName, fileSaver, logFile, summarizeCodeSections } = require('./utils/index');
const { scraperMain, detailScraper } = require('./scrapers/index');

(async() => {
    const userRequestedDate = await userPrompt('Enter the Lookup Date: ');
    const { formattedUserDate, formattedOutputDate } = await dateFormat(userRequestedDate);
    await logFile("RUN", `${formattedUserDate}`);
    const mainList = await scraperMain(formattedUserDate);
    const addCourtNameData = await addCourtName(mainList);
    !fs.existsSync(`./data`)?fs.mkdirSync(`./data/`):'';
    await fileSaver(`../data/${formattedOutputDate}.json`, addCourtNameData);
    const summary = await summarizeCodeSections(mainList);
    const userDecision = await userPrompt('Do you wish to continue with getting case data on specific codes? (yes/no): ');
    if (userDecision.toLowerCase() === 'yes') {
        const setupData = await setup(`\nPlease enter the codes you wish to filter, separated by commas (for example, '18.2-266,18.2-101').\nAlternatively, just press 'Enter' to skip this step and continue.`);
        if (setupData != false) await fileSaver(`./config.json`, { codeSections: setupData });
        await logFile("Search Query Codes", `${setupData}`);
        const configExists = await fs.existsSync('./utils/config.json');
        const filteredData = (configExists) ? await userFilter(mainList) : mainList;
        const details = await detailScraper(filteredData);
        await fileSaver(`../data/${formattedOutputDate}_details.json`, details);
    };
    await logFile("FINISHED", `${formattedUserDate}`);
})();
