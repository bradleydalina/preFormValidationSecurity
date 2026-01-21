'use strict';
/*
  Copyright (C) Bradley B Dalina 2026
  Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
*/
(function (d, w) {
        function DalinaFVS(form, options) {
                const self = this;
                const _mounted = false;
                //Selector
                const _form = _verifySelector(form);
                const _button = _form ? _form.querySelector('[type="submit"]') : null;
                //Errors
                let _error;
                const _errorCollection =[];
                //FormData
                const _formData =null;
                const _xhr = null;
                const _agentData =null;
                //Options & Config
                const _method = options.method || (_form ? _form.method : null);
                const _action = options.action || (_form ? _form.action : null);
                const _showLogs = options.showlogs || false;    
                const _debug = options.debug || false;
                const _headers = Object.freeze(options.headers || {});
                //Security
                const _encrypt = true;
                const _serialize = true;
                const _userAgent=true;
                const _reqSign=true;
                //Callbacks
                const _successCallback = null;
                const _errorCallback = null;
                const _submitCallback=null;   
                //Private Functions
                function _verifySelector(selector) {
                        try {
                                    return d.querySelector(selector);
                                } catch {
                                        return null;
                                    }
                    }
                function _logger(_m) {
                        if (_showLogs) {
                                console.log(_m);
                            }
                    }
                function _loading(active=false){
                        if(active){
                                _button.classList.add('loading');
                                _button.setAttribute('disabled', 'disabled');
                            }else{
                                    setTimeout(() => {
                                            _button.classList.remove('loading');
                                            _button.removeAttribute('disabled');
                                        }, 500)
                                }
                    }
                function _getAgentData(){
                        if (navigator.userAgentData) {
                                if (navigator.userAgentData?.getHighEntropyValues) {
                                            navigator.userAgentData.getHighEntropyValues([
                                                "platform",
                                                "platformVersion",
                                                "architecture",
                                                "bitness",
                                                "model",
                                                "uaFullVersion",
                                                "fullVersionList"
                                            ]).then(data => {
                                                _logger(data);
                                                _agentData = data ;
                                                return _agentData;
                                            });
                                        }
                                _agentData = navigator.userAgentData.brands
                                .map(b => b.brand + " " + b.version)
                                .join(", ");
                                return _agentData;
                            }
                            _agentData = navigator.userAgent || "unknown";
                        return _agentData;
                    }        
                //Public Hook Functions  
                this.debugger = function() {
                        console.error(_errorCollection);
                    };
                this.getErrors = function(){
                        return _errorCollection;
                    };
                this.onSuccess = function(){
                        _logger('Ajax request was successfully submitted...');
                        if (_successCallback) {
                                _error = "Success callback is already registered";
                                _errorCollection.push(new Error(_error));
                                if (_options.debug) throw new Error(_error);
                            }
                        if (typeof _c === "function") {
                                _successCallback = _c;
                            }
                        else if (_c !== null && _debug === true) {
                                _error = 'Callback is not a valid function and cannot be executed:"' + typeof _c + '"';
                                _errorCollection.push(new Error(_error));
                                throw new Error(_error);
                            }
                        return this;
                    };
                this.onSubmit = function(){
                        _logger('Ajax request is being submitted...');
                        if (_submitCallback) {
                                _error = "Submit callback is already registered";
                                _errorCollection.push(new Error(_error));
                                if (_options.debug) throw new Error(_error);
                            }
                        if (typeof _c === "function") {
                                _submitCallback = _c;
                            }
                        else if (_c !== null && _debug === true) {
                                _error = 'Callback is not a valid function and cannot be executed:"' + typeof _c + '"';
                                _errorCollection.push(new Error(_error));
                                throw new Error(_error);
                            }
                        return this;
                    };
                this.onError = function(){
                        _logger('Ajax request failed...');
                        if (_errorCallback) {
                            _error = "Error callback is already registered";
                            _errorCollection.push(new Error(_error));
                            if (_options.debug) throw new Error(_error);
                        }
                        if (typeof _c === "function") {
                            _errorCallback = _c;
                        }
                        else if (_c !== null && _debug === true) {
                            _error = 'Callback is not a valid function and cannot be executed:"' + typeof _c + '"';
                            _errorCollection.push(new Error(_error));
                            throw new Error(_error);
                        }
                        return this;
                    };             
                this.init = function(){
                        if (_mounted) return this;
                            _logger("Ajax Security is mounted.");
                            if (_form instanceof HTMLFormElement &&
                            _form &&
                            _form.nodeType === 1 &&
                            typeof _form.nodeName === 'string') {
                                    _formData = new FormData(_form);
                                    _xhr = new XMLHttpRequest();
                                    _xhr.open(_method, _action, true);
                                    _mounted = true;
                                    for (const header in _headers) {
                                            _xhr.setRequestHeader(header, _headers[header]);
                                        }
                                    _xhr.onload = function () {
                                            if (_xhr.readyState === 4) {
                                                    if (_xhr.status >= 200 && _xhr.status < 300) {  
                                                            _logger(_xhr.responseType);
                                                            _logger(`Form submitted successfully: ${_xhr.responseType === 'json' ? _xhr.responseText : _xhr.responseType.toUppereCase()+' Response'}.`);
                                                            if (_successCallback) {
                                                                try {
                                                                        _successCallback(JSON.parse(_xhr.response));
                                                                    } catch (e) {
                                                                            _successCallback(_xhr.response);
                                                                        }  
                                                                }
                                                        } else {
                                                                if (_debug) throw new Error(`${_xhr.status} Form submission failed at ${_xhr.statusText ? _xhr.statusText : _xhr.responseURL}.`);
                                                                _logger(_xhr);
                                                                if (_errorCallback) {
                                                                        _errorCallback({ "error": true, "title": `${_xhr.status} ${_xhr.statusText}`, "message": _xhr.responseURL });
                                                                    }
                                                            }
                                                    _loading(false);    
                                                }
                                        }
                                    _xhr.onerror = function () {
                                            _loading(false); 
                                            _error = `ERROR: ${_xhr.status} ${_xhr.statusText} ${_xhr.responseURL}`;
                                            _errorCollections.push(_error);
                                            if (_errorCallback) {
                                                    _errorCallback({ "error": true, "title": 'Network Error', "message": _error });
                                                }                                
                                            if (_debug) throw new Error('Network error occurred during form submission.');
                                        }
                                    if (_submitCallback) _submitCallback();  
                                }else{
                                        _error = `Invalid HTMLFormElement "${form}"`;
                                        _errorCollections.push(_error);
                                        if (_debug) throw new Error(_error);
                                    }
                        return this;            
                    };

                this.send= function(){
                        _loading(true);
                        _xhr.send(_formData); 
                    };            
                this.init();
            }
        w.DalinaFVS = DalinaFVS;
    })(document, window);