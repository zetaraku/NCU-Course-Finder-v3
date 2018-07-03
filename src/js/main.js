import $ from 'jquery';
import 'bootstrap';
import 'bootstrap-loader';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import 'jquery-ui/ui/widgets/dialog';
import 'jquery-ui/themes/base/all.css';
import 'tablesorter';
import 'tablesorter/dist/css/theme.default.min.css';
import 'tablesorter/dist/js/extras/jquery.tablesorter.pager.min';
import 'tablesorter/dist/css/jquery.tablesorter.pager.min.css';
import moment from 'moment';
import 'moment/locale/zh-tw';
import Clipboard from 'clipboard';

import getJQueryWrappers from './my_jqury_wrapper';
import filterCoursesByQuery from './course_filter';
import makeCourseRows from './row_maker';
import filter_category from '../static_data/filter_category.json';
import filter_options from '../static_data/filter_options.json';
import '../scss/style.scss';

const proxy = 'https://cors-anywhere.herokuapp.com/';
const data_server = 'https://path/to/your/data/server/';
// const urlPrefix = proxy + data_server;
const urlPrefix = './';
const getUrl = (relpath) => urlPrefix + relpath + `?ts=${moment().valueOf()}`;

const urls = {
	announcement: getUrl('data/info/announcement.txt'),
	disclaimer: getUrl('data/info/popup_info.txt'),
	course_data: getUrl('data/dynamic/courses.json'),
	department_tree: getUrl('data/dynamic/department_tree.json'),
};

const DAY_IDS = [0, 1, 2, 3, 4, 5, 6];
const HOUR_IDS = [1, 2, 3, 4, 'Z', 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D'];

// Cached jQueryElements, ValueSupplier, ValueConsumer, ValueResetter, ValueToString
let CE, VS, VC, VR, VTS;
let deptsels;

let COURSE_DATA;
let department_tree;

$(document).ready(() => {
	initScheduleTable();

	( { CE, VS, VC, VR, VTS, deptsels } = getJQueryWrappers($) );

	(async function () {
		loadDisclaimer();
		loadAnnouncement();
		await loadDepartmentTree();
		initDepartmentSelection();
		await loadCourseData();
		initFilterCategory();
		initUI();
		applyHashQuery();
		enableSearching();
	})();

	function initScheduleTable() {
		let schedule_table_head$ = $('#schedule_table>thead');
		let schedule_table_body$ = $('#schedule_table>tbody');
		schedule_table_head$.append((() => {
			let weekday_ch = ['日', '一', '二', '三', '四', '五', '六'];
			return $('<tr></tr>').append(
				'<th>＼</th>',
				DAY_IDS.map((day) =>
					$('<th></th>').append(
						$(`<a href="javascript:;">${weekday_ch[day]}</a>`)
							.on('click', () => toggleDay(day))
					)
				)
			);
		})());
		schedule_table_body$.append(
			HOUR_IDS.map((ej) => {
				let trclass = (ej === 'Z' ?
					'noon' :
					['A', 'B', 'C', 'D'].includes(ej) ?
						'night' :
						''
				);
				return $(`<tr class="${trclass}"></tr>`).append(
					$('<td class="head"></td>').append(
						$(`<a href="javascript:;">${ej}</a>`)
							.on('click', () => toggleHour(ej))
					),
					DAY_IDS.map((ei) => {
						let tdclass = (ei === 6 || ei === 0 ? 'weekend' : '');
						return $(`<td class="${tdclass}"></td>`)
							.append(`<input type="checkbox" value="${ei}-${ej}">`);
					})
				);
			})
		);

		function toggleDay(d) {
			CE['schedule_periods']
				.filter((i, e) => e.value.startsWith(d))
				.prop('checked', (i, val) => !val);
		}
		function toggleHour(h) {
			CE['schedule_periods']
				.filter((i, e) => e.value.endsWith(h))
				.prop('checked', (i, val) => !val);
		}
	}
	function initTableSorter() {
		$.tablesorter.addParser({
			id: 'percento',
			is: (s) => false,
			format: (s) => {
				let n = s.replace(/%$/, '');
				if(n === 'Infinity') return '9e9';
				if(n === 'null') return '-9e9';
				return n;
			},
			type: 'numeric',	// set type, either numeric or text
		});
		$('#result_table')
			.tablesorter({
				headers: {
					4: { sorter: 'digit' },
					5: { sorter: 'digit', string: 'min' },
					6: { sorter: 'percento' },
					7: { sorter: 'digit', string: 'min' },
					8: { sorter: 'percento' },
				},
			}).tablesorterPager({
				container: $('.tspager'),
				size: 50,
				output: ' 共找到 {totalRows} 筆結果 目前顯示第 {page}/{totalPages} 頁 ',
			});
	}
	async function loadAnnouncement() {
		$('#announcement').html('<font color="red">正在取得資料...</font>');
		try {
			$('#announcement').html(await $.get({
				url: urls.announcement,
				dataType: 'text',
			}));
		} catch(e) {
			console.warn('announcement unavailable.');
		}
	}
	async function loadDepartmentTree() {
		( { department_tree } = await $.getJSON(urls.department_tree) );
	}
	async function loadCourseData() {
		$('#datatime').html('<font color="red">正在取得資料...</font>');
		try {
			let LAST_UPDATE_TIME;
			( { courses: COURSE_DATA, LAST_UPDATE_TIME } = await $.getJSON(urls.course_data) );
			preprocessCourseData(COURSE_DATA);

			let LAST_UPDATE_MOMENT = moment.unix(LAST_UPDATE_TIME);
			$('#datatime').text(
				LAST_UPDATE_MOMENT.format('Y/M/D H:mm') +
				' (' + LAST_UPDATE_MOMENT.fromNow() + ')'
			);
		} catch(e) {
			$('#datatime').html('<font color="red">無法取得資料</font>');
			console.error(e);
		}

		function preprocessCourseData(course_data) {
			Object.values(course_data).forEach((course) => {
				course.remainCnt = course.limitCnt - course.admitCnt;
				course.successRate = getRate(course.remainCnt, course.waitCnt);
				course.fullRate = getRate(course.admitCnt, course.limitCnt);
			});

			function getRate(n, d) {
				// if(!d) {
				// 	if(!n)
				// 		return 0;
				// 	else
				// 		return Infinity;
				// }

				return Math.floor(1000 * n / d) / 10;
			}
		}
	}
	function initDepartmentSelection() {
		let colesel$ = $('#colesel'); {
			colesel$.append('<option value="">[不指定]</option>');
		}
		deptsels[''] = $('<select class="form-control"></select>');
		for(let ckey of Object.keys(department_tree)) {
			let coleopt = $(`<option value="${ckey}">${department_tree[ckey].name}</option>`);
			colesel$.append(coleopt);

			let depts = department_tree[ckey].departments;
			let deptsel$ = $('<select class="form-control"></select>'); {
				let deptopt0$ = $('<option value="">[不指定]</option>');
				deptsel$.append(deptopt0$);
			}
			for(let dkey of Object.keys(depts)) {
				let deptopt$ = $(`<option value="${dkey}">${depts[dkey].name}</option>`);
				deptsel$.append(deptopt$);
			}
			deptsels[ckey] = deptsel$;
		}

		colesel$.on('change', function (event) {
			onCollegeChanged(this.value);
		});

		function onCollegeChanged(college) {
			$('#deptdiv').empty();
			if(college !== '')
				$('#deptdiv').append(deptsels[college]);
		}
	}
	function initFilterCategory() {
		let filter_category$ = $('#filter_category');
		for(let ckey of Object.keys(filter_category)) {
			let category_opt = $(`<option value="${ckey}">${filter_category[ckey]} (${ckey})</option>`);
			filter_category$.append(category_opt);
		}

		let typeMap = {};
		for(let course of Object.values(COURSE_DATA)) {
			let group = course.classNo.match(/^([A-Z]{2})/);
			let [, typeid] = group;
			typeMap[typeid] = typeMap[typeid] || 0;
			typeMap[typeid] += 1;
		}
		for(let ckey of Object.keys(typeMap).sort()) {
			let category_opt = $(`<option value="${ckey}">${ckey}**** (${typeMap[ckey]})</option>`);
			filter_category$.append(category_opt);
		}
	}
	function initUI() {
		$('#searching_table').on('change', onSearchChanged);
		let clipboard = new Clipboard('.clipboard-btn');

		initTableSorter();
		resetSearchingForm();

		// //////////////////////////////////////////////////// //
		let title_tmp = $('#my_title').text();
		$('#my_title').mouseover(() => {
			$('#my_title').text('NeverCareU Course Finder');
		}).mouseout(() => {
			$('#my_title').text(title_tmp);
		});
		// //////////////////////////////////////////////////// //
	}
	function resetSearchingForm() {
		Object.keys(VR).forEach((key) => {
			VR[key]();
		});
	}
	function applyHashQuery() {
		let Q = getHashQuery();
		if(Q) {
			Object.keys(CE).forEach((key) => {
				if(Q[key] !== undefined)
					VC[key](Q[key]);
			});
			onSearchChanged();
			doQuery();
		} else {
			onSearchChanged();
		}

		function getHashQuery() {	// get Query from window.location.hash
			if(!window.location.hash)
				return undefined;
			let kvstrs = window.location.hash.substr(1).split('&');
			let q = {};
			kvstrs.forEach((e) => {
				let kv = e.split('=', 2);
				if(kv.length === 2)
					q[kv[0]] = decodeURIComponent(kv[1]);
			});
			if(window.location.hash)
				window.history.pushState('', document.title, window.location.pathname);
			return q;
		}
	}
	async function loadDisclaimer() {
		try {
			$('#disclaimer').html(await $.get({
				url: urls.disclaimer,
				dataType: 'text',
			})).dialog({
				title: '※※免責聲明※※',
				modal: true,
				width: 'auto',
				draggable: false,
				resizable: false,
			});
			$('.ui-widget-overlay').on('click', () => {
				$('#disclaimer').dialog('close');
			});
		} catch(e) {
			console.warn('disclaimer unavailable.');
		}
	}
	function enableSearching() {
		$('.startSearch')
			.on('click', () => doQuery())
			.prop('disabled', false);
	}
});

function doQuery() {
	let query = collectQuery();

	// close alert
	let result_alert = $('#result_alert');
	result_alert.hide();

	// display searching message
	let result_table_body = $('#result_table>tbody');
	result_table_body.empty();
	result_alert.css('background-color', 'pink').html('搜尋中...').show();

	let result_courses = filterCoursesByQuery(Object.values(COURSE_DATA), query);
	// console.time('processBlock');	// time-consuming sector measurement start
	makeCourseRows(result_courses, progressQuery, finishQuery);

	function collectQuery() {
		// get all option of query from ValueSupplier
		let q = {};
		filter_options.forEach((e) => {
			q[e] = VS[e]();
		});
		return q;
	}
	function progressQuery(curr, all) {
		result_alert.html(`搜尋中... (${curr}/${all})`);
	}
	function finishQuery(trs) {
		// console.timeEnd('processBlock');	// time-consuming sector measurement end
		result_alert.hide();
		result_table_body.empty();

		trs.forEach((e) => {
			result_table_body.append(e);
		});

		if(result_courses.length >= 1000) {
			result_alert.css('background-color', 'orange')
				.html('<i>※篩選條件過少可能導致結果筆數太多以致於搜尋/排序速度緩慢，請多加留意※</i>').show();
		} else if(result_courses.length === 0) {
			result_alert.css('background-color', 'orange')
				.html('<i>找不到相符的結果' + (query.category ? '（有可能是使用了類別篩選忘記關閉）' : '') + '</i>').show();
		}

		$('#result_table').trigger('update');
	}
}

function onSearchChanged() {
	if(VS['schedule_opts']() === '')
		$('#schedule_table').hide();
	else
		$('#schedule_table').show();

	$('#share_link').val(
		(window.location.origin !== 'null' ? window.location.origin : 'file://') +
		window.location.pathname + getOptionsToHash()
	);

	function getOptionsToHash() {
		let strs = {};
		filter_options.forEach((e) => {
			strs[e] = VTS[e]();
		});
		return '#' + toQueryString(strs);

		function toQueryString(obj) {
			return Object.keys(obj)
				.filter((k) => obj[k] !== undefined && obj[k] !== '')
				.map((k) => k + '=' + encodeURIComponent(obj[k]))
				.join('&');
		}
	}
}
