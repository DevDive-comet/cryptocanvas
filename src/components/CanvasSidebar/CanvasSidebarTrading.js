import React from 'react'
import { Divider, Modal } from 'antd'
import CurrentOwner from './CurrentOwner'
import MarketStatus from './MarketStatus'
import withWeb3 from '../../hoc/withWeb3'
import { updateTransactions } from '../../helpers/localStorage'
import withEvents from '../../hoc/withEvents'

class CanvasSidebarTrading extends React.PureComponent {
  constructor () {
    super()
    this.state = {
      currentBuyOffer: {},
      currentSellOffer: {},
    }
  }

  componentDidMount () {
    this.getCurrentBuyOffer()
    this.getCurrentSellOffer()
    this.props.getBlockNumber().then(this.watchForChanges)
  }

  getCurrentBuyOffer = () => {
    this.props.Contract.getCurrentBuyOffer(this.props.canvasId)
      .then(currentBuyOffer => {
        console.log(currentBuyOffer)
        return this.setState({ currentBuyOffer })
      })
  }

  getCurrentSellOffer = () => {
    this.props.Contract.getCurrentSellOffer(this.props.canvasId)
      .then(currentSellOffer => {
        console.log(currentSellOffer)
        return this.setState({ currentSellOffer })
      })
  }

  watchForChanges = (blockNumber) => {
    const buyOfferMadeEvent = this.props.Contract.BuyOfferMadeEvent({}, { fromBlock: blockNumber, toBlock: 'latest' })
    const buyOfferCancelledEvent = this.props.Contract.BuyOfferCancelledEvent({}, { fromBlock: blockNumber, toBlock: 'latest' })
    const sellOfferMadeEvent = this.props.Contract.SellOfferMadeEvent({}, { fromBlock: blockNumber, toBlock: 'latest' })
    const sellOfferCancelledEvent = this.props.Contract.SellOfferCancelledEvent({}, { fromBlock: blockNumber, toBlock: 'latest' })
    const canvasSoldEvent = this.props.Contract.CanvasSoldEvent({}, { fromBlock: blockNumber, toBlock: 'latest' })

    buyOfferMadeEvent.watch(this.getCurrentBuyOffer)
    buyOfferCancelledEvent.watch(this.getCurrentBuyOffer)
    sellOfferMadeEvent.watch(this.getCurrentSellOffer)
    sellOfferCancelledEvent.watch(this.getCurrentSellOffer)
    // todo - fix canvas sold event handling
    // canvasSoldEvent.watch(() => { return window.location.reload()})

    this.props.events.push(
      buyOfferMadeEvent,
      buyOfferCancelledEvent,
      sellOfferMadeEvent,
      sellOfferCancelledEvent,
      canvasSoldEvent
      )
  }

  submitSellOffer = (offerInEth) => {
    const offerInWei = this.props.web3.toWei(offerInEth, 'ether')
    console.log(`[USER] New sell offer: ${offerInWei} WEI (${offerInEth} ETH)`)
    this.props.Contract.offerForSale(this.props.canvasId, offerInWei)
      .then(transaction => {
        updateTransactions(transaction)
        Modal.success({
          title: 'Offer for Sale Transaction sent',
          content: 'It will be visible for others in a few minutes, after the blockchain updates.',
        })

      })
  }

  submitSellOfferToAddress = (offerInEth, receiverAddress) => {
    const offerInWei = this.props.web3.toWei(offerInEth, 'ether')
    console.log(`[USER] New sell offer: ${offerInWei} WEI (${offerInEth} ETH)`)
    this.props.Contract.offerForSaleToAddress(this.props.canvasId, offerInWei, receiverAddress)
      .then(transaction => {
        updateTransactions(transaction)
        Modal.success({
          title: 'Offer for Sale to Address Transaction sent',
          content: 'It will be visible for others in a few minutes, after the blockchain updates.',
        })

      })
  }

  cancelSellOffer = () => {
    this.props.Contract.cancelSellOffer(this.props.canvasId)
      .then(transaction => {
        updateTransactions(transaction)
        Modal.success({
          title: 'Remove Sell Offer Transaction sent',
          content: 'It will be visible for others in a few minutes, after the blockchain updates.',
        })

      })
  }

  submitBuyOffer = (offerInEth) => {
    const offerInWei = this.props.web3.toWei(offerInEth, 'ether')
    console.log(`[USER] New buy offer: ${offerInWei} WEI (${offerInEth} ETH)`)
    this.props.Contract.makeBuyOffer(this.props.canvasId, offerInWei)
      .then(transaction => {
        updateTransactions(transaction)
        Modal.success({
          title: 'Buy Offer Transaction sent',
          content: 'It will be visible for others in a few minutes, after the blockchain updates.',
        })

      })
  }

  cancelBuyOffer = () => {
    this.props.Contract.cancelBuyOffer(this.props.canvasId)
      .then(transaction => {
        updateTransactions(transaction)
        Modal.success({
          title: 'Cancel Buy Offer Transaction sent',
          content: 'It will be visible for others in a few minutes, after the blockchain updates.',
        })

      })
  }

  acceptBuyOffer = (priceInEth) => {
    // const priceInWei = this.props.web3.toWei(priceInEth, 'ether')
    const priceInWei = this.props.web3.toWei(0, 'ether')
    this.props.Contract.acceptBuyOffer(this.props.canvasId, priceInWei)
      .then(transaction => {
        updateTransactions(transaction)
        Modal.success({
          title: 'Accept Buy Offer Transaction sent',
          content: 'It will be visible for others in a few minutes, after the blockchain updates.',
        })

      })
  }

  acceptSellOffer = (priceInEth) => {
    const priceInWei = this.props.web3.toWei(priceInEth, 'ether')
    this.props.Contract.acceptSellOffer(this.props.canvasId, priceInWei)
      .then(transaction => {
        updateTransactions(transaction)
        Modal.success({
          title: 'Buy Canvas Transaction sent',
          content: 'It will be visible for others in a few minutes, after the blockchain updates.',
        })

      })
  }

  render () {
    return (
      <div className="CanvasSidebar">
        <h2 className="CanvasSidebar__title">Canvas #{this.props.canvasId}</h2>
        <h3 className="CanvasSidebar__status">Completed</h3>

        <Divider />

        <CurrentOwner
          canvasOwner={this.props.canvasOwner}
          isUserCanvasOwner={this.props.account === this.props.canvasOwner}
        />

        <Divider />

        <MarketStatus
          userAddress={this.props.account}
          isUserCanvasOwner={this.props.account === this.props.canvasOwner}
          currentBuyOffer={this.state.currentBuyOffer}
          currentSellOffer={this.state.currentSellOffer}
          submitBuyOffer={this.submitBuyOffer}
          submitSellOffer={this.submitSellOffer}
          submitSellOfferToAddress={this.submitSellOfferToAddress}
          cancelBuyOffer={this.cancelBuyOffer}
          cancelSellOffer={this.cancelSellOffer}
          acceptBuyOffer={this.acceptBuyOffer}
          acceptSellOffer={this.acceptSellOffer}
        />

      </div>
    )
  }
}

CanvasSidebarTrading.propTypes = {}
CanvasSidebarTrading.defaultProps = {}

export default withEvents(withWeb3(CanvasSidebarTrading))
