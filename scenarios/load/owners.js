import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL } from '../../utils/config.js';
import { getAuthHeaders } from '../../utils/getAuthHeaders.js';

const url = `${BASE_URL}/owners`;

export const options = {
    stages: [ 
      { duration: '10s', target: 9 },  
      { duration: '60s', target: 9 },  
      { duration: '10s', target: 0 }, 
    ],
    thresholds: {
        http_req_failed: [
          'rate<0.01'
        ]
    },
};

export default function () {
    const authHeaders = getAuthHeaders('admin', 'admin');

    group('01. Retrieve all pet owners', function () {
        const res = http.get(url, { headers: authHeaders });
    
        if (res.status !== 200) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Status code is 200': (r) => r.status === 200,
            'Body response is not empty': (r) => r.body.length > 0,
            'Request duration is less than 200ms': (r) => r.timings.duration < 200
        });
    
        sleep(1);
    });

    group('02. Get a pet owner by ID', function () {
        const res = http.get(`${url}/2`, { headers: authHeaders });
    
        if (res.status !== 200) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Status code is 200': (r) => r.status === 200,
            'Body response is not empty': (r) => r.body.length > 0,
            'Owner id is correct': (r) => r.json().id === 1,
            'Request duration is less than 150ms': (r) => r.timings.duration < 150
        });
    
        sleep(1);
    });

    group('03. Add a new pet owner', function () {
        const postPayload = JSON.stringify({
            "firstName": "George",
            "lastName": "Franklin",
            "address": "110",
            "city": "Madison",
            "telephone": "6085551023"
        });

        const res = http.post(url, postPayload, { headers: authHeaders });
    
        if (res.status !== 201) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Status code is 201': (r) => r.status === 201,
            'Body response is not empty': (r) => r.body.length > 0,
            'Request duration is less than 200ms': (r) => r.timings.duration < 200
        });
    
        sleep(1);
    });

    group('04. Update an owner’s details', function () {
        const putPayload = JSON.stringify({
            "firstName": "George",
            "lastName": "Franklin",
            "address": "110",
            "city": "Madison",
            "telephone": "6085551023"
        });

        const res = http.put(`${url}/2`, putPayload, { headers: authHeaders });
    
        if (res.status !== 204) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Status code is 204': (r) => r.status === 204,
            'Request duration is less than 150ms': (r) => r.timings.duration < 150
        });
    
        sleep(1);
    });

    // group('05. Delete an owner', function () {
    //     const ownerId = 1;

    //     const res = http.delete(`${url}/${ownerId}`, { headers: authHeaders });
    
    //     if (res.status !== 204) {
    //         console.error(`${url} Failed. Status: ${res.status}`);
    //     };
    
    //     check(res, {
    //         'Status code is 204': (r) => r.status === 204,
    //         'Request duration is less than 150ms': (r) => r.timings.duration < 150
    //     });

    //     ownerId++;
    
    //     sleep(1);
    // });

};