class IOSTContractStorage
{
    constructor() {
        this.simpleStorage = function () {
            this.put = function (k, v) {
                if (typeof v !== 'string') {
                    throw new Error("storage put must be string");
				}
		        console.log("put ", k, v);
    	        return 0;
    	    };
    	    this.get = function (k) {
    	        console.log("get ", k);
    	        return "";
    	    };
    	    this.del = function (k) {
    	        console.log("del ", k);
    	        return 0;
    	    }
    	};

    	this.mapStorage = function () {
    	    this.mapPut = function (k, f, v) {
    	        if (typeof v !== 'string') {
    	            throw new Error("storage mapPut must be string");
    	        }
    	        console.log("mapPut ", k, f, v);
    	        return 0;
    	    };
    	    this.mapHas = function (k, f) {
    	        console.log("mapHas ", k, f);
    	        return true;
    	    };
    	    this.mapGet = function (k, f) {
    	        console.log("mapGet ", k, f);
    	        return "";
    	    };
    	    this.mapKeys = function (k) {
    	        console.log("mapKeys ", k);
    	        return ["key0", "key1"];
    	    };
    	    this.mapDel = function (k, f) {
    	        console.log("mapDel ", k, f);
    	        return 0;
    	    }
    	};
    }

    put(k, v) {
        return this.simpleStorage.put(k, v);
    }
    get(k) {
        return this.simpleStorage.get(k);
    }
    del(k) {
        return this.simpleStorage.del(k);
    }

    mapPut(k, f, v) {
        return this.mapStorage.mapPut(k, f, v);
    }
    mapHas(k, f) {
        return this.mapStorage.mapHas(k, f);
    }
    mapGet(k, f) {
        return this.mapStorage.mapGet(k, f);
    }
    mapKeys(k) {
        return this.mapStorage.mapKeys(k);
    }
    mapDel(k, f) {
        return this.mapStorage.mapDel(k, f);
    }
};

module.exports = IOSTContractStorage;

