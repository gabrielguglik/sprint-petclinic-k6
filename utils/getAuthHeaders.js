
import encoding from 'k6/encoding';

export function getAuthHeaders(username = 'admin', password = 'admin') {
    const credentials = `${username}:${password}`;
    const encodedCredentials = encoding.b64encode(credentials);
  
    return {
      Authorization: `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
    };
}