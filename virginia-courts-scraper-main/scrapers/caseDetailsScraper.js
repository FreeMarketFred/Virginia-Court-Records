const fs = require('fs');
const puppeteer = require('puppeteer');
const { typeDelay, logFile } = require('../utils/index');
const detailsList = [];
let caseDetailsOut = '';
let totalCases = 0;
let remainingCases = 0;
let casesSearched = 0;

/**
 * Initiates a rotating indicator in the console to visually represent the process activity.
 * @returns {Function} A function that, when called, will stop the rotating indicator.
 */
const startRotatingIndicator = () => {
    let isRunning = true;
    let direction = true;
    const interval = setInterval(() => {
        process.stdout.write('\r\x1b[K');
        process.stdout.write(`<<<<<<<< ${direction ? '/' : '\\'} Searching for: ${caseDetailsOut} Cases Remaining: ${remainingCases} ${!direction ? '/' : '\\'} >>>>>>>`);
        direction = !direction;
    }, 100)

    return () => {
        clearInterval(interval);
        isRunning = false;
        process.stdout.write('\r\x1b[K');
        process.stdout.write('\n');
    }
}

/**
 * Scrapes detailed information for a list of cases.
 * @param {Array} mainList - The list of main cases to scrape details for.
 * @returns {Promise<Array>} - The list of detailed case information.
 */
const detailScraper = async (mainList) => {
    totalCases = mainList.length;
    const stopIndicator = startRotatingIndicator();
    const lookupCodeDetails = fs.readFileSync('./staticList/getLookupCodeDetails.json', 'utf8');
    const jsonCodeDetails = JSON.parse(lookupCodeDetails);
    const browser = await puppeteer.launch({ headless: "new" });
    console.log("Total Cases: ", mainList.length);
    const splitArrays = await splitArrayIntoChunks(mainList, 8);

    await Promise.all(splitArrays.map(async (arr) => {
        for (let i = 0; i < arr.length; i++) {
            const courtDetail = jsonCodeDetails.filter(codeDetail => codeDetail.fipsCode4 === arr[i].qualifiedFips);
            const caseNumber = arr[i].formattedCaseNumber;
            caseDetailsOut = `${arr[i].name}, ${courtDetail[0].courtName}, ${caseNumber}`;
            casesSearched++;
            remainingCases = totalCases - casesSearched;
            await scraper(browser, courtDetail[0].courtName, caseNumber, arr[i]);
        }
    }))
    await browser.close();
    stopIndicator();
    return detailsList;
}

/**
 * Splits an array into smaller chunks.
 * @param {Array} array - The array to be split.
 * @param {number} chunkCount - The number of chunks to split the array into.
 * @returns {Promise<Array<Array>>} - A promise that resolves with the array of chunks.
 */
const splitArrayIntoChunks = async (array, chunkCount) => {
    const chunks = [];
    const chunkSize = Math.ceil(array.length / chunkCount);
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Scrapes the details for a single case.
 * @param {puppeteer.Browser} browser - The Puppeteer browser instance.
 * @param {string} court - The court name.
 * @param {string} caseNumber - The case number to search for.
 * @param {Object} originalRecord - The original record associated with the case.
 * @returns {Promise<void>} - A promise that resolves when the scraping is complete.
 */
const scraper = async (browser, court, caseNumber, originalRecord) => {
    try {
        const typeSpeed = await typeDelay();
        const courtName = court.includes('/') ? court.replace('/', '_') : court;
    
        const link = "https://eapps.courts.state.va.us/ocis/landing/false";
        
        const page = await browser.newPage();
        
        page.setRequestInterception(true);
        page.on('request', request => request.resourceType() === 'image' || request.resourceType() === 'stylesheet' ? request.abort() : request.continue());
        
        await page.setViewport({width: 540, height: 600});
        
        await page.goto(link, {timeout: 0, waitUntil: "networkidle0"});
        
        page.on('response', async (response) => {
            if(response.url() == "https://eapps.courts.state.va.us/ocis-rest/api/public/getCaseDetails"){
                const json_res = await response.json();
                const data = json_res.context.entity.payload;
                if(data != null){
                    originalRecord.courtName = courtName.toUpperCase();
                    detailsList.push({summary: originalRecord, details: data});
                }
            }
        })
        
        const waiting = async (timeToWait) => await page.waitForTimeout(timeToWait);
        
        await page.$eval("#acceptTerms", (el) => el.click());
        
        await page.waitForSelector(`#searchByLabelValue`, { timeout: 300000 });
        await page.$eval("#searchByLabelValue", (el) => el.click());
        await waiting(250);
        await page.waitForSelector(`#courtLevelDivLabel1`, { timeout: 300000 });
        await page.$eval("#courtLevelDivLabel1", (el) => el.click());
        await waiting(250);
        await page.waitForSelector(`#applySelectCourtLevel`, { timeout: 300000 });
        await page.$eval("#applySelectCourtLevel", (el) => el.click());
        await waiting(250);
    
        await page.$eval("#courtSelectMobileLabel", (el) => el.click());
    
        await page.waitForSelector(`#searchCourtsMobile`, { timeout: 300000 });
        await page.focus("#searchCourtsMobile");
        await page.keyboard.type(court, { delay: typeSpeed });
        await waiting(200);
        await page.keyboard.press("Enter");
    
        const courts_select = await page.$$("#main > app-selection > div > div.container-fluid > div:nth-child(3) > span");
        for (let i = 0; i < courts_select.length; i++) {
            await page.$eval(`#courtName${i}`, (el) => el.click());
        }
        await page.$eval(`#applyButton`, (el) => el.click());
    
        await page.focus("#caseNumberSearchFeildMobile");
        await waiting(100);
        await page.keyboard.type(caseNumber, { delay: typeSpeed });
        await waiting(250);
        await page.$eval("#startSearchMobile", (el) => el.click());
        await waiting(2000);
    
        let body_check;
        body_check = await page.$eval("body", (el) => el.textContent);
        if (body_check.includes("Acknowledge")) {
            await page.$eval("#acknowledgeDisclaimers", (el) => el.click());
            await waiting(4000);
        }
        const data_check = body_check.includes("No Search Results found") || body_check.includes("undergoing maintenance or updates") ? true : false;
        if (data_check) {
            await waiting(4000);
            await page.close();
        }else{
            await waiting(250);
            await page.close();
        }
    } catch (error) {
        await logFile("ERROR", error);
    }
}

module.exports = detailScraper;
