import React, { Component } from 'react';
import PropTypes from 'prop-types';
import bs58 from 'bs58';
import classnames from 'classnames';
import promisifySmartContractFunc from 'promisify-smart-contract-func';
import ReactTooltip from 'react-tooltip';
import {
  Web3Context,
  DocTypesContext,
  EventsContext,
  withContext,
} from '../context';
import { isValidIPFSHash, isValidEthAddress } from '../global/utilities';

class NewDocPanel extends Component {
  state = {
    ipfsHash: '',
    ipfsHashError: null,
    recipient: '',
    recipientError: null,
    docType: 0,
    pending: '',
    submissionError: null,
  }

  componentWillReceiveProps(nextProps) {
    const { pending } = this.state;
    const { events } = nextProps;
    if (events.pending[pending] === false) {
      this.reset();
    }
  }

  onIpfsHashChange = (e) => {
    const newValue = e.target.value;
    if (newValue.match(/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]*$/) == null) {
      return;
    }
    this.setState({ ipfsHash: newValue, ipfsHashError: null });
  }

  onRecipientChange = (e) => {
    const newValue = e.target.value;
    if (newValue.match(/^(|0|0x[0-9A-Fa-f]*)$/) == null) {
      return;
    }
    this.setState({ recipient: newValue, recipientError: null });
  }

  onDocTypeChange = (e) => {
    this.setState({ docType: e.target.value });
  }

  onSubmit = (e) => {
    const { events } = this.props;
    const { web3: { contracts: { ipfsDoc }, address } } = this.props;
    e.preventDefault();
    const {
      ipfsHash,
      recipient,
      docType,
    } = this.state;

    let hasError = false;
    if (!isValidIPFSHash(ipfsHash)) {
      this.setState({
        ipfsHashError: 'Invalid IPFS hash',
      });
      hasError = true;
    }
    if (!isValidEthAddress(recipient)) {
      this.setState({
        recipientError: 'Invalid Ethereum address',
      });
      hasError = true;
    }
    if (hasError) return;

    promisifySmartContractFunc(
      ipfsDoc.Submit,
      parseInt(bs58.decode(ipfsHash).toString('hex'), 16),
      docType,
      recipient,
      { from: address },
    ).then((transaction) => {
      this.setState({ pending: transaction });
      events.addToPending(transaction);
    }).catch((error) => {
      // HACK: Because MetaMask messages are too nice to be displayed
      this.setState({
        submissionError: error.toString().split(/Error:\s*/).pop(),
      });
    });
  }

  populateFields = (e) => {
    e.preventDefault();
    const { web3 } = this.props;
    this.setState({
      ipfsHash: 'QmZEG1mA8eGfiD5RtrWZQ95LFdU5DPhpez7dqxBe7VY8zH',
      ipfsHashError: null,
      recipient: web3.address,
      recipientError: null,
      docType: 0,
      pending: '',
      submissionError: null,
    });
  }

  reset = () => {
    this.setState({
      ipfsHash: '',
      ipfsHashError: null,
      recipient: '',
      recipientError: null,
      docType: 0,
      pending: '',
      submissionError: null,
    });
  }

  render() {
    const { events, docTypes } = this.props;
    const {
      ipfsHash,
      ipfsHashError,
      recipient,
      recipientError,
      docType,
      pending,
      submissionError,
    } = this.state;
    const pendingTransaction = events.pending[pending] === true;

    return (
      <form className="container" onSubmit={this.onSubmit}>
        <p className="h4 mb-4">
          New Document Submission
        </p>
        <p>
          This form is used to submit the uploaded IPFS document to the recipient.
        </p>
        <p>
          Click&nbsp;
          <a href="" onClick={this.populateFields}>
            here
          </a>
          &nbsp;to populate the fields with a dummy file.&nbsp;
          <a data-tip data-for="tooltip-populate">
            <i className="fa fa-info-circle" />
          </a>
          <ReactTooltip id="tooltip-populate" type="light" effect="solid">
            <span>
              Encrypted file and decryption key are provided
            </span>
          </ReactTooltip>
        </p>
        <div className="form-group row">
          <label className="col-2 col-sm-1 col-form-label text-right" htmlFor="new-doc-type-input">
            <i className="fas fa-file" style={{ fontSize: '1.5em' }} />
          </label>
          <div className="input-group col-10 col-sm-11 mb-4">
            <div className="input-group-prepend">
              <div className="input-group-text">
                Type
              </div>
            </div>
            <select
              className="custom-select"
              id="new-doc-type-input"
              disabled={pendingTransaction}
              onChange={this.onDocTypeChange}
            >
              {
                docTypes.map((type, idx) => (
                  <option
                    key={type}
                    value={idx}
                    selected={idx === docType}
                  >
                    {type}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        <div className="form-group row">
          <label className="col-2 col-sm-1 col-form-label text-right" htmlFor="new-doc-ipfs-hash-input">
            <i data-tip data-for="tooltip-hash" data-place="top" className="fas fa-hashtag" style={{ fontSize: '1.5em' }} />
          </label>
          <ReactTooltip id="tooltip-hash" type="light" effect="solid">
            <span>
              Hash of file when it is uploaded to IPFS
            </span>
          </ReactTooltip>
          <div className="col-10 col-sm-11 mb-4">
            <input
              type="text"
              className={classnames('form-control', { 'is-invalid': ipfsHashError })}
              id="new-doc-ipfs-hash-input"
              placeholder="IPFS Hash"
              value={ipfsHash}
              disabled={pendingTransaction}
              onChange={this.onIpfsHashChange}
            />
            <div className="invalid-feedback">
              {ipfsHashError}
            </div>
          </div>
        </div>

        <div className="form-group row">
          <label className="col-2 col-sm-1 col-form-label text-right" htmlFor="new-doc-recipient-input">
            <i data-tip data-for="tooltip-recipient" data-place="top" className="fas fa-people-carry" style={{ fontSize: '1.5em' }} />
          </label>
          <ReactTooltip id="tooltip-recipient" type="light" effect="solid">
            <span>
              Ethereum address of file recipient
            </span>
          </ReactTooltip>
          <div className="col-10 col-sm-11 mb-4">
            <input
              type="text"
              className={classnames('form-control', { 'is-invalid': recipientError })}
              id="new-doc-recipient-input"
              placeholder="Recipient Address"
              value={recipient}
              disabled={pendingTransaction}
              onChange={this.onRecipientChange}
            />
            <div className="invalid-feedback">
              {recipientError}
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={pendingTransaction}
        >
          {
            pendingTransaction ? 'Submitting...' : 'Submit'
          }
        </button>
        <p className="text-danger mt-2">
          {submissionError}
        </p>
      </form>
    );
  }
}

NewDocPanel.propTypes = {
  docTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  web3: PropTypes.object.isRequired,
  events: PropTypes.object.isRequired,
};

export default withContext(Web3Context, EventsContext, DocTypesContext)(NewDocPanel);
