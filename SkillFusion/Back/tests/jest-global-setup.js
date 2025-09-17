import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import puppeteer from 'puppeteer';
import { sequelize } from '../src/models/connection.js';
export default async () => {
  await sequelize.authenticate();
};
const appUrl = `http://localhost:${process.env.PORT}`;

describe("Home", () => {
  let browser;
  let page;

  before(async () => {
    browser = await puppeteer.launch({ 
      headless: 'new', // Mode headless moderne
      args: ['--no-sandbox']
    });
    page = await browser.newPage();
  });

  after(async () => {
    await page.close();
    await browser.close();
  });

  it("should display the add list modal when clicking on the add list button", async () => {
    // ACT
    await page.goto(appUrl);
    await page.waitForSelector('#add-list-button');
    await page.click('#add-list-button');

    // ASSERT
    const modal = await page.waitForSelector('#add-list-modal', { visible: true });
    const title = await modal.evaluate(el => el.querySelector('.modal-card-title').textContent);
    
    assert.strictEqual(
      title.includes("Ajouter une liste"), 
      true, 
      "Le titre de la modal doit contenir 'Ajouter une liste'"
    );
  });
});