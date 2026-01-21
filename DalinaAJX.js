'use strict';
/*
  Copyright (C) Bradley B Dalina 2026
  Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
*/
(function (d, w) {
        function DalinaFVS(form, options=null) {
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
                const _encryptKey = options.encryptKey || null; //done
                const _serialize = true; //done
                const _userAgent=true; //done
                const _reqSign=options.signature || null; //done
                //Callbacks
                const _successCallback = null;
                const _errorCallback = null;
                const _submitCallback=null;   
                //Private Functions
                async function _encryptGCM(plainText, key) {
                        const enc = new TextEncoder();
                        const iv = crypto.getRandomValues(new Uint8Array(12));
                        const cryptoKey = await crypto.subtle.importKey(
                                "raw",
                                enc.encode(key),
                                "AES-GCM",
                                false,
                                ["encrypt"]
                            );
                        const encrypted = await crypto.subtle.encrypt(
                                { name: "AES-GCM", iv },
                                cryptoKey,
                                enc.encode(plainText)
                            );
                        return {
                                iv: btoa(String.fromCharCode(...iv)),
                                data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
                            };
                    }
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
                        _logger('Getting the agent data');
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
                function _serializedIntegrity(){
                        _logger('Serializing the ajax data');
                        let fd = new FormData();
                        _formData.forEach(function (value, key) {
                                fd.append(
                                        key,
                                        _encryptKey ? 
                                        _encryptGCM(JSON.stringify({
                                                value: value,
                                                type: typeof value,
                                                length: String(value).length
                                            }), _encryptKey) : JSON.stringify({
                                                value: value,
                                                type: typeof value,
                                                length: String(value).length
                                            })
                                    );
                            });
                        return fd;
                    }
                function _nonSerializedEncryption(){
                        let fd = new FormData();
                        if(_encryptKey) _logger('Encrypting the ajax data');
                        _formData.forEach(function (value, key) {
                                fd.append(key, _encryptKey ? _encryptGCM(value, _encryptKey) : value);
                            });
                        return fd;
                    }               
                //Public Hook Functions
                this.getAgentData = function(){                       
                        return _getAgentData();
                    };  
                this.debugger = function() {
                        console.error(_errorCollection);
                    };
                this.getErrors = function(){
                        _logger('Getting the error collection data');
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
                                    if(_serialize) _xhr.setRequestHeader('X-serialized', 'true');
                                    if(_encryptKey) _xhr.setRequestHeader('X-encryptGCM', 'true');  
                                    if(_reqSign) _xhr.setRequestHeader(_reqSign['header'], _reqSign['value']);    
                                    _xhr.setRequestHeader(, _headers[header]);    
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
                        let _dataSecurity = _serialize ? _serializedIntegrity(_formData) : _nonSerializedEncryption(_formData);
                        _logger('Sending the ajax data');
                        _xhr.send(_dataSecurity); 
                    };            
                this.init();
            }
        w.DalinaFVS = DalinaFVS;
    })(document, window);


//Server Side Unserialize
// $data = $request->all();

// if (isset($data['username'])) {
//     $decoded = json_decode($data['username'], true);
//     if (json_last_error() === JSON_ERROR_NONE) {
//         $data['username'] = $decoded;
//     }
// }

// $validator = Validator::make($data, [
//     'username.value' => 'required|string',
// ]);


//Server Side Decryption

// function decryptGCM($ciphertextB64, $ivB64, $key)
// {
//     $ciphertext = base64_decode($ciphertextB64);
//     $iv = base64_decode($ivB64);

//     $tagLength = 16;
//     $tag = substr($ciphertext, -$tagLength);
//     $data = substr($ciphertext, 0, -$tagLength);

//     return openssl_decrypt(
//         $data,
//         'aes-256-gcm',
//         $key,
//         OPENSSL_RAW_DATA,
//         $iv,
//         $tag
//     );
// }