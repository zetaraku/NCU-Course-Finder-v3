import $ from 'jquery';

const course_info_page = 'https://cis.ncu.edu.tw/Course/main/support/courseDetail.html';
const partition_size = 42;

export default function makeCourseRows(courses, onProgress) {
	return new Promise((resolve, reject) => {
		let trs = [], i = 0;

		(function nextBlock() {
			for(let j = 0; j < partition_size && i < courses.length; j++) {
				trs[i] = makeCourseRow(courses[i]);
				i += 1;
			}
			onProgress(i, courses.length);

			if(i < courses.length)
				setTimeout(nextBlock, 0);
			else
				resolve(trs);
		})();
	});
}

function makeCourseRow(course) {
	let tr = $('<tr class="result_row"></tr>');

	tr.append('<td class="c_no">' +
		course.classNo.replace('*', '') +
		'<small>/' + ('00000' + course.serialNo).slice(-5) + '</small>' +
	'</td>');
	tr.append(makeNameTD(course));
	tr.append('<td class="c_teacher">' +
		course.teachers.join(',<br>') +
	'</td>');
	tr.append('<td class="c_sr">' +
		getTypeTag(course) +
	'</td>');
	tr.append('<td class="c_credit">' +
		course.credit +
	'</td>');
	tr.append(`<td class="c_rw">
		${course.remainCnt} / ${course.waitCnt}
	</td>`);
	let successRateInRange = trimTo100(course.successRate);
	tr.append(`<td class="c_succrate"
		style='background:
			linear-gradient(
				90deg, rgba(0,255,0,1) ${successRateInRange}%, rgba(0,0,0,0) ${successRateInRange}%
			);
		'>${course.successRate}%
	</td>`);
	tr.append(`<td class="c_al">
		${course.admitCnt} / ${course.limitCnt}
	</td>`);
	let fullRateInRange = trimTo100(course.fullRate);
	tr.append(`<td class="c_fullrate"
		style="background:
			linear-gradient(
				90deg, rgba(255,165,0,1) ${fullRateInRange}%, rgba(0,0,0,0) ${fullRateInRange}%
			);
		">${course.fullRate}%
	</td>`);
	tr.append('<td class="c_timevals">' +
		course.times.join(', ') +
	'</td>');

	return tr;
}
function makeNameTD(course) {
	let nametd = $('<td class="c_name" style="position: relative;"></td>');

	nametd.append(makeInfoBadge(course));
	nametd.append(`<a title="${course.name}" target="_blank" href="${course_info_page}?crs=${course.serialNo}">` +
		course.name +
	'</a>');

	return nametd;
}
function getTypeTag(course) {
	if(/^CC/.test(course.classNo))
		return '<span class="badge badge-primary">核心通識</span>';
	if(/^GS/.test(course.classNo))
		return '<span class="badge badge-success">一般通識</span>';
	if(course.type === 'required')
		return '<span class="badge badge-primary">必修</span>';
	if(course.type === 'elective')
		return '<span class="badge badge-success">選修</span>';

	return '<span class="badge badge-secondary">無資料</span>';
}
function makeInfoBadge(course) {
	let infobadge = $('<div class="hovered-badge" style="right: 0; background-color: #22222222; position: absolute;"></div>');

	if(course.passwordCard === 'all')
		infobadge.append('<span class="badge badge-yellow-warning" title="需要密碼卡">' +
			'🔐' +
		'</span>');

	return infobadge;
}

function trimTo100(n) {
	if(n < 0)
		return 0;
	if(n > 100)
		return 100;
	return n;
}
