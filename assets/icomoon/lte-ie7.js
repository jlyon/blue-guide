/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-cog' : '&#xf013;',
			'icon-caret-right' : '&#xf0da;',
			'icon-caret-down' : '&#xf0d7;',
			'icon-search' : '&#xf002;',
			'icon-location' : '&#xe000;',
			'icon-disability' : '&#xe006;',
			'icon-other' : '&#xe005;',
			'icon-access' : '&#xe004;',
			'icon-mentalbehavioural' : '&#xe003;',
			'icon-alltypes' : '&#xe001;',
			'icon-generalhealth' : '&#xe002;',
			'icon-dentaloral' : '&#xe008;',
			'icon-spinner' : '&#xe009;',
			'icon-directions' : '&#xe007;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};