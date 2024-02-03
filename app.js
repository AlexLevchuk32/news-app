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
		topHeadLines(country = 'us', category = 'sport', getNews) {
			http.get(
				`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
				getNews,
			);
		},
		everything(query, getNews) {
			http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, getNews);
		},
	};
})();

// DOM-Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];

// Событие на форме
form.addEventListener('submit', (event) => {
	event.preventDefault();

	loadNews();
	searchInput.value = '';
});

//  Инициализация загрузки новостей
document.addEventListener('DOMContentLoaded', function () {
	// Инициализая библиотеки Materialize
	M.AutoInit();

	loadNews();
});

// Загрузка новостей
function loadNews() {
	showLoader();

	const country = countrySelect.value;
	const category = categorySelect.value;
	const searchText = searchInput.value;

	if (!searchText) {
		newsService.topHeadLines(country, category, getResponse);
	} else {
		newsService.everything(searchText, getResponse);
	}
}

// Функция calback, будет вызываться после получения ответа от сервера (новостей)
function getResponse(error, response) {
	// console.log(response); // articles[Array] массив объектов с новостями

	removeLoader();

	if (error) {
		showAlert(error, 'error-msg');
		return;
	}

	if (!response.articles.length) {
		// show empty message
		return;
	}

	renderNews(response.articles);
}

// Рендер новостей
function renderNews(news) {
	const newsContainer = document.querySelector('.news-container .row');

	if (newsContainer.children.length) {
		clearContainer(newsContainer);
	}

	let fragment = '';

	news.forEach((newsItem) => {
		const elem = newsTemplate(newsItem);

		fragment += elem;
	});

	// console.log(fragment);

	newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// Очистка контейнера с новостями
function clearContainer(container) {
	// let child = container.lastElementChild;

	// while (child) {
	// 	container.removeChild(child);
	// 	child = container.lastElementChild;
	// }

	container.innerHTML = '';
}

// Разметка для новостей
function newsTemplate({ urlToImage, title, url, description }) {
	// console.log(news);
	return `
		<div class='col s12'>
			<div class='card'>
				<div class='card-image'>
					<img src='${urlToImage || './img/NoImage.webp'}'>
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

// function newsTemplate(news) {
// 	console.log(news);
// }

// Обработка ошибок, вывод сообзений
function showAlert(msg, type = 'success') {
	M.toast({ html: msg, classes: type });
}

// Показ аниации загрузки
function showLoader() {
	document.body.insertAdjacentHTML(
		'afterbegin',
		`
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
	`,
	);
}

// Скрываем прелоадер
function removeLoader() {
	const loader = document.querySelector('.progress');

	if (loader) {
		loader.remove();
	}
}

// Вывод изображения заглушки
// function checkImg() {
// 	const img = document.querySelectorAll('.card-image > img');

// 	img.forEach((item) => {
// 		// console.log(item.src);
// 		// item.src = './img/NoImage.webp';

// 		if (!item.src) {
// 			item.src = './img/NoImage.webp';
// 		}
// 	});
// }
