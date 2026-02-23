import { EncryptedPayload } from '../types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const PBKDF2_ITERATIONS = 150_000;

export async function randomSalt(length = 16): Promise<Uint8Array> {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return salt;
}

export async function deriveKeyPBKDF2(password: string, salt: Uint8Array, iterations = PBKDF2_ITERATIONS): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptAESGCM(key: CryptoKey, plaintextBytes: Uint8Array): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);
  const plaintextBuffer = plaintextBytes.buffer.slice(
    plaintextBytes.byteOffset,
    plaintextBytes.byteOffset + plaintextBytes.byteLength
  );
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivBuffer }, key, plaintextBuffer);
  return { iv, ciphertext: new Uint8Array(encrypted) };
}

export async function decryptAESGCM(key: CryptoKey, iv: Uint8Array, ciphertext: Uint8Array): Promise<Uint8Array> {
  const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);
  const ciphertextBuffer = ciphertext.buffer.slice(
    ciphertext.byteOffset,
    ciphertext.byteOffset + ciphertext.byteLength
  );
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBuffer }, key, ciphertextBuffer);
  return new Uint8Array(decrypted);
}

export function toUtf8Bytes(value: string): Uint8Array {
  return encoder.encode(value);
}

export function fromUtf8Bytes(bytes: Uint8Array): string {
  return decoder.decode(bytes);
}
