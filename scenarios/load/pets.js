import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { BASE_URL } from '../../utils/config.js';
import { getAuthHeaders } from '../../utils/getAuthHeaders.js';

const url = `${BASE_URL}/pets`;

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

    group('01. Retrieve all pets', function () {
        const res = http.get(url, { headers: authHeaders });

        if (res.status !== 200) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };

        check(res, {
            'Retrieved all pets with success (200)': (r) => r.status === 200,
            '01. Body response is not empty': (r) => r.body.length > 0,
            '01. Request duration is less than 200ms': (r) => r.timings.duration < 200
        });

        sleep(1);
    });

    group('02. Get a pet by ID', function () {
        const res = http.get(`${url}/1`, { headers: authHeaders });

        if (res.status !== 200) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };

        check(res, {
            'Got a pet by ID with success (200)': (r) => r.status === 200,
            '02. Body response is not empty': (r) => r.body.length > 0,
            '02. Pet id is correct': (r) => r.json().id === 1,
            '02. Request duration is less than 150ms': (r) => r.timings.duration < 150
        });

        sleep(1);
    });

    group('03. Update pet details', function () {
        const putPayload = JSON.stringify({
            "name": "Leo",
            "birthDate": "2010-09-07",
            "type": {
                "name": "cat",
                "id": 1
            }
        });

        const res = http.put(`${url}/1`, putPayload, { headers: authHeaders });

        if (res.status !== 204) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };

        check(res, {
            'Updated pet details with success (204)': (r) => r.status === 204,
            '03. Request duration is less than 200ms': (r) => r.timings.duration < 200
        });

        sleep(1);
    });

    // group('04. Delete a pet', function () {
    //     let petId = 1;

    //     const res = http.delete(`${url}/${petId}`, { headers: authHeaders });
    
    //     if (res.status !== 204) {
    //         console.error(`${url} Failed. Status: ${res.status}`);
    //     };
    
    //     check(res, {
    //         'Deleted a pet with success (204)': (r) => r.status === 204,
    //         '04. Request duration is less than 150ms': (r) => r.timings.duration < 150
    //     });

    //     petId++;
    
    //     sleep(1);
    // });

};
