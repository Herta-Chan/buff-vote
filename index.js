import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { JSDOM } from 'jsdom';
import { allFakers } from '@faker-js/faker';

const faker = allFakers.vi;

function createRandomUser() {
    const n = `${faker.person.fullName()}`.split(' ');
    // [n[2], n[0], n[1]].join(' ')
    return {
        phone: faker.phone.number().replace(/ +/g, ''),
        name: `Lêu lêu :p ${Date.now()}`,
        email: faker.internet.email(),
    };
}

const jar = new CookieJar();

const client = wrapper(
    axios.create({
        jar,
        baseURL: 'https://amitaplus.com/bongro',
        headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'accept-language': 'vi-VN,vi;q=0.9',
            'sec-ch-ua':
                '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-requested-with': 'XMLHttpRequest',
            'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36`,
        },
    }),
);

const teamVote = [
    {
        id: 11,
        tag: 'thpt_nam',
    },
    {
        id: 54,
        tag: 'thpt_nu',
    },
];

function getCsrfToken(scriptContent, functionName) {
    const line = scriptContent.trim().split('\n');
    let found = false;
    for (let i = 0; i < line.length - 1; i++) {
        if (found && line[i].includes('csrf_test_name:')) {
            const csrf = line[i]
                .replace('csrf_test_name:', '')
                .trim()
                .replace(/"/g, '');
            console.log(`${functionName}: ${csrf}`);
            return csrf;
        }
        if (line[i].includes(`function ${functionName}`)) {
            found = true;
        }
    }
}

async function task(loop = false) {
    // Step 1: Lấy csrf Token
    const data = await client.get('/vote');
    // Step 2: Tạo Account
    // Step 2.1: Lấy cái html mà nó render ra cái gì đó
    const postFeCr = new URLSearchParams();
    postFeCr.set('csrf_test_name', getCsrfToken(data.data, 'createAudience'));
    const feCreate = await client.post('/audience/feCreate', postFeCr);
    const dom = new JSDOM(feCreate.data);
    // Step 2.2: Tạo account
    const postData = new URLSearchParams();
    const fakeData = createRandomUser();
    postData.set('name', fakeData.name);
    postData.set('email', fakeData.email);
    postData.set('phone', fakeData.phone);
    postData.set(
        'csrf_test_name',
        dom.window.document
            .querySelector('#createForm > input[type=hidden]')
            .getAttribute('value'),
    );
    const resposeAccount = await client.post('/audience/feStore', postData);
    const submitVoteCSRF = getCsrfToken(data.data, 'submitVote');
    // Step 3: Voting
    await Promise.all(
        teamVote.map((team) => {
            const voteData = new URLSearchParams();
            voteData.set('teamId', team.id);
            voteData.set('audienceId', resposeAccount.data.audienceId);
            voteData.set('tag', team.tag);
            voteData.set('csrf_test_name', submitVoteCSRF);
            return client.post('/vote/store', voteData).then((r) => {
                console.log(
                    `UID: ${resposeAccount.data.audienceId} vote cho ${
                        team.id
                    } (${team.tag}) status: ${
                        r.data?.alert?.icon == 'success' ? '✅' : '❌'
                    }`,
                );
            });
        }),
    );
    // Step 4: Clear cúc ki
    jar.removeAllCookiesSync();
    // Step 5: Nếu mà abc thì chạy lại
    if (loop) task(loop);
}

task(true);