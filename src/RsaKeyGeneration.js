

function generateRsaKeys() {
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