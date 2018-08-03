import React, { Component } from 'react';
import Spinner from 'react-spinkit';
import * as openpgp from 'openpgp';
import classnames from 'classnames';
import ReactTooltip from 'react-tooltip';
import GlobalLogger from '../global/GlobalLogger';
import { isValidIPFSHash } from '../global/utilities';

const STAGE_IPFS_HASH_INPUT = 0;
const STAGE_PRIVATE_KEY_INPUT = 1;
const STAGE_DOWNLOAD = 2;
const STAGE_DECRYPT = 3;

const TEST_PRIVATE_KEY = `-----BEGIN PGP PRIVATE KEY BLOCK-----

lKIEW1rS/RMFK4EEAAoCAwTwGRBkRVjKdY2fUuAoI0B+b6CRiF15iGQ3+mTMiZS4
KhZ8gR3WLkIgq5ecfAhGYZPzfeolOh6RRXyfTwhpQ7GK/gcDAo2BqhUkxkiX5XC4
HuCBuWo1Q09Cllc5Z2gfAfgA0uDjSEzdMUjo8Ic1+TRS/816up6k9PXmJOnGeAPN
6DsbOF8xCZEYBH1iRmIdbkRs2H60MlJhdGUgVGVzdCAoRm9yIGRlbW8gcHVycG9z
ZXMpIDx0ZXN0QHJhdGUzLm5ldHdvcms+iJAEExMIADgWIQSitSPGBRiFsQ8cG4fU
lkZfyqFZWQUCW1rS/QIbAwULCQgHAgYVCgkICwIEFgIDAQIeAQIXgAAKCRDUlkZf
yqFZWQA2AP4jgBIK9MeWdVyYHqAEafyfrZV4EGnkA1FcVi+zlTnEOgD/dSxncLYw
l3jlWY4Wuu6Da+/rXvHYST0ha8AZNMnLO2ucpgRbWtL9EgUrgQQACgIDBObvIPYb
gbtBSnI7nrA7E22OD/9GqxC3P7JLH5lnYJhcescfIJ9+cxQ7KSUzctF48amK3w9y
G6aH4cDpAQozdHYDAQgH/gcDAtv65uP79Uod5Za0rfxlog1phDmuIs58PBQ/LIMY
nYPNEv3+352FjSeS76UCuqVYe23jpCmRMErcsV2e4DF78Wu0NFBDsAHFrJELISVI
Z3iIeAQYEwgAIBYhBKK1I8YFGIWxDxwbh9SWRl/KoVlZBQJbWtL9AhsMAAoJENSW
Rl/KoVlZ8Y8BAL5tzFMCP6dG8uUFMWDFoh8hkDGVU+eWSeWXSTM9/2oUAQCl35BM
ERX5vAqSZMhGGmy3Qfo6tZdamsLd1jtfE0b41w==
=nGXB
-----END PGP PRIVATE KEY BLOCK-----`;

class DownloadPanel extends Component {
  stages = {
    [STAGE_IPFS_HASH_INPUT]: {
      render: () => {
        const {
          ipfsHash,
          ipfsHashError,
        } = this.state;

        return (
          <React.Fragment>
            <div className="form-group row">
              <p className="col-sm-12">
                The IPFS Hash should look something like&nbsp;
                <code>
                  QmZEG1mA8eGfiD5RtrWZQ95LFdU5DPhpez7dqxBe7VY8zH
                </code>
                .
              </p>
              <label className="col-2 col-sm-1 col-form-label text-right" htmlFor="dl-doc-ipfs-hash-input">
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
                  id="dl-doc-ipfs-hash-input"
                  placeholder="IPFS Hash"
                  value={ipfsHash}
                  onChange={this.onIpfsHashChange}
                />
                <div className="invalid-feedback">
                  {ipfsHashError}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      },
      nextButton: 'Next',
      next: (e) => {
        const {
          ipfsHash,
        } = this.state;

        e.preventDefault();
        if (!isValidIPFSHash(ipfsHash)) {
          this.setState({ ipfsHashError: 'Invalid IPFS Hash' });
          return;
        }
        this.setState({ stage: STAGE_PRIVATE_KEY_INPUT });
      },
    },
    [STAGE_PRIVATE_KEY_INPUT]: {
      render: () => {
        const {
          privateKey,
          privateKeyError,
          passphrase,
          passPhraseError,
        } = this.state;

        return (
          <React.Fragment>
            <div className="form-group row">
              <p className="col-12">
                (Optional) The private key will be used to decode the uploaded
                file.
                If you used our dummy data, the private key and passphrase have been filled for you.
              </p>
              <div className="col-12">
                <pre
                  className="p-2"
                  style={{ color: '#e83e8c', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {TEST_PRIVATE_KEY}
                </pre>
              </div>
              <label className="col-2 col-sm-1 col-form-label text-right" htmlFor="dl-doc-private-key-input">
                <i className="fas fa-key" style={{ fontSize: '1.5em' }} />
              </label>
              <div className="col-10 col-sm-11 mb-4">
                <textarea
                  className={classnames('form-control', { 'is-invalid': privateKeyError })}
                  id="dl-doc-private-key-input"
                  rows={10}
                  placeholder="Private key"
                  value={privateKey}
                  onChange={this.onPrivateKeyChange}
                />
                <div className="invalid-feedback">
                  {privateKeyError}
                </div>
              </div>
            </div>
            <div className="form-group row">
              <label className="col-2 col-sm-1 col-form-label text-right" htmlFor="dl-doc-passphrase-input">
                <i className="fas fa-unlock-alt" style={{ fontSize: '1.5em' }} />
              </label>
              <div className="col-10 col-sm-11 mb-4">
                <input
                  type="password"
                  className={classnames('form-control', { 'is-invalid': passPhraseError })}
                  id="dl-doc-passphrase-input"
                  placeholder="Passphrase"
                  value={passphrase}
                  onChange={this.onPassphraseChange}
                />
                <div className="invalid-feedback">
                  {passPhraseError}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      },
      prevButton: 'Back',
      nextButton: 'Download',
      prev: (e) => {
        e.preventDefault();
        this.setState({ stage: STAGE_IPFS_HASH_INPUT });
      },
      next: (e) => {
        e.preventDefault();
        this.setState({ stage: STAGE_DOWNLOAD });
        this.download();
      },
    },
    [STAGE_DOWNLOAD]: {
      render: () => (
        <React.Fragment>
          <Spinner className="mx-auto mb-2 text-center" name="three-bounce" color="white" />
          <div className="text-center">
            Downloading
          </div>
        </React.Fragment>
      ),
    },
    [STAGE_DECRYPT]: {
      render: () => (
        <React.Fragment>
          <Spinner className="mx-auto mb-2 text-center" name="chasing-dots" color="white" />
          <div className="text-center">
            Decrypting
          </div>
        </React.Fragment>
      ),
    },
  }

  state = {
    ipfsHash: 'QmZEG1mA8eGfiD5RtrWZQ95LFdU5DPhpez7dqxBe7VY8zH',
    ipfsHashError: null,
    privateKey: TEST_PRIVATE_KEY,
    privateKeyError: null,
    passphrase: 'testing123',
    passPhraseError: null,
    stage: STAGE_IPFS_HASH_INPUT,
  }

  onIpfsHashChange = (e) => {
    const newValue = e.target.value;
    if (newValue.match(/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]*$/) == null) {
      return;
    }
    this.setState({ ipfsHash: newValue, ipfsHashError: null });
  }

  onPrivateKeyChange = (e) => {
    const newValue = e.target.value;
    this.setState({ privateKey: newValue, privateKeyError: null });
  }

  onPassphraseChange = (e) => {
    const newValue = e.target.value;
    this.setState({ passphrase: newValue, passPhraseError: null });
  }

  onSubmit = (e) => {
    const { stage } = this.state;
    e.preventDefault();
    if (this.stages[stage].next) {
      this.stages[stage].next(e);
    }
  }

  reset = () => {
    this.setState({
      ipfsHash: '',
      ipfsHashError: null,
      privateKey: '',
      privateKeyError: null,
      passphrase: '',
      passPhraseError: null,
      stage: STAGE_IPFS_HASH_INPUT,
    });
  }

  download = async () => {
    const {
      ipfsHash,
      privateKey,
      passphrase,
    } = this.state;
    const ipfsUrl = `https://ipfs.infura.io/ipfs/${ipfsHash}`;

    if (privateKey) {
      const r = await fetch(ipfsUrl);
      this.setState({ stage: STAGE_DECRYPT });
      const blob = await r.blob();
      const reader = new FileReader();
      reader.addEventListener('loadend', async () => {
        let privKeyObj;
        try {
          [privKeyObj] = openpgp.key.readArmored(privateKey).keys;
        } catch (error) {
          GlobalLogger.log(error);
          this.setState({
            privateKeyError: 'Error parsing private key',
            stage: STAGE_PRIVATE_KEY_INPUT,
          });
          return;
        }
        if (passphrase) {
          try {
            await privKeyObj.decrypt(passphrase);
          } catch (error) {
            GlobalLogger.log(error);
            this.setState({
              passPhraseError: 'Incorrect passphrase',
              stage: STAGE_PRIVATE_KEY_INPUT,
            });
            return;
          }
        }
        try {
          const options = {
            // parse armored message
            message: openpgp.message.read(
              new Uint8Array(reader.result),
            ),
            // for decryption
            privateKeys: [privKeyObj],
          };
          const decryptedData = await openpgp.decrypt(options);
          const decryptedBlob = new Blob([this.str2ab(decryptedData.data)], { encoding: 'UTF-8' });
          const url = window.URL.createObjectURL(decryptedBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = decryptedData.filename;
          a.click();
          this.reset();
        } catch (error) {
          GlobalLogger.log(error);
          this.setState({
            privateKeyError: 'Error decrypting with private key',
            stage: STAGE_PRIVATE_KEY_INPUT,
          });
        }
      });
      reader.readAsArrayBuffer(blob);
    } else {
      const a = document.createElement('a');
      a.href = ipfsUrl;
      a.click();
      this.reset();
    }
  }

  str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i += 1) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  render() {
    const { stage } = this.state;
    return (
      <React.Fragment>
        <form className="container" onSubmit={this.onSubmit}>
          <p className="h4 mb-4">
            Download
          </p>
          <div className="alert alert-info mt-3 mb-3" role="alert">
            This download feature is for demostration purposes only.
            <br />
            Not intended for downloading large files that are more than 1MB.
          </div>
          <div className="alert alert-danger mt-3 mb-3" role="alert">
            <strong>
              Do NOT place your ethereum private key here.
            </strong>
          </div>

          {this.stages[stage].render()}

          <div className="text-center">
            {this.stages[stage].prevButton && (
              <button
                className="btn btn-primary mr-2"
                type="button"
                onClick={this.stages[stage].next}
              >
                {this.stages[stage].prevButton}
              </button>
            )}

            {this.stages[stage].nextButton && (
              <button
                className="btn btn-primary"
                type="button"
                onClick={this.stages[stage].next}
              >
                {this.stages[stage].nextButton}
              </button>
            )}
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default DownloadPanel;
