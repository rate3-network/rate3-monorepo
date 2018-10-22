import 'babel-polyfill';

import R3Stellar from "../r3-stellar.js";
import sinon from 'sinon';
import axios from 'axios';

require('chai')
.use(require('chai-as-promised'))
.should();
const expect = require('chai').expect;

describe("server.js tests", function () {
    beforeEach(async function () {
        this.r3 = await R3Stellar('https://horizon-live.stellar.org:1337');
        this.axiosMock = sinon.mock(axios);
        this.r3.Stellar.Config.setDefault();
    });
  
    afterEach(function () {
        this.axiosMock.verify();
        this.axiosMock.restore();
    });

    describe('Setup r3-stellar.js', function () {
        it("throws error for insecure server", async function () {
            try {
                await R3Stellar('http://horizon-live.stellar.org:1337')
            } catch (err) {
                expect(err.message).equal('Cannot connect to insecure horizon server');
            }
        });
    });

});