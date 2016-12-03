;(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD (+ global for extensions)
        define(['mvevent', 'jquery'], function (MvEvent, $) {
            return (root.MvForm = factory(MvEvent, $));
        });
    } else if (typeof exports === "object") {
        // CommonJS
        module.exports = factory(require('mvevent'), require('jquery'));
    } else {
        // Browser
        root.MvForm = factory(root.MvEvent, root.$);
    }
})(this, function (MvEvent, $) {

    var _method = {

        //初始化
        setup: function (el, options) {
            options || (options = {});
            this.$el = el instanceof $ ? el : $(el);
            if (!el || !el.length) {
                console.warn('init failed because of el can not be found.');
                throw Error('init failed because of el can not be found.');
            }
            var tagName = this.$el.get(0).tagName;
            tagName = String.prototype.toUpperCase.call(tagName);
            if (tagName === 'INPUT') {
                this.$inputs = [this.$el];
                this.$textareas = [];
            }
            else if (tagName === 'TEXTAREA') {
                this.$inputs = [];
                this.$textareas = [this.$el];
            } else if (tagName === 'FORM') {
                this.$inputs = this.$el.find('input');
                this.$textareas = this.$el.find('textarea');
            } else {
                console.warn('init failed because of el is invalid.');
                throw Error('init failed because of el is invalid');
            }
            this.errors = [];
            this.showError = options.showError;
            this.on('error', this._error, this);
            this.on('ok', this._ok, this);
            return this;
        },

        //验证
        validate: function () {
            $.each(this.$inputs, function (i, n) {
                n = n instanceof $ ? n : $(n);
                this._validate(n, this.showError);
            }.bind(this));

            $.each(this.$textareas, function (i, n) {
                n = n instanceof $ ? n : $(n);
                this._validate(n, this.showError);
            }.bind(this));
            var rtn = !this.errors.length;
            if (!rtn) {
                $('#' + this.errors[0].id).focus();
            }
            return rtn;
        },

        //验证必填
        required: function ($el, flag) {
            var val = this.value($el);
            var rtn = !!val;
            if (val instanceof Array || val instanceof FileList) {
                rtn = val.length;
            }
            this.trigger(rtn ? 'ok' : 'error', $el, 'required', flag);
            return rtn;
        },

        //验证邮件格式
        email: function ($el, flag) {
            var val = this.value($el);
            var rtn = /^[a-z\d]+(\.[a-z\d]+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$/.test(val);
            this.trigger(rtn ? 'ok' : 'error', $el, 'email', flag);
            return rtn;
        },

        //验证数字格式
        number: function ($el, flag) {
            var val = this.value($el);
            var rtn = /^[0-9]+$/.test(val);
            this.trigger(rtn ? 'ok' : 'error', $el, 'number', flag);
            return rtn;
        },

        //验证链接格式
        url: function ($el, flag) {
            var val = this.value($el);
            var rtn = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val);
            this.trigger(rtn ? 'ok' : 'error', $el, 'url', flag);
            return rtn;
        },

        //验证文件，图片
        file: function ($el, flag) {
            var rtn = true;
            var accepts = $el.attr('accept');
            if (!accepts) {
                if (rtn && flag) {
                    this.trigger('ok', $el, 'file', flag);
                }
                return rtn;
            }
            var files = this.value($el);
            var accept = '', reg = '', file;
            if (files.length) {
                file = files[0];
                accepts = accepts.split(',');
                while (accept = accepts.shift()) {
                    accept = accept.slice(accept.indexOf('/') + 1);
                    reg += '|' + $.trim(accept);
                }
                reg = reg.slice(1);
                reg = reg.replace(/\//g, '\\/');
                reg = '\\/(' + reg + ')$';
                rtn = new RegExp(reg).test(file.type);
            }
            this.trigger(rtn ? 'ok' : 'error', $el, 'file', flag);
            return rtn;
        },

        //验证文件，图片大小
        maxsize: function ($el, flag) {
            var rtn = true;
            var maxsize = this._parseInt($el.attr('maxsize'));
            if (maxsize !== null) {
                var files = this.value($el);
                var size = 0, file;
                if (files.length) {
                    file = files[0];
                    size = Math.round(file.size / 1024);
                }
                rtn = maxsize * 1024 > size;
            }
            this.trigger(rtn ? 'ok' : 'error', $el, 'maxsize', flag);
            return rtn;
        },

        //验证字符串最小字符数
        minlength: function ($el, flag) {
            var rtn = true;
            var val = this.value($el);
            var len = this._parseInt($el.attr('minlength'));
            if (len !== null) {
                rtn = (new RegExp('^.{' + len + ',}$')).test(val);
            }
            this.trigger(rtn ? 'ok' : 'error', $el, 'minlength', flag);
            return rtn;
        },

        //验证字符串最大字符数
        maxlength: function ($el, flag) {
            var rtn = true;
            var val = this.value($el);
            var len = this._parseInt($el.attr('maxlength'));
            if (len !== null) {
                rtn = (new RegExp('^.{0,' + len + '}$')).test(val);
            }
            this.trigger(rtn ? 'ok' : 'error', $el, 'maxlength', flag);
            return rtn;
        },

        //验证数字最小值
        min: function ($el, flag) {
            var rtn = this.number($el, false);
            if (rtn) {
                var min = this._parseInt($el.attr('min')) || Number.MIN_VALUE;
                var val = this.value($el);
                rtn = val >= min;
            }
            this.trigger(rtn ? 'ok' : 'error', $el, 'min', flag);
            return rtn;
        },

        //验证数字最大值
        max: function ($el, flag) {
            var rtn = this.number($el, false);
            if (rtn) {
                var val = this.value($el);
                var max = this._parseInt($el.attr('max')) || Number.MAX_VALUE;
                rtn = val <= max;
            }
            this.trigger(rtn ? 'ok' : 'error', $el, 'max', flag);
            return rtn;
        },

        //验证指定正则表达式
        pattern: function ($el, flag) {
            var reg = $el.attr('pattern');
            reg = reg instanceof RegExp ? reg : new RegExp(reg);
            var rtn = reg.test(this.value($el));
            this.trigger(rtn ? 'ok' : 'error', $el, 'pattern', flag);
            return rtn;
        },

        //获取值
        value: function ($el) {
            if ($el.attr('type') === 'file') {
                return $el.get(0).files;
            }
            if ($el.val) {
                return $el.val();
            }
            return null;
        },

        //显示错误信息
        _showError: function ($el, $label, msg, type) {
            this._ok($el, type, true, $label);
            var id = $el.data('show-error') || $el.attr('show-error');
            var existLabel = !!($label && $label.get(0));
            var sclass = 'mvform-invalidate-' + type;
            var $msg = $('<span class="mvform-invalidate-msg">').text(msg).addClass(sclass);
            if (existLabel && !$label.find('span.mvform-invalidate-msg').get(0)) {
                $label.append($msg.data('ctlid', $el.attr('id')));
            }
            if (!id && existLabel) {
                id = $label.attr('for');
            }
            if (id) {
                $('#' + id).addClass('mvform-invalidate').addClass(sclass);
            } else {
                $el.addClass('mvform-invalidate');
            }
            $el.data('validate', 'invalidate');
        },

        //创建错误消息
        _createMsg: function ($el, $label, type) {
            var msg = $el.data(type + '-msg') || $el.attr(type + '-msg');
            if (msg) {
                return msg;
            }
            msg = $el.data('msg') || $el.attr('msg');
            if (msg) {
                return msg;
            }
            var title = '';
            var val = $el.data(type) || $el.attr(type);
            var elType = $el.attr('type');
            if ($label && $label.get(0)) {
                title = $label.get(0).firstChild.data
            }
            switch (type) {
                case "required":
                    title = title || '必填项';
                    msg = '请填写' + title;
                    if (elType === 'file') {
                        msg = '请上传' + title;
                    }
                    break;
                case "email":
                    msg = '邮件地址格式错误';
                    break;
                case "number":
                    msg = '非法的数字';
                    break;
                case "url":
                    msg = '链接地址格式错误';
                    break;
                case "file":
                    msg = '文件格式错误';
                    break;
                case "maxsize":
                    msg = '文件大小不能超过' + val + 'MB';
                    break;
                case "minlength":
                    title = title || '输入字符';
                    msg = '不能低于' + val + '位';
                    break;
                case "maxlength":
                    title = title || '输入字符';
                    msg = '不能超过' + val + '位';
                    break;
                case "min":
                    title = title || '输入数值';
                    msg = '不能小于' + val;
                    break;
                case "max":
                    title = title || '输入数值';
                    msg = '不能大于' + val;
                    break;
                case "pattern":
                    msg = '非法的输入值';
                    break;
            }
            return msg;
        },

        _getLabel: function ($el) {
            var id = $el.attr('id'), name = $el.attr('name');
            var showError = $el.data('show-error');
            var $label = $('label[for="' + showError + '"]');
            if (id && !$label.length) {
                $label = $('label[for="' + id + '"]');
            }
            if (name && !$label.length) {
                $label = $('label[for="' + name + '"]');
            }
            // var $parent = $el;
            // while (!$label.get(0) && !$parent.is('body')) {
            //     $parent = $parent.parent();
            //     $label = $parent.find('label:first');
            // }
            // if ($label.get(0)) {
            //     return $label;
            // }
            return $label;
        },

        //验证失败
        _error: function ($el, type, flag) {
            var id = $el.attr('id') || $el.attr('name');
            var $label = this._getLabel($el);
            var msg = this._createMsg($el, $label, type);
            this.errors.push({id: id, msg: msg});
            if (flag) {
                this._showError($el, $label, msg, type);
            }
        },

        //验证成功
        _ok: function ($el, type, flag, $label) {
            $el.removeClass('mvform-invalidate').removeClass('mvform-invalidate-' + type).data('validate', 'validate');
            if (!($label instanceof $ && $label.is('label'))) {
                $label = this._getLabel($el);
            }
            var id = $el.data('show-error') || $el.attr('show-error');
            var existLabel = !!($label && $label.get(0));
            if (!id && existLabel) {
                id = $label.attr('for');
            }
            if (id) {
                $('#' + id).removeClass('mvform-invalidate');
            }
            var $span = $label.find('span.mvform-invalidate-msg');
            if (type) {
                $span = $span.filter('.mvform-invalidate-' + type);
            }
            $span.filter(function () {
                return $(this).data('ctlid') === $el.attr('id');
            }).remove();
        },

        //转换为整数
        _parseInt: function (d) {
            return $.isNumeric(d) ? parseInt(d) : null;
        },

        //内部验证函数
        _validate: function ($el, flag) {
            var rtn = true;
            $.each(['required', 'email', 'number', 'url', 'file', 'maxsize', 'minlength', 'maxlength', 'min', 'max', 'pattern'], function (i, n) {
                if (rtn && ($el.get(0).hasAttribute(n) || $el.attr('type') == n)) {
                    rtn = this[n].call(this, $el, flag);
                    if (!rtn) {
                        return false;
                    }
                }
            }.bind(this));
        }

    };

    var MvForm = Object.create(MvEvent);

    $.each(Object.keys(_method), function (i, n) {
        MvForm[n] = _method[n];
    });

    return MvForm;

});