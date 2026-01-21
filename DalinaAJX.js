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
    const _form = document.querySelector(form) || null;
    const _button = null;
    //Errors
    let _error;
    const _errorCollection =[];
    //FormData
    const _formData =null;
    const _xhr = null;
    //Options & Config
    const _method = options.method || _form.method;
    const _action = options.action || _form.action;
    const _showLogs = options.showlogs || false;    
    const _debug = options.debug || false;
    const _headers = options.headers || {};
    //Security
    const _encrypt = true;
    const _serialize = true;
    const _userAgent=true;
    const _signature=true;
    //Callbacks
    const _successCallback = null;
    const _errorCallback = null;
    const _submitCallback=null;   
    //Private Functions
    function _logger(_m) {
            if (_showLogs) {
                    console.log(_m);
                }
        }
    //Public Hook Functions  
    this.debugger = function() {
            console.error(_errorCollection);
        }
    this.getErrors = function(){
            return _errorCollection;
        }    
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
                                }
                            }
                        _xhr.onerror = function () {
                                _error = `ERROR: ${_xhr.status} ${_xhr.statusText} ${_xhr.responseURL}`;
                                _errorCollections.push(_error);
                                if (_errorCallback) {
                                        _errorCallback({ "error": true, "title": 'Network Error', "message": _error });
                                    }                                
                                if (_debug) throw new Error('Network error occurred during form submission.');
                            }
                        if (_submitCallback) _submitCallback();
                        _mounted = true;
                        
                    }else{
                            _error = `Invalid HTMLFormElement "${form}"`;
                            _errorCollections.push(_error);
                            if (_debug) throw new Error(_error);
                        }
            return this;            
        };
    this.send= function(){
            _xhr.send(formData); 
        };            
    this.init();
  }
  w.DalinaFVS = DalinaFVS;
})(document, window);