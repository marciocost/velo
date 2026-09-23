import { test, expect } from '../support/fixtures'

import { deleteOrderByEmail } from '../support/database/orderRepository'

test.describe('Checkout', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/order')
    await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
  })

  test.describe('validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ app }) => {
      alerts = app.checkout.elements.alerts
    })


    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {

      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })


    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'marcio@teste.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }


      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {

      const customer = {
        name: 'Marcio',
        lastname: 'Costa',
        email: 'marcio@.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }


      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()


      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'marcio@teste.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }


      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'marcio@teste.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }


      // Arrange
      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {

    const mockCreditScore = async (page: any, score: number) => {
      await page.route('**/functions/v1/credit-analysis', async (route: { fulfill: (arg0: { status: number; contentType: string; body: string }) => any }) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ score }),
        })
      })
    }

    const startConfiguration = async (page: any) => {
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora/i }).click()
    }

    const expectCheckoutStatus = async (page: any, headingName: string | RegExp) => {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: headingName })).toBeVisible()
    }

    test('deve criar um pedido com sucesso para pagamento à vista', async ({ app, page }) => {
    })

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento.', async ({ app, page }) => {



      const customer = {
        name: 'Steve',
        lastname: 'Woz',
        email: 'woz@velo.dev',
        document: '09699086017',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByEmail(customer.email)
      await mockCreditScore(page, 710)

      // Arrange
      await startConfiguration(page)

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      //await app.checkout.expectSummaryTotal(customer.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expectCheckoutStatus(page, 'Pedido Aprovado!')

    })

    test('deve colocar o pedido em análise quando o score do CPF for entre 501 e 700 no financiamento', async ({ app, page }) => {

      const customer = {
        name: 'Ada',
        lastname: 'Lovelace',
        email: 'ada.lovelace@velo.dev',
        document: '89616547054',
        phone: '(11) 98888-7777',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByEmail(customer.email)
      await mockCreditScore(page, 600)

      // Arrange
      await startConfiguration(page)

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expectCheckoutStatus(page, 'Pedido em Análise!')


    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento', async ({ app, page }) => {

      const customer = {
        name: 'Alan',
        lastname: 'Turing',
        email: 'alan.turing@velo.dev',
        document: '12345678909',
        phone: '(11) 97777-6666',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByEmail(customer.email)
      await mockCreditScore(page, 500)

      // Arrange
      await startConfiguration(page)

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expectCheckoutStatus(page, 'Crédito Reprovado')

    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ app, page }) => {

      const customer = {
        name: 'Alan',
        lastname: 'Turing',
        email: 'alan.turing@velo.dev',
        document: '12345678909',
        phone: '(11) 97777-6666',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await deleteOrderByEmail(customer.email)
      await mockCreditScore(page, 500)

      // Arrange
      await startConfiguration(page)

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expectCheckoutStatus(page, 'Crédito Reprovado')

    })


    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ app, page }) => {

      const customer = {
        name: 'Grace',
        lastname: 'Hopper',
        email: 'grace.hopper@velo.dev',
        document: '98765432100',
        phone: '(11) 96666-5555',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '10000'
      }

      await deleteOrderByEmail(customer.email)
      await mockCreditScore(page, 500)

      // Arrange
      await startConfiguration(page)

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expectCheckoutStatus(page, /Crédito Reprovado/i)

    })

    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual que 50%', async ({ app, page }) => {

      const customer = {
        name: 'Graca',
        lastname: 'Hopperem',
        email: 'grace.hopperem@velo.dev',
        document: '22785404084',
        phone: '(11) 96666-5555',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '20000'
      }

      await deleteOrderByEmail(customer.email)
      await mockCreditScore(page, 450)

      // Arrange
      await startConfiguration(page)

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expectCheckoutStatus(page, /Pedido Aprovado!/i)

    })

    test('deve aprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada maior que 50%', async ({ app, page }) => {

      const customer = {
        name: 'Praca',
        lastname: 'Hopporem',
        email: 'hopporem@velo.dev',
        document: '73586266057',
        phone: '(11) 96666-5555',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '30000'
      }

      await deleteOrderByEmail(customer.email)
      await mockCreditScore(page, 300)

      // Arrange
      await startConfiguration(page)

      await app.configurator.expectPrice(customer.totalPrice)
      await app.configurator.finishConfigurator()
      await app.checkout.expectLoaded()

      await app.checkout.fillCustomerData(customer)
      await app.checkout.selectStore(customer.store)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.fillDownPayment(customer.downPayment)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expectCheckoutStatus(page, /Pedido Aprovado!/i)

    })

  })

})

