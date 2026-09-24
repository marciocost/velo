import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  const optionalCheckbox = (name: string | RegExp) =>
    page.getByRole('checkbox', { name })

  return {
    async open() {
      await page.goto('/')

      await page
        .getByRole('link', { name: /Configure Agora/i })
        .click()
    },

    async selectColor(name: string) {
      await page.getByRole('button', { name }).click()
    },

    async selectWheels(name: string | RegExp) {
      await page.getByRole('button', { name }).click()
    },

    async expectPrice(price: string) {
      await expect(
        page.getByText(price, { exact: true }).first()
      ).toBeVisible()
    },

    async expectCarImageSrc(src: string | RegExp) {
      const carImage = page.locator('img[alt^="Velô Sprint"]')
      await expect(carImage).toHaveAttribute('src', src)
    },

    async checkOptional(name: string | RegExp) {
      await expect(optionalCheckbox(name)).toBeVisible()
      await optionalCheckbox(name).check()
    },

    async uncheckOptional(name: string | RegExp) {
      await expect(optionalCheckbox(name)).toBeVisible()
      await optionalCheckbox(name).uncheck()
    },

    async finishConfigurator() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
    },
  }
}