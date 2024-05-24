const fs = require('fs');
const puppeteer = require('puppeteer');
const { typeDelay, logFile } = require('../utils/index');

const landingPageLink = "https://eapps.courts.state.va.us/ocis/landing/false";
const responseData = "https://eapps.courts.state.va.us/ocis-rest/api/public/search";
const mainList = [];
let totalCases = 0;
let courtCount = 0;
let courtFinishedCount = 0;
let uiUpdate = '';

/**
 * Initiates a rotating indicator in the console to visually represent the process activity.
 * @returns {Function} A function that, when called, will stop the rotating indicator.
 */
const startRotatingIndicator = () => {
    let isRunning = true;
    let direction = true;
    const interval = setInterval(() => {
        process.stdout.write(`\r<<<<<<<< ${direction ? '/' : '\\'} ${uiUpdate} Total Cases: ${totalCases} Courts Left ${courtCount - courtFinishedCount} ${!direction ? '/' : '\\'} >>>>>>>`);
        direction = !direction;
    }, 100)

    return () => {
        clearInterval(interval);
        isRunning = false;
        process.stdout.write('\n');
    }
}

/**
 * Splits an array into chunks of a specified size.
 * @param {Array} array - The array to be split.
 * @param {number} chunkCount - The number of chunks to split the array into.
 * @returns {Promise<Array<Array>>} A promise that resolves with the array of chunks.
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
 * Performs the scraping operation for a given court on a specific date.
 * @param {puppeteer.Browser} browser - The Puppeteer browser instance.
 * @param {string} court - The court for which data is being scraped.
 * @param {string} userDate - The date for which data is being scraped.
 * @returns {Promise<void>} A promise that resolves when the scraping for the given court and date is complete.
 */
const scraper = async (browser, court, userDate) => {
    try {
        const typeSpeed = await typeDelay();
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        page.setDefaultTimeout(0);
        const waiting = async (timeToWait) => await page.waitForTimeout(timeToWait);
        page.setRequestInterception(true);
        page.on('request', request => request.resourceType() === 'image' || request.resourceType() === 'stylesheet' ? request.abort() : request.continue());

        await page.setViewport({ width: 540, height: 600 });

        await page.goto(landingPageLink, { timeout: 0, waitUntil: "networkidle0" });

        page.on('response', async (response) => {
            if (response.url() == responseData) {
                const jsonResponse = await response.json();
                const data = jsonResponse.context.entity.payload.searchResults;
                const noOfRecords = jsonResponse.context.entity.payload.noOfRecords;
                totalCases += noOfRecords;
                uiUpdate = `Found ${noOfRecords} in ${court}`;
                if (noOfRecords != 0) mainList.push(...data);
            }
        })

        await page.waitForSelector(`#acceptTerms`, { timeout: 300000 });
        await page.$eval("#acceptTerms", (el) => el.click());

        await waiting(5000);

        await page.waitForSelector(`#searchByLabelValue`, { timeout: 300000 });
        await page.$eval("#searchByLabelValue", (el) => el.click());
        await waiting(500);
        await page.waitForSelector(`#courtLevelDivLabel2`, { timeout: 300000 });
        await page.$eval("#courtLevelDivLabel2", (el) => el.click());
        await waiting(500);
        await page.waitForSelector(`#applySelectCourtLevel`, { timeout: 300000 });
        await page.$eval("#applySelectCourtLevel", (el) => el.click());
        await waiting(500);

        await page.waitForSelector(`#courtSelectMobileLabel`, { timeout: 300000 });
        await page.$eval("#courtSelectMobileLabel", (el) => el.click());

        await page.waitForSelector(`#searchCourtsMobile`, { timeout: 300000 });
        await page.focus("#searchCourtsMobile");
        await page.keyboard.type(court, { delay: typeSpeed });
        await waiting(200);
        await page.keyboard.press("Enter");

        const courtsSelect = await page.$$("#main > app-selection > div > div.container-fluid > div:nth-child(3) > span");
        for (let i = 0; i < courtsSelect.length; i++) {
            await page.$eval(`#courtName${i}`, (el) => el.click());
        }
        await page.waitForSelector(`#applyButton`, { timeout: 300000 });
        await page.$eval(`#applyButton`, (el) => el.click());

        await page.waitForSelector(`#datepickerele`, { timeout: 300000 });
        await page.focus("#datepickerele");
        await waiting(100);
        await page.keyboard.type(userDate, { delay: typeSpeed });
        await waiting(500);
        await page.keyboard.press("Enter");
        await page.$eval("#startSearchMobile", (el) => el.click());
        await waiting(4000);

        let bodyCheck;
        bodyCheck = await page.$eval("body", (el) => el.textContent);
        if (bodyCheck.includes("Acknowledge")) {
            await page.waitForSelector(`#acknowledgeDisclaimers`, { timeout: 300000 });
            await page.$eval("#acknowledgeDisclaimers", (el) => el.click());
            await waiting(5000);
        }

        const dataCheck = bodyCheck.includes("No Search Results found") || bodyCheck.includes("undergoing maintenance or updates") || bodyCheck.includes("error") ? true : false;
        if (dataCheck) {
            await page.close();
            return;
        }

        const loadMore = async () => {
            let bodyContent = await page.$eval("body", (el) => el.textContent);
            if (bodyContent.includes('Extend Session')) {
                await page.$eval("#extendBtn1", (el) => el.click());
            }
            if (bodyContent.includes('Load More Results')) {
                await page.$eval("#loadMore", (el) => el.click());
                await waiting(2500);
                await loadMore();
            } else {
                await page.close();
                courtFinishedCount++;
                return;
            }
        }
        await loadMore();
    } catch (error) {
        await logFile("ERROR", error);
    }
}

/**
 * The main function to start the scraping process.
 * @param {string} userDate - The date to be used in the scraping process.
 * @returns {Promise<Array>} A promise that resolves with the list of scraped data.
 */
const scraperMain = async (userDate) => {
    const stopIndicator = startRotatingIndicator();
    const courtPickersFile = fs.readFileSync('./staticList/courtPicker.json', 'utf8');
    const courtPicker = JSON.parse(courtPickersFile);
    courtCount = courtPicker.length;
    const browser = await puppeteer.launch({ headless: "new", timeout: 300000 });
    const splitArrays = await splitArrayIntoChunks(courtPicker, 20);
    await Promise.all(splitArrays.map(async (arr) => {
        for (let i = 0; i < arr.length; i++) {
            await scraper(browser, arr[i].court, userDate);
        }
    }))
    await browser.close();
    stopIndicator();
    return mainList;
}

module.exports = scraperMain;
