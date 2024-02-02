// Кастомный HTTP запрос
function customHttp() {
	return {
		get(url, cb) {
			try {
				const xhr = new XMLHttpRequest();
				xhr.open('GET', url);
				xhr.addEventListener('load', () => {
					if (Math.floor(xhr.status / 100) !== 2) {
						cb(`Error. Status code: ${xhr.status}`, xhr);
						return;
					}
					const response = JSON.parse(xhr.responseText);
					cb(null, response);
				});

				xhr.addEventListener('error', () => {
					cb(`Error. Status code: ${xhr.status}`, xhr);
				});

				xhr.send();
			} catch (error) {
				cb(error);
			}
		},
		post(url, body, headers, cb) {
			try {
				const xhr = new XMLHttpRequest();
				xhr.open('POST', url);
				xhr.addEventListener('load', () => {
					if (Math.floor(xhr.status / 100) !== 2) {
						cb(`Error. Status code: ${xhr.status}`, xhr);
						return;
					}
					const response = JSON.parse(xhr.responseText);
					cb(null, response);
				});

				xhr.addEventListener('error', () => {
					cb(`Error. Status code: ${xhr.status}`, xhr);
				});

				if (headers) {
					Object.entries(headers).forEach(([key, value]) => {
						xhr.setRequestHeader(key, value);
					});
				}

				xhr.send(JSON.stringify(body));
			} catch (error) {
				cb(error);
			}
		},
	};
}
// Инициализация http запроса
const http = customHttp();

const newsService = (function () {
	const apiKey = '569868670af740deb2712cbd01190c5c';
	const apiUrl = 'https://newsapi.org/v2';

	return {
		topHeadLines(country = 'ru', getNews) {
			http.get(
				`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`,
				getNews,
			);
		},
		everything(query, getNews) {
			http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, getNews);
		},
	};
})();

//  Инициализация селекторов
document.addEventListener('DOMContentLoaded', function () {
	// Инициализая библиотеки Materialize
	M.AutoInit();
	loadNews();
});

// Загрузка новостей
function loadNews() {
	newsService.topHeadLines('us', getResponse);
}

// Функция calback, будет вызываться после получения ответа от сервера (новостей)
function getResponse(error, response) {
	// console.log(response); // articles[Array] массив объектов с новостями

	renderNews(response.articles);
}

// Рендер новостей
function renderNews(news) {
	const newsContainer = document.querySelector('.news-container .row');
	let fragment = '';

	news.forEach((newsItem) => {
		const elem = newsTemplate(newsItem);

		fragment += elem;
	});

	// console.log(fragment);

	newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// Разметка для новостей
function newsTemplate({ urlToImage, title, url, description }) {
	// console.log(news);
	return `
		<div class='col s12'>
			<div class='card'>
				<div class='card-image'>
					<img src='${urlToImage || null}'>
					<span class='card-title'>${title || ''}</span>
				</div>
				<div class='card-content'>
					<p>${description || ''}</p>
				</div>
				<div class='card-action'>
					<a href='${url || null}' target="_blank">Read more...</a>
				</div>
			</div>
		</div>
	`;
}
