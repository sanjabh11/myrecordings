const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = CHARSET.length;

export function uuidToBase62(uuid) {
  // Remove hyphens and convert to hex
  const hex = uuid.replace(/-/g, '');
  
  // Convert hex to decimal
  let decimal = BigInt(`0x${hex}`);
  
  // Convert decimal to base62
  let result = '';
  while (decimal > 0) {
    result = CHARSET[decimal % BigInt(BASE)] + result;
    decimal = decimal / BigInt(BASE);
  }
  
  return result;
}

export function base62ToUuid(base62) {
  // Convert base62 to decimal
  let decimal = BigInt(0);
  for (let i = 0; i < base62.length; i++) {
    decimal = decimal * BigInt(BASE) + BigInt(CHARSET.indexOf(base62[i]));
  }
  
  // Convert decimal to hex
  let hex = decimal.toString(16).padStart(32, '0');
  
  // Insert hyphens to form UUID
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
