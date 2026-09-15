import { test, expect } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import type { OrderDetails } from '../support/actions/orderLoockupActions'
import { insertOrder, deleteOrderByNumber } from '../support/database/orderRepository'
import crypto from 'crypto'

test.describe('Consulta de Pedido', () => {

  test.beforeEach(async ({ app }) => {
    await app.orderLoockup.open()
  })

  //VLO-JEYZAY


  test('deve consultar um pedido aprovado', async ({ app }) => {

    const order: OrderDetails = {
      number: 'VLO-SE4R01',
      status: 'APROVADO',
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'Marcio Teste',
        email: 'marcio@velo.dev',
      },
      payment: 'À Vista',
    }

    await deleteOrderByNumber(order.number)

    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'glacier-blue',
      wheel_type: 'aero',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '(11) 99999-9999',
      customer_cpf: '780.228.290-05',
      payment_method: 'avista',
      total_price: '40000',
      status: order.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: [],
    })

    await app.orderLoockup.searchOrder(order.number)
    await app.orderLoockup.validateOrderDetails(order)
    await app.orderLoockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido reprovado', async ({ app }) => {

    const order: OrderDetails = {
      number: 'VLO-SE4R02',
      status: 'REPROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Carol Teste',
        email: 'carol@gmail.com',
      },
      payment: 'À Vista',
    }

    await deleteOrderByNumber(order.number)

    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'midnight-black',
      wheel_type: 'sport',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '(11) 99999-9999',
      customer_cpf: '780.228.290-05',
      payment_method: 'avista',
      total_price: '40000',
      status: order.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: [],
    })

    await app.orderLoockup.searchOrder(order.number)
    await app.orderLoockup.validateOrderDetails(order)
    await app.orderLoockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-SE4R03',
      status: 'EM_ANALISE',
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Babi Teste',
        email: 'babi@gmail.com',
      },
      payment: 'À Vista',
    }

    await deleteOrderByNumber(order.number)

    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'lunar-white',
      wheel_type: 'aero',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '(11) 99999-9999',
      customer_cpf: '780.228.290-05',
      payment_method: 'avista',
      total_price: '40000',
      status: order.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: [],
    })

    await app.orderLoockup.searchOrder(order.number)
    await app.orderLoockup.validateOrderDetails(order)
    await app.orderLoockup.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()
    await app.orderLoockup.searchOrder(order)
    await app.orderLoockup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'XYZ-999-INVALIDO'
    await app.orderLoockup.searchOrder(orderCode)
    await app.orderLoockup.validateOrderNotFound()
  })

  test('deve manter o botão de busca desabilitado com campo vazio ou apenas espaços', async ({ app, page }) => {
    const button = app.orderLoockup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLoockup.elements.orderInput.fill('     ')
    await expect(button).toBeDisabled()
  })
})