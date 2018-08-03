import React, { Component } from 'react';
import '@fortawesome/fontawesome-free/css/all.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/style.css';
import promisifySmartContractFunc from 'promisify-smart-contract-func';
import GlobalLogger from './global/GlobalLogger';

import { docHistoryAddr, ipfsDocAddr } from './constants/ContractAddresses';
import DocHistoryAbi from './constants/DocHistoryContract';
import IpfsDocAbi from './constants/IpfsDocContract';

import {
  InstallMetamask,
  NewDocPanel,
  Tabs,
  SubmissionsPanel,
  ReceiptsPanel,
  DownloadPanel,
  FaqPanel,
} from './components';

import {
  Web3Context,
  EventsContext,
  DocTypesContext,
} from './context';

class App extends Component {
  state = {
    web3js: {
      availability: false,
      address: null,
    },
    events: {
      pending: {},
      addToPending: (address) => {
        const { events } = this.state;
        const { pending } = events;
        this.setState({
          events: {
            ...events,
            pending: { ...pending, [address]: true },
          },
        });
      },
      removeFromPending: (address) => {
        const { events } = this.state;
        const { pending } = events;
        this.setState({
          events: {
            ...events,
            pending: { ...pending, [address]: false },
          },
        });
      },
      submitted: {
        items: [],
        fromBlock: null,
        toBlock: null,
      },
      received: {
        items: [],
        fromBlock: null,
        toBlock: null,
      },
    },
    docTypes: [],
  }

  componentDidMount() {
    this.setupWeb3Context();
  }

  setupWeb3Context() {
    const { web3js } = this.state;

    if (typeof web3 !== 'undefined') {
      window.web3 = new Web3(window.web3.currentProvider); /* global Web3 */

      if (window.web3.currentProvider.isMetaMask === true) {
        window.web3.eth.getAccounts((error, accounts) => {
          let userAddress = null;

          if (accounts.length > 0) {
            GlobalLogger.log('Has active accounts');
            userAddress = accounts[0]; // eslint-disable-line prefer-destructuring
            this.initContracts();
          }

          this.setState({
            web3js: {
              ...web3js,
              availability: true,
              address: userAddress,
            },
          }, async () => {
            if (userAddress == null) {
              return;
            }
            await this.getDocs(
              this.contracts.docHistory, userAddress,
              'submitEvents', 'submitted',
              { owner: userAddress },
            );
            await this.getDocs(
              this.contracts.docHistory, userAddress,
              'receiveEvents', 'received',
              { recipient: userAddress },
            );
            this.startListeningForDocAddedEvent(
              this.contracts.docHistory, userAddress,
              'submitEvents', 'submitted',
              { owner: userAddress },
            );
            this.startListeningForDocAddedEvent(
              this.contracts.docHistory, userAddress,
              'receiveEvents', 'received',
              { recipient: userAddress },
            );
          });
        });
      } else {
        // Another web3 provider
        GlobalLogger.log('Need another web3 provider');
        this.setState({
          web3js: {
            ...web3js,
            availability: false,
          },
        });
      }
    } else {
      // No web 3 provider
      GlobalLogger.log('No web3 provider');
      this.setState({
        web3js: {
          ...web3js,
          availability: false,
        },
      });
    }
  }

  async getDocTypes(docHistory) {
    try {
      const docTypesLength = await promisifySmartContractFunc(docHistory.docTypesLength.call);
      const docTypes = await Promise.all(
        [...Array(docTypesLength.toNumber()).keys()].map(
          idx => promisifySmartContractFunc(docHistory.docTypes.call, idx),
        ),
      );
      this.setState({ docTypes });
    } catch (error) {
      GlobalLogger.error(error);
    }
  }

  getTransactionDetails(results) {
    return Promise.all(
      results.map(async (result) => {
        const block = await promisifySmartContractFunc(
          window.web3.eth.getBlock, result.blockNumber,
        );
        return { ...result, timestamp: block.timestamp };
      }),
    );
  }

  async getDocs(contract, userAddress, localStorageKey, eventType, filter) {
    if (!userAddress) return;

    const storage = this.getFromLocalStorage(localStorageKey);

    if (!storage[userAddress]) {
      const toBlock = await promisifySmartContractFunc(window.web3.eth.getBlockNumber);
      const fromBlock = 0;
      const event = contract.DocAdded(
        filter,
        { fromBlock, toBlock },
      );
      const results = await promisifySmartContractFunc(event.get.bind(event));
      const data = {
        items: (await this.getTransactionDetails(results)),
        fromBlock,
        toBlock,
      };
      this.updateStateAndStorage(localStorageKey, storage, userAddress, eventType, data);
    } else {
      const toBlock = await promisifySmartContractFunc(window.web3.eth.getBlockNumber);
      const fromBlock = storage[userAddress].toBlock + 1;

      if (fromBlock > toBlock) {
        this.setState(prevState => ({
          ...prevState,
          events: {
            ...prevState.events,
            [eventType]: { ...prevState.events[eventType], ...storage[userAddress] },
          },
        }));
        return;
      }
      const event = contract.DocAdded(
        filter,
        { fromBlock, toBlock },
      );
      const results = await promisifySmartContractFunc(event.get.bind(event));
      const data = {
        items: storage[userAddress].items.concat(
          await this.getTransactionDetails(results),
        ),
        fromBlock: storage[userAddress].fromBlock,
        toBlock,
      };
      this.updateStateAndStorage(localStorageKey, storage, userAddress, eventType, data);
    }
  }

  getFromLocalStorage(item) {
    try {
      const jsonStr = localStorage.getItem(item);
      return (jsonStr && JSON.parse(jsonStr)) || {};
    } catch (error) {
      GlobalLogger.error(error);
      return {};
    }
  }

  updateStateAndStorage = (item, itemData, userAddress, eventType, userData) => {
    this.setState(prevState => ({
      ...prevState,
      events: { ...prevState.events, [eventType]: userData },
    }));
    itemData[userAddress] = userData; // eslint-disable-line no-param-reassign
    localStorage.setItem(item, JSON.stringify(itemData));
  }

  async startListeningForDocAddedEvent(contract, userAddress, localStorageKey, eventType, filter) {
    if (!userAddress) return;

    const event = contract.DocAdded(filter);
    event.watch(async (error, result) => {
      GlobalLogger.log(`${eventType} event listened`);
      GlobalLogger.log(result);
      if (error) GlobalLogger.error(error);
      // eslint-disable-next-line react/destructuring-assignment
      this.state.events.removeFromPending(result.transactionHash);
      const storage = this.getFromLocalStorage(localStorageKey);
      if (storage[userAddress] && result.blockNumber <= storage[userAddress].toBlock) {
        return;
      }
      const data = {
        items: ((storage[userAddress] || {}).items || []).concat(
          await this.getTransactionDetails([result]),
        ),
        fromBlock: (storage[userAddress] || {}).fromBlock == null
          ? result.blockNumber
          : storage[userAddress].fromBlock,
        toBlock: result.blockNumber,
      };
      this.updateStateAndStorage(localStorageKey, storage, userAddress, eventType, data);
    });
  }

  initContracts() {
    const docHistory = window.web3.eth.contract(DocHistoryAbi).at(docHistoryAddr);
    const ipfsDoc = window.web3.eth.contract(IpfsDocAbi).at(ipfsDocAddr);
    this.contracts = { docHistory, ipfsDoc };

    this.getDocTypes(docHistory);
  }

  render() {
    const {
      web3js,
      events,
      docTypes,
    } = this.state;

    return (
      <Web3Context.Provider value={{ ...web3js, contracts: this.contracts }}>
        <EventsContext.Provider value={events}>
          <DocTypesContext.Provider value={docTypes}>
            <div className="App">
              <div
                style={{ minHeight: '100vh', backgroundColor: '#141d26' }}
                className="d-flex flex-column container-fluid"
              >
                {
                  web3js.availability
                    ? (
                      <Tabs>
                        <NewDocPanel
                          tabName="New Submission"
                          tabIcon="fas fa-file-signature"
                          path="new"
                        />
                        <SubmissionsPanel
                          tabName="Submissions"
                          tabIcon="fa fa-file-alt"
                          path="submissions"
                        />
                        <ReceiptsPanel
                          tabName="Received Documents"
                          tabIcon="fas fa-file-invoice"
                          path="received"
                        />
                        <DownloadPanel
                          tabName="Download Document"
                          tabIcon="fa fa-download"
                          path="download"
                        />
                        <FaqPanel
                          tabName="F.A.Q."
                          tabIcon="fa fa-question-circle"
                          path="faq"
                        />
                      </Tabs>
                    )
                    : <InstallMetamask />
                }
              </div>
            </div>
          </DocTypesContext.Provider>
        </EventsContext.Provider>
      </Web3Context.Provider>
    );
  }
}

export default App;
