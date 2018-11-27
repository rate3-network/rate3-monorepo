// Type definitions for web3 1.0
// Project: https://github.com/ethereum/web3.js
// Definitions by: Simon Jentzsch <https://github.com/simon-jentzsch>
//                 Nitzan Tomer <https://github.com/nitzantomer>
//                 Zurbo <https://github.com/zurbo>
//                 Xiao Liang <https://github.com/yxliang01>
//                 Francesco Soncina <https://github.com/phra>
//                 Nick Addison <https://github.com/naddison36>
//                 Ícaro Harry <https://github.com/icaroharry>
//                 Linus Norton <https://github.com/linusnorton>
//                 Javier Peletier <https://github.com/jpeletier>
//                 HIKARU KOBORI <https://github.com/anneau>
//                 Baris Gumustas <https://github.com/matrushka>
//                 André Vitor de Lima Matos <https://github.com/andrevmatos>
//                 Levin Keller <https://github.com/levino>
//                 Dmitry Radkovskiy <https://github.com/zlumer>
//                 Konstantin Melnikov <https://github.com/archangel-irk>
//                 Asgeir Sognefest <https://github.com/sogasg>
//                 Donam Kim <https://github.com/donamk>
//                 Doug Kent <https://github.com/dkent600>
//                 Daniel Zhou <https://github.com/nerddan>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

import Providers, { Provider } from "../../node_modules/@types/web3/providers";
import { Bzz, Shh } from "../../node_modules/@types/web3/types";
import { BatchRequest, Net, Personal } from "../../node_modules/@types/web3/eth/types";
import Utils from "../../node_modules/@types/web3/utils";
import Eth from "../../node_modules/@types/web3/eth/index";

declare class Web3 {
    static providers: Providers;
    static givenProvider: Provider;
    static modules: {
        Eth: new (provider: Provider) => Eth;
        Net: new (provider: Provider) => Net;
        Personal: new (provider: Provider) => Personal;
        Shh: new (provider: Provider) => Shh;
        Bzz: new (provider: Provider) => Bzz;
    };
    static utils: Utils;
    constructor(provider?: Provider | string);
    version: string;
    BatchRequest: new () => BatchRequest;
    extend(methods: any): any; // TODO
    bzz: Bzz;
    currentProvider: Provider;
    eth: Eth;
    shh: Shh;
    givenProvider: Provider;
    providers: Providers;
    setProvider(provider: Provider): void;
    utils: Utils;
}

export default Web3;
