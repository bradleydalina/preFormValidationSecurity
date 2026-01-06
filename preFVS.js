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
class preFVS {
  constructor(_s = null, options = {}, d = document, w = window) {
      this.firstInvalid=null;
      //Detector
      this.isManualInput = false;
      this.keyboardEvents = 0;
      this.mouseEvents = 0;
      //allback
      this.callback=null;
      //Selector
      this.form = d.querySelector(_s) ?? null;
      this.button = null;
      //Options
      this.options = {
          //Security
          bait: options.bait ?? false,
          defaultKey: options.defaultKey ?? '000-00-0000',
          //Helper
          log: options.log ?? false,
          debug: options.debug ?? true,
          //Style
          style:options.style ?? null
        };
      this._logMessenger('Initilizing PreFVS...');
      this._logMessenger('Checking instance form element _s...');
        if(this.form instanceof HTMLFormElement &&
          this.form &&
          this.form.nodeType === 1 &&
          typeof this.form.nodeName === 'string'){
        
          const unTrusted = d.createElement('input');
          d.querySelector('input[name="unTrusted"]')?.remove();
          unTrusted.name="unTrusted";
          unTrusted.setAttribute("type", "hidden"); 
          unTrusted.value=false;
          this.form.prepend(unTrusted); 

          if(this.options.bait){
                const nullbait = d.createElement('input');
                d.querySelector('input[name="NFrmKey"]')?.remove();
                nullbait.name="NFrmKey";
                nullbait.setAttribute("type", "hidden"); 
                this.form.prepend(nullbait);

                const defaultbait = d.createElement('input');
                d.querySelector('input[name="DFrmKey"]')?.remove();
                defaultbait.name="DFrmKey";
                defaultbait.value=this.options.defaultKey;
                defaultbait.setAttribute("type", "hidden");
                defaultbait.setAttribute("required", "required"); 
                this.form.prepend(defaultbait);            
            }
          const formData = new FormData(this.form);
          const elements = this.form.elements;
          this.inputs = [];
          for (const [name, value] of formData.entries()) {
              const field = elements[name];
              this.inputs.push(field);
            }
          this.inputs = Array.from(this.inputs);
          this.validators = new Map();
          this.button = this.form.querySelector('[type="submit"]');          
          this._setupSubmitHandler();
          this._appendStyle(_s, w, d);          
        } else {
            if (this.options.debug) {
                const err = `Invalid HTMLFormElement, please verify your _s${
                  _s ? ' "' + _s + '" ' : ' '
                }if it exists and constitute a valid form element.`;
                throw new Error(err);
              }
          }
    }
  _logMessenger(_m){
      if(this.options.log){
          console.log(_m);
        }
    }
  _appendStyle(_s, w, d) {
      this._logMessenger('Adding preFVS styles...');
      let cssText = ` 
                          ${_s} input:not([type="button"]):not([type="submit"]):not(:user-invalid):focus,
                          ${_s} textarea:not(:user-invalid):focus,
                          ${_s} select:not(:user-invalid):focus{
                              border:solid 1px #000;       
                            }    
                          ${_s} input:user-invalid, 
                          ${_s} select:user-invalid,
                          ${_s} textarea:user-invalid{
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
                          ${_s} textarea:user-invalid{background-position: right calc(.375em + .1875rem) top 10px !important;} 
                          ${_s} input.valid:-webkit-autofill,
                          ${_s} input:valid:-webkit-autofill,   
                          ${_s} input.valid:-internal-autofill-selected,
                          ${_s} input.valid:-internal-autofill-previewed,
                          ${_s} input:valid:-internal-autofill-selected,
                          ${_s} input:valid:-internal-autofill-previewed,
                          ${_s} input:-internal-autofill-selected,
                          ${_s} input:-internal-autofill-previewed,
                          ${_s} input:not([type="button"]):not([type="submit"]):user-valid,
                          ${_s} input:not([type="button"]):not([type="submit"]):valid,
                          ${_s} input:not([type="button"]):not([type="submit"]).valid,
                          ${_s} input:not([type="button"]):not([type="submit"]):autofill:valid,
                          ${_s} input:not([type="button"]):not([type="submit"]).valid:autofill,
                          ${_s} input:not([type="button"]):not([type="submit"]):-webkit-autofill:valid,
                          ${_s} input:not([type="button"]):not([type="submit"]):autofill,
                          ${_s} input:not([type="button"]):not([type="submit"]):-webkit-autofill,
                          ${_s} select:user-valid,
                          ${_s} select:valid,
                          ${_s} select.valid,
                          ${_s} select:autofill:valid,
                          ${_s} select.valid:autofill,
                          ${_s} textarea:user-valid,
                          ${_s} textarea:valid,
                          ${_s} textarea.valid,
                          ${_s} textarea.valid:autofill,
                          ${_s} textarea:autofill:valid{
                                padding-right: calc(1.5em + .75rem) !important;
                                background-color: white !important;
                                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 12 12'%3E%3Cpath fill='%23038205' d='M6 0C2.69 0 0 2.69 0 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6m3.44 4.94l-3.5 3.5c-.12.12-.28.18-.44.18s-.32-.06-.44-.18l-2-2c-.24-.24-.24-.64 0-.88s.64-.24.88 0L5.5 7.12l3.06-3.06c.24-.24.64-.24.88 0c.25.24.25.64 0 .88'/%3E%3C/svg%3E") !important;
                                background-repeat: no-repeat !important;
                                background-position: right calc(.375em + .1875rem) center !important;
                                background-size: calc(.75em + .375rem) calc(.75em + .375rem) !important;
                                appearance: none !important;
                                -webkit-appearance: none !important;
                            }
                          ${_s} textarea.valid:autofill, ${_s} textarea.valid,${_s} textarea:user-valid,${_s} textarea:valid,${_s} textarea:autofill:valid{background-position: right calc(.375em + .1875rem) top 10px;}                
                          ${_s} button[type='submit'], ${_s} input[type='submit']{
                              position:relative;
                              padding-right:.75rem;
                              line-height:1.6;
                              transition: padding 150ms linear;
                            } 
                          ${_s} button[disabled]:hover, ${_s} input[disabled]:hover, ${_s} select[disabled]:hover, ${_s} textarea[disabled]:hover{
                                cursor: not-allowed !important;
                                pointer-events: all;
                            }
                          ${_s} select[disabled],${_s} input:not([type="submit"])[disabled], ${_s} textarea[disabled] {
                              opacity: 0.5 !important;
                            }      
                          ${_s} button[type='submit'].loading, ${_s} input[type='submit'].loading{
                              position:relative;
                              padding-right:40px;
                              transition: padding 150ms linear; 
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              align-content: center;
                              justify-items: center;
                              column-gap: 10px;
                              opacity:0.8 !important;
                              cursor:not-allowed;
                              pointer-events: all;
                            }
                          ${_s} button[type='submit'].loading::after, ${_s} input[type='submit'].loading::after{
                              content:'';
                              display:block;
                              width:20px;
                              height:20px;
                              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='20' fill='none' stroke='%23ffffff' stroke-width='4' stroke-linecap='round' stroke-dasharray='90' stroke-dashoffset='60'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 25 25' to='360 25 25' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E");
                            }  
                          ${_s} ::placeholder{
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
                          ${_s} input:user-invalid::placeholder, 
                          ${_s} textarea:user-invalid::placeholder,
                          ${_s} select:user-invalid{
                              color:#ff0000b0;
                              font-size:12px;
                              font-weight:400;
                              vertical-align:middle;            
                              display:flex;
                              align-items:center;
                              justify-content:center;
                            }
                          `;
      cssText+=this.options.style ?? '';                        
      if (
        d.getElementById('preFVS-CSS') &&
        d.getElementById('preFVS-CSS').classList.contains(_s)
      ) {
        return this;
        } else if (d.getElementById('preFVS-CSS')) {
          d.getElementById('preFVS-CSS').classList.add(_s);
          d.getElementById('preFVS-CSS').innerHTML += cssText;
          return this;
        } else {
          const preFVSCSS = d.createElement('style');
          preFVSCSS.setAttribute('type', 'text/css');
          preFVSCSS.setAttribute('id', 'preFVS-CSS');
          preFVSCSS.appendChild(d.createTextNode(cssText));
          d.head.appendChild(preFVSCSS);
          return this;
        }
    }
  //PUBLIC API
  _setupListeners(_i) {
      this._logMessenger('Setting up listeners...');
      // Track keyboard events (manual typing)
      _i.addEventListener('keydown', (e) => {
          this.keyboardEvents++;
        });
      
      _i.addEventListener('keyup', (e) => {
          this.isManualInput = true;          
          this._runValidation(_i);
        });
      
      // Track paste events
      _i.addEventListener('paste', (e) => {
          this.isManualInput = true;          
          this._runValidation(_i);
        });
      // Track focus
      _i.addEventListener('focus', (e) => {
          this.isManualInput = true;
        }); 
      _i.addEventListener('change', (e) => {
          // If no keyboard events fired before input event, likely automated
          if (this.keyboardEvents === 0) {
              this.isManualInput = false;
            } 
            const value = e.target.value;
             if (e.isTrusted && value) {
              this.isManualInput = true;
             }
             //console.log('Valid?', _i.checkValidity()); // Checks actual validation
             //console.log('Validity state:', _i.validity);

             this._runValidation(_i);
        });   
      
      // Track programmatic changes
      _i.addEventListener('input', (e) => {
          // If no keyboard events fired before input event, likely automated
          if (this.keyboardEvents === 0) {
              this.isManualInput = false;
            }
            this._runValidation(_i);
        });      
    }
  _setupSubmitHandler(_d=document) {
      this._logMessenger('preFVS form submit handler...');
      this.firstInvalid=null;
      const unTrusted = _d.querySelector('input[name="unTrusted"]');
      this.inputs.forEach((_i) => {
          this._setupListeners(_i);     
        })
      if (this.button instanceof HTMLElement &&
        this.button &&
        this.button.nodeType === 1 &&
        typeof this.button.nodeName === 'string') {
            this.button.addEventListener('click', (e) => {              
                if(!e.isTrusted && unTrusted){                
                        unTrusted.value=true;            
                    }                
                this.inputs.forEach((_i) => {
                    _i.setCustomValidity("");                    
                    this._runValidation(_i)                                       
                  });
                this.button.classList.add('loading');
                if (!this.form.checkValidity()) {
                    this.form.reportValidity();
                    setTimeout(() => {
                        this.button.classList.remove('loading');
                    }, 500);
                  }
              })
          }
        this.form.addEventListener('submit', (e) => {
            if(!e.isTrusted && unTrusted){                
                    unTrusted.value=true;            
                }
          const pragmatic = _d.createElement('input');
          _d.querySelector('input[name="pragmatic"]')?.remove();
          pragmatic.name="pragmatic";
          pragmatic.setAttribute("type", "hidden"); 
          this.form.prepend(pragmatic); 
          if(!this._isUserTyping()){           
              pragmatic.value=true;            
            }
            else{
              pragmatic.value=false;  
            }
          // run validation on all
          if (!this.form.checkValidity()) {
                //console.error('Form validation failed. Please correct the errors and try again.');
              e.preventDefault();
              this.form.reportValidity();
            }
            
            if(this.callback && typeof this.callback === "function"){
                e.preventDefault();
                //console.log(this.callback);
                this.callback(this.form);
                this.button.classList.remove('loading');
            } 
            this.button.classList.remove('loading');                    
        });
    }
  _isUserTyping() {
      return this.keyboardEvents > 0 && this.isManualInput;
    }    
  _objCheck(_o) {
      if (!_o.selector || !_o.rule) {
          if (this.options.debug)
            throw new Error(
                'Object does not properly contain the selector and rule keys.'
              );
           return;
        }
      this._prepareValidator(_o.selector, _o.rule);
    }
  _prepareValidator(_s, _r, _d=document) {
      let _i;
      if (typeof _s === 'string') {
          _i = _d.querySelector(_s);
          if (!(_i instanceof HTMLElement)) {
              if (this.options.debug)
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
      this._setValidator(_i, _r);      
    }
  _setValidator(_i, _r) {    
        if (!this.validators.has(_i)) {
            this.validators.set(_i, []);
          }
        if (Array.isArray(_r)) {
            _r.forEach((r) => {
              this.validators.get(_i).push(r);
            });
            } else {
              this.validators.get(_i).push(_r);
            }    
      }
  _isPlainObject(_o) {
      return (
          _o &&
          typeof _o === 'object' &&
          !Array.isArray(_o) &&
          _o.constructor === Object
        );
    }  
  _runValidation(_i) {
      this._logMessenger(`Validating user input ${_i.name}...`);
      const validators = this.validators.get(_i) || [];
      let _m = [];
      for (const _v of validators) {
          const msg = _v(_i.value, _i);
          if (msg) {
              if (!_m.includes(msg)) _m.push(msg);
              _i.setCustomValidity(msg);
              _i.setAttribute("placeholder", _m);
            }
        }
      _i.classList.add('valid');  
      if (!_i.valid && _i.validationMessage) {
          _i.setAttribute("placeholder", _i.validationMessage);
          _i.classList.remove('valid'); 
          _i.classList.add('invalid');
        }
      if (!this.firstInvalid && !_i.checkValidity()) {
          this.firstInvalid=_i;
        }
    }
  addValidator(_i, _r) {
      if (Array.isArray(_i)) {
          if (_i.every(this._isPlainObject)) {
              _i.forEach((item) => {
                this._objCheck(item);
              });
            } else {
              if (this.options.debug)
                throw new Error('Array must contain only plain objects.');
            }
        }
      if (this._isPlainObject(_i)) {
          this._objCheck(_i);
        }
      this._prepareValidator(_i, _r);
      return this;
    }
  isValid(_c = null) {
        if (typeof _c === "function") {
            this.callback = _c;
          }
          else if (_c !== null && this.options.debug===true) {
            throw new Error(`Callback is not a valid function and cannot be executed: "${typeof _c}".`);
          }
            return this;
    }      
}
