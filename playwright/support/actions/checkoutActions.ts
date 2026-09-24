import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {

  const terms = page.getByTestId('checkout-terms')

  const alerts = {
    name: page.getByTestId('checkout-error-name'),
    lastname: page.getByTestId('checkout-error-lastname'),
    email: page.getByTestId('checkout-error-email'),
    phone: page.getByTestId('checkout-error-phone'),
    document: page.getByTestId('checkout-error-document'),
    store: page.getByTestId('checkout-error-store'),
    terms: page.getByTestId('checkout-error-terms')
  }

  return {

    elements: {
      terms,
      alerts
    },

    async expectLoaded() {
      await expect(page.getByRole('button', { name: 'Confirmar Pedido' })).toBeVisible()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },
    async fillCustomerData(data: {
      name: string
      lastname: string
      email: string
      phone: string
      document: string
    }) {
      await page.getByTestId('checkout-name').fill(data.name)
      await page.getByTestId('checkout-lastname').fill(data.lastname)
      await page.getByTestId('checkout-email').fill(data.email)
      await page.getByTestId('checkout-phone').fill(data.phone)
      await page.getByTestId('checkout-document').fill(data.document)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async selectPaymentMethod(method: string) {
      await page.getByRole('button', { name: new RegExp(method, 'i') }).click()
    },

    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await page.getByRole('button', { name: 'Confirmar Pedido' }).click()
    },

    async expectResult(status: string) {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: status })).toBeVisible()
    }
  }
}

