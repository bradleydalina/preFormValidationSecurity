'use strict';
/*
  Copyright (C) Bradley B Dalina 2026
  Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
*/
(function (d, w) {
  function DalinaFVS(form, options) {
    const self = this;
    const _mounted = false;
    const _form = document.querySelector(form) || null;
    const _button = null;
    //Options & Config
    const _method = options.method || _form.method;
    const _action = options.action || _form.action;
    const _showLogs = options.showlogs || false;
    const _errorCollection =[];
    const _debug = options.debug || false;
    const _headers = option.headers || {};

    //Callbacks
    const _successCallback = null;
    const _errorCallback = null;
    const _submitCallback=null;
    
    function _logger(_m) {
        if (_showLogs) {
          console.log(_m);
        }
      }
    this.debugger = function() {
        return console.error(_errorCollection);
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
                        const formData = new FormData(_form);
                        const xhr = new XMLHttpRequest();
                        xhr.open(_method, _action, true);
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
                        xhr.send(formData); 
                    }else{
                            const err = `Invalid HTMLFormElement "${form}"`;
                            _errorCollections.push(err);
                            if (_debug) throw new Error(err);
                        }
            return this;            
        };        
    this.init();
  }
  w.DalinaFVS = DalinaFVS;
})(document, window);