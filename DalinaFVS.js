'use strict';
/*
 Copyright (C) Bradley B Dalina 2026
 Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
 */
/*
  _s = selector
  _i = input element
  _r = rule function
  _v = validator function
  _m = message
  _c = callback function
  _o = object`
  _d = document
  _w = window
*/
/*
  <input type="button">
  <input type="checkbox">
  <input type="color">
  <input type="date">
  <input type="datetime-local">
  <input type="email">
  <input type="file">
  <input type="hidden">
  <input type="image">
  <input type="month">
  <input type="number">
  <input type="password">
  <input type="radio">
  <input type="range">
  <input type="reset">
  <input type="search">
  <input type="submit">
  <input type="tel">
  <input type="text">
  <input type="time">
  <input type="url">
  <input type="week">
*/
(function (d, w) {
    function DalinaFVS(form, options) {
          let _validators = [];
          const _listeners = new WeakMap();
          //callback hook
          let _isValidHook = null;
          let _firstInvalid = null;
          //Detector
          let _isManualInput = false;
          let _keyboardEvents = 0;
          let _mouseEvents = 0;
          let _options = Object.freeze(options || {
            //Security
            bait: false,
            defaultKey: '000-00-0000',
            //Helper
            log: false,
            debug: true,
            //Style
            style: null
          });
          let _form = document.querySelector(form) || null;
          let _button = null;
          let _inputs = [];
          const _cStyle = '.__formDalinaFVS';

          _logMessenger('Initializing DalinaFVS...');
          _logMessenger(`Checking instance form element ${form}...`);
          if (_form instanceof HTMLFormElement &&
            _form &&
            _form.nodeType === 1 &&
            typeof _form.nodeName === 'string') {

            _form.classList.add(_cStyle.replace('.', ''));      

            _removeIfExists('input[name="unTrusted"]');
            _createHiddenInput("unTrusted", false);

            if (_options.bait) {
              
              _removeIfExists('input[name="NFrmKey"]');
              _createHiddenInput("NFrmKey", false);

              _removeIfExists('input[name="DFrmKey"]');
              _createHiddenInput("DFrmKey", _options.defaultKey, [{"required":"required"}]);

            }

            _inputs = Array.from(_form.elements).filter(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');

            _inputs = Array.from(_inputs);
            _validators = new Map();
            _button = _form.querySelector('[type="submit"]');
            _setupSubmitHandler();
            _appendStyle(form);
          } else {
            if (_options.debug) throw new Error(`Invalid HTMLFormElement "${form}"`);
          }
          function _logMessenger(_m) {
              if (_options.log) {
                console.log(_m);
              }
            }
          function _createHiddenInput(name, value=null, attributes=[]){
              const newInput = d.createElement('input');
              newInput.name = name;
              newInput.setAttribute("type", "hidden");
              newInput.setAttribute("autocomplete", "off");
              newInput.value = value;
              attributes.forEach(obj => {
                Object.entries(obj).forEach(([key, value]) => {
                  newInput.setAttribute(key, value);
                });
              });
              _form.prepend(newInput);
            }
          function _removeIfExists(selector) {
              let removeInput = d.querySelector(selector);
              if (removeInput) removeInput.remove();
            }    
          function _setupSubmitHandler() {
            _logMessenger('DalinaFVS form submit handler...');
            _firstInvalid = null;
            const unTrusted = d.querySelector('input[name="unTrusted"]');
            _inputs.forEach((_i) => {
              _setupListeners(_i);
            });
            if (_button instanceof HTMLElement &&
              _button &&
              _button.nodeType === 1 &&
              typeof _button.nodeName === 'string') {
              _button.addEventListener('click', (e) => {
                if (!e.isTrusted && unTrusted) {
                  unTrusted.value = true;
                }
                _inputs.forEach((_i) => {
                  _i.setCustomValidity("");
                  _runValidation(_i);
                });
                _button.classList.add('loading');
                if (!_form.checkValidity()) {
                  _form.reportValidity();
                  setTimeout(() => {
                    _button.classList.remove('loading');
                  }, 500);
                }
              });
            }
            _form.addEventListener('submit', (e) => {
                if (!e.isTrusted && unTrusted) {
                  unTrusted.value = true;
                }
                const pragmatic = d.createElement('input');
                let pragmatic_input = d.querySelector('input[name="pragmatic"]');
                if (pragmatic_input) pragmatic_input.remove();
                pragmatic.name = "pragmatic";
                pragmatic.setAttribute("type", "hidden");
                _form.prepend(pragmatic);
                if (!_isUserTyping()) {
                  pragmatic.value = true;
                }
                else {
                  pragmatic.value = false;
                }
                // run validation on all
                if (!_form.checkValidity()) {
                  //console.error('Form validation failed. Please correct the errors and try again.');
                  e.preventDefault();
                  _form.reportValidity();
                }

                if (_isValidHook && typeof _isValidHook === "function") {
                  e.preventDefault();
                  //console.log(this.callback);
                  _isValidHook(_form);
                  _button.classList.remove('loading');
                }
                _button.classList.remove('loading');
              });
            }
          function _setupListeners(_i) {
              _logMessenger('Setting up listeners...');
              const handlers = {
                keydown(e) {
                  _keyboardEvents++;
                },
                keyup(e) {
                  _isManualInput = true;
                  _runValidation(_i);
                },
                paste(e) {
                  _isManualInput = true;
                  _runValidation(_i);
                },
                focus(e) {
                  _isManualInput = true;
                },
                change(e) {
                  if (_keyboardEvents === 0) _isManualInput = false;
                  if (e.isTrusted && e.target.value) _isManualInput = true;
                  _runValidation(_i);
                },
                input(e) {
                  if (_keyboardEvents === 0) _isManualInput = false;
                  _runValidation(_i);
                }
              };

            _listeners.set(_i, handlers);

            _i.addEventListener("keydown", handlers.keydown);
            _i.addEventListener("keyup", handlers.keyup);
            _i.addEventListener("paste", handlers.paste);
            _i.addEventListener("focus", handlers.focus);
            _i.addEventListener("change", handlers.change);
            _i.addEventListener("input", handlers.input);

            }
          function _appendStyle(_s) {
              _logMessenger('Adding DalinaFVS styles...');
              let cssText = ` 
                                  ${_cStyle} [type=radio],
                                  ${_cStyle} [type=checkbox] {
                                    -webkit-appearance: none;
                                    -moz-appearance:    none;
                                    appearance:         none;
                                  }    
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not(:user-invalid):focus,
                                  ${_cStyle} textarea:not(:user-invalid):focus,
                                  ${_cStyle} select:not(:user-invalid):focus{
                                      border:solid 1px #000;       
                                    } 
                                  ${_cStyle} [type=radio],
                                  ${_cStyle} [type=checkbox] {
                                    width: 20px;
                                    height: 20px;
                                    border: solid 1px #cccccc;
                                    margin-right: 8px;
                                    position: relative;
                                  }
                                  ${_cStyle} [type=radio]:checked::before,
                                  ${_cStyle} [type=checkbox]:checked::before {
                                    content: "";
                                    width: 14px;
                                    height: 14px;
                                    background-color: rgb(3, 130, 5);;
                                    position: absolute;
                                    top: 2px;
                                    left: 2px;
                                  }  
                                  ${_cStyle} [type=checkbox]:user-invalid, ${_cStyle} [type=radio]:user-invalid{
                                    border: solid 1px red;
                                    background-color:#ff000024 !important;
                                  }
                                  ${_cStyle} [type=radio],
                                  ${_cStyle} [type=radio]:checked::before{
                                    border-radius: 100%;
                                  }
                                  ${_cStyle} input:not([type="radio"]):not([type="checkbox"]):user-invalid, 
                                  ${_cStyle} select:user-invalid,
                                  ${_cStyle} textarea:user-invalid{
                                        border: solid 1px #ff0000 !important;
                                        padding-right: calc(1.5em + .75rem) !important;
                                        background-color: #ff000024 !important;
                                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 16 16'%3E%3Cpath fill='%23ac0202' d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2a1 1 0 0 0 0-2z'/%3E%3C/svg%3E") !important;
                                        background-repeat: no-repeat !important;
                                        background-position: right calc(.375em + .1875rem) center !important;
                                        background-size: calc(.75em + .375rem) calc(.75em + .375rem) !important;
                                        appearance: none !important;
                                        -webkit-appearance: none !important;
                                      }                               
                                  ${_cStyle} textarea:user-invalid{background-position: right calc(.375em + .1875rem) top 10px !important;} 
                                  ${_cStyle} input.valid:-webkit-autofill,
                                  ${_cStyle} input:valid:-webkit-autofill,   
                                  ${_cStyle} input.valid:-internal-autofill-selected,
                                  ${_cStyle} input.valid:-internal-autofill-previewed,
                                  ${_cStyle} input:valid:-internal-autofill-selected,
                                  ${_cStyle} input:valid:-internal-autofill-previewed,
                                  ${_cStyle} input:-internal-autofill-selected,
                                  ${_cStyle} input:-internal-autofill-previewed,
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):user-valid,
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):valid,
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]).valid,
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):autofill:valid,
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]).valid:autofill,
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):-webkit-autofill:valid,
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):autofill,
                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):-webkit-autofill,
                                  ${_cStyle} select:user-valid,
                                  ${_cStyle} select:valid,
                                  ${_cStyle} select.valid,
                                  ${_cStyle} select:autofill:valid,
                                  ${_cStyle} select.valid:autofill,
                                  ${_cStyle} textarea:user-valid,
                                  ${_cStyle} textarea:valid,
                                  ${_cStyle} textarea.valid,
                                  ${_cStyle} textarea.valid:autofill,
                                  ${_cStyle} textarea:autofill:valid{
                                        padding-right: calc(1.5em + .75rem) !important;
                                        background-color: white !important;
                                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 12 12'%3E%3Cpath fill='%23038205' d='M6 0C2.69 0 0 2.69 0 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6m3.44 4.94l-3.5 3.5c-.12.12-.28.18-.44.18s-.32-.06-.44-.18l-2-2c-.24-.24-.24-.64 0-.88s.64-.24.88 0L5.5 7.12l3.06-3.06c.24-.24.64-.24.88 0c.25.24.25.64 0 .88'/%3E%3C/svg%3E") !important;
                                        background-repeat: no-repeat !important;
                                        background-position: right calc(.375em + .1875rem) center !important;
                                        background-size: calc(.75em + .375rem) calc(.75em + .375rem) !important;
                                        appearance: none !important;
                                        -webkit-appearance: none !important;
                                    }
                                  ${_cStyle} textarea.valid:autofill, ${_cStyle} textarea.valid,${_cStyle} textarea:user-valid,${_cStyle} textarea:valid,${_cStyle} textarea:autofill:valid{background-position: right calc(.375em + .1875rem) top 10px;}                
                                  ${_cStyle} button[type='submit'], ${_cStyle} input[type='submit']{
                                      position:relative;
                                      padding-right:.75rem;
                                      line-height:1.6;
                                      transition: padding 150ms linear;
                                    } 
                                  ${_cStyle} button[disabled]:hover, ${_cStyle} input[disabled]:hover, ${_cStyle} select[disabled]:hover, ${_cStyle} textarea[disabled]:hover{
                                        cursor: not-allowed !important;
                                        pointer-events: all;
                                    }
                                  ${_cStyle} select[disabled],${_cStyle} input:not([type="submit"])[disabled], ${_cStyle} textarea[disabled] {
                                      opacity: 0.5 !important;
                                    }      
                                  ${_cStyle} button[type='submit'].loading, ${_cStyle} input[type='submit'].loading{
                                      position:relative;
                                      padding-right:40px;
                                      transition: padding 150ms linear; 
                                      display: inline-flex;
                                      align-items: center;
                                      justify-content: center;
                                      align-content: center;
                                      justify-items: center;
                                      column-gap: 10px;
                                      opacity:0.8 !important;
                                      cursor:not-allowed;
                                      pointer-events: all;
                                    }
                                  ${_cStyle} button[type='submit'].loading::after, ${_cStyle} input[type='submit'].loading::after{
                                      content:'';
                                      display:block;
                                      width:20px;
                                      height:20px;
                                      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='20' fill='none' stroke='%23ffffff' stroke-width='4' stroke-linecap='round' stroke-dasharray='90' stroke-dashoffset='60'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 25 25' to='360 25 25' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E");
                                    }  
                                  ${_cStyle} ::placeholder{
                                        color:#545454;
                                        font-size:12px !important;
                                        font-weight:400;
                                        vertical-align:middle;            
                                        display:block;
                                        align-items:center;
                                        justify-content:center;
                                        justify-items:center;
                                        align-content:center;        
                                      }     
                                  ${_cStyle} input:user-invalid::placeholder, 
                                  ${_cStyle} textarea:user-invalid::placeholder,
                                  ${_cStyle} select:user-invalid{
                                      color:#ff0000b0;
                                      font-size:12px;
                                      font-weight:400;
                                      vertical-align:middle;            
                                      display:flex;
                                      align-items:center;
                                      justify-content:center;
                                    }
                                  `;
              cssText += _options.style || '';

              if (!d.getElementById('DalinaFVS-CSS')) {
                const style = d.createElement('style');
                style.id = 'DalinaFVS-CSS';
                style.textContent = cssText || '';
                d.head.appendChild(style);
              }
            }
          function _isUserTyping() {
              return _keyboardEvents > 0 && _isManualInput;
            }
          function _objCheck(_o) {
              if (!_o.selector || !_o.rule) {
                if (_options.debug)
                  throw new Error(
                    'Object does not properly contain the selector and rule keys.'
                  );
                return;
              }
              Object.freeze(_o);
              _prepareValidator(_o.selector, _o.rule);
            }
          function _prepareValidator(_s, _r) {
              let _i;
              if (typeof _s === 'string') {
                _i = d.querySelector(_s);
                if (!(_i instanceof HTMLElement)) {
                  if (_options.debug)
                    throw new Error(`Element selector "${_s}" does not exists.`);
                  return;
                }
              }
              if (
                _s instanceof HTMLElement &&
                _s &&
                _s.nodeType === 1 &&
                typeof _s.nodeName === 'string'
              ) {
                _i = _s;
              }
              _setValidator(_i, _r);
            }
          function _setValidator(_i, _r) {
              if (!_validators.has(_i)) {
                _validators.set(_i, []);
              }
              if (Array.isArray(_r)) {
                _r.forEach((r) => {
                  _validators.get(_i).push(r);
                });
              } else {
                _validators.get(_i).push(_r);
              }
            }
          function _isPlainObject(_o) {
              return Object.prototype.toString.call(_o) === '[object Object]';
            }
          function _runValidation(_i) {
              _logMessenger(`Validating user input ${_i.name}...`);
              const validators = _validators.get(_i) || [];
              let _m = [];
              for (const _v of validators) {
                const msg = _v(_i.value, _i);
                if (msg) {
                  if (!_m.includes(msg)) _m.push(msg);
                  _i.setCustomValidity(msg);
                  _i.setAttribute("placeholder", _m.join(', '));//_m[0]);
                }
              }
              _i.classList.add('valid');
              if (!_i.valid && _i.validationMessage) {
                _i.setAttribute("placeholder", _i.validationMessage);
                _i.classList.remove('valid');
                _i.classList.add('invalid');
              }
              if (!_firstInvalid && !_i.checkValidity()) {
                _firstInvalid = _i;
              }
            }
          this.addValidator = function (_i, _r) {
              if (Array.isArray(_i)) {
                if (_i.every(_isPlainObject)) {
                  _i.forEach((item) => {
                    _objCheck(item);
                  });
                } else {
                  if (_options.debug)
                    throw new Error('Array must contain only plain objects.');
                }
              }
              if (_isPlainObject(_i)) {
                _objCheck(_i);
              }
              _prepareValidator(_i, _r);
              return this;
            };
          this.onSuccess = function (_c) {
              if (_isValidHook) {
                if (_options.debug) throw new Error("isValid hook already registered");
              }
              if (typeof _c === "function") {
                _isValidHook = _c;
              }
              else if (_c !== null && _options.debug === true) {
                throw new Error('Callback is not a valid function and cannot be executed:"' + typeof _c + '"');
              }
              return this;
            };
          this.destroy = function (){
              _inputs.forEach(el => {
                const handlers = _listeners.get(el);
                if (!handlers) return;

                el.removeEventListener("keydown", handlers.keydown);
                el.removeEventListener("keyup", handlers.keyup);
                el.removeEventListener("paste", handlers.paste);
                el.removeEventListener("focus", handlers.focus);
                el.removeEventListener("change", handlers.change);
                el.removeEventListener("input", handlers.input);

                _listeners.delete(el);
              });

              _validators.clear();
              _isValidHook = null;
              _firstInvalid = null;
              _isManualInput = false;
              _keyboardEvents = 0;
              _mouseEvents = 0;
              _options = {};
              _form = null;
              _button = null;
              _inputs.length = 0;

              // Remove injected CSS
              const css = document.getElementById("DalinaFVS-CSS");
              if (css) css.remove();

              _button.removeEventListener("click");
              _form.removeEventListener("submit");
              return this;
            };
      }
    w.DalinaFVS = DalinaFVS;
  })(document, window);

const DFVS = new DalinaFVS("#loginForm");
DFVS.addValidator('[type="email"]', (v) => v && v.toString().endsWith('@gmail.com') ? null : `Value ${v} must ends with "@gmail.com".`)
.onSuccess(function(form){
  console.info('Form was validated');
});
//console.log(JSON.stringify(DFVS));

//https://jshint.com/
//https://validatejavascript.com/