async function importRsaKey(jwkKey, keyType) {
    let algorithm;
    let usages;

    if (keyType === 'public') {
        algorithm = {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}
        };
        usages = ["encrypt"];  // or other usages for a public key
    } else if (keyType === 'private') {
        algorithm = {
            name: "RSA-OAEP",
            hash: {name: "SHA-256"}
        };
        usages = ["decrypt"];  // or other usages for a private key
    } else {
        throw new Error("Invalid key type. Must be 'public' or 'private'.");
    }

}