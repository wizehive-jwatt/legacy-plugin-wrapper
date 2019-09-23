export function Filters(plugin) {
	/**
	 * Wizehive filters
	 *
	 * Copyright (c) WizeHive - http://www.wizehive.com
	 *
	 * @since 0.x.x
	 */
	plugin
	.filter('truncate', function() {
		return function(input, length) {
			if (input) {
				length = length || 100;
				if (input.length > length) {
					return input.substr(0, length) + '...';
				}
				return input;
			}
		};
	})
	/**
	 * Return subarray starting from given index
	 *
	 * @author	Paul W. Smith <paul@wizehive.com>
	 * @since	0.5.31
	 * @param	{array} input
	 * @param	{number} startIndex
	 * @returns	{array}
	 */
	.filter('startFrom', function() {
		return function(input, startIndex) {
			if (angular.isArray(input) && input.length > (startIndex - 1)) {
				return input.slice(startIndex, Infinity);
			}
			return input;
		};
	})
	/**
	 * Identity filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 * @param	{Object} User object
	 * @param 	{Array} WorkspaceMembers array
	 * @returns	{String} Format user name
	 */
	.filter('identity', function() {
		return function(input) {

			if (input) {

				switch (input.resource) {
					case 'workspaces': return 'a workspace integration';
					default: return input.displayName || input.username || input.email;
				}

			}

			return '';
		};
	})
	/**
	 * Created By Filter
	 *
	 * If Real Person, User CreatedByUser o/w CreatedByClient
	 *
	 * @author Anna Parks
	 * @since 0.5.66
	 * @param	{Object} object
	 * @param 	{Array} WorkspaceMembers array
	 * @returns	{String} Formatted created by name
	 */
	.filter('createdBy', ['identityFilter', function(identityFilter) {
		return function(input) {
			if (input) {

				if (input.createdByUser && !input.createdByUser.resource) {
					return identityFilter(input.createdByUser);
				}

				if (input.createdByClient) {
					return input.createdByClient.appName;
				}
			}
			return '';
		};
	}])
	/**
	 * Tag list filter
	 *
	 * Converts an array of tags in comma delimited string
	 *
	 * @since 0.5.24-10
	 * @author Everton Yoshitani <everton@wizehive.com>
	 * @param {Array} Array of tags
	 * @returns {String} List of tags separated by comma
	 */
	.filter('tagList', function() {
		return function(input) {
			if (input) {
				if (input instanceof Array) {
					return input.join(', ');
				} else {
					return input;
				}
			}
			return '';
		};
	})
	/**
	 * Object to text filter
	 *
	 * Converts an object to string based off an object key
	 *
	 * @author Everton Yoshitani <everton@wizehive.com>
	 * @since 0.5.24-10
	 * @param {Object} input - Object
	 * @param {String} key  - Object key to return it's value
	 * @returns {*} String or passed input
	 */
	.filter('objectToText', function() {
		return function(input, key) {
			if (input && key && input[key]) {
				return input[key];
			}
			return input;
		};
	})
	/**
	 * Null to text filter
	 *
	 * Replaces `null` values or `null` string with text
	 *
	 * @author Everton Yoshitani <everton@wizehive.com>
	 * @since 0.5.24-10
	 * @param {Null|String} input Input text
	 * @param {String} text Text to replace input
	 * @returns {String}
	 */
	.filter('nullToText', function() {
		return function(input, text) {
			if (!input || input === 'null') {
				return text;
			} else {
				return input;
			}
		};
	})
	/**
	 * Relative date filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('relativeDate', ['userDateFilter', function(userDateFilter) {
		return function(input) {
			var date = moment(input),
				now = moment();

			if (date) {
				var diff = now.diff(date, 'seconds'),
					dayDiff = now.diff(date, 'days');

				if (isNaN(dayDiff) || dayDiff < 0 || dayDiff >= 31) {
					return userDateFilter(date);
				}

				return dayDiff === 0 && (diff < 60 && 'just now' ||
							diff < 120 && '1 minute ago' ||
							diff < 3600 && Math.floor(diff / 60) + ' minutes ago' ||
							diff < 7200 && '1 hour ago' ||
							diff < 86400 && Math.floor(diff / 3600) + ' hours ago') ||
							dayDiff == 1 && 'Yesterday' ||
							dayDiff < 7 && dayDiff + ' days ago' ||
							dayDiff == 7 && '1 week ago' ||
							dayDiff < 31 && Math.ceil(dayDiff / 7) + ' weeks ago' ||
							userDateFilter(date);
			}
			return '';
		};
	}])
	.filter('userDate', ['$rootScope', function($rootScope) {
		// Default presentation format in case user profile not available
		var defaultFormat = 'MM/DD/YYYY';

		/**
		 * User date filter - formats a date according to user's "dateFormat" preference
		 *
		 * @author	Paul W. Smith <paul@wizehive.com>
		 * @since	0.5.58
		 * @param	{Date|String}	input
		 * @returns	{String}
		 */
		return function(input) {

			var format;

			try {
				format = $rootScope.user.settings.dateFormat.toUpperCase();
			} catch (e) {
				format = defaultFormat;
			}

			var mdate = moment(input);
			if (!mdate.isValid()) {
				return input;
			} else {
				return mdate.format(format);
			}
		};
	}])
	.filter('userDateForDataView', ["userDateFilter", function(userDateFilter) {
		/**
		 * userDate filter version for data views - formats a date according to user's "dateFormat" preference
		 * it performs extra validation when input is undefined to not process that value as a date
		 *
		 * @author	Juan Scarton <juan.scarton@wizehive.com>
		 * @since	2.4.1
		 * @param	{Date|String}	input
		 * @returns	{String}
		 */
		return function(input) {
			if (input === undefined) {
				return input;
			} else {
				return userDateFilter(input);
			}
		};
	}])
	/**
	 * To string filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('toString', function() {
		return function(input) {
			if (typeof input === 'undefined') {
				return '';
			}
			return input.toString();
		};
	})
	/**
	 * Pluralize filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('pluralize', function() {
		return function(input) {
			input = input || '';
			if (input.length) {
				if (input[input.length-1] === 'y') {
					return input.substr(0, input.length-1) + 'ies';
				} else {
					return input + 's';
				}
			}
			return input;
		};
	})
	/**
	 * Singularize filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('singularize', function() {
		return function(input) {
			input = input || '';
			if (input.length) {
				if (input.substr(input.length-3) === 'ies') {
					return input.substr(0, input.length-3) + 'y';
				} else if (input[input.length-1] === 's') {
					return input.substr(0, input.length-1);
				}
			}
			return input;
		};
	})
	/**
	 * Capitalize filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('capitalize', function() {
		return function(input) {
			var parts = (input || '').split(' '),
				len = parts.length;
			while (len--) {
				parts[len] = parts[len][0].toUpperCase() + parts[len].substr(1);
			}
			return parts.join(' ');
		};
	})
	/**
	 * Article filter
	 *
	 * Returns 'a' or 'an' depending on the first letter of the following word
	 *
	 * @author Paul W. Smith <paul@wizehive.com>
	 * @since 0.5.25
	 * @param {Null|String} input Input text
	 * @returns {String}
	 */
	.filter('article', function() {
		return function(input) {
			if (!input) {
				return '';
			}
			if (/^[aeiouAEIOU]/.test(input)) {
				return 'an';
			}
			return 'a';
		};
	})
	/**
	 * URL encode filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('urlEncode', function() {
		return function(input) {
			return window.encodeURIComponent(input);
		};
	})
	/**
	 * Icon filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('icon', function() {
		var icons = {
				tasks: 'icon-check',
				files: 'icon-doc',
				records: 'icon-doc-inv',
				reviews: 'icon-star',
				events: 'icon-calendar',
				notes: 'icon-comment'
			},
			files = {
				img: 'icon-file-image',
				doc: 'icon-doc-text',
				aud: 'icon-file-audio',
				vid: 'icon-file-video',
				txt: 'icon-doc',
				jav: 'icon-doc',
				gen: 'icon-doc'
			},
			legacy = {
				question: 'icon-help-circled',
				task: 'icon-check',
				reply: 'icon-comment',
				'private message': 'icon-chat',
				file: 'icon-doc',
				link: 'icon-link',
				entry: 'icon-edit',
				record: 'icon-doc',
				'record-activity': 'icon-doc',
				email: 'icon-envelope',
				review: 'icon-star',
				'event': 'icon-calendar',
				note: 'icon-comment'
			},
			models = {
				Event: icons.events,
				File: icons.files,
				FormRecord: icons.records,
				Note: icons.notes,
				Task: icons.tasks
			};
		return function(input) {
			return icons[input] || files[input] || models[input] || legacy[input] || 'icon-help-circled';
		};
	})
	/**
	 * State filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('state', ['$rootScope', function($rootScope) {
		return function(input) {
			if ($rootScope.states) {
				angular.forEach($rootScope.states, function(state) {
					if (input === state.id) {
						input = state.state;
						return false;
					}
				});
			}
			return input;
		};
	}])
	/**
	 * Country filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('country', ['$rootScope', function($rootScope) {
		return function(input) {
			if ($rootScope.countries) {
				angular.forEach($rootScope.countries, function(country) {
					if (input === country.id) {
						input = country.country;
						return false;
					}
				});
			}
			return input;
		};
	}])
	/**
	 * Activity action filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('activityAction', function() {
		return function(activity) {
			var action = '';
			switch (activity.action) {
				case 'create':
					if (activity.resource === 'files') {
						action = 'uploaded';
					} else if (activity.resource === 'tasks' || activity.resource === 'notes' || activity.resource === 'members' ) {
						action = 'added';
					} else if (activity.resource === 'replies') {
						action = 'replied';
					} else if (activity.resource === 'invitees') {
						action = 'invited';
					}
					else {
						action = 'created';
					}
					break;
				case 'read': action = 'read'; break;
				case 'update': action = 'updated'; break;
				case 'delete': action = 'deleted'; break;
				default: break;
			}
			return action;
		};
	})
	/**
	 * Activity headline filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('activityHeadline', function() {
		return function(activity) {
			var resourceTypeFields = {notes: "note", files: "file", tasks: "task", events: "event", replies: "reply", records: "record", invitees: "workspaceInvitee", members: "workspaceMember"};
			var nameFields = {notes: "body", files: "name", tasks: "task", events: "event", replies: "body", records: "name", invitees: "email", members: "id"};
			var resource;
			if (!activity.resource && !activity.record) {
				resource = "note";
			}
			else {
				resource = activity.resource;
				if (activity.resource == 'members') {
					if (activity.action == 'create') {
						return "New Member Added";
					}
					else if (activity.action == 'update') {
						return "Member Updated";
					}
					else if (activity.action == 'delete') {
						return "Member Deleted";
					}
				}
				else {
					return activity[resourceTypeFields[resource]][nameFields[resource]]; }
				}
		};
	})
	/**
	 * Activity resource filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('activityResource', function() {
		return function(activity) {
			var resourceTypeFields = {files: "file", tasks: "task", events: "event", replies: "reply", records: "record", invitees: "workspaceInvitee", members: "workspaceMember", notes: "note"};
			var resource = activity.resource;
			if (resourceTypeFields[resource] && activity[resourceTypeFields[resource]]) {
				return activity[resourceTypeFields[resource]].id;
			} else {
				return null;
			}
		};
	})
	/**
	 * Activity type filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('activityType', function() {
		return function(activityResource) {
			var type = '';
			switch (activityResource) {
				case 'files': type = 'file'; break;
				case 'tasks': type = 'task'; break;
				case 'events': type = 'event'; break;
				case 'records': type = 'record'; break;
				case 'notes': type = 'comment'; break;
				case 'replies': type = 'reply'; break;
				case 'invitees': type = 'member'; break;
				case 'members': type = 'member'; break;
				default: break;
			}
			return type;
		};
	})
	/**
	 * Parse Plugin Types Into Human Readable Format
	 *
	 * @param	{String}	userType
	 * @author Anna Parks
	 * @since 0.5.47
	 */
	.filter('pluginTypes', function() {
		return function(pluginTypes) {

			var types = {
				'full-page': 'Full Page',
				'inline': 'Inline',
				'record-overlay': 'Record',
				'settings': 'Settings'
	//			'server': 'Server'
			};

			if (pluginTypes && pluginTypes.length) {
				return pluginTypes.filter(function(type) {
					return types[type];
				}).map(function(type) {
					return types[type];
				}).join(',');
			}

			return '---';
		};
	})
	/**
	 * Simple resource ID filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('simpleResourceId', function() {
		return function(activity) {
			var srId;
			if (activity.resource === "notes") {
				if (activity.note.record.id) {
					srId = activity.note.record.id;
				} else if (activity.note.resource) {
					srId = activity.note.resourceId;
				}
				else {
					srId = activity.note.id;
				}
			} else if (activity.resource === "files") {
				if (activity.file.record.id) {
					srId = activity.file.record.id;
				} else if (activity.file.resource) {
					srId = activity.file.resourceId;
				}
				else {
					srId = activity.file.id;
				}
			} else if (activity.resource === "members") {
				srId = activity.workspaceMember.user.id;
			} else if (activity.resource === "invitees") {
				srId = activity.workspaceMember.user.id;
			} else {
				srId = activity.resourceId;
			}
			return srId;
		};
	})
	/**
	 * Activity text filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('activityText', ['$filter', function($filter) {
		var resourceLabels = {
			FormRecord: 'Record',
			notes: 'Comment'
		};
		return function(activity) {
			if (activity.type === 'note') {
				return 'Comment';
			} else {
				var resourceLabel = $filter('capitalize')($filter('singularize')(resourceLabels[activity.resource] || activity.resource));
				return resourceLabel + ' ' + $filter('activityAction')(activity);
			}
		};
	}])
	/**
	 * Activity label filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('activityLabel', ['$filter', function($filter) {
		return function(activity) {
			var label;
			switch (activity.type) {
				case 'events':
					label = activity.event;
					break;
				case 'files':
					label = activity.name + '.' + activity.extension;
					break;
				case 'notes':
					label = activity.body || activity.note.body;
					break;
				case 'tasks':
					label = activity.task;
					break;
				default:
					label = $filter('activityText')(activity);
			}
			return label;
		};
	}])
	.filter('eventDateTime', ['userDateFilter', function(userDateFilter) {
		/**
		 * Event date time filter - displays date/time range for an event
		 *
		 * @author	Paul W. Smith <paul@wizehive.com>
		 * @since	0.5.58
		 * @param	{Object}	Zengine event object
		 * @returns	{String}
		 */
		return function eventDateTime(event) {
			if (!event.start || !event.end) {
				return;
			}
			var startDate = moment(event.start);
			var endDate = moment(event.end);
			var isSameDay = startDate.isSame(endDate, 'day');
			var output = '';

			if (event.isAllDay) {
				output += 'All day | ';
			}

			output += _getDate(startDate) + _getTime(startDate);
			if (isSameDay && event.isAllDay) {
				// Don't show separate end time
				return output;
			}

			output += ' - ';
			if (!isSameDay) {
				output += _getDate(endDate);
			}
			output += _getTime(endDate);
			return output;

			// Local utility function - get formatted date or 'Today' as appropriate
			function _getDate(input) {
				if (input.isSame(moment(), 'day')) {
					return 'Today';
				} else {
					return userDateFilter(input);
				}
			}

			// Local utility function - get formatted time, or empty string if all-day (no time)
			function _getTime(input) {
				if (event.isAllDay) {
					return '';
				} else {
					return input.format(' h:mm a');
				}
			}

		};
	}])
	/**
	 * Field array value filter
	 *
	 * @author Unknown
	 * @since 0.x.x
	 */
	.filter('fieldArrayValue', function() {
		return function(response) {
			if (angular.isArray(response)) {
				return response.join(', ');
			}
			return response;
		};
	})
	/**
	 * Returns true if input is a non-empty object
	 *
	 * @author	Anna Parks <anna@wizehive.com>
	 * @since 0.5.61
	 * @param {Null|Object} object
	 * @returns {boolean}
	 */
	.filter('nonEmpty', function() {
		return function(object) {
			return !!(object && Object.keys(object).length > 0);
		};
	})
	/**
	 * Record Name with Form Name
	 *
	 * @author	Wes DeMoney <wes@wizehive.com>
	 * @since	0.5.31
	 */
	.filter('recordFormName', ['$rootScope', '$routeParams', function($rootScope, $routeParams) {
		return function(record) {

			if (!record.name) {
				return '';
			}

			if (!record.form.id) {
				return record.name;
			}

			var response = record.name,
				formName = false;

			if ($routeParams.workspace_id) {

				angular.forEach($rootScope.workspace.forms, function(form) {

					if (record.form.id === form.id) {
						formName = form.singularName;
					}

				});

			}
			else {

				angular.forEach($rootScope.workspaces, function(workspace) {

					if (record.workspace && record.workspace.id === workspace.id) {

						angular.forEach(workspace.forms, function(form) {

							if (record.form.id === form.id) {
								formName = form.singularName;
							}

						});

					}

				});

			}

			if (formName) {
				response = response + ' (' + formName + ')';
			}

			return response;
		};
	}])
	/**
	 * Role Name By Id
	 *
	 * @author	Everton Yoshitani <wes@wizehive.com>
	 * @since	0.5.34
	 */
	.filter('roleNameById', ['$rootScope', function($rootScope) {
		return function(roleId) {
			var name = roleId;
			angular.forEach($rootScope.workspace.roles, function(role) {
				if (role.id === roleId) {
					name = role.name;
				}
			});
			return name;
		};
	}])
	/**
	 * Field title - name if present, otherwise label
	 *
	 * @author	Paul W. Smith <paul@wizehive.com>
	 * @since	0.5.36
	 */
	.filter('formFieldTitle', function() {
		return function(field) {
			return (field && field.name || field && field.label || field);
		};
	})

	/**
	 * Title Case
	 *
	 * @see  https://gist.github.com/maruf-nc/5625869
	 * @since  0.5.41
	 */
	.filter('titleCase', function() {
		return function (input) {
			var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

			return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {

				if (index > 0 && index + match.length !== title.length &&
					match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
					(title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
					title.charAt(index - 1).search(/[^\s-]/) < 0) {
					return match.toLowerCase();
				}

				if (match.substr(1).search(/[A-Z]|\../) > -1) {
					return match;
				}

				return match.charAt(0).toUpperCase() + match.substr(1);
			});
		};
	})

	/**
	 * Trim
	 *
	 * @see  https://github.com/willmendesneto/keepr/blob/master/app/scripts/filters/trim.js
	 * @since  0.5.41
	 */
	.filter('trim', function () {
		return function (input) {
			var str;
			if (input === undefined || input === null) {
				input = '';
			}
			str = String(input);
			if (String.prototype.trim !== null) {
				return str.trim();
			} else {
				return str.replace(/^\s+|\s+$/gm, '');
			}
		};
	})

	/**
	 * Camel case
	 *
	 * @see https://github.com/willmendesneto/keepr/blob/master/app/scripts/filters/camelcase.js
	 * @since  0.5.41
	 */
	.filter('camelCase', ['$filter', function ($filter) {
		return function (input, firstWordWithCase) {

			if (input === null || input === undefined) {
				input = '';
			}

			var $trim = $filter('trim');

			// First character with camel case
			if (!!firstWordWithCase) {
				input = $filter('capitalize')(input);
			}

			return $trim(input).replace(/[-_\s]+(.)?/g, function(match, c) {
				return c.toUpperCase();
			});
		};
	}])

	/**
	 * kebab-case
	 *
	 * @see https://gist.github.com/thevangelist/8ff91bac947018c9f3bfaad6487fa149#gistcomment-2986430
	 * @since  2.23.0
	 */
	.filter('kebabCase', ['$filter', function ($filter) {
		return function (input) {
			if (input === null || input === undefined) {
				input = '';
			}

			var $trim = $filter('trim');

			return $trim(input)
				.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
				.filter(Boolean)
				.map(function (x) { return x.toLowerCase(); })
				.join('-');
		};
	}])

	/**
	 * Numeric Value Filter
	 *
	 * Formats a numeric value for display based on form field settings
	 *
	 * @param	{number}
	 * @param	{object} form field
	 * @returns {string}
	 */
	.filter('znNumericValue', ['$filter', function($filter) {

		return function(amount, field) {

			var properties = {},
				decimal = 0,
				result = '',
				bn;

			if (field && field.settings && field.settings.properties) {
				properties = field.settings.properties;
			}

			if (properties.decimal) {
				decimal = properties.decimal;
			}

			try {
				bn = new BigNumber(amount);
			}
			catch (err) {
				return '';
			}

			// Use Absolute Value for Currency Formatting
			var isNegative = bn.isNegative();

			if (isNegative) {
				bn = bn.abs();
			}

			// Format as string '1,234.56', to decimal places
			result = bn.toFormat(decimal);

			// Prepend Currency Symbol
			if (properties.currency) {

				var symbol = $filter('znCurrencySymbol')(properties.currency);

				result = symbol + result;

			}

			// Prepend Sign if Negative
			if (isNegative) {
				result = '-' + result;
			}

			return result;

		};

	}])
	/**
	 * Currency Symbol from Currency Code
	 *
	 * @param	{string}	code
	 * @returns {string}	symbol
	 */
	.filter('znCurrencySymbol', [function() {

		return function(code) {

			var symbol = '';

			angular.forEach(wizehive.config('currencies'), function(currency) {
				if (currency.id == code) {
					symbol = currency.symbol;
				}
			});

			return symbol;

		};

	}])
	/**
	 * Presentation Text Filter
	 *
	 * Formats a presentation text field for display based on form field settings
	 *
	 * @param	{object} form field
	 * @returns {string}
	 */
	.filter('znPresentationalText', ['$filter', function($filter) {

		return function(field) {

			var znMarkdown = $filter('znMarkdown'),
						label = '',
						properties = {},
						result;

			if (field && field.label) {
				label = field.label;
			}

			if (field && field.settings && field.settings.properties) {
				properties = field.settings.properties;
			}

			if (properties.markdown) {
				result = znMarkdown(label);
			} else {
				result = label;
			}

			return result;

		};

	}])
	/**
	 * Markdown Filter
	 *
	 * Sanitize markdown, strips input HTML tags, and renders Markdown
	 *
	 * @param	{markdown}
	 * @returns {html}
	 */
	.filter('znMarkdown', ['$filter', '$showdown', function($filter, $showdown) {

		return function(markdown) {

			if (!markdown) {
				return markdown;
			}

			var sanitizeMarkdown = $filter('sanitizeMarkdown');

			return $showdown.makeHtml(sanitizeMarkdown($showdown.stripHtml(markdown)));

		};

	}])
	/**
	 * Sanitize un-safe/unsupported markdown
	 */
	.filter('sanitizeMarkdown', function () {
		return function (str) {

			if (!str) {
				return '';
			}

			// Images
			var  escapeImageLink = function(wholeMatch, altText, linkId, url, width, height, m5, title) {
				return '<div>'+wholeMatch+'</div>';
			};

			var inlineImageRegex = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g;
			var crazyImageRegex = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g;
			var base64ImageRegex = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g;
			var referenceImageRegex = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g;
			var shortcutImageRegex = /!\[([^\[\]]+)]()()()()()/g;

			str = str.replace(inlineImageRegex, escapeImageLink);
			str = str.replace(crazyImageRegex, escapeImageLink);
			str = str.replace(base64ImageRegex, escapeImageLink);
			str = str.replace(referenceImageRegex, escapeImageLink);
			str = str.replace(shortcutImageRegex, escapeImageLink);

			// Auto Links
			var escapeAutoLink = function (wholeMatch, leadingMagicChars, url, m2, m3, trailingPunctuation, trailingMagicChars) {
				if (url && (url.substring(0, 8) == "https://")) {
					return wholeMatch;
				} else {
					return '<div>'+wholeMatch+'</div>';
				}
			};

			var simpleAutoLinkRegex  = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi;
			var simple2AutoLinkRegex = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi;
			var delimAutoLinkRegex   = /()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi;
			var mailAutoLinkRegex = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gmi;
			var delimMailRegex  = /<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi;

			str = str.replace(simpleAutoLinkRegex, escapeAutoLink);
			str = str.replace(simple2AutoLinkRegex, escapeAutoLink);
			str = str.replace(delimAutoLinkRegex, escapeAutoLink);
			str = str.replace(mailAutoLinkRegex, escapeAutoLink);
			str = str.replace(delimMailRegex, escapeAutoLink);

			// Links
			var escapeLink = function (wholeMatch, linkText, linkId, url, m5, m6, title) {
				if (url && (url.substring(0, 8) == "https://")) {
					return wholeMatch;
				} else {
					return '<div>'+wholeMatch+'</div>';
				}
			};

			var referenceLinkRegex = /\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g;
			var crazyLinkRegex = /\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g;
			var normalLinkRegex = /\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g;
			var shortcutLinkRegex = /\[([^\[\]]+)]()()()()()/g;
			var mentionLinkRegex = /(^|\s)(\\)?(@([a-z\d\-]+))(?=[.!?;,[\]()]|\s|$)/gmi;
			var referencesLinkRegex = /\[([^\[\]]+)]:[ \t]*()(.*)()()()/g;

			str = String(str);
			//str = str.replace(referenceLinkRegex, escapeLink);
			str = str.replace(crazyLinkRegex, escapeLink);
			str = str.replace(normalLinkRegex, escapeLink);
			//str = str.replace(shortcutLinkRegex, escapeLink);
			//str = str.replace(mentionLinkRegex, escapeLink);
			str = str.replace(referencesLinkRegex, escapeLink);

			return str;
		};
	})/**
	* Force secure links
	*/
	.filter('secureLinks', function () {
		return function (str) {
			return String(str).replace(/http\:\/\//ig, 'https://');
		};
	})
	/**
	 * Escape HTML Simplified Version. It only escape </> characters.
	 * It is based on the original escapeHtml filter but only escape the tags
	 * @author Juan Scarton <juan.scarton@wizehive.com>
	 * @since 2.5.1
	 */
	.filter('escapeHtmlTags', function() {

		var entityMap = {
			"<": "&lt;",
			">": "&gt;",
			"/": '&#x2F;'
		};

		return function(str) {
			return String(str).replace(/[<>\/]/g, function (s) {
				return entityMap[s];
			});
		};

	})
	/**
	 * Fix escaped HTML issues on ui-select
	 * @author Juan Scarton <juan.scarton@wizehive.com>
	 * @since 2.5.3
	 */
	.filter('uiSelectHighlightFixChars', function() {

		return function(str) {
			return String(str)
				.replace(/\&<span class=\"ui-select-highlight\">(l|g)<\/span>t\;/g, '\&$1t;')
				.replace(/\&<span class=\"ui-select-highlight\">(lt|gt|#x2F)<\/span>\;/g, '\&$1;')
				.replace(/\&<span class=\"ui-select-highlight\">(lt\;|gt\;|\#x2F\;)<\/span>/g, '\&$1')
				.replace(/\&(l|g)<span class=\"ui-select-highlight\">t<\/span>\;/g, '\&$1t;')
				.replace(/\&(lt|gt|\#x2F)<span class=\"ui-select-highlight\">\;<\/span>/g, '\&$1;')
				.replace(/<span class=\"ui-select-highlight\">\&<\/span>(lt\;|gt\;|\#x2F\;)/g, '\&$1')
				.replace(/<span class=\"ui-select-highlight\">\&(l|g)<\/span>t\;/g, '\&$1t;')
				.replace(/<span class=\"ui-select-highlight\">\&(lt|gt|#x2F)<\/span>\;/g, '\&$1;')
				.replace(/<span class=\"ui-select-highlight\">\&(lt\;|gt\;|#x2F\;)<\/span>/g, '\&$1')
				.replace(/<span class=\"ui-select-highlight\">\&\#<\/span>x2F\;/g, '\&#x2F;')
				.replace(/<span class=\"ui-select-highlight\">\&\#x<\/span>2F\;/g, '\&#x2F;')
				.replace(/<span class=\"ui-select-highlight\">\&\#x2<\/span>F\;/g, '\&#x2F;')
				.replace(/<span class=\"ui-select-highlight\">\&\#x2F<\/span>\;/g, '\&#x2F;')
				.replace(/\&<span class=\"ui-select-highlight\">\#<\/span>x2F\;/g, '\&#x2F;')
				.replace(/\&<span class=\"ui-select-highlight\">\#x<\/span>2F\;/g, '\&#x2F;')
				.replace(/\&<span class=\"ui-select-highlight\">\#x2<\/span>F\;/g, '\&#x2F;')
				.replace(/\&<span class=\"ui-select-highlight\">\#x2F<\/span>\;/g, '\&#x2F;')
				.replace(/\&<span class=\"ui-select-highlight\">\#x2F\;<\/span>/g, '\&#x2F;')
				.replace(/\&\#<span class=\"ui-select-highlight\">x<\/span>2F\;/g, '\&#x2F;')
				.replace(/\&\#<span class=\"ui-select-highlight\">x2<\/span>F\;/g, '\&#x2F;')
				.replace(/\&\#<span class=\"ui-select-highlight\">x2F<\/span>\;/g, '\&#x2F;')
				.replace(/\&\#<span class=\"ui-select-highlight\">x2F\;<\/span>/g, '\&#x2F;')
				.replace(/\&\#x<span class=\"ui-select-highlight\">2<\/span>F\;/g, '\&#x2F;')
				.replace(/\&\#x<span class=\"ui-select-highlight\">2F<\/span>\;/g, '\&#x2F;')
				.replace(/\&\#x<span class=\"ui-select-highlight\">2F\;<\/span>/g, '\&#x2F;')
				.replace(/\&\#x2<span class=\"ui-select-highlight\">F<\/span>\;/g, '\&#x2F;')
				.replace(/\&\#x2<span class=\"ui-select-highlight\">F\;<\/span>/g, '\&#x2F;');
		};
	})
	/**
	 * Escape HTML
	 *
	 * http://stackoverflow.com/questions/14462612/escape-html-text-in-an-angularjs-directive/28537958#28537958
	 */
	.filter('escapeHtml', function() {

		var entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;'
		};

		return function(str) {
			return String(str).replace(/[&<>"'\/]/g, function (s) {
				return entityMap[s];
			});
		};

	})
	/**
	 * Field Name
	 *
	 * Get field name from field id
	 *
	 * @param	{Number}	fieldId
	 * @returns {String}
	 */
	.filter('fieldName', function() {
		return function(fieldId) {
			return 'field' + fieldId;
		};
	})
	.filter('znUserDate', ['userDateFilter', function (userDateFilter) {
		return userDateFilter;
	}]);
}

export default {
	Filters
}