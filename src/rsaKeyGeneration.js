class RSAHandler {
    static generateRsaKeys() {
        const keyUsages = ['encrypt', 'decrypt'];
        const rsaParams = {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256"
        };

        return window.crypto.subtle.generateKey(rsaParams, true, keyUsages)
            .then(keyPair => {
                return {
                    privateKey: keyPair.privateKey,
                    publicKey: keyPair.publicKey
                };
            });
    }

    static rsaEncrypt(publicKey, data) {
        const rsaParams = {
            name: "RSA-OAEP"
        };

        return window.crypto.subtle.encrypt(rsaParams, publicKey, data);
    }

    static rsaDecrypt(privateKey, data) {
        const rsaParams = {
            name: "RSA-OAEP"
        };

        return window.crypto.subtle.decrypt(rsaParams, privateKey, data);
    }
}

export default RSAHandler;
