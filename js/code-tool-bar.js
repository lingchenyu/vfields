$(function(){
	var single = {
		codePrettifyToolbar: function(lang) {
			var _lang;
			switch( lang.toLowerCase() ) {
				case 'js':
				case 'javascript':
					_lang = 'JavaScript';
					break;
				case 'java':
				case 'python':
				case 'shell':
					_lang = lang.charAt(0).toUpperCase().concat(lang.toLowerCase().slice(1));
					break;
				case 'bash':
					_lang = 'Shell';
					break;
				case 'c':
					_lang = 'C';
					break;
				case 'html': 
				case 'css': 
				case 'xml':
				case 'cpp':
					_lang = lang.toUpperCase();
					break;
                case 'txt':
                case 'plain':
                    _lang = 'txt';
                    break;
				default:
					_lang = lang; 
			}

			var toolbar = '<div class="code-pretty-toolbar">' +
							'<span class="title">' + _lang + '</span>' +
							'<a href="javascript:void(0);" title="复制代码" class="tool clipboard"><i class="fa fa-files-o"></i></a>' +
							'<span class="msg"></span>' +
						  '</div>';

			return toolbar;
		},
		//获取代码文本
		getPrettifyCode: function($container) {
			code = [];

			// 组合代码
			$container.find('li').each(function() {
				code.push( $(this).text() );
			});
			// using \r instead of \r or \r\n makes this work equally well on IE, FF and Webkit
			code = code.join('\r');
			// For Webkit browsers, replace nbsp with a breaking space
			code = code.replace(/\u00a0/g, " ");

			return code;
		},
		//代码高亮工具栏功能
		codePrettifyToolbarAction: function() {
			/* 复制代码 */
			_this = this;
			var clipboard = new Clipboard('.clipboard', {
				text: function(e) {
					$container = $(e).parent().parent();
					return _this.getPrettifyCode($container);
				}
			});
			clipboard.on('success', function(e) {
				$container = $(e.trigger).parent().parent();
				$container.find('.msg').hide().text('已复制.').stop().fadeIn(300).delay(1500).fadeOut(500);
			});

			clipboard.on('error', function(e) {
				$container = $(e.trigger).parent().parent();
				$container.find('.msg').hide().text('暂不支持当前浏览器，请手动复制.').stop().fadeIn(300).delay(3000).fadeOut(500);
			});
		},
		// 代码高亮 Google Code Prettify
		codePrettify: function() {
			/* 更改 pre 的 class，增加 toolbar */
			var _this = this;
			$('pre icode').each(function() {
				var lang = $(this).attr('class');
				if (lang) {
					var code = $(this).html();
					$(this).parent().attr('class', 'prettyprint linenums lang-' + lang).html(code)
							.wrap('<div class="code-pretty-container"></div>')
							.parent().append( _this.codePrettifyToolbar(lang) );
				}
			});
			prettyPrint();
			_this.codePrettifyToolbarAction();
		},
		init: function() {
			var _this = this;
				_this.codePrettify();
		}
	}
	single.init();
})