/**
 *	jQuery.h5form - HTML5 Forms Plugin
 *	Version -laster / English
 *
 *	Author: by Yoshiyuki Mikomde http://www.rapidexp.com/h5form
 *
 *	Copyright (c) 2012 - 2013 Yoshiyuki Mikome (http://www.rapidexp.com)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */
(function($) {

	$.fn.h5form = function(options) {
		// Check UA
		var ua = window.navigator.userAgent.toLowerCase(),
			msie = parseInt(ua.replace(/.*msie (\d+).*/, "$1")),
			firefox = parseInt(ua.replace(/.*firefox\/(\d+).*/, "$1")),
			chrome = parseInt(ua.replace(/.*chrome\/(\d+).*/, "$1")),
			opera = parseInt(ua.replace(/.*opera[\/ ](\d+).*/, "$1")),	// "opara/9.80" or "opera 10.10"
			safari = parseInt(ua.replace(/.*version\/(\d+).*safari.*/, "$1")),	// "Version/5.0 Safari/533.16"
			android = (navigator.userAgent.search(/Android/) != -1);

		var outerHTML = function(ui) {
			// Firefox 10 or earlier does not have outerHTML
			var obj = ui.get(0);
			return obj.outerHTML || new XMLSerializer().serializeToString(obj);
		};

		//default configuration properties
		var defaults = {
//# REQUIRED|PATTERN|NUMBER|DATETIME|EMAILURL|MAXLENGTH
			exprResponse: '.h5form-response, .h5form-reversed',
			exprBehind: '.h5fom-behind',
			styleErr: { backgroundColor: 'mistyrose' },
//# REQUIRED
			msgEmpty: 'Please enter this field.',
			msgUnselct: 'Please select an item.',
			msgUncheck: 'Please check this checkbox.',
//# PATTERN
			msgPattern: 'Does not match the required pattern.',
//# EMAILURL
			msgEmail: 'E-mail address is not correct.',
			msgUrl: 'URL is not correct.',
//# PLACEHOLDER
			colorOff: '#a1a1a1',
//# MAXLENGTH
			msgMaxlen: 'Too many # characters.',
//# NUMBER|DATETIME
			msgInvalid: 'Value is invalid.',
			msgMin: 'Please be greater than or equal to #.',
			msgMax: 'Please be less than or equal to #.',
//# NUMBER
			addSpin: true,
			classSpinNumber: 'h5form-spinNumber',
			classRange: 'h5form-range',
//# DATETIME
			classSpinTime: 'h5form-spinTime',
			classDatetime: 'h5form-datetime',
			datepicker: { },
//#
			hasOptions: [],
			dynamicHtml: '.h5form-dynamic'
		};
		var opts = $.extend({}, defaults, options);

		// Test browser
		var test1 = $('<input>').hide().appendTo($('body')).get(0),
			test2 = $('textarea:first').get(0) || new Object(),
//# REQUIRED|PATTERN|NUMBER|DATETIME|EMAILURL|MAXLENGTH
			hasCustomValidity = ('setCustomValidity' in test1) && !android,
			hasAppendTitle = chrome || (msie > 9),
//# AUTOFOCUS
			hasAutofocus = ('autofocus' in test1),
//# REQUIRED
			hasRequired = ('required' in test1) && !android,
			hasPattern = ('pattern' in test1) && !android,
//# EMAILURL
			hasEmail = hasUrl = hasCustomValidity && hasPattern && !android, // maybe
//# PLACEHOLDER
			hasPlaceholder = ('placeholder' in test1),
//# NUMBER
			hasNumber = hasSpin = hasRange =
				('step' in test1) && ('min' in test1) && !android && !firefox,
//# DATETIME
			hasDateTime = (opera>=9),
			hasDate = hasDateTime || chrome > 21,
			hasTime = hasDateTime || chrome > 22,
//# MAXLENGTH
			hasMaxlength = ('maxLength' in test2),
//# FORM
			hasFormAttr = ('form' in test1) && ('formAction' in test1) && !android,
//# AUTOCOMPLETE
			hasDatalist = ('autocomplete' in test1) && ('list' in test1),
//#
			hasBugButton = (msie && msie < 8);
			hasBugEnter = (msie && msie < 9) || android;

		for (i = opts.hasOptions.length-1; i >= 0; i--) {
			eval(opts.hasOptions[i] + '=true;');
		}

		$('input:last').remove();

		var validatable = ':input:enabled:not(:button, :submit)';
//# REQUIRED|PATTERN|NUMBER|DATETIME|EMAILURL|MAXLENGTH
		// clear balloons
		$(validatable).click(function() {
			$(this).siblings(opts.exprResponse).remove();
			$(opts.exprBehind).removeAttr('disabled');
		});
		$(document).on('click', opts.exprResponse, function() {
			$(this).remove();
		});
//#
		var getAttr = function (ui, name) {
			var attr = ui.attr(name);
			return (attr == undefined) ? '' : attr;
		};

//# REQUIRED|PATTERN|NUMBER|DATETIME|EMAILURL|MAXLENGTH
		/**
		 * Change Type
		 * @param {string} type -- type.
		 * @return {object} -- this.
		 */
		var typeTo = function(ui, type) {
			var	at = ui.get(0).attributes,
			ui2 = $('<input type="'+type+'">');

			for(i = at.length-1; i>=0; i--) {
				name = at[i].nodeName;
				value = at[i].nodeValue;
				if (name && value) {
					if (name == 'type') {
						type = value;	// original type for additional class
					} else {
						ui2.attr(name, value);
					}
				}
			}
			ui2.addClass('h5form-'+type);

			return ui2.replaceAll(ui);
		};

		/**
		 * Check validity of the element
		 * @param {object} ui -- element
		 * @return {bool} -- valid
		 */
		$.fn.h5form.checkValidity = function(ui) {
			if (hasCustomValidity) {
				return ui.get(0).checkValidity();
			} else {
				return (!ui.data('customValidity'));
			}
		};

		/**
		 * Set a custom validity to the elements
		 * @param {string} message -- message.
		 * @return {object} -- this.
		 */
		var $firstTime = true;
		var $novalidate = false;
		$.fn.h5form.setCustomValidity = function(ui, message) {
			if ($novalidate) message = '';	// null is invalid in opera
			if (ui.is(validatable)) {
				// Add a title to the message
				if (!hasAppendTitle && message && (title = getAttr(ui, 'title'))) {
					message += '\n' + title;
				}
				// Set a custon validity
				if (hasCustomValidity) {
					ui.get(0).setCustomValidity(message);
				} else {
					if (message) {
						ui.data('customValidity', message.replace(/\n/, '<br />'));
					} else {
						ui.removeData('customValidity');
					}

					if (!$firstTime && opts.styleErr) {
						if (message) {
							ui.css(opts.styleErr);
						} else {
							for (key in opts.styleErr) {
								ui.css(key, '');
							}
						}
					}
				}
			}
			return ui;
		};

//#
		// for each form
		return $(this).each(function() {

			//Private properties
			var form = $(this),
//# AUTOFOCUS
				elmAutofocus,
//# PLACEHOLDER
				elmPlaceholder = new Array(),
//#
				validatableElements = form.find(validatable);

			// form.attr('novalidate') result undefined,
			// when from has simply "novalidate" rather than "novalidate='novalidate'"
			$novalidate = !!outerHTML(form).match(/^[^>]+ novalidate/);

//# NUMBER|DATETIME
			/**
			 * Spin number or time
			 * @param {bool} -- isDown.
			 * @return {object} -- this.
			 */
			var spin = function(ui, isDown) {
				var	isNumber = (ui.hasClass('h5form-number')),
					min = attr2num(ui, 'min', (isNumber) ? '' : 0),
					max = attr2num(ui, 'max', (isNumber) ? '' : 86400),
					step = attr2num(ui, 'step', (isNumber) ? 1 : 60),
					base = (isNumber) ? min : 0,
					val = (isNumber) ? Number(ui.val()) : str2sec(ui.val(), true);

				val = val - ((val - base) % step) + step * ((isDown) ? -1 : 1);

				if (max != '' && val > max) val = max;
				if (min != '' && val < min) val = min;

				ui.val((isNumber) ? val : sec2str(val, step % 60, true));
				return ui;
			};
//#

			/**
			 * For each control function
			 * @return {object} -- this.
			 */
			var initControl = function(elm, firstTime) {
				$firstTime = firstTime;

				return elm.each(function() {

					var ui = $(this),
						type = getAttr(ui, 'type').toLowerCase();

//# AUTOFOCUS
					// Is autofoucs
					if (!hasAutofocus && !elmAutofocus && getAttr(ui, 'autofocus')) {
						elmAutofocus = ui;
					}
//# PLACEHOLDER
					// Focus and blur attach for Placeholder
					var placeholder = getAttr(ui, 'placeholder');

					if (!hasPlaceholder && placeholder && type != 'password') {
						elmPlaceholder.push(ui);

						var evFocus = (function() {
							if (ui.val() == placeholder) {
								ui.attr('value', '').css('color', '');
							}
						});
						ui.unbind('focus', evFocus).focus(evFocus);

						var evBlur = (function() {
							if (ui.val() == '' || ui.val() == placeholder) {
								ui.val(placeholder).css('color', opts.colorOff);
							}
						});
						ui.unbind('blur', evBlur).blur(evBlur).blur();
					}

//# NUMBER|DATETIME
					// Spin button
					if (
//# NUMBER
						(!hasSpin && type == 'number') ||
//# DATETIME
						(!hasTime && type == 'time') ||
//# NUMBER|DATETIME
						false) {
						var className, allow;
						ui = typeTo(ui, 'text');
						switch (type) {
//# NUMBER
						case 'number':
							className = opts.classSpinNumber;
							allow = [8, 9, 35, 36, 37, 39, 46, 190];
							break;
//# DATETIME
						default:
							className = opts.classSpinTime;
							allow = [8, 9, 35, 36, 37, 39, 46, 59, 186, 190];
							break;
//# NUMBER|DATETIME
						}

						// Keydown event attach
						var evKeydown = (function(ev) {
							var cc = ev.charCode || ev.keyCode;
							if (cc == 38) spin(ui, 0);
							if (cc == 40) spin(ui, 1);
							if (($.inArray(cc, allow) >= 0) || (cc >= 48 && cc <= 57)) return true;
							return false;
						});
						ui.unbind('keydown', evKeydown).keydown(evKeydown);

						if (opts.addSpin) {
							ui.after('<span class="' + className + '">' +
									 '<button type="button">&and;</button>' +
									 '<button type="button">&or;</button></span>');

							// Click button
							ui.next().children().click(function() {
								spin(ui, ui.next().children().index($(this))).change();
								// change for Chrome
							});
						}
					}

//# DATETIME
					// Datepicker
					if (!hasDate && (type == 'date') && ('datepicker' in ui)) {
						var option = opts.datepicker;
						option.dateFormat = 'yy-mm-dd';
						option.minDate = getAttr(ui, 'min');
						option.maxDate = getAttr(ui, 'max');
						ui = typeTo(ui, 'text').datepicker(option);
					}

//# NUMBER
					// Slider
					if (!hasRange && (type == 'range') && ('slider' in ui)) {
						var min = attr2num(ui, 'min', 0),
							max = attr2num(ui, 'max', 100),
							step = attr2num(ui, 'step', 1),
							val = attr2num(ui, 'val', (min + max) / 2 - ((min + max) / 2 % step));

						ui.hide().after('<span class="' + opts.classRange +
										'"><div></div></span>').val(val);
						ui.next().children().slider({
							min: min, max: max, step: step, value: val,
							change: function(ev, sl) {
								ui.val($(this).slider('value'));
							}
						});
					}

//# MAXLENGTH
					// Maxlength
					if (!hasMaxlength && ui.is('textarea') &&
						(maxlength = getAttr(ui, 'maxlength'))) {
						// Keypress event attach
						var evKeypress = (function(ev) {
							var cc = ev.charCode || ev.keyCode;
							if (($.inArray(cc, [8, 9, 37, 39, 46]) < 0) &&
								(this.value.length >= maxlength)) {
								return false;
							}
							return true;
						});
						ui.unbind('keypress', evKeypress).keypress(evKeypress);
					}

//# DATETIME
					// Datetime
					if (!hasDateTime && (type == 'datetime' || type == 'datetime-local')) {
						if (!ui.next().hasClass(opts.classDatetime)) {
							var val = getLocalDatetime(ui.val()),
								min = getLocalDatetime(getAttr(ui, 'min')),
								max = getLocalDatetime(getAttr(ui, 'max')),
								tz = (type == 'datetime') ?
									'<span class="h5form-timezone">' + getTZ() + '</span>' : '';

							ui.hide().after(
								'<span class="' + opts.classDatetime + '">' +

								'<input type="date" value="' + val[0] + '"' +
								' min="' + min[0] + '" max="' + max[0] + '"' +
								' size="' + getAttr(ui, 'size') + '"' +
								' class="' + getAttr(ui, 'class') + '"' +
								' title="' + getAttr(ui, 'title') + '">' +

								'<input type="time" value="' + val[1] + '"' +
								' step="' + attr2num(ui, 'step', 60) + '"' +
								' size="' + getAttr(ui, 'size') + '"' +
								' class="' + getAttr(ui, 'class') + '"' +
								' title="' + getAttr(ui, 'title') + '">' +
								tz +
								'</span>');
//# REQUIRED|DATETIME
							if (getAttr(ui, 'required')) {
								ui.removeAttr('required');
								initControl(ui.next().children().attr('required', 'required'));
							} else {
//# DATETIME
								initControl(ui.next().children());
//# REQUIRED|DATETIME
							}
//# DATETIME
						}
					}
//# AUTOCOMPLETE
					if ((!hasDatalist) &&
						(list = getAttr(ui, 'list')) &&
						('autocomplete' in ui))
					{
						var arr = new Array();
						$('datalist#'+list).children('option').each(function () {
							arr.push($(this).val());
						});
						// Avoid conflicts with the browser
						ui.removeAttr('list');

						ui.autocomplete({
							source: arr,
							// under imput method
							search: function(ev, ui) {
								if (ev.keyCode == 229) return false;
								return true;
							}

						})
						.keyup(function(ev) {
							// output imput method
							if (ev.keyCode == 13) $(this).autocomplete('search');
						});
					}
//#

					/**
					 * Change event
					 * @return {bool} -- isNecessary.
					 */
					var evChange = (function() {

						var isNecessary = false,
							name = ui.attr('name'),
							isChecked = $('[name="'+name+'"]:checked').length,
							isEmpty = ((ui.val() == '') ||
									   (ui.is(':checkbox, :radio') && !isChecked) ||
//# PLACEHOLDER
									   (placeholder && ui.val() == placeholder) ||
//#
									   false);

//# REQUIRED|PATTERN|NUMBER|DATETIME|EMAILURL|MAXLENGTH
						// clear validity first
						$.fn.h5form.setCustomValidity($('[name="'+name+'"]'), '');	// null is invalid in opera
//#
						if (hasBugEnter && !ui.is('select, textarea, button')) {
							// Keypress event attach
							var evKeypress2 = (function(ev) {
								var cc = ev.charCode || ev.keyCode;
								if (cc == 13) {
									form.find('input:submit, button:submit').eq(0).click();
									return false;
								}
								return true;
							});
							ui.unbind('keypress', evKeypress2).keypress(evKeypress2);
							isNecessary = true;
						}
//# REQUIRED
						// Required
						if (!hasRequired && getAttr(ui, 'required')) {
							isNecessary = true;
							if (isEmpty) {
								var msg = opts.msgEmpty;
								if (ui.is('select, :radio')) msg = opts.msgUnselct;
								if (ui.is(':checkbox')) msg = opts.msgUncheck;
								$.fn.h5form.setCustomValidity(ui, msg);
								return true;
							}
						}
//# PATTERN
						// Pattern
						if (!hasPattern && (pattern = getAttr(ui, 'pattern'))) {
							isNecessary = true;
							if (!isEmpty &&
								validateRe(ui, '^(' + pattern.replace(/^\^?(.*)\$?$/, '$1') + ')$')) {
								$.fn.h5form.setCustomValidity(ui, opts.msgPattern);
								return true;
							}
						}
//# EMAILURL
						// Email
						if (!hasEmail && type == 'email') {
							isNecessary = true;
							if (!isEmpty && validateRe(ui,
							   '[\\w-\\.]{3,}@([\\w-]{2,}\\.)*([\\w-]{2,}\\.)[\\w-]{2,4}', 'i')) {
								$.fn.h5form.setCustomValidity(ui, opts.msgEmail);
								return true;
							}
						}

						// URL
						if (!hasUrl && type == 'url') {
							isNecessary = true;
							if (!isEmpty && validateRe(ui,
							   '[\\w-\\.]{3,}:\\/\\/([\\w-]{2,}\\.)*([\\w-]{2,}\\.)[\\w-]{2,4}',
							   'i')) {
								$.fn.h5form.setCustomValidity(ui, opts.msgUrl);
								return true;
							}
						}

//# MAXLENGTH
						// Maxlength
						if (!hasMaxlength && ui.is('textarea') && getAttr(ui, 'maxlength')) {
							isNecessary = true;
							if (over = validateMaxlength(ui)) {
								$.fn.h5form.setCustomValidity(ui, opts.msgMaxlen.replace(/#/, over));
								return true;
							}
						}

//# NUMBER|DATETIME
						// Number, Date, Time
						if (
//# NUMBER
							(!hasNumber && type == 'number') ||
//# DATETIME
							(!hasDateTime && (type == 'date' || type == 'time')) ||
//# NUMBER|DATETIME
							false) {
							isNecessary = true;

							// Set values to local
							var ui0 = ui, type0 = type, ui2 = ui;
//# DATETIME
							// Is this control within datetime?
							if (ui.parent().hasClass(opts.classDatetime)) {
								ui0 = ui.parent().prev();	// hidden datetime control
								type0 = getAttr(ui0, 'type').toLowerCase();	// datetime or datetime-local

								ui2 = ui.parent().children('input');	// a set of date & time
								$.fn.h5form.setCustomValidity(ui2, '');
								var i = ui2.index(ui), date = ui2.eq(0).val(), time = ui2.eq(1).val();
								if (date != '' || time != '') {
									// Complement the other control if empty
									if (date == '' || time == '') {
										var min = getLocalDatetime(getAttr(ui0, 'min'), true);	// use min value
										if (i == 0 && date != '' && time == '') { ui2.eq(1).val(min[1]); }
										if (i == 1 && time != '' && date == '') { ui2.eq(0).val(min[0]); }
										date = ui2.eq(0).val(), time = ui2.eq(1).val();
									}
									// Copy to hidden datetime control
									var val = $.trim(date + 'T' + time);
									if (type0 == 'datetime-local') {
										ui0.val(val);
									} else {
										var dt = getUTCDatetime(val);
										ui0.val(dt[0] + 'T' + dt[1]);
									}
								} else {
									ui0.val('');
								}
							}
//# NUMBER|DATETIME
							// Set validation parameters
							var pattern = '^-?\\d+\\.?\\d*$',
								min = 0,
								step = 1;
//# DATETIME
							switch (type0) {
							case 'date':
								pattern = '^\\d+-\\d+-\\d+$';
								min = '1970-01-01';
								step = 1;
								break;
							case 'time':
								pattern = '^\\d+:\\d+:?\\d*\\.?\\d*$';
								min = '00:00';
								step = 60;
								break;
							case 'datetime':
								pattern = '^\\d+-\\d+-\\d+T\\d+:\\d+:?\\d*\\.?\\d*Z$';
								min = '1970-01-01T00:00';
								step = 60;
								break;
							case 'datetime-local':
								pattern = '^\\d+-\\d+-\\d+T\\d+:\\d+:?\\d*\\.?\\d*$';
								min = '1970-01-01T00:00';
								step = 60;
								break;
							}
//# NUMBER|DATETIME
							// Perform validtions
							if (validateRe(ui0, pattern) || (validateStep(ui0, min, step))) {
								$.fn.h5form.setCustomValidity(ui2, opts.msgInvalid);
								return true;
							}
							if (validateMin(ui0)) {
								$.fn.h5form.setCustomValidity(ui2, opts.msgMin.replace(/#/, getAttr(ui0, 'min')));
								return true;
							}
							if (validateMax(ui0)) {
								$.fn.h5form.setCustomValidity(ui2, opts.msgMax.replace(/#/, getAttr(ui0, 'max')));
								return true;
							}
						}
//#
						return isNecessary;
					});

					// Test the change event, to run concurrently
					if (evChange()) {
						// Attach the change event if necessary
						ui.unbind('change', evChange).change(evChange);
					}

				});
			};
			initControl(validatableElements, true);

//# AUTOFOCUS
			if (elmAutofocus) {
				elmAutofocus.focus().select();	// focus only does not work in IE
			}
//#

			//
			// When submit
			//

			form.find('input:submit, input:image, button:submit')
				.click(function(ev) {

				if (ev.result == false) return false;	// Canceled in the previous handler

				var ui = $(this),
					validatableElements = form.find(validatable);	// Rescan becase for typeTo
//# FORM
				if (!hasFormAttr) {
					if (attr = getAttr(ui, 'formaction')) {
						form.attr('action', attr);
					}
					if (attr = getAttr(ui, 'formeenctype')) {
						form.attr('enctype', attr);
					}
					if (attr = getAttr(ui, 'formmethod')) {
						form.attr('method', attr);
					}
					if (attr = getAttr(ui, 'formtarget')) {
						form.attr('target', attr);
					}
					if (null != ui.attr('formnovalidate')) {
						form.attr('novalidate', 'novalidate');
//# REQUIRED|PATTERN|NUMBER|DATETIME|EMAILURL|MAXLENGTH
						validatableElements.each(function() {
							$.fn.h5form.setCustomValidity($(this), '');
						});
//# FORM
					}
				}
//#
				// Re-scan for dinamic controls
				initControl(form.find(opts.dynamicHtml));

//# REQUIRED|PATTERN|NUMBER|DATETIME|EMAILURL|MAXLENGTH
				// Show balloons message
				if (!hasCustomValidity) {
					var result = true;
					validatableElements.each(function() {
						if (message = $(this).data('customValidity')) {
							err = $(this);
							if (opts.styleErr) err.css(opts.styleErr);
							if (result) {
								if (!err.prev().is(opts.exprResponse)) {
									var m = opts.exprResponse.match(/^\.([^, ]+),? *\.?([^, ]*)/),
									name = ($(window).width() - err.offset().left < 300 && !!m[2]) ?
										m[2] : m[1];
									err.before('<span class="' + name + '"></span>');
									$(opts.exprBehind).attr('disabled', 'disabled');
								}
								err.prev().html('<p>' + message.replace(/\n/, '<br/>') + '</p>');
								err.focus().select();	// focus only does not work in IE
								result = false;
							}
						}
					});
					if (!result) return false;
				}
//#
				// Submit if no error

//# PLACEHOLDER
				// Clear Placeholder
				if (!hasPlaceholder) {
					for (i = elmPlaceholder.length-1; i>=0; i--) {
						if (i != undefined) {
							var elm = elmPlaceholder[i];
							if (elm.val() == getAttr(elm, 'placeholder')) {
								elm.val('');
							}
						}
					}
				}

//#
				if (hasBugButton)
				{
					// Set a value of button:submit you clicked to input:hidden.
					$('<input type="hidden" name="' + getAttr(ui, 'name') +
					  '" value="' + ui.val() + '">').appendTo(form);

					form.find('button, input:submit').attr('name', '');

					if (ui.is('button')) {
						form.find('input:submit').remove();
					}
				}
			});

		});

//# PATTERN|EMAILURL|NUMBER|DATETIME
		// Validations
		// if error, result value is true (is not zero).
		// search returns zero when first match.

		function validateRe(item, pattern, flags) {
			re = new RegExp(pattern, flags);
			return ((item.val() != '') && item.val().search(re));
		}
//# MAXLENGTH
		function validateMaxlength(item) {
			var len = item.val().length,
				max = attr2num(item, 'maxlength', 0);
			// if error, reulst value is number of overflow
			return (len && max && (len	> max)) ? len - max : 0;
		}
//# NUMBER|DATETIME
		function validateStep(item, min, step) {
			min = (getAttr(item, 'type').toLowerCase().indexOf('datetime')) ?
				attr2num(item, 'min', min) : attr2num(item, '', min);
			step = attr2num(item, 'step', step);
			var val = attr2num(item, 'val', '');
			return ((val != '') && ((val - min) % step));
		}
		function validateMin(item) {
			var val = attr2num(item, 'val', ''),
				min = attr2num(item, 'min', '');
			return ((val != '') && (min != '') && (val < min));
		}
		function validateMax(item) {
			var val = attr2num(item, 'val', ''),
				max = attr2num(item, 'max', '');
			return ((val != '') && (max != '') && (val > max));
		}

		// functions of datetime

		function attr2num(item, name, def) {
			var val = (name) ? ((name == 'val') ? item.val() : getAttr(item, name)) : def;
			if (val == undefined || val == '') val = '' + def;
//# DATETIME
			// Result seconds on unix time if the type is time
			// or resuts days on unix time if the type is date
			// because the return value is compared with the step base.
			if (val.match(/\d+-\d+-\d+[ T]\d+:\d/))
				return Date.parse(utc2js(val)) / (1000);	// seconds
			if (val.match(/\d+-\d+-\d+/))
				return Date.parse(utc2js(val)) / (1000 * 60 * 60 * 24);	// days
			if (val.match(/\d+:\d/)) return str2sec(val, true);	// seconds
//# NUMBER|DATETIME
			return Number(val);
		}
//# DATETIME
		function str2sec(str, gmt) {
			if (str.search(/\d+:\d+/)) str = '00:00';
			if (gmt) str += ' GMT';
			return Date.parse('1970/1/1 ' + str) / 1000;
		}
		function sec2str(time, sec, gmt) {
			var date = new Date(time * 1000);
			ret = (gmt) ? date.toUTCString() : toString();
			return ret.replace((sec) ? /.* (\d+:\d+:\d+).*$/ : /.* (\d+:\d+).*$/, '$1');
		}
		function getLocalDatetime(val, NullIsToday) {
			if (!val && !NullIsToday) return new Array('', '');
			// string to date for TZ
			var dt = (!val) ? new Date() : new Date(utc2js(val)),
				date = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate();

			date = date.replace(/\b(\d)\b/g, '0$1');
			var time = (val) ?
				dt.toString().replace(/.* (\d+:\d+:\d+).*$/, '$1') : '12:00';

			return new Array(date, time);
		}
		function getUTCDatetime(val) {
			// string to date for TZ
			var dt = new Date(utc2js(val)),
				date = dt.getUTCFullYear() + '-' + (dt.getUTCMonth() + 1) +
					'-' + dt.getUTCDate();

			date = date.replace(/\b(\d)\b/g, '0$1');
			var time = dt.toUTCString().replace(/.* (\d+:\d+:\d+).*$/, '$1Z');

			return new Array(date, time);
		}
		function utc2js(val) {
			return val.replace(/-/g, '/').replace(/T/, ' ').replace(/Z/, ' GMT')
				.replace(/([+-])(\d+):(\d+)/, ' GMT$1$2$3');
		}
		function getTZ()
		{
			var dt = new Date(),
				min = -1 * dt.getTimezoneOffset();

			if (min) {
				var	ret = min / 60 + ':' + min % 60;
				return ret.replace(/\b(\d)\b/g, '0$1').replace(/^(\d)/, '+$1');
			} else {
				return 'UTC';
			}
		}
//#
	};

})(jQuery);
