import { Page } from "playwright";

export async function mockCreditAnalysis(page: Page, score: number) {
    await page.route('**/functions/v1/credit-analysis', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                status: 'Done',
                score,
            }),
        })
    })
}