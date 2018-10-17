import React from 'react';
import PropTypes from 'prop-types';
import bs58 from 'bs58';
import ReactTooltip from 'react-tooltip';

const linkStyle = {
  color: 'inherit',
};

const EventsList = ({
  fromBlock, toBlock, eventItems, docTypes,
}) => {
  if (eventItems.length === 0) {
    return (
      <div className="alert alert-dark mt-3 mb-3" role="alert">
        No events found from blocks&nbsp;
        {fromBlock}
        &nbsp;to&nbsp;
        {toBlock}
      </div>
    );
  }

  return (
    <div>
      <div className="alert alert-dark mt-3 mb-3" role="alert">
        Showing events from blocks&nbsp;
        {fromBlock}
        &nbsp;to&nbsp;
        {toBlock}
      </div>
      <div>
        {
          eventItems.map((item) => {
            const {
              transactionHash,
              args,
              timestamp,
            } = item;
            const {
              docHash,
              docTypeId,
              owner,
              recipient,
            } = args;
            const transactionDate = new Date(timestamp * 1000);

            return (
              <div className="card mb-3" key={transactionHash}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <div className="card-title m-3">
                    <h5 className="row">
                      <span className="col-4 col-sm-3 col-md-2">
                        TxHash:
                      </span>
                      <span className="col-8 col-sm-9 col-md-10">
                        <a
                          href={`https://ropsten.etherscan.io/tx/${transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={linkStyle}
                        >
                          {transactionHash}
                        </a>
                      </span>
                    </h5>
                  </div>
                  <div className="card-subtitle m-3">
                    <div className="row">
                      <span className="col-4 col-sm-3 col-md-2">
                        Date:
                      </span>
                      <span className="col-8 col-sm-9 col-md-10">
                        {transactionDate.toLocaleDateString()}
                        ,&nbsp;
                        {transactionDate.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <table className="table">
                    <tbody>
                      <tr>
                        <th scope="row">
                          Document Type
                        </th>
                        <td style={{ wordBreak: 'break-word' }}>
                          {docTypes[parseInt(docTypeId, 10)]}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">
                          IPFS Hash&nbsp;
                          <a data-tip data-for="tooltip-hash">
                            <i className="fa fa-info-circle" />
                          </a>
                          <ReactTooltip id="tooltip-hash" type="light" effect="solid">
                            <span>
                              Hash of file when it is uploaded to IPFS
                            </span>
                          </ReactTooltip>
                        </th>

                        <td style={{ wordBreak: 'break-all' }}>
                          {
                            bs58.encode(Buffer.from(docHash.substring(2), 'hex'))
                          }
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">
                          Sender Address
                        </th>
                        <td style={{ wordBreak: 'break-all' }}>
                          <a
                            href={`https://ropsten.etherscan.io/address/${owner}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={linkStyle}
                          >
                            {owner}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">
                          Recipient Address
                        </th>
                        <td style={{ wordBreak: 'break-all' }}>
                          <a
                            href={`https://ropsten.etherscan.io/address/${recipient}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={linkStyle}
                          >
                            {recipient}
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

EventsList.propTypes = {
  fromBlock: PropTypes.number.isRequired,
  toBlock: PropTypes.number.isRequired,
  eventItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  docTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default EventsList;
