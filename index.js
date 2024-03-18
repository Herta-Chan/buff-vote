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

function randomSDT() {
  const prefixes = ['03', '05', '07', '08', '09', '06']; 
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  let str = randomPrefix;

  for (let i = 0; i < 8; i++) {
    str += Math.floor(Math.random() * 10).toString();
  }

  return str;
}

console.log(randomSDT());

function randomGmail() {
  const hoList = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Huynh", "Phan", "Vu", "Vo", "Dang"];
  const tenList = ["Nam", "Ha", "Lan", "An", "Linh", "Dung", "Huong", "Anh", "Tung", "Bao"];
  const minYear = 1970; // Năm sinh tối thiểu
  const maxYear = 2005; // Năm sinh tối đa

  const randomHo = hoList[Math.floor(Math.random() * hoList.length)];
  const randomTen = tenList[Math.floor(Math.random() * tenList.length)];
  const randomYear = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;

  const email = `${randomHo.toLowerCase()}${randomTen.toLowerCase()}${randomYear}@gmail.com`;
  return email;
}

console.log(randomGmail());

function randomHoVaTen() {
  const hoList = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"];
  const tenDemList = ["Văn", "Thị", "Hồng", "Hoàng", "Như", "Minh", "Thành", "Đức", "Thu", "Tuấn"];
  const tenList = ["Nam", "Hà", "Lan", "An", "Linh", "Dũng", "Hương", "Anh", "Tùng", "Bảo"];

  const randomHo = hoList[Math.floor(Math.random() * hoList.length)];
  const randomTenDem = tenDemList[Math.floor(Math.random() * tenDemList.length)];
  const randomTen = tenList[Math.floor(Math.random() * tenList.length)];

  return `${randomHo} ${randomTenDem} ${randomTen}`;
}

console.log(randomHoVaTen());

function task(loopTask = false) {
  const data = new URLSearchParams();
  data.set('name', randomHoVaTen());
  data.set('email', randomGmail());
  data.set('phone', randomSDT());
  return fetch('https://amitaplus.com/bongro/audience/store', {
      headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'vi-VN,vi;q=0.9',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
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
      referrer: 'https://amitaplus.com/bongro/vote',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: data.toString(),
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
  })
      .then((r) => {
          console.log('Response status:', r.status);
          return r.json();
      })
      .then((res) => {
          console.log('Response JSON:', res);
          return Promise.all(
              teamVote.map((d) => voteTeam(d.id, res.audienceId, d.tag)),
          );
      })
      .then(() => {
          if (loopTask) {
              return task(loopTask);
          }
      })
      .catch((error) => {
          console.error('Error:', error);
      });
}

/**
* @param {thpt_nam|thpt_nu} tag
*/
function voteTeam(teamId, userId, tag) {
  const data = new URLSearchParams();
  data.set('teamId', teamId);
  data.set('audienceId', userId);
  data.set('tag', tag);
  return fetch('https://amitaplus.com/bongro/vote/store', {
      headers: {
          accept: 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'vi-VN,vi;q=0.9',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
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
      referrer: 'https://amitaplus.com/bongro/vote',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: data.toString(),
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
  })
      .then((r) => r.json())
      .then((data) => {
          console.log(
              `UID: ${userId} vote cho ${teamId} (${tag}) status: ${
                  data?.alert?.icon == 'success' ? '✅' : '❌'
              }`,
          );
      });
}

task(true);
