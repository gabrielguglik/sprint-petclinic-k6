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
            'Retrieved all pet owners with success (200)': (r) => r.status === 200,
            '01. Body response is not empty': (r) => r.body.length > 0,
            '01. Request duration is less than 200ms': (r) => r.timings.duration < 200
        });
    
        sleep(1);
    });

    group('02. Get a pet owner by ID', function () {
        const res = http.get(`${url}/1`, { headers: authHeaders });
    
        if (res.status !== 200) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Got a pet owner by ID with success (200)': (r) => r.status === 200,
            '02. Body response is not empty': (r) => r.body.length > 0,
            '02. Owner id is correct': (r) => r.json().id === 1,
            '02. Request duration is less than 150ms': (r) => r.timings.duration < 150
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
            'Added a new pet owner with success (201)': (r) => r.status === 201,
            '03. Body response is not empty': (r) => r.body.length > 0,
            '03. Request duration is less than 200ms': (r) => r.timings.duration < 200
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

        const res = http.put(`${url}/1`, putPayload, { headers: authHeaders });
    
        if (res.status !== 204) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Updated an owner’s details with success (204)': (r) => r.status === 204,
            '04. Request duration is less than 200ms': (r) => r.timings.duration < 200
        });
    
        sleep(1);
    });

    // group('05. Delete an owner', function () {
    //     let ownerId = 1;

    //     const res = http.delete(`${url}/${ownerId}`, { headers: authHeaders });
    
    //     if (res.status !== 204) {
    //         console.error(`${url} Failed. Status: ${res.status}`);
    //     };
    
    //     check(res, {
    //         'Deleted an owner with success (204)': (r) => r.status === 204,
    //         '05. Request duration is less than 150ms': (r) => r.timings.duration < 150
    //     });

    //     ownerId++;
    
    //     sleep(1);
    // });

    group('06. Get a pet by ID (owner’s pet)', function () {
        const res = http.get(`${url}/1/pets/1`, { headers: authHeaders });
    
        if (res.status !== 200) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Got a pet by ID (owner’s pet) with success (200)': (r) => r.status === 200,
            '06. Body response is not empty': (r) => r.body.length > 0,
            '06. Owner id is correct': (r) => r.json().ownerId === 1,
            '06. Pet id is correct': (r) => r.json().id === 1,
            '06. Request duration is less than 150ms': (r) => r.timings.duration < 150
        });
    
        sleep(1);
    });

    group('07. Update pet details (owner’s pet)', function () {
        const putPayload = JSON.stringify({
            "name": "Leo",
            "birthDate": "2010-09-07",
            "type": {
                "name": "cat",
                "id": 1
            }
        });

        const res = http.put(`${url}/1/pets/1`, putPayload, { headers: authHeaders });
    
        if (res.status !== 204) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Updated pet details (owner’s pet) with success (204)': (r) => r.status === 204,
            '07. Request duration is less than 200ms': (r) => r.timings.duration < 200
        });
    
        sleep(1);
    });

    group('08. Add a new pet to an owner', function () {
        const postPayload = JSON.stringify({
            "name": "Leo",
            "birthDate": "2010-09-07",
            "type": {
                "name": "cat",
                "id": 1
            }
        });

        const res = http.post(`${url}/1/pets`, postPayload, { headers: authHeaders });
    
        if (res.status !== 201) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Added a new pet to an owner with success (201)': (r) => r.status === 201,
            '08. Body response is not empty': (r) => r.body.length > 0,
            '08. Request duration is less than 200ms': (r) => r.timings.duration < 200
        });
    
        sleep(1);
    });

    group('09. Add a vet visit for a pet', function () {
        const postPayload = JSON.stringify({
            "date": "2030-01-01",
            "description": "rabies shot"
        });

        const res = http.post(`${url}/1/pets/1/visits`, postPayload, { headers: authHeaders });
    
        if (res.status !== 201) {
            console.error(`${url} Failed. Status: ${res.status}`);
        };
    
        check(res, {
            'Added a vet visit for a pet with success (201)': (r) => r.status === 201,
            '09. Body response is not empty': (r) => r.body.length > 0,
            '09. Request duration is less than 200ms': (r) => r.timings.duration < 200
        });
    
        sleep(1);
    });

};
