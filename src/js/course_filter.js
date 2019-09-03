export default function filterCoursesByQuery(courses, query) {
	let results = courses.slice();

	if(query.department) {
		results = results.filter((course) =>
			course.deptcode === query.department
		);
	} else if(query.college) {
		results = results.filter((course) =>
			course.colecode === query.college
		);
	}
	if(query.coursenames) {
		if(query.coursename_opt === 'and') {
			results = results.filter((course) =>
				query.coursenames.every((name) =>
					matchCourseWithTerm(course, name)
			));
		} else if(query.coursename_opt === 'or') {
			results = results.filter((course) =>
				query.coursenames.some((name) =>
					matchCourseWithTerm(course, name)
			));
		}
	}
	if(query.teachers) {
		let teacherRegexp = new RegExp(`(${query.teachers.join('|')})`);
		if(query.teacher_opt === 'or') {
			results = results.filter((course) =>
				course.teachers.some((teacher) =>
					teacher.match(teacherRegexp)
			));
		} else if(query.teacher_opt === 'nor') {
			results = results.filter((course) =>
				!course.teachers.some((teacher) =>
					teacher.match(teacherRegexp)
			));
		}
	}
	if(query.credits) {
		results = results.filter((course) =>
			query.credits.includes(course.credit)
		);
	}
	if(query.reqtype) {
		results = results.filter((course) =>
			course.type === query.reqtype
		);
	}
	if(query.category) {
		results = results.filter((course) =>
			new RegExp('^' + query.category).test(course.classNo)
		);
	}
	if(query.pwcard) {
		results = results.filter((course) =>
			course.passwordCard === query.pwcard
		);
	}
	if(query.schedule_opts) {
		if(query.schedule_periods === undefined)
			query.schedule_periods = [];

		if(query.schedule_opts === 'include') {
			results = results.filter((course) =>
				course.times.some((hour) =>
					query.schedule_periods.includes(hour)
			));
		} else if(query.schedule_opts === 'enclose') {
			results = results.filter((course) =>
				course.times.every((hour) =>
					query.schedule_periods.includes(hour)
			));
		} else if(query.schedule_opts === 'exclude') {
			results = results.filter((course) =>
				!course.times.some((hour) =>
					query.schedule_periods.includes(hour)
			));
		}
	}
	if(query.extra_opts) {
		if(query.extra_opts.includes('isNotFull')) {
			results = results.filter((course) =>
				course.remainCnt > 0
			);
		}
	}

	return results;

	function matchCourseWithTerm(course, name) {
		let inverse = false;
		if(name.charAt(0) === '!') {
			inverse = true;
			name = name.substr(1);
		}
		return inverse ^ new RegExp(name).test(course.name);
	}
}
