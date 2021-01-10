/*! Copyright (c) 2020 alfalabs.net license MIT */
/** dependencies
    alfa-animation-vert-ui.mjs
    alfa-console-log.mjs
 */

import AlfaAnimationVert from './alfa-animation-vert-ui.mjs'

import AlfaConsoleLog from './alfa-console-log.mjs'; 
var alfaConsoleLog = new AlfaConsoleLog('alfa-collapsible-anim')
var log =     alfaConsoleLog.log.bind(alfaConsoleLog)
var logWarn = alfaConsoleLog.logWarn.bind(alfaConsoleLog)
var logErr =  alfaConsoleLog.logErr.bind(alfaConsoleLog)


const $dqs = document.querySelector.bind(document); 
const $dce = document.createElement.bind(document); 


/** constructor 
 * 
 *  @param {String} elementSelector - a CSS selector, unique for element to create
 *  @param {Object} options - added to this.cfg, (also cfg optinos can be html attributes, they will be camel capitalized)
 */
function AlfaCollapsibleAnim(elementSelector, options){

    var defaults = {
        headerClass:  'alfa-collapsible-anim_header',
        contentClass: 'alfa-collapsible-anim_content',
        startClosed: false,
        author: 'alfalabs.net',
        moduleName: 'AlfaCollapsibleAnim',
        // onHeaderClick: defaults to NOP function, useless in alfa-menu
    }

    /** ui element has an element on page */
    this.elementSelector = elementSelector;

    this.container = (elementSelector!==null) ? $dqs(elementSelector) : options.containerElement

    this.wrapper = this.container; /** name "wrapper" is used in legacy alfa-collapsible-boxes-ui */

    this.setCfgValues(options, defaults)  /** element configuration comes from options and html attributes */
   

    this.createElement()
    this.insertStyleTag()

    alfaConsoleLog.setCfg({id: this.container.getAttribute('id')}) /** !!! probably is shared */
    log('constructor()', {elementSelector, options})
}
/** get configuration from defauls, options and HTML element attributes  */
AlfaCollapsibleAnim.prototype.setCfgValues = function(options, defaults){

    options = options || {}
    this.cfg = Object.assign({}, defaults, options)

    /** get cfg from html element attributes */
    Array.from(this.container.attributes).forEach(function(attr){
        var name = camelize(attr.name)
        this.cfg[name] = attr.value
    }.bind(this));

    this.onHeaderClick = options.onHeaderClick || function(){}

    this.id = this.container.getAttribute('id')
}

AlfaCollapsibleAnim.prototype.exampleMethod = function(){
    log('exampleMethod()', this.cfg);
}

AlfaCollapsibleAnim.prototype.createElement = function(){
    // this.container.innerHTML = 'alfa-collapsible-anim-ui'+this.elementSelector

    /** assing attributes */
    if(this.cfg.elemCss){this.container.style = this.cfg.elemCss}

    this.header = this.container.querySelector('.'+this.cfg.headerClass)
    this.content= this.container.querySelector('.'+this.cfg.contentClass)

    this.content.classList.add(this.cfg.contentClass)

    this.AlfaAnimationVert = new AlfaAnimationVert(null, {
        containerElement:  this.content,
        startClosed: this.cfg.startClosed
    } )

    this.header.classList.add(this.cfg.headerClass)
    this.header.addEventListener('click', this.toggle.bind(this));

}

/** header click event handler:
 *  also called from toggleBox(), ev is not available then  */
AlfaCollapsibleAnim.prototype.toggle = function(ev){

    this.onHeaderClick(ev)

    var el = this.container; /** using legacy "el" from alfa-collapsible-boxes */
    el.content = el

    log('toggle()', `"${ev ? this.header.innerText : ''}"`);

    if(ev) ev.stopImmediatePropagation();

    // highlight this element as 'last-clicked'
    // this.lastClicked(el);

    if(this.AlfaAnimationVert.isOpen){
        this.close()
    } else {
        this.open()
    }
}  
AlfaCollapsibleAnim.prototype.open = function(opts){
    this.AlfaAnimationVert.open(opts)
    this.wrapper.setAttribute('opened', '');
}
AlfaCollapsibleAnim.prototype.close = function(opts){
    this.AlfaAnimationVert.close(opts)
    this.wrapper.removeAttribute('opened');
}
   


AlfaCollapsibleAnim.prototype.clear = function(){
    this.clearNode(this.container)
}
AlfaCollapsibleAnim.prototype.clearNode = function(myNode){
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
}



AlfaCollapsibleAnim.prototype.insertStyleTag = function(){
    var styleAttr = 'alfa-collapsible-anim-ui';     // +'_'+this.id;
    if($dqs(`[${styleAttr}]`)) return;  /** do not insert style if already exists */

    var styleTag = $dce('style');
    styleTag.setAttribute(styleAttr, '');

    var headerClass = this.cfg.headerClass
    var contentClass = this.cfg.contentClass

    /** selector is not used because the instance of this element may be used directly without specifying selector */
   
    styleTag.innerHTML = `
        .${headerClass} {
            background: gainsboro; 
            border-bottom: 1px solid silver; 
            cursor: pointer;
            padding-left: 15px;
            margin-bottom: 1px;
        }
        .${headerClass}:hover{
            background: silver;
        }
        /* .${contentClass} { 
            height: auto !important; - NOT
        } */
        `;

    /* NOTE: calling body.append will add your new styles to the bottom of the page and override any existing ones */
    $dqs('head').append(styleTag);
}

export default AlfaCollapsibleAnim;



    // helpers

    /** not used, but interesting: https://gist.github.com/jpetitcolas/4481778
     *  from: https://ourcodeworld.com/articles/read/608/how-to-camelize-and-decamelize-strings-in-javascript
     * @param text 
     * delimiter: underscore or hyphen
     */
    function camelize(text) {
        return text.replace(/^([A-Z])|[\s-_]+(\w)/g, function(match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            return p1.toLowerCase();        
        });
    }

    // function log(){
    //     // return;
    //     var args = Array.prototype.slice.call(arguments); 
    //     args.unshift('%c[alfa-collapsible-anim-ui]', 'color:blue');
    //     console.log.apply(null, args);
    // }
    // function logWarn(){
    //     var args = Array.prototype.slice.call(arguments); 
    //     args.unshift('%c[alfa-collapsible-anim-ui] WARNING:', 'color:darkorange; font-weight:bold;');
    //     console.log.apply(null, args);
    // }
    // function logErr(){
    //     var args = Array.prototype.slice.call(arguments); 
    //     args.unshift('%c[alfa-collapsible-anim-ui] ERROR:', 'color:red; font-weight:bold;');
    //     console.log.apply(null, args);
    // }