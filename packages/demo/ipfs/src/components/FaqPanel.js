import React from 'react';

const questions = [
  {
    title: 'What is this?',
    answer: (
      <React.Fragment>
        <p>
          This is a simple demo for document sharing using Ethereum and&nbsp;
          <a href="https://ipfs.io/" target="blank">
            IPFS
          </a>
          .
        </p>

        <p>
          In this demo you can share any file uploaded on IPFS.
          To help you get started quickly, we have prepared a&nbsp;
          <a href="https://en.wikipedia.org/wiki/Pretty_Good_Privacy#OpenPGP" target="blank">
            OpenPGP
          </a>
          &nbsp;encrypted passport image stored in IPFS for you.
        </p>
      </React.Fragment>
    ),
  },
  {
    title: 'How do I try it out?',
    answer: (
      <React.Fragment>
        <ol>
          <li>
            <h6>
              Make New Submission
            </h6>
            <p>
              Make a&nbsp;
              <a href="#new">
                new file submission
              </a>
              &nbsp;to someone (yourself included) via an Ethereum transaction.
              We have prepared a demo encrypted file and its decryption private
              key for you.
            </p>
          </li>
          <li>
            <h6>
              View the submission details
            </h6>
            <p>
              You may verify the Ethereum transaction in either&nbsp;
              <a href="#submissions">
                Submissions
              </a>
              &nbsp;or&nbsp;
              <a href="#received">
                Received Documents
              </a>
              &nbsp;page.
            </p>
          </li>
          <li>
            <h6>
              Download the file
            </h6>
            <p>
              Once you received a file submission,&nbsp;
              <a href="#download">
                download the file
              </a>
              .
              Take the IPFS hash and place the decryption keys in the field.
              Please do not use any Mainnet or production-use keys.
            </p>
          </li>
        </ol>
      </React.Fragment>
    ),
  },
  {
    title: 'Why is this important?',
    answer: (
      <React.Fragment>
        <p>
          The submission act is public and stored on the smart contract.
          This is a way to share a file to the public in a decentralised way.
        </p>
        <p>
          For information that are sensitive, and only meant for a party,
          either the encrypted file IPFS hash or the encrypted key itself
          (in cases of symmetric encryption) can be shared on-chain.
        </p>

        <p>
          In this demo, we shown a use case where you can submit your KYC
          information on-chain to multiple recipients in a secure manner.
        </p>

        <p>
          This opens up a multitude of use cases such as encryption public key
          management, data verifcation information, KYC verfication by
          third-parties, attestation documents, etc.
        </p>
      </React.Fragment>
    ),
  },
  {
    title: 'When moon?',
    answer: (
      <React.Fragment>
        <p>
          Great question!&nbsp;
          <a href="https://www.timeanddate.com/astronomy/moon/light.html" target="blank">
            Check here
          </a>
          .
        </p>
      </React.Fragment>
    ),
  },
];

const FaqPanel = () => (
  <div className="container">
    <h4 className="mb-4">
      Frequently Asked Questions
    </h4>
    <div className="row">
      {
        questions.map(question => (
          <div className="card col-sm-12 p-2 pt-3 mb-3" key={question.title}>
            <div className="card-body">
              <h5 className="card-title" style={{ fontWeight: 'bold' }}>
                {question.title}
              </h5>
              <div className="card-text">
                {question.answer}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  </div>
);

export default FaqPanel;
