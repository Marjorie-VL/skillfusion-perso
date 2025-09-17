import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import puppeteer from 'puppeteer';

const appUrl = `http://localhost:${process.env.PORT}`;
test('Test passeur', () => expect(true).toBe(true));


describe("Home", () => {
  let browser;
  let page;

  before(async () => {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox']
    });
    page = await browser.newPage();
  });

  after(async () => {
    await page.close();
    await browser.close();
  });

  it("should display the add list modal when clicking on the add list button", async () => {
    try {
      await page.goto(appUrl);
      await page.setViewport({ width: 1080, height: 1024 });
      
      await page.waitForSelector('#add-list-button');
      await page.click('#add-list-button');

      const modal = await page.waitForSelector('#add-list-modal', { visible: true });
      const title = await modal.evaluate(el => el.querySelector('.modal-card-title').textContent);
      
      assert.strictEqual(
        title.includes("Ajouter une liste"), 
        true
      );
    } catch (error) {
      await browser.close();
      throw error;
    }
  });
});