export default function getJQueryWrappers($) {
	let deptsels = {};
	let CE = getCachedJQueryElements(deptsels);
	let VS = getValueSupplier();
	let VC = getValueConsumer();
	let VR = getValueResetter();
	let VTS = getValueToString();

	return {
		CE, VS, VC, VR, VTS, deptsels
	};

	function getCachedJQueryElements(_deptsels) {
		return {
			college: $('#colesel'),
			department: _deptsels,
			coursenames: $('#search_name input[type="text"]'),
			coursename_opt: $('#search_name input[name="name_opt"]'),
			teachers: $('#search_teacher input[type="text"]'),
			teacher_opt: $('#search_teacher input[name="teacher_opt"]'),
			credits: $('#filter_credit input[name="credit"]'),
			reqtype: $('#filter_require input[name="type"]'),
			category: $('#filter_category'),
			pwcard: $('#filter_pwcard input[name="passwordCard"]'),
			semester: $('#filter_semester input[name="fullHalf"]'),
			schedule_periods: $('#schedule_table input[type="checkbox"]'),
			schedule_opts: $('#filter_schedule input[name="filter_mode"]'),
			extra_opts: $('#extra_options input[type="checkbox"]'),
		};
	}
	function getValueResetter() {
		let basicValueResetter = {
			text: (name) => () => {
				CE[name].val('');
			},
			select: (name) => () => {
				CE[name].val('');
			},
			multi_select: (name0, name1, namefunc2) => () => {
				CE[name0].val('');
				CE[name1][namefunc2()].val('');
			},
			radio: (name) => () => {
				CE[name].first().prop('checked', true);
			},
			checkbox: (name, data) => () => {
				CE[name].prop('checked', false);
				data.forEach((e) => {
					CE[name].filter(`[value="${e}"]`).prop('checked', true);
				});
			},
		};
		return {
			college: basicValueResetter.select('college'),
			department: basicValueResetter.multi_select('college', 'department', () => CE.college.val()),
			coursenames: basicValueResetter.text('coursenames'),
			coursename_opt: basicValueResetter.radio('coursename_opt'),
			teachers: basicValueResetter.text('teachers'),
			teacher_opt: basicValueResetter.radio('teacher_opt'),
			credits: basicValueResetter.checkbox('credits', [0, 1, 2, 3, 4]),
			reqtype: basicValueResetter.radio('reqtype'),
			category: basicValueResetter.select('category'),
			pwcard: basicValueResetter.radio('pwcard'),
			semester: basicValueResetter.radio('semester'),
			schedule_periods: basicValueResetter.checkbox('schedule_periods', []),
			schedule_opts: basicValueResetter.radio('schedule_opts'),
			extra_opts: basicValueResetter.checkbox('extra_opts', []),
		};
	}
	function getValueSupplier() {
		let basicValueSupplier = {
			text_plain: (name) => () => {
				return CE[name].val();
			},
			text_array: (name, delim) => () => {
				let arr = CE[name].val()
					.trim().split(delim).filter((e) => e !== '');
				return arr.length > 0 ? arr : undefined;
			},
			select: (name, defaultval) => () => {
				return CE[name].val() || defaultval;
			},
			multi_select: (name1, namefunc2, defaultval) => () => {
				return CE[name1][namefunc2()].val() || defaultval;
			},
			radio: (name) => () => {
				return CE[name].filter(':checked').val();
			},
			checkbox: (name, valfunc) => () => {
				let arr = CE[name].filter(':checked').toArray()
					.map((e) => valfunc(e.value));
				return arr.length > 0 ? arr : undefined;
			},
		};
		return {
			college: basicValueSupplier.select('college', undefined),
			department: basicValueSupplier.multi_select('department', () => CE.college.val(), undefined),
			coursenames: basicValueSupplier.text_array('coursenames', /\s+/),
			coursename_opt: basicValueSupplier.radio('coursename_opt'),
			teachers: basicValueSupplier.text_array('teachers', /\s+/),
			teacher_opt: basicValueSupplier.radio('teacher_opt'),
			credits: basicValueSupplier.checkbox('credits', window.parseInt),
			reqtype: basicValueSupplier.radio('reqtype'),
			category: basicValueSupplier.select('category', ''),
			pwcard: basicValueSupplier.radio('pwcard'),
			semester: basicValueSupplier.radio('semester'),
			schedule_periods: basicValueSupplier.checkbox('schedule_periods', (e) => e),
			schedule_opts: basicValueSupplier.radio('schedule_opts'),
			extra_opts: basicValueSupplier.checkbox('extra_opts', (e) => e),
		};
	}
	function getValueConsumer() {
		let basicValueConsumer = {
			text: (name) => (data) => {
				CE[name].val(data);
			},
			select: (name) => (data) => {
				CE[name].val(data);
			},
			multi_select: (name1, namefunc2, defaultval) => (data) => {
				CE[name1][namefunc2()].val(data);
			},
			radio: (name) => (data) => {
				CE[name].filter(`[value="${data}"]`).prop('checked', true);
			},
			checkbox: (name) => (data) => {
				CE[name].prop('checked', false);
				data.split(',')
					.filter((e) => e !== '')
					.forEach((e) => {
						CE[name].filter(`[value="${e}"]`).prop('checked', true);
					});
			},
			withCallback: (func, callback) => (...args) => {
				func.call(this, ...args);
				callback();
			},
		};
		return {
			college: basicValueConsumer.select('college'),
			department: basicValueConsumer.multi_select('department', () => CE.college.val(), ''),
			coursenames: basicValueConsumer.text('coursenames'),
			coursename_opt: basicValueConsumer.radio('coursename_opt'),
			teachers: basicValueConsumer.text('teachers'),
			teacher_opt: basicValueConsumer.radio('teacher_opt'),
			credits: basicValueConsumer.checkbox('credits'),
			reqtype: basicValueConsumer.radio('reqtype'),
			category: basicValueConsumer.select('category'),
			pwcard: basicValueConsumer.radio('pwcard'),
			semester: basicValueConsumer.radio('semester'),
			schedule_periods: basicValueConsumer.checkbox('schedule_periods'),
			schedule_opts: basicValueConsumer.radio('schedule_opts'),
			extra_opts: basicValueConsumer.checkbox('extra_opts'),
		};
	}
	function getValueToString() {
		let basicStringifier = {
			text: (name) => () => {
				return CE[name].val();
			},
			select: (name) => () => {
				return CE[name].val() || '';
			},
			multi_select: (name1, namefunc2) => () => {
				return CE[name1][namefunc2()].val() || '';
			},
			radio: (name) => () => {
				return CE[name].filter(':checked').val();
			},
			checkbox: (name, delim) => () => {
				return CE[name].filter(':checked').toArray()
					.map((e) => e.value)
					.join(delim);
			},
		};
		return {
			college: basicStringifier.select('college'),
			department: basicStringifier.multi_select('department', () => CE.college.val()),
			coursenames: basicStringifier.text('coursenames'),
			coursename_opt: basicStringifier.radio('coursename_opt'),
			teachers: basicStringifier.text('teachers'),
			teacher_opt: basicStringifier.radio('teacher_opt'),
			credits: basicStringifier.checkbox('credits', ','),
			reqtype: basicStringifier.radio('reqtype'),
			category: basicStringifier.select('category'),
			pwcard: basicStringifier.radio('pwcard'),
			semester: basicStringifier.radio('semester'),
			schedule_periods: basicStringifier.checkbox('schedule_periods', ','),
			schedule_opts: basicStringifier.radio('schedule_opts'),
			extra_opts: basicStringifier.checkbox('extra_opts', ','),
		};
	}
}
