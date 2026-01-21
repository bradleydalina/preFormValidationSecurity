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
    const _errorCollection =[];
    //FormData
    const _formData =[];
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
                                xhr.setRequestHeader(header, _headers[header]);
                            }
                        xhr.onload = function () {
                            if (xhr.readyState === 4) {
                                if (xhr.status >= 200 && xhr.status < 300) {  
                                        _logger(xhr.responseType);
                                        _logger(`Form submitted successfully: ${xhr.responseType === 'json' ? xhr.responseText : xhr.responseType.toUppereCase()+' Response'}.`);
                                        if (_onSuccessCallback) {
                                            try {
                                                    _onSuccessCallback(JSON.parse(xhr.response));
                                                } catch (e) {
                                                        _onSuccessCallback(xhr.response);
                                                    }
                                            }
                                    } else {
                                            if (_debug) throw new Error(`${xhr.status} Form submission failed at ${xhr.statusText ? xhr.statusText : xhr.responseURL}.`);
                                            _logger(xhr);
                                            if (_onErrorCallback) {
                                                    _onErrorCallback({ "error": true, "title": `${xhr.status} ${xhr.statusText}`, "message": xhr.responseURL });
                                                }
                                        }
                                }
                            }
                        xhr.onerror = function () {
                                if (_onErrorCallback) {
                                        _onErrorCallback({ "error": true, "title": `${xhr.status} ${xhr.statusText}`, "message": xhr.responseURL });
                                    }                                
                                if (_debug) throw new Error('Network error occurred during form submission.');
                            }
                        if (_submitCallback) {
                                    _submitCallback();
                                }
                        _mounted = true;
                        
                    }else{
                            const err = `Invalid HTMLFormElement "${form}"`;
                            _errorCollections.push(err);
                            if (_debug) throw new Error(err);
                        }
            return this;            
        };
    this.send= function(){
            xhr.send(formData); 
        };            
    this.init();
  }
  w.DalinaFVS = DalinaFVS;
})(document, window);