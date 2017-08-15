$(document).ready(function() {
    MyForm = {
        validate: function() {
            var errorFields = [];

            var validateFio = function(fioValue) {
                if (fioValue) {
                    fioArray = fioValue.split(' ');
                    fioArrayFiltered = fioArray.filter(function(item) {
                        return item.length > 0;
                    });
                    return (fioArrayFiltered.length === 3);
                } else return false
            };

            var validateEmail = function(emailValue) {
                var re = new RegExp('^(([^<>()[\\]\\\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\\"]+)*)|(\\".+\\"))@(ya\\.ru|yandex\\.(ru|ua|by|kz|com))$');
                return re.test(emailValue);
            };

            var validatePhone = function(phoneValue) {
                var re = new RegExp('^\\+7\\([0-9]{3}\\)[0-9]{3}-[0-9]{2}-[0-9]{2}$');
                if (!re.test(phoneValue)) {
                    return false;
                }
                else {
                    var numberArray = phoneValue.split('').filter(function(item) {
                        return ['+', '-', '(', ')'].indexOf(item) === -1
                    });
                    sumNumberArray = numberArray.reduce(function(a, b){return parseInt(a, 10) + parseInt(b, 10)}, 0);
                    if (sumNumberArray >= 30) {
                        return false;
                    }
                }

                return true;
            };
            var data = MyForm.getData();
            for (item in data) {
                $('input[name=' + item + ']').removeClass('error');
                if ((item === 'fio' && !validateFio(data[item])) ||
                    (item === 'email' && !validateEmail(data[item])) ||
                    (item === 'phone' && !validatePhone(data[item]))) {
                    errorFields.push(item);
                }
            }

            return { isValid: !errorFields.length, errorFields: errorFields };
        },

        getData: function() {
            var data = {};
            formContainer.find('input').each(function() {
                if (this.name) {
                    data[this.name] = $(this).val();
                }
            });
            return data;
        },
        setData: function(data) {
            var names = ['fio', 'phone', 'email'];
            for (var item in data) {
                if(names.indexOf(item) !== -1) {
                    var element = $('input[name=' + item + ']');
                    if (element.length) element.val(data[item]);
                }
            }
        },
        submit: function() {
            var clearResultContainer = function() {
                resultContainer.removeAttr('class').html('');
            };

            var doAjaxResponse = function() {
                submitButton.prop('disabled', true);
                clearResultContainer();
                var url = formContainer.attr('action');
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json',
                    success: function(data){
                        if (data.status === 'success') {
                            resultContainer.addClass('success').html('Success');
                            submitButton.prop('disabled', false);
                        } else if (data.status === 'error') {
                            resultContainer.addClass('error').html(data.reason);
                            submitButton.prop('disabled', false);
                        } else if (data.status === 'progress') {
                            resultContainer.addClass('progress');
                            setTimeout(function() {
                                doAjaxResponse()
                            }, data.timeout)
                        }
                    },
                    error: function(){
                        console.log('error');
                    }
                });
            };

            clearResultContainer();
            submitButton.prop('disabled', false);
            var validate = MyForm.validate();
            if (validate.isValid) {
                doAjaxResponse()
            } else {
                validate.errorFields.forEach(function(item){
                    var element = $('input[name=' + item + ']');
                    if (element.length) {
                        element.addClass('error');
                    }
                })
            }
        }
    };

    var formContainer = $('#myForm');
    var submitButton = formContainer.find('#submitButton');
    var resultContainer = $('#resultContainer');
    formContainer.submit(function(event) {
        event.preventDefault();
        MyForm.submit();
    });
});
