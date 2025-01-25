const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;
const tagPosition = saltLength + ivLength;
const encryptedPosition = tagPosition + tagLength;

const encrypt = (text, key) => {
    const iv = crypto.randomBytes(ivLength);
    const salt = crypto.randomBytes(saltLength);
    const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');
    const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
    
    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
};

const decrypt = (encryptedText, key) => {
    try {
        const buffer = Buffer.from(encryptedText, 'hex');
        
        const salt = buffer.slice(0, saltLength);
        const iv = buffer.slice(saltLength, tagPosition);
        const tag = buffer.slice(tagPosition, encryptedPosition);
        const encrypted = buffer.slice(encryptedPosition);
        
        const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha256');
        const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);
        
        decipher.setAuthTag(tag);
        
        return decipher.update(encrypted) + decipher.final('utf8');
    } catch (error) {
        return null;
    }
};

module.exports = {
    encrypt,
    decrypt
};