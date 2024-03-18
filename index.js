const { allFakers } = require('@faker-js/faker');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const faker = allFakers.vi;

function createRandomUser() {
	const n = `${faker.person.fullName()}`.split(' ');
	return {
		phone: faker.phone.number().replace(/ +/g, ''),
		name: [n[2], n[0], n[1]].join(' '),
		email: faker.internet.email(),
	};
}

async function start() {
	const browser = await puppeteer.launch({ headless: true, devtools: false });
	async function task() {
		const user = createRandomUser();
		let voting = 0;
		console.log('Running task...', user);
		const page = await browser.newPage();
		// K load ảnh để tải trang nhanh hơn
		await page.setRequestInterception(true);
		page.on('request', (request) => {
			if (request.resourceType() === 'image') {
				request.abort();
			} else {
				request.continue();
			}
		});
		page.on('response', async (response) => {
			if (response.url() == 'https://amitaplus.com/bongro/vote/store') {
				voting++;
				if (response.ok()) {
					console.log('Request successful:', response.url());
				} else {
					console.error('Request failed:', response.url());
				}
				if (voting == 2) {
					await page.deleteCookie();
					await page.evaluate(() => {
						window.localStorage.clear();
						window.sessionStorage.clear();
					});

					// Đóng tab
					await page.close();

					// Spawn task mới
					task();
				}
			}
		});
		await page.goto('https://amitaplus.com/bongro/vote');
		await page.waitForSelector('#audienceName');
		await page.waitForSelector('#votingPage > script:nth-child(6)');

		const scriptContent = await page.evaluate(() => {
			const element = document.querySelector(
				'#votingPage > script:nth-child(6)',
			);
			return element ? element.textContent : null;
		});

		if (scriptContent) {
			console.log('Script content đã tìm thấy');
		} else {
			console.log('Element not found or script has no text content.');
		}

		function getCsrfToken(functionName) {
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

		await page.evaluate(`
			validateVote = function (audience, teamId, tag) {
			$.ajax({
				url: 'https://amitaplus.com/bongro/vote/validateVote',
				type: 'POST',
				data: {
					phone: audience.phone,
					email: audience.email,
					tag: tag,
					csrf_test_name:
						'${getCsrfToken('validateVote')}',
				},
				dataType: 'json',
				success: function (result) {
					if (typeof result.audienceId !== 'undefined') {
						if (result.audienceId == 0) {
							infoModal();
						} else {
							if (result.voted == 1) {
								var alert = {
									title: 'Thông báo',
									icon: 'warning',
									text: 'Đã hết lượt bình chọn ngày hôm nay. Hãy thử lại vào ngày mai!',
								};
								showAlert(alert);
							} else {
								submitVote(result.audienceId, teamId, tag);
							}
						}
					}
				},
			});
		};

		checkInfo = function (teamId, tag) {
			var audience = JSON.parse(
				localStorage.getItem('amitaplusAudience'),
			);
			if (audience === null) {
				infoModal();
			} else {
				validateVote(audience, teamId, tag);
			}
		};

		submitVote = function (audienceId, teamId, tag) {
			$.ajax({
				url: 'https://amitaplus.com/bongro/vote/store',
				type: 'POST',
				data: {
					teamId,
					audienceId: audienceId,
					tag,
					csrf_test_name:
						'${getCsrfToken('submitVote')}',
				},
				dataType: 'json',
				success: function (result) {
					if (typeof result.alert !== 'undefined') {
						showAlert(result.alert);
					}
				},
			});
		};

		vote = function (teamId, tag) {
			console.log('Running patch function');
			checkInfo(teamId, tag);
		};

		console.clear();
		console.log('Patch function');
	`);

		// Click (kiểu này vì nó bị ẩn)
		await page.evaluate(() => {
			document.getElementById('audienceName').click();
		});
		// Chờ modal xuất hiện
		await page.waitForSelector('#createModal');

		// Lấy các phần tử input
		const nameInput = await page.waitForSelector('#inputName');
		const emailInput = await page.waitForSelector('#inputEmail');
		const phoneInput = await page.waitForSelector('#inputPhone');

		// Điền dữ liệu vào các input
		await nameInput.type(user.name);
		await emailInput.type(user.email);
		await phoneInput.type(user.phone);

		// Click Lưu
		await page.evaluate(() => {
			window.feStore();
		});

		// Đợi khoảng 0,5s
		await new Promise((r) => setTimeout(r, 500));

		await page.evaluate(() => {
			window.vote(11, 'thpt_nam');
			window.vote(54, 'thpt_nu');
		});
	}
	task();
}

start();