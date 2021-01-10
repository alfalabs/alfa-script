/*! alfa-animation-vert-ui  Copyright (c) 2020 alfalabs.net license MIT */


// import AlfaConsoleLog from './alfa-console-log.mjs'; 
// var alfaConsoleLog = new AlfaConsoleLog('alfa-animation-vert-ui')
// var log =     alfaConsoleLog.log.bind(alfaConsoleLog)
// var logWarn = alfaConsoleLog.logWarn.bind(alfaConsoleLog)
// var logErr =  alfaConsoleLog.logErr.bind(alfaConsoleLog)
var log = function(){}

const $dqs = document.querySelector.bind(document); 
const $dce = document.createElement.bind(document); 


/** constructor 
 * 
 *  @param {String} elementSelector - a CSS selector, unique for element to create
 *  @param {Object} options - added to this.cfg, (also cfg optinos can be html attributes, they will be camel capitalized)
 */
function AlfaAnimationVert(elementSelector, options){

    var defaults = {
        author: 'alfalabs.net',
        moduleName: 'alfa-animation-vert-ui',
        startClosed: false
    }

    /** ui element has an element on page */
    this.elementSelector = elementSelector;

    this.container = (elementSelector!==null) ? $dqs(elementSelector) : options.containerElement
    // alfaConsoleLog.setCfg({id: this.container.id})
    log('constructor()', {elementSelector, options})

    this.getCfgValues(options, defaults)  /** element configuration comes from options and html attributes */
   

    this.createElement()
    this.insertStyleTag()


    /** add methods to the html element to be accesible by calling on instance of element */
    this.container.open = this.open.bind(this)
    this.container.close = this.close.bind(this)
}
/** get configuration from defauls, options and HTML element attributes  */
AlfaAnimationVert.prototype.getCfgValues = function(options, defaults){

    options = options || {}
    this.cfg = Object.assign({}, defaults, options)

    /** get cfg from html element attributes */
    if(this.container.hasAttribute('start-closed')) {this.cfg.startClosed = true}

    // Array.from(this.container.attributes).forEach(function(attr){
    //     var name = camelize(attr.name)
    //     this.cfg[name] = attr.value
    // }.bind(this));

    // log('getAttributes() this.cfg:', this.cfg)
}

// AlfaAnimationVert.prototype.exampleMethod = function(){
//     log('exampleMethod()', this.cfg);
// }

AlfaAnimationVert.prototype.createElement = function(){

    this.container.classList.add('alfa-animation-vert-ui')

    if(this.cfg.startClosed){
        this.container.style.height = 0;
        this.isOpen = false
    } else {
        this.isOpen = true
    }
    this.container.style.overflow = 'hidden'

}

AlfaAnimationVert.prototype.open = function(opts){
    /** animation to:
     *  el.content.style.height = 'auto';
     */

    // log('before open() isOpen:',  this.isOpen)

    var elem = this.container;

    opts = opts || {};
    if (this.noAnim || opts.noAnim) {elem.style.height = 'auto'; this.isOpen = true;  return; } // NO Animation --- >

    function resetHeight(ev){

        if(ev.target != elem) return;
        elem.removeEventListener('transitionend', resetHeightEvent);

        if(!this.isOpen) return;

        requestAnimationFrame(()=>{      
            elem.style.transition = '0';
            elem.style.height = 'auto';

            requestAnimationFrame(()=>{
                elem.style.height = null;
                elem.style.transition = null;

                // this.fire("elementOpened", el);
            });
        });
    }
    var resetHeightEvent = resetHeight.bind(this);
    elem.addEventListener('transitionend', resetHeightEvent);

    this.isOpen = true;

    elem.style.height = elem.scrollHeight + "px";

}
AlfaAnimationVert.prototype.close = function(opts){
    /** animation to:
     *  elem.style.height = 0;
     */

    // log('before close() isOpen:',  this.isOpen)

    var elem = this.container; 

    opts = opts || {};
    if (this.noAnim || opts.noAnim) {elem.style.height = 0; this.isOpen = false;  return; } // NO Animation --- >

    function endTransition(ev){     
        if(ev.target != elem) return;
        elem.removeEventListener('transitionend', endTransitionEvent);

        if(this.isOpen) return;

        // this.fire("elementClosed", el);
    }

    var endTransitionEvent = endTransition.bind(this);
    elem.addEventListener('transitionend', endTransitionEvent);

    this.isOpen = false;   
    
    

    requestAnimationFrame(()=>{
        elem.style.transition = '0';
        elem.style.height = elem.scrollHeight + "px";

        requestAnimationFrame(()=>{
            elem.style.transition = null;
            elem.style.height = 0;
        });
    });
}

AlfaAnimationVert.prototype.toggle = function(opts){
    if(this.isOpen) {this.close(opts)}
    else  {this.open(opts)}
}



AlfaAnimationVert.prototype.clearNode = function(myNode){
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
}



AlfaAnimationVert.prototype.insertStyleTag = function(){
    
    var styleAttr = 'alfa-animation-vert-ui';
    if($dqs(`[${styleAttr}]`)) return;  /** do not insert style if already exists */

    var styleTag = $dce('style');
    styleTag.setAttribute(styleAttr, '');

    /** selector is not used because the instance of this element may be used directly without specifying selector */

    styleTag.innerHTML = `
        .alfa-animation-vert-ui {
            height: auto;
            overflow: hidden;
            transition: height .5s;
        }`;

    /* NOTE: calling body.append will add your new styles to the bottom of the page and override any existing ones */
    $dqs('head').append(styleTag);
}

export default AlfaAnimationVert;
  